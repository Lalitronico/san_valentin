import Phaser from 'phaser';
import { GAME_W } from '../constants';
import { createLondonData } from '../systems/worldData';
import { BaseExplorationScene } from './BaseExplorationScene';

export class LondonScene extends BaseExplorationScene {
  private skylineFar: Phaser.GameObjects.Rectangle[] = [];
  private skylineNear: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('LondonScene');
  }

  create(): void {
    // Distant skyline (behind tiles at depth 0)
    for (let x = 0; x < GAME_W; x += 28) {
      const h = Phaser.Math.Between(30, 70);
      const b = this.add.rectangle(x + 14, 86 - h / 2, 24, h, 0x0a1830, 0.55).setDepth(0);
      this.skylineFar.push(b);
    }

    for (let x = 0; x < GAME_W; x += 24) {
      const h = Phaser.Math.Between(48, 110);
      const b = this.add.rectangle(x + 12, 112 - h / 2, 20, h, 0x060e20, 0.75).setDepth(0);
      this.skylineNear.push(b);
    }

    super.create(); // tiles, rain, player, etc.
  }

  update(time: number): void {
    super.update(time); // handles rain, water, etc.

    this.skylineFar.forEach((b, i) => {
      b.x += Math.sin((time + i * 40) * 0.0002) * 0.04;
      b.alpha = 0.48 + Math.sin((time + i * 20) * 0.002) * 0.04;
    });

    this.skylineNear.forEach((b, i) => {
      b.x += Math.sin((time + i * 25) * 0.00035) * 0.06;
      b.alpha = 0.7 + Math.sin((time + i * 18) * 0.0024) * 0.05;
    });
  }

  protected buildWorld() {
    return createLondonData();
  }
}
