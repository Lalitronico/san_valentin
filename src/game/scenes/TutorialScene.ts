import Phaser from 'phaser';
import { GAME_H, GAME_W } from '../constants';
import { persistSave } from '../save';
import { resetState } from '../state';
import { playConfirmSound, startMusic } from '../systems/audio';
import { ensureCoreTextures } from '../systems/textureFactory';

export class TutorialScene extends Phaser.Scene {
  constructor() {
    super('TutorialScene');
  }

  create(): void {
    ensureCoreTextures(this);
    startMusic(this);
    this.cameras.main.setBackgroundColor(0x0f203a);

    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0b1831);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 44, GAME_H - 44, 0x132947).setStrokeStyle(4, 0xe4f0ff);

    this.add
      .text(GAME_W / 2, 54, 'TUTORIAL DE AVENTURA', {
        fontFamily: 'Press Start 2P',
        fontSize: '13px',
        color: '#ffe3a8'
      })
      .setOrigin(0.5);

    const cards = [
      { x: 190, y: 168, title: 'EXPLORA', icon: 'sign', lines: ['WASD/Flechas', 'para moverte'] },
      { x: 384, y: 168, title: 'INTERACTUA', icon: 'memory', lines: ['E o ENTER', 'para hablar/tomar'] },
      { x: 578, y: 168, title: 'TRANSFORMA', icon: 'encounter', lines: ['Elige opcion', 'en cada momento'] }
    ];

    cards.forEach((c) => {
      this.add.rectangle(c.x, c.y, 172, 132, 0x1c3658).setStrokeStyle(2, 0xc8dfff);
      this.add.image(c.x, c.y - 30, c.icon).setScale(1.4);
      this.add
        .text(c.x, c.y + 8, c.title, {
          fontFamily: 'Press Start 2P',
          fontSize: '8px',
          color: '#ffe9b8'
        })
        .setOrigin(0.5);
      this.add
        .text(c.x, c.y + 31, c.lines.join('\n'), {
          fontFamily: 'Press Start 2P',
          fontSize: '7px',
          color: '#dce9ff',
          align: 'center'
        })
        .setOrigin(0.5);
    });

    this.add.rectangle(GAME_W / 2, 298, GAME_W - 128, 90, 0x1a3354).setStrokeStyle(2, 0xc8dfff);
    this.add
      .text(
        GAME_W / 2,
        280,
        'OBJETIVO\nJunta 6 recuerdos, supera Duda/Distancia/Extrañar\ny llega al puente de Londres para el reencuentro.',
        {
          fontFamily: 'Press Start 2P',
          fontSize: '8px',
          color: '#dbe9ff',
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5);

    this.add
      .text(GAME_W / 2, GAME_H - 100, 'TIP: SI TE PIERDES, MIRA EL OBJETIVO ARRIBA EN PANTALLA', {
        fontFamily: 'Press Start 2P',
        fontSize: '8px',
        color: '#ffd7e8'
      })
      .setOrigin(0.5);

    this.add.rectangle(GAME_W / 2, 368, 320, 30, 0x0d1a30).setStrokeStyle(2, 0xd7e6ff);
    this.add
      .text(GAME_W / 2, 368, 'PRESS ENTER PARA COMENZAR', {
        fontFamily: 'Press Start 2P',
        fontSize: '9px',
        color: '#eff6ff'
      })
      .setOrigin(0.5)
      .setName('press');

    this.input.keyboard?.once('keydown-ENTER', () => {
      playConfirmSound();
      const state = resetState();
      state.flags.tutorialSeen = true;
      state.currentScene = 'CityScene';
      persistSave();
      this.scene.start('CharacterSelectScene');
    });
  }

  update(time: number): void {
    const press = this.children.getByName('press') as Phaser.GameObjects.Text;
    if (press) {
      press.setAlpha(0.45 + Math.sin(time * 0.01) * 0.55);
    }
  }
}
