import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { LOVE_CONFIG } from '../../config';
import { playConfirmSound, startMusic, unlockAudio } from '../systems/audio';
import { getState, resetState } from '../state';
import { persistSave } from '../save';

export class TitleScene extends Phaser.Scene {
  private stars: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x0b1630);
    startMusic(this);

    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a1630);
    this.add.rectangle(GAME_W / 2, GAME_H * 0.33, GAME_W, GAME_H * 0.66, 0x1a2d5c, 0.22);
    this.add.rectangle(GAME_W / 2, GAME_H * 0.52, GAME_W, GAME_H * 0.36, 0x223566, 0.22);

    for (let i = 0; i < 130; i += 1) {
      const star = this.add
        .rectangle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, GAME_H - 100), 2, 2, i % 5 === 0 ? 0xf5d899 : 0xdde9ff)
        .setAlpha(Phaser.Math.FloatBetween(0.25, 1));
      this.stars.push(star);
    }

    for (let x = 0; x < GAME_W; x += 18) {
      const h = Phaser.Math.Between(44, 130);
      this.add.rectangle(x + 9, GAME_H - 86 - h / 2, 18, h, 0x0b1224).setDepth(2);
      if (Math.random() > 0.72) {
        this.add.rectangle(x + 4, GAME_H - 86 - h + Phaser.Math.Between(10, 30), 3, 3, 0xffe8a2, 0.85).setDepth(3);
      }
    }

    this.add.rectangle(GAME_W - 112, GAME_H - 180, 22, 120, 0x0f1830).setDepth(4);
    this.add.rectangle(GAME_W - 112, GAME_H - 234, 16, 14, 0x101a33).setDepth(4);
    this.add.rectangle(GAME_W - 112, GAME_H - 180, 8, 8, 0xf5de9c).setDepth(5);

    this.add.rectangle(GAME_W / 2, GAME_H - 70, GAME_W, 56, 0x1e2f58, 0.75).setDepth(1);
    this.add.rectangle(GAME_W / 2, GAME_H - 54, GAME_W, 5, 0x374f82, 0.8).setDepth(1);

    for (let x = 20; x < GAME_W; x += 70) {
      this.add.rectangle(x, GAME_H - 80, 3, 24, 0x111622).setDepth(6);
      this.add.rectangle(x, GAME_H - 95, 10, 8, 0xf5e0a1, 0.95).setDepth(7);
    }

    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 16, GAME_H - 16, 0x000000, 0).setStrokeStyle(3, 0xd6e4ff).setDepth(20);

    this.add
      .text(GAME_W / 2, 74, 'MONSTER-ADVENTURE', {
        fontFamily: 'Press Start 2P',
        fontSize: '16px',
        color: '#f7d8a0'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, 106, `Pixel Love Story`, {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#ffd6e8'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, 136, `${LOVE_CONFIG.dates.valentine}`, {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#bdd7ff'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add
      .text(GAME_W / 2, GAME_H - 142, `Para ${LOVE_CONFIG.girlfriendName}`, {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color: '#fff4c7'
      })
      .setOrigin(0.5)
      .setDepth(30);

    this.add.rectangle(GAME_W / 2, GAME_H - 76, 220, 30, 0x0d1a30).setStrokeStyle(2, 0xd7e6ff).setDepth(30);
    this.add
      .text(GAME_W / 2, GAME_H - 76, 'PRESS ENTER', {
        fontFamily: 'Press Start 2P',
        fontSize: '11px',
        color: '#eff6ff'
      })
      .setOrigin(0.5)
      .setName('press')
      .setDepth(31);

    this.add.rectangle(GAME_W / 2, GAME_H - 28, 460, 22, 0x0c1730).setStrokeStyle(1, 0x9db7dd).setDepth(30);
    this.add
      .text(GAME_W / 2, GAME_H - 28, 'WASD/FLECHAS MOVER | E/ENTER INTERACT | ESC PAUSA', {
        fontFamily: 'Press Start 2P',
        fontSize: '7px',
        color: '#9bb8dd'
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
    const press = this.children.getByName('press') as Phaser.GameObjects.Text;
    if (press) {
      press.setAlpha(0.45 + Math.sin(time * 0.01) * 0.55);
    }

    this.stars.forEach((star, i) => {
      star.y += 0.04 + (i % 4) * 0.03;
      if (star.y > GAME_H - 70) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, GAME_W);
      }
    });
  }
}
