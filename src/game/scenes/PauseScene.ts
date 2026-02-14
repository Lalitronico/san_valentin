import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(data: { returnScene: string }): void {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x03070f, 0.75);
    this.add
      .text(GAME_W / 2, GAME_H / 2 - 14, 'PAUSA', {
        fontFamily: 'Press Start 2P',
        fontSize: '14px',
        color: '#f2f6ff'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2, GAME_H / 2 + 16, 'ESC / ENTER PARA VOLVER', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#bfd7ff'
      })
      .setOrigin(0.5);

    const resume = (): void => {
      this.scene.stop();
      this.scene.resume(data.returnScene);
    };

    this.input.keyboard?.once('keydown-ESC', resume);
    this.input.keyboard?.once('keydown-ENTER', resume);
  }
}
