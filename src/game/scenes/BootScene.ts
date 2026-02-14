import Phaser from 'phaser';
import { loadSave, persistSave } from '../save';
import { getState } from '../state';
import { ensureCoreTextures } from '../systems/textureFactory';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    ensureCoreTextures(this);
    Object.assign(getState(), loadSave());
    persistSave();
    this.scene.start('TitleScene');
  }
}
