import Phaser from 'phaser';
import { COLORS, GAME_W } from '../constants';

export class Hud {
  private label: Phaser.GameObjects.Text;
  private memoryText: Phaser.GameObjects.Text;
  private objectiveBg: Phaser.GameObjects.Rectangle;
  private objectiveText: Phaser.GameObjects.Text;
  private barBg: Phaser.GameObjects.Rectangle;
  private bar: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    const panel = scene.add.rectangle(154, 28, 300, 40, 0x102037).setStrokeStyle(3, COLORS.uiEdge).setDepth(40);
    this.label = scene.add
      .text(20, 18, 'LOVE', {
        fontFamily: 'Press Start 2P',
        fontSize: '10px',
        color: '#ffd4e5'
      })
      .setDepth(41);
    this.barBg = scene.add.rectangle(114, 31, 124, 12, 0x060b14).setDepth(41);
    this.bar = scene.add.rectangle(52, 31, 0, 12, COLORS.love).setOrigin(0, 0.5).setDepth(42);
    this.memoryText = scene.add
      .text(192, 18, 'RECUERDOS: 0/6', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#ffebaa'
      })
      .setDepth(41);

    this.objectiveBg = scene.add
      .rectangle(GAME_W - 198, 28, 382, 24, 0x11223b, 0.88)
      .setStrokeStyle(2, 0xbdd7ff)
      .setDepth(40);
    this.objectiveText = scene.add
      .text(GAME_W - 198, 21, '', {
        fontFamily: 'Press Start 2P',
        fontSize: '6px',
        color: '#d5e8ff',
        wordWrap: { width: 360, useAdvancedWrap: false }
      })
      .setOrigin(0.5, 0)
      .setDepth(41);

    panel.setScrollFactor(0);
    this.label.setScrollFactor(0);
    this.barBg.setScrollFactor(0);
    this.bar.setScrollFactor(0);
    this.memoryText.setScrollFactor(0);
    this.objectiveBg.setScrollFactor(0);
    this.objectiveText.setScrollFactor(0);
  }

  update(loveMeter: number, memoryCount: number, objective: string): void {
    const width = Phaser.Math.Clamp((loveMeter / 100) * 124, 0, 124);
    this.bar.width = width;
    this.memoryText.setText(`RECUERDOS: ${memoryCount}/6`);
    this.objectiveText.setText(objective);
  }

  destroy(): void {
    this.label.destroy();
    this.memoryText.destroy();
    this.objectiveBg.destroy();
    this.objectiveText.destroy();
    this.barBg.destroy();
    this.bar.destroy();
  }
}
