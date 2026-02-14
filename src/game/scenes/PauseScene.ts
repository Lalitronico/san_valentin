import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { isMuted, startMusic, stopMusic, toggleMute } from '../systems/audio';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(data: { returnScene: string }): void {
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x03070f, 0.75);

    this.add
      .text(GAME_W / 2, GAME_H / 2 - 50, 'PAUSA', {
        fontFamily: 'Press Start 2P',
        fontSize: '14px',
        color: '#f2f6ff'
      })
      .setOrigin(0.5);

    // Sound toggle
    const soundLabel = this.add
      .text(GAME_W / 2, GAME_H / 2 - 10, this.soundText(), {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color: '#ffe39f'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    soundLabel.on('pointerdown', () => {
      toggleMute();
      soundLabel.setText(this.soundText());
      if (!isMuted()) {
        startMusic(this);
      }
    });

    this.input.keyboard?.on('keydown-M', () => {
      toggleMute();
      soundLabel.setText(this.soundText());
      if (!isMuted()) {
        startMusic(this);
      }
    });

    // Return to title
    const titleLabel = this.add
      .text(GAME_W / 2, GAME_H / 2 + 20, '[ T ] VOLVER AL TITULO', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#bfd7ff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    titleLabel.on('pointerdown', () => {
      this.scene.stop();
      this.scene.stop(data.returnScene);
      stopMusic();
      this.scene.start('TitleScene');
    });

    this.input.keyboard?.on('keydown-T', () => {
      this.scene.stop();
      this.scene.stop(data.returnScene);
      stopMusic();
      this.scene.start('TitleScene');
    });

    this.add
      .text(GAME_W / 2, GAME_H / 2 + 52, 'ESC / ENTER PARA VOLVER', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#8aa5cc'
      })
      .setOrigin(0.5);

    const resume = (): void => {
      this.scene.stop();
      this.scene.resume(data.returnScene);
    };

    this.input.keyboard?.once('keydown-ESC', resume);
    this.input.keyboard?.once('keydown-ENTER', resume);
  }

  private soundText(): string {
    return isMuted() ? '[ M ] SONIDO: OFF' : '[ M ] SONIDO: ON';
  }
}
