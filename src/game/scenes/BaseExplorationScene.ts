import Phaser from 'phaser';
import { GAME_H, GAME_W, TILE_SIZE, STEP_SOUND_MS, PLAYER_SPEED, INTERACT_RANGE, MEMORY_LOVE_BONUS } from '../constants';
import { LOVE_CONFIG } from '../../config';
import { getState } from '../state';
import { persistSave } from '../save';
import { playConfirmSound, playFanfare, playStepSound, startMusic } from '../systems/audio';
import { ensureCoreTextures } from '../systems/textureFactory';
import { getObjectiveText } from '../systems/objectives';
import type { EncounterData, ExitData, MemoryData, NpcData, SignData, WorldData } from '../systems/worldData';
import { DialogBox } from '../ui/DialogBox';
import { ChoiceMenu } from '../ui/ChoiceMenu';
import { Hud } from '../ui/Hud';

type WorldObj<T> = T & { sprite: Phaser.Physics.Arcade.Sprite };

export abstract class BaseExplorationScene extends Phaser.Scene {
  protected player!: Phaser.Physics.Arcade.Sprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { [key: string]: Phaser.Input.Keyboard.Key };
  private escKey!: Phaser.Input.Keyboard.Key;
  private dialog!: DialogBox;
  private choices!: ChoiceMenu;
  private hud!: Hud;

  private npcs: WorldObj<NpcData>[] = [];
  private memories: WorldObj<MemoryData>[] = [];
  private encounters: WorldObj<EncounterData>[] = [];
  private signs: WorldObj<SignData>[] = [];
  private world!: WorldData;
  private lastStep = 0;
  private waterTiles: Phaser.GameObjects.Image[] = [];
  private lampGlows: Phaser.GameObjects.Arc[] = [];
  private rain: Array<{ rect: Phaser.GameObjects.Rectangle; vx: number; vy: number }> = [];
  private saveIndicator!: Phaser.GameObjects.Text;

  constructor(key: string) {
    super(key);
  }

  protected abstract buildWorld(): WorldData;

  create(): void {
    ensureCoreTextures(this);
    startMusic(this);

    const state = getState();
    this.world = this.buildWorld();
    state.currentScene = this.scene.key;
    persistSave();

    this.renderTiles();
    this.spawnPlayer();
    this.spawnObjects();

    this.dialog = new DialogBox(this);
    this.choices = new ChoiceMenu(this);
    this.hud = new Hud(this);
    this.hud.update(state.loveMeter, state.memories.length, getObjectiveText());

    this.add
      .text(GAME_W / 2, GAME_H - 6, this.world.label, {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#d6e6ff'
      })
      .setOrigin(0.5, 1)
      .setDepth(45)
      .setScrollFactor(0);

    this.saveIndicator = this.add
      .text(GAME_W - 10, GAME_H - 6, '', {
        fontFamily: 'Press Start 2P',
        fontSize: '6px',
        color: '#8bc4a0'
      })
      .setOrigin(1, 1)
      .setDepth(50)
      .setScrollFactor(0)
      .setAlpha(0);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as { [key: string]: Phaser.Input.Keyboard.Key };
    this.escKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // London rain (all scenes)
    for (let i = 0; i < 100; i += 1) {
      const rect = this.add
        .rectangle(
          Phaser.Math.Between(0, GAME_W),
          Phaser.Math.Between(0, GAME_H),
          1,
          Phaser.Math.Between(4, 8),
          0xb0c8e0,
          0.22
        )
        .setAngle(-16)
        .setDepth(35);
      this.rain.push({ rect, vx: 1.0 + (i % 3) * 0.15, vy: 2.2 + (i % 4) * 0.3 });
    }

    this.input.keyboard!.on('keydown-ENTER', () => this.handleAccept());
    this.input.keyboard!.on('keydown-E', () => this.handleAccept());
    this.input.keyboard!.on('keydown-UP', () => {
      if (this.choices.isActive()) this.choices.move(-1);
    });
    this.input.keyboard!.on('keydown-DOWN', () => {
      if (this.choices.isActive()) this.choices.move(1);
    });
  }

  update(time: number): void {
    this.hud.update(getState().loveMeter, getState().memories.length, getObjectiveText());

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.launch('PauseScene', { returnScene: this.scene.key });
      this.scene.pause();
      return;
    }

    if (this.dialog.isActive() || this.choices.isActive()) {
      this.player.setVelocity(0, 0);
      return;
    }

    const speed = PLAYER_SPEED;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;

    this.player.setVelocity(vx, vy);

    if (vx !== 0 && vy !== 0) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.velocity.normalize().scale(speed);
    }

    if ((vx !== 0 || vy !== 0) && time - this.lastStep > STEP_SOUND_MS) {
      playStepSound();
      this.lastStep = time;
    }

    this.checkExits();
    this.animateWater(time);

    // Rain animation
    for (const drop of this.rain) {
      drop.rect.x -= drop.vx;
      drop.rect.y += drop.vy;
      if (drop.rect.y > GAME_H + 8 || drop.rect.x < -8) {
        drop.rect.y = Phaser.Math.Between(-30, -8);
        drop.rect.x = Phaser.Math.Between(0, GAME_W + 40);
      }
    }
  }

  private handleAccept(): void {
    if (this.dialog?.isActive()) {
      this.dialog.advance();
      return;
    }
    if (this.choices?.isActive()) {
      this.choices.confirm();
      return;
    }

    this.tryInteract();
  }

  private renderTiles(): void {
    const blockedGroup = this.physics.add.staticGroup();
    const half = TILE_SIZE / 2;

    for (let y = 0; y < this.world.tiles.length; y += 1) {
      for (let x = 0; x < this.world.tiles[y].length; x += 1) {
        const t = this.world.tiles[y][x];
        const key =
          t === 1
            ? 'tile-path'
            : t === 2
              ? 'tile-water'
              : t === 3
                ? 'tile-brick'
                : t === 4
                  ? 'tile-floor'
                  : t === 5
                    ? 'tile-bus'
                    : t === 6
                      ? 'tile-window'
                      : t === 7
                        ? 'tile-door'
                    : t === 8
                          ? 'tile-road'
                          : t === 9
                            ? 'tile-border'
                            : t === 10
                              ? 'tile-road-v'
                              : t === 11
                                ? 'tile-intersection'
                          : 'tile-grass';
        const img = this.add.image(x * TILE_SIZE + half, y * TILE_SIZE + half, key).setDepth(1);
        if (t === 2) this.waterTiles.push(img);

        if (this.world.blocked.has(`${x},${y}`)) {
          const obstacle = blockedGroup
            .create(x * TILE_SIZE + half, y * TILE_SIZE + half, key)
            .setOrigin(0.5, 0.5)
            .setDepth(2);
          obstacle.refreshBody();
        }
      }
    }

    this.player = this.physics.add
      .sprite(this.world.spawn.x * TILE_SIZE + half, this.world.spawn.y * TILE_SIZE + half, this.playerTexture())
      .setDepth(10)
      .setSize(TILE_SIZE * 0.5, TILE_SIZE * 0.5)
      .setOffset(TILE_SIZE * 0.25, TILE_SIZE * 0.35);

    this.physics.add.collider(this.player, blockedGroup);
  }

  private spawnPlayer(): void {
    this.player.setTexture(this.playerTexture());
  }

  private spawnObjects(): void {
    const half = TILE_SIZE / 2;

    this.world.npcs.forEach((npc) => {
      const sprite = this.physics.add
        .sprite(npc.x * TILE_SIZE + half, npc.y * TILE_SIZE + half, npc.spriteKey ?? 'npc-default')
        .setImmovable(true)
        .setDepth(10);
      sprite.body.moves = false;
      this.npcs.push({ ...npc, sprite });

      this.tweens.add({
        targets: sprite,
        y: sprite.y + Phaser.Math.Between(-1, 1),
        duration: Phaser.Math.Between(900, 1400),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    this.world.memories.forEach((m) => {
      const sprite = this.physics.add
        .sprite(m.x * TILE_SIZE + half, m.y * TILE_SIZE + half, 'memory-labeled')
        .setImmovable(true)
        .setDepth(9);
      sprite.body.moves = false;
      if (getState().memories.includes(m.id)) {
        sprite.setVisible(false);
      }
      this.memories.push({ ...m, sprite });
    });

    this.world.encounters.forEach((e) => {
      const sprite = this.physics.add
        .sprite(e.x * TILE_SIZE + half, e.y * TILE_SIZE + half, 'encounter-labeled')
        .setImmovable(true)
        .setDepth(9);
      sprite.body.moves = false;
      if (getState().solvedEncounters.includes(e.key)) {
        sprite.setTint(0x6e729a);
      }
      this.encounters.push({ ...e, sprite });
    });

    this.world.signs.forEach((s) => {
      const key = s.spriteKey ?? 'sign-labeled';
      if (key === 'prop-lamp') {
        const glow = this.add.circle(s.x * TILE_SIZE + half, s.y * TILE_SIZE + half - 8, 12, 0xf5e5a5, 0.2).setDepth(8);
        this.lampGlows.push(glow);
        this.tweens.add({
          targets: glow,
          alpha: { from: 0.12, to: 0.26 },
          duration: Phaser.Math.Between(700, 1100),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      const sprite = this.physics.add
        .sprite(s.x * TILE_SIZE + half, s.y * TILE_SIZE + half, key)
        .setImmovable(true)
        .setDepth(9);
      sprite.body.moves = false;
      this.signs.push({ ...s, sprite });
    });
  }

  private tryInteract(): void {
    const playerPos = new Phaser.Math.Vector2(this.player.x, this.player.y);

    const all = [
      ...this.npcs.map((n) => ({ type: 'npc' as const, data: n, dist: Phaser.Math.Distance.BetweenPoints(playerPos, n.sprite) })),
      ...this.memories.map((m) => ({ type: 'memory' as const, data: m, dist: Phaser.Math.Distance.BetweenPoints(playerPos, m.sprite) })),
      ...this.encounters.map((e) => ({ type: 'encounter' as const, data: e, dist: Phaser.Math.Distance.BetweenPoints(playerPos, e.sprite) })),
      ...this.signs.map((s) => ({ type: 'sign' as const, data: s, dist: Phaser.Math.Distance.BetweenPoints(playerPos, s.sprite) }))
    ].filter((entry) => entry.dist <= INTERACT_RANGE);

    if (all.length === 0) return;
    all.sort((a, b) => a.dist - b.dist);
    const target = all[0];

    if (target.type === 'npc') {
      if (target.data.id === 'npc-city-4') {
        const closerTo = getState().selectedCharacter === 'her' ? 'Eduardo' : 'Joana';
        this.dialog.start([
          { speaker: target.data.name, text: `El bus rojo va al campus. Próxima parada: más cerca de ${closerTo}.` }
        ]);
        return;
      }

      if (target.data.id === 'london-npc-1' && !getState().flags.reunionUnlocked) {
        getState().flags.reunionUnlocked = true;
        getState().loveMeter = Math.min(100, getState().loveMeter + MEMORY_LOVE_BONUS);
        persistSave();
        playFanfare();
      }

      this.dialog.start(target.data.lines.map((line) => ({ speaker: target.data.name, text: line })));
      return;
    }

    if (target.type === 'sign') {
      this.dialog.start(target.data.lines.map((line) => ({ speaker: 'Letrero', text: line })));
      return;
    }

    if (target.type === 'memory') {
      if (getState().memories.includes(target.data.id)) {
        this.dialog.start([{ speaker: 'Sistema', text: 'Ese recuerdo ya vive contigo.' }]);
        return;
      }
      getState().memories.push(target.data.id);
      getState().loveMeter = Math.min(100, getState().loveMeter + MEMORY_LOVE_BONUS);
      target.data.sprite.setVisible(false);
      persistSave();
      playFanfare();
      this.showFloatingText(target.data.sprite.x, target.data.sprite.y, `+${MEMORY_LOVE_BONUS} LOVE`);
      this.flashSave();
      this.dialog.start([{ speaker: 'Recuerdo', text: target.data.description }]);
      return;
    }

    const encounter = target.data;
    if (getState().solvedEncounters.includes(encounter.key)) {
      this.dialog.start([{ speaker: encounter.title, text: 'Este momento ya fue transformado en fuerza.' }]);
      return;
    }

    this.dialog.start(
      [
        { speaker: encounter.title, text: encounter.intro },
        { speaker: LOVE_CONFIG.myName, text: 'No te peleo. Te entiendo... y te transformo.' }
      ],
      () => {
        this.choices.open(
          encounter.options.map((o) => ({ label: o.label, value: o.value })),
          (value) => {
            const picked = encounter.options.find((o) => o.value === value);
            if (!picked) return;
            getState().solvedEncounters.push(encounter.key);
            getState().loveMeter = Math.min(100, getState().loveMeter + picked.bonus);
            encounter.sprite.setTint(0x6e729a);
            persistSave();
            this.showFloatingText(encounter.sprite.x, encounter.sprite.y, `+${picked.bonus} LOVE`, '#ff9dc1');
            this.flashSave();
            this.dialog.start([
              { speaker: encounter.title, text: picked.response },
              { speaker: 'Sistema', text: `Love Meter +${picked.bonus}` }
            ]);
          }
        );
      }
    );
  }

  private checkExits(): void {
    const px = Math.floor(this.player.x / TILE_SIZE);
    const py = Math.floor(this.player.y / TILE_SIZE);
    const exit = this.world.exits.find((e) => px >= e.x && px < e.x + e.w && py >= e.y && py < e.y + e.h);
    if (!exit) return;

    const lockedMessage = this.exitLockReason(exit);
    if (lockedMessage) {
      this.player.setPosition(this.world.spawn.x * TILE_SIZE + TILE_SIZE / 2, this.world.spawn.y * TILE_SIZE + TILE_SIZE / 2);
      this.dialog.start([{ speaker: 'Sistema', text: lockedMessage }]);
      return;
    }

    getState().currentScene = exit.to;
    persistSave();
    playConfirmSound();
    this.scene.start(exit.to);
  }

  private exitLockReason(exit: ExitData): string | null {
    if (exit.requiredLove !== undefined && getState().loveMeter < exit.requiredLove) {
      return exit.lockedText ?? `Necesitas Love Meter >= ${exit.requiredLove}.`;
    }
    if (exit.requiredMemories !== undefined && getState().memories.length < exit.requiredMemories) {
      return exit.lockedText ?? `Necesitas ${exit.requiredMemories} recuerdos.`;
    }
    if (exit.requiredEncounters !== undefined && getState().solvedEncounters.length < exit.requiredEncounters) {
      return exit.lockedText ?? `Necesitas resolver ${exit.requiredEncounters} momentos.`;
    }
    if (exit.requiresFlag && !getState().flags[exit.requiresFlag]) {
      return exit.lockedText ?? 'Aún no se desbloquea esta salida.';
    }
    return null;
  }

  private animateWater(time: number): void {
    const alpha = 0.86 + Math.sin(time * 0.0045) * 0.14;
    this.waterTiles.forEach((tile) => tile.setAlpha(alpha));
  }

  private showFloatingText(x: number, y: number, text: string, color = '#ffdd8b'): void {
    const floater = this.add
      .text(x, y - 8, text, {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color
      })
      .setOrigin(0.5)
      .setDepth(55);

    this.tweens.add({
      targets: floater,
      y: y - 36,
      alpha: 0,
      duration: 1200,
      ease: 'Sine.easeOut',
      onComplete: () => floater.destroy()
    });
  }

  private flashSave(): void {
    this.saveIndicator.setText('SAVED');
    this.saveIndicator.setAlpha(1);
    this.tweens.killTweensOf(this.saveIndicator);
    this.tweens.add({
      targets: this.saveIndicator,
      alpha: 0,
      duration: 1400,
      delay: 400,
      ease: 'Sine.easeOut'
    });
  }

  private playerTexture(): string {
    return getState().selectedCharacter === 'her' ? 'player-her' : 'player-my';
  }
}
