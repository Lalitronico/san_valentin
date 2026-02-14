import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { createLondonData } from '../systems/worldData';
import { BaseExplorationScene } from './BaseExplorationScene';

export class LondonScene extends BaseExplorationScene {
  private rain: Phaser.GameObjects.Rectangle[] = [];
  private skylineFar: Phaser.GameObjects.Rectangle[] = [];
  private skylineNear: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('LondonScene');
  }

  create(): void {
    for (let x = 0; x < GAME_W; x += 28) {
      const h = Phaser.Math.Between(30, 70);
      const b = this.add.rectangle(x + 14, 86 - h / 2, 24, h, 0x14264b, 0.55).setDepth(0);
      this.skylineFar.push(b);
    }

    for (let x = 0; x < GAME_W; x += 24) {
      const h = Phaser.Math.Between(48, 110);
      const b = this.add.rectangle(x + 12, 112 - h / 2, 20, h, 0x0e1d3a, 0.75).setDepth(0);
      this.skylineNear.push(b);
    }

    for (let i = 0; i < 120; i += 1) {
      const drop = this.add
        .rectangle(Phaser.Math.Between(0, GAME_W), Phaser.Math.Between(0, GAME_H), 1, Phaser.Math.Between(5, 10), 0xb9d4ff, 0.35)
        .setAngle(-18)
        .setDepth(35);
      this.rain.push(drop);
    }

    super.create();
  }

  update(time: number): void {
    super.update(time);

    this.skylineFar.forEach((b, i) => {
      b.x += Math.sin((time + i * 40) * 0.0002) * 0.04;
      b.alpha = 0.48 + Math.sin((time + i * 20) * 0.002) * 0.04;
    });

    this.skylineNear.forEach((b, i) => {
      b.x += Math.sin((time + i * 25) * 0.00035) * 0.06;
      b.alpha = 0.7 + Math.sin((time + i * 18) * 0.0024) * 0.05;
    });

    this.rain.forEach((drop, i) => {
      drop.x -= 1.2 + (i % 3) * 0.2;
      drop.y += 2.7 + (i % 4) * 0.35;
      if (drop.y > GAME_H + 8 || drop.x < -8) {
        drop.y = Phaser.Math.Between(-40, -10);
        drop.x = Phaser.Math.Between(0, GAME_W + 40);
      }
    });
  }

  protected buildWorld() {
    return createLondonData();
  }
}
