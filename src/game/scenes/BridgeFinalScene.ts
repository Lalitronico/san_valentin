import Phaser from 'phaser';
import { LOVE_CONFIG } from '../../config';
import { GAME_H, GAME_W, TILE_SIZE } from '../constants';
import { persistSave } from '../save';
import { getState } from '../state';
import { playConfirmSound, playFanfare, startMusic } from '../systems/audio';
import { ensureCoreTextures } from '../systems/textureFactory';
import { DialogBox } from '../ui/DialogBox';

export class BridgeFinalScene extends Phaser.Scene {
  private dialog!: DialogBox;
  private readyForLetter = false;
  private stars: Phaser.GameObjects.Rectangle[] = [];
  private river: Phaser.GameObjects.Rectangle[] = [];
  private rain: Array<{ rect: Phaser.GameObjects.Rectangle; vx: number; vy: number }> = [];
  private lampGlows: Phaser.GameObjects.Arc[] = [];
  private skylineFar: Phaser.GameObjects.Rectangle[] = [];
  private skylineNear: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('BridgeFinalScene');
  }

  create(): void {
    // Reset arrays for clean restart (Phaser reuses the same instance)
    this.readyForLetter = false;
    this.stars = [];
    this.river = [];
    this.rain = [];
    this.lampGlows = [];
    this.skylineFar = [];
    this.skylineNear = [];

    ensureCoreTextures(this);
    startMusic(this);
    this.cameras.main.setBackgroundColor(0x0c1630);

    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0c1836);
    this.add.rectangle(GAME_W / 2, GAME_H * 0.35, GAME_W, GAME_H * 0.7, 0x273d73, 0.22);

    for (let i = 0; i < 130; i += 1) {
      const s = this.add.rectangle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, 220), 2, 2, i % 7 === 0 ? 0xf1da95 : 0xd9e8ff, Phaser.Math.FloatBetween(0.3, 1));
      this.stars.push(s);
    }

    for (let x = 0; x < GAME_W; x += 28) {
      const h = Phaser.Math.Between(48, 120);
      const b = this.add.rectangle(x + 14, GAME_H - 176 - h / 2, 24, h, 0x1d2f57, 0.45).setDepth(1);
      this.skylineFar.push(b);
    }

    for (let x = 0; x < GAME_W; x += 22) {
      const h = Phaser.Math.Between(56, 150);
      const b = this.add.rectangle(x + 11, GAME_H - 170 - h / 2, 22, h, 0x101a33).setDepth(2);
      this.skylineNear.push(b);
      if (Math.random() > 0.74) {
        this.add.rectangle(x + 7, GAME_H - 170 - h + Phaser.Math.Between(12, 44), 3, 3, 0xffe8a2, 0.85).setDepth(3);
      }
    }

    this.add.rectangle(GAME_W - 130, GAME_H - 220, 24, 150, 0x0d1833).setDepth(4);
    this.add.rectangle(GAME_W - 130, GAME_H - 288, 18, 16, 0x111c38).setDepth(4);
    this.add.rectangle(GAME_W - 130, GAME_H - 230, 10, 10, 0xf6de9d).setDepth(5);

    for (let y = 11; y < 18; y += 1) {
      for (let x = 0; x < 32; x += 1) {
        const color = y < 13 ? 0x1f345a : 0x172b4b;
        this.add.rectangle(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, color).setDepth(2);
      }
    }

    for (let y = 13; y <= 17; y += 1) {
      for (let x = 0; x <= 31; x += 1) {
        const block = this.add
          .rectangle(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 0x2b4e83)
          .setDepth(3);
        this.river.push(block);
      }
    }

    this.add.rectangle(GAME_W / 2, 265, GAME_W - 140, 18, 0x27365a).setDepth(7);
    this.add.rectangle(GAME_W / 2, 277, GAME_W - 140, 8, 0x1d2847).setDepth(7);

    for (let x = 90; x <= GAME_W - 90; x += 70) {
      this.add.rectangle(x, 251, 4, 24, 0x0f1422).setDepth(8);
      this.add.rectangle(x, 236, 12, 8, 0xf6e0a1, 0.95).setDepth(9);
      this.add.rectangle(x, 304, 8, 6, 0xf6e0a1, 0.18).setDepth(3);
      const glow = this.add.circle(x, 236, 13, 0xf6e0a1, 0.14).setDepth(8);
      this.lampGlows.push(glow);
      this.tweens.add({
        targets: glow,
        alpha: { from: 0.09, to: 0.2 },
        duration: 900 + ((x / 70) % 3) * 240,
        yoyo: true,
        repeat: -1
      });
    }

    for (let i = 0; i < 90; i += 1) {
      const rect = this.add
        .rectangle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, GAME_H), 1, Phaser.Math.Between(5, 9), 0xc4dcff, 0.26)
        .setAngle(-16)
        .setDepth(6);
      this.rain.push({ rect, vx: 1 + (i % 3) * 0.2, vy: 2.2 + (i % 4) * 0.3 });
    }

    this.add
      .text(GAME_W / 2, 22, 'REENCUENTRO EN LONDRES', {
        fontFamily: 'Press Start 2P',
        fontSize: '12px',
        color: '#ebf4ff'
      })
      .setOrigin(0.5)
      .setDepth(10);

    const leftKey = getState().selectedCharacter === 'her' ? 'player-her' : 'player-my';
    const rightKey = getState().selectedCharacter === 'her' ? 'player-my' : 'player-her';

    const left = this.add.image(248, 259, leftKey).setScale(1.25).setDepth(11);
    const right = this.add.image(520, 259, rightKey).setScale(1.25).setDepth(11);

    this.tweens.add({
      targets: left,
      x: 350,
      duration: 1800,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: right,
      x: 418,
      duration: 1800,
      ease: 'Sine.easeInOut'
    });

    this.dialog = new DialogBox(this);

    const lines = [
      {
        speaker: LOVE_CONFIG.myName,
        text: `Septiembre 2026 dejó de ser promesa: estábamos en Londres, por fin en el mismo lugar.`
      },
      {
        speaker: LOVE_CONFIG.girlfriendName,
        text: 'La distancia nos dolió, pero nunca pudo con nosotros.'
      },
      {
        speaker: LOVE_CONFIG.myName,
        text: 'Plot twist: la distancia no era el final. Era el puente para llegar aquí.'
      },
      {
        speaker: 'Sistema',
        text: 'Reencuentro completado. Presiona E o ENTER para abrir la carta final.'
      }
    ];

    this.dialog.start(lines, () => {
      this.readyForLetter = true;
      getState().finalSeen = true;
      getState().currentScene = 'BridgeFinalScene';
      persistSave();
      playFanfare();
    });

    this.input.keyboard?.on('keydown-E', () => this.handleAction());
    this.input.keyboard?.on('keydown-ENTER', () => this.handleAction());
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.launch('PauseScene', { returnScene: this.scene.key });
      this.scene.pause();
    });
  }

  update(time: number): void {
    this.river.forEach((r, i) => {
      r.fillColor = i % 2 === 0 ? 0x2b4e83 : 0x345d99;
      r.alpha = 0.76 + Math.sin((time + i * 18) * 0.008) * 0.22;
    });

    this.skylineFar.forEach((b, i) => {
      b.x += Math.sin((time + i * 50) * 0.0002) * 0.04;
      b.alpha = 0.4 + Math.sin((time + i * 22) * 0.002) * 0.04;
    });

    this.skylineNear.forEach((b, i) => {
      b.x += Math.sin((time + i * 30) * 0.00035) * 0.06;
    });

    for (const drop of this.rain) {
      drop.rect.x -= drop.vx;
      drop.rect.y += drop.vy;
      if (drop.rect.y > GAME_H + 8 || drop.rect.x < -8) {
        drop.rect.y = Phaser.Math.Between(-30, -8);
        drop.rect.x = Phaser.Math.Between(0, GAME_W + 40);
      }
    }

    this.stars.forEach((s, i) => {
      s.alpha = 0.35 + Math.sin((time + i * 20) * 0.01) * 0.55;
    });

    this.lampGlows.forEach((g, i) => {
      g.radius = 11 + Math.sin((time + i * 45) * 0.004) * 1.5;
    });
  }

  private handleAction(): void {
    if (this.dialog.isActive()) {
      this.dialog.advance();
      return;
    }
    if (!this.readyForLetter) return;

    playConfirmSound();
    this.showLetterOverlay();
  }

  private showLetterOverlay(): void {
    const overlay = document.getElementById('letter-overlay');
    if (!overlay) return;

    const gfName = document.getElementById('gf-name');
    const letterText = document.getElementById('letter-text');
    const jokeLine = document.getElementById('joke-line');
    const codeEl = document.getElementById('secret-code');
    const copyBtn = document.getElementById('copy-code') as HTMLButtonElement | null;
    const copyStatus = document.getElementById('copy-status');
    const replayBtn = document.getElementById('replay-final') as HTMLButtonElement | null;
    const closeBtn = document.getElementById('close-letter') as HTMLButtonElement | null;

    if (!gfName || !letterText || !jokeLine || !codeEl || !copyBtn || !copyStatus || !replayBtn || !closeBtn) return;

    gfName.textContent = LOVE_CONFIG.girlfriendName;
    letterText.textContent = `${LOVE_CONFIG.anniversaryMessage} Te amo. Con amor, ${LOVE_CONFIG.myName}.`;
    jokeLine.textContent = LOVE_CONFIG.insideJokes[Phaser.Math.Between(0, LOVE_CONFIG.insideJokes.length - 1)] ?? '';
    codeEl.textContent = LOVE_CONFIG.secretCode;
    copyStatus.textContent = '';

    copyBtn.onclick = async () => {
      const toCopy = LOVE_CONFIG.secretCode;
      try {
        await navigator.clipboard.writeText(toCopy);
        copyStatus.textContent = 'Código copiado.';
      } catch {
        copyStatus.textContent = 'No se pudo copiar automáticamente.';
      }
    };

    replayBtn.onclick = () => {
      overlay.classList.add('hidden');
      this.time.delayedCall(100, () => this.scene.restart());
    };

    closeBtn.onclick = () => {
      overlay.classList.add('hidden');
    };

    overlay.classList.remove('hidden');
  }
}
