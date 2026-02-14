import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { LOVE_CONFIG } from '../../config';
import { playConfirmSound, startMusic, unlockAudio } from '../systems/audio';
import { getState, resetState } from '../state';
import { persistSave } from '../save';

type ShootingStar = { x: number; y: number; vx: number; vy: number; life: number; trail: Phaser.GameObjects.Rectangle };

export class TitleScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Rectangle[] = [];
  private skylineFar: Phaser.GameObjects.Rectangle[] = [];
  private skylineNear: Phaser.GameObjects.Rectangle[] = [];
  private shootingStars: ShootingStar[] = [];
  private heart!: Phaser.GameObjects.Text;
  private nextShoot = 0;

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x070e22);
    startMusic(this);

    // Sky gradient layers
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x070e22);
    this.add.rectangle(GAME_W / 2, GAME_H * 0.25, GAME_W, GAME_H * 0.5, 0x0f1d42, 0.4);
    this.add.rectangle(GAME_W / 2, GAME_H * 0.45, GAME_W, GAME_H * 0.3, 0x182a5a, 0.25);
    // Horizon glow
    this.add.rectangle(GAME_W / 2, GAME_H - 110, GAME_W, 80, 0x1a2d5c, 0.3);

    // Stars (layered sizes for depth)
    for (let i = 0; i < 160; i += 1) {
      const size = i % 12 === 0 ? 3 : i % 4 === 0 ? 2 : 1;
      const color = i % 7 === 0 ? 0xf5d899 : i % 11 === 0 ? 0xffb0c0 : 0xdde9ff;
      const star = this.add
        .rectangle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, GAME_H - 110), size, size, color)
        .setAlpha(Phaser.Math.FloatBetween(0.15, 1));
      this.stars.push(star);
    }

    // Skyline far (dimmer, thinner)
    for (let x = 0; x < GAME_W; x += 28) {
      const h = Phaser.Math.Between(40, 100);
      const b = this.add.rectangle(x + 14, GAME_H - 86 - h / 2, 24, h, 0x0c1528, 0.7).setDepth(1);
      this.skylineFar.push(b);
    }

    // Skyline near (brighter, windows)
    for (let x = 0; x < GAME_W; x += 18) {
      const h = Phaser.Math.Between(44, 130);
      const b = this.add.rectangle(x + 9, GAME_H - 86 - h / 2, 18, h, 0x0b1224).setDepth(2);
      this.skylineNear.push(b);
      // Window lights (more varied)
      if (Math.random() > 0.6) {
        const wy = GAME_H - 86 - h + Phaser.Math.Between(10, h - 10);
        const color = Math.random() > 0.7 ? 0xffd4a0 : 0xffe8a2;
        this.add.rectangle(x + 4 + Phaser.Math.Between(0, 6), wy, 3, 3, color, 0.85).setDepth(3);
      }
      if (Math.random() > 0.75) {
        const wy2 = GAME_H - 86 - h + Phaser.Math.Between(20, h - 5);
        this.add.rectangle(x + Phaser.Math.Between(2, 10), wy2, 2, 2, 0xffe8a2, 0.6).setDepth(3);
      }
    }

    // Big Ben silhouette
    this.add.rectangle(GAME_W - 112, GAME_H - 180, 22, 120, 0x0f1830).setDepth(4);
    this.add.rectangle(GAME_W - 112, GAME_H - 234, 16, 14, 0x101a33).setDepth(4);
    this.add.rectangle(GAME_W - 112, GAME_H - 245, 6, 12, 0x101a33).setDepth(4);
    this.add.rectangle(GAME_W - 112, GAME_H - 180, 8, 8, 0xf5de9c).setDepth(5);
    // Clock glow
    this.add.circle(GAME_W - 112, GAME_H - 180, 14, 0xf5de9c, 0.08).setDepth(4);

    // Thames / bridge
    this.add.rectangle(GAME_W / 2, GAME_H - 70, GAME_W, 56, 0x14254a, 0.8).setDepth(1);
    this.add.rectangle(GAME_W / 2, GAME_H - 54, GAME_W, 3, 0x2a4070, 0.6).setDepth(1);
    // Water reflections
    for (let x = 10; x < GAME_W; x += Phaser.Math.Between(30, 60)) {
      const w = Phaser.Math.Between(8, 20);
      this.add.rectangle(x, GAME_H - 50 + Phaser.Math.Between(0, 16), w, 1, 0x4a7ab0, 0.25).setDepth(1);
    }

    // Bridge lamps
    for (let x = 20; x < GAME_W; x += 70) {
      this.add.rectangle(x, GAME_H - 80, 3, 24, 0x111622).setDepth(6);
      this.add.rectangle(x, GAME_H - 95, 10, 8, 0xf5e0a1, 0.95).setDepth(7);
      this.add.circle(x, GAME_H - 93, 8, 0xf5e0a1, 0.06).setDepth(6);
    }

    // Decorative border
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 16, GAME_H - 16, 0x000000, 0).setStrokeStyle(3, 0xd6e4ff).setDepth(20);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 20, GAME_H - 20, 0x000000, 0).setStrokeStyle(1, 0xd6e4ff, 0.3).setDepth(20);

    // Heart above title
    this.heart = this.add
      .text(GAME_W / 2, 48, '\u2665', {
        fontFamily: 'Press Start 2P',
        fontSize: '18px',
        color: '#ff6b95'
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Title
    this.add
      .text(GAME_W / 2, 78, 'PIXEL LOVE', {
        fontFamily: 'Press Start 2P',
        fontSize: '18px',
        color: '#f7d8a0'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, 100, 'A D V E N T U R E', {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#ffd6e8'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, 126, `${LOVE_CONFIG.dates.valentine}`, {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#8aa8d0'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, GAME_H - 156, 'Para: Mi Joanita', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#ffd6e8'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, GAME_H - 140, 'De: Tu Lalito', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#fff4c7'
      })
      .setOrigin(0.5)
      .setDepth(30);

    // Press Enter button with glow
    this.add.rectangle(GAME_W / 2, GAME_H - 76, 220, 30, 0x0d1a30, 0.9).setStrokeStyle(2, 0xd7e6ff).setDepth(30);
    this.add
      .text(GAME_W / 2, GAME_H - 76, 'PRESS ENTER', {
        fontFamily: 'Press Start 2P',
        fontSize: '11px',
        color: '#eff6ff'
      })
      .setOrigin(0.5)
      .setName('press')
      .setDepth(31);

    // Controls hint
    this.add.rectangle(GAME_W / 2, GAME_H - 28, 460, 22, 0x0c1730, 0.8).setStrokeStyle(1, 0x9db7dd, 0.5).setDepth(30);
    this.add
      .text(GAME_W / 2, GAME_H - 28, 'WASD/FLECHAS MOVER | E/ENTER INTERACT | ESC PAUSA', {
        fontFamily: 'Press Start 2P',
        fontSize: '7px',
        color: '#7090b0'
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.input.keyboard?.once('keydown-ENTER', async () => {
      await unlockAudio();
      playConfirmSound();
      const tutorialSeen = getState().flags.tutorialSeen;
      const fresh = resetState();
      fresh.flags.tutorialSeen = tutorialSeen;
      persistSave();
      this.scene.start(fresh.flags.tutorialSeen ? 'CharacterSelectScene' : 'TutorialScene');
    });
  }

  update(time: number): void {
    // Press Enter pulse
    const press = this.children.getByName('press') as Phaser.GameObjects.Text;
    if (press) {
      press.setAlpha(0.4 + Math.sin(time * 0.008) * 0.6);
    }

    // Heart pulse
    if (this.heart) {
      const scale = 1 + Math.sin(time * 0.006) * 0.12;
      this.heart.setScale(scale);
      this.heart.setAlpha(0.7 + Math.sin(time * 0.006) * 0.3);
    }

    // Stars twinkle (varied speeds)
    for (let i = 0; i < this.stars.length; i += 1) {
      const star = this.stars[i];
      star.alpha = 0.2 + Math.sin((time + i * 37) * (0.003 + (i % 5) * 0.001)) * 0.7;
      star.y += 0.02 + (i % 6) * 0.015;
      if (star.y > GAME_H - 80) {
        star.y = -2;
        star.x = Phaser.Math.Between(0, GAME_W);
      }
    }

    // Skyline subtle parallax
    for (let i = 0; i < this.skylineFar.length; i += 1) {
      this.skylineFar[i].x += Math.sin((time + i * 60) * 0.0001) * 0.02;
    }

    // Shooting stars
    if (time > this.nextShoot) {
      this.spawnShootingStar();
      this.nextShoot = time + Phaser.Math.Between(2000, 5000);
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i -= 1) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= 1;
      ss.trail.setPosition(ss.x, ss.y);
      ss.trail.setAlpha(ss.life / 40);
      if (ss.life <= 0) {
        ss.trail.destroy();
        this.shootingStars.splice(i, 1);
      }
    }
  }

  private spawnShootingStar(): void {
    const x = Phaser.Math.Between(50, GAME_W - 50);
    const trail = this.add.rectangle(x, Phaser.Math.Between(20, 120), 12, 2, 0xffffff, 0.8).setAngle(-25).setDepth(15);
    this.shootingStars.push({
      x,
      y: trail.y,
      vx: 3 + Math.random() * 2,
      vy: 1.2 + Math.random(),
      life: 40,
      trail
    });
  }
}
