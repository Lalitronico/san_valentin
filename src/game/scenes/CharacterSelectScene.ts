import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { ensureCoreTextures } from '../systems/textureFactory';
import { getState } from '../state';
import { persistSave } from '../save';
import { playConfirmSound, startMusic } from '../systems/audio';

export class CharacterSelectScene extends Phaser.Scene {
  private selected = 0;
  private cards: Phaser.GameObjects.Rectangle[] = [];
  private warningText!: Phaser.GameObjects.Text;

  constructor() {
    super('CharacterSelectScene');
  }

  create(): void {
    ensureCoreTextures(this);
    startMusic(this);
    this.cameras.main.setBackgroundColor(0x15233b);

    this.add
      .text(GAME_W / 2, 42, 'ELIGE PERSONAJE', {
        fontFamily: 'Press Start 2P',
        fontSize: '13px',
        color: '#ffe6b2'
      })
      .setOrigin(0.5);

    const leftCard = this.add.rectangle(GAME_W / 2 - 140, 190, 180, 220, 0x263b5a).setStrokeStyle(3, 0xe3eeff);
    const rightCard = this.add.rectangle(GAME_W / 2 + 140, 190, 180, 220, 0x263b5a).setStrokeStyle(3, 0x8ea7cc);
    this.cards = [leftCard, rightCard];

    this.add.image(GAME_W / 2 - 140, 150, 'player-my').setScale(4.3);
    this.add.image(GAME_W / 2 + 140, 150, 'player-her').setScale(4.3);

    this.add
      .text(GAME_W / 2 - 140, 242, 'EDUARDO VERA', {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color: '#d4e5ff'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2 + 140, 242, 'JOANA VASTI', {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color: '#ffd7e7'
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2, GAME_H - 34, '← → PARA CAMBIAR | ENTER PARA CONFIRMAR', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#bdd7ff'
      })
      .setOrigin(0.5);

    this.warningText = this.add
      .text(GAME_W / 2, GAME_H - 56, '', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#ffd7e8'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.input.keyboard?.on('keydown-LEFT', () => this.change(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.change(1));
    this.input.keyboard?.on('keydown-ENTER', () => this.confirm());

    this.refresh();
  }

  private change(dir: number): void {
    this.selected = Phaser.Math.Wrap(this.selected + dir, 0, 2);
    this.refresh();
  }

  private refresh(): void {
    this.cards.forEach((card, i) => {
      card.setStrokeStyle(3, i === this.selected ? 0xffe39f : 0x8ea7cc);
    });
  }

  private confirm(): void {
    if (this.selected === 0) {
      this.warningText.setText('Esa es otra historia...');
      this.warningText.setAlpha(1);
      this.tweens.killTweensOf(this.warningText);
      this.tweens.add({
        targets: this.warningText,
        alpha: 0,
        duration: 1800,
        ease: 'Sine.easeOut'
      });
      return;
    }

    getState().selectedCharacter = this.selected === 0 ? 'my' : 'her';
    getState().currentScene = 'CityScene';
    persistSave();
    playConfirmSound();
    this.scene.start('CityScene');
  }
}
