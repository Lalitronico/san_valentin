import Phaser from 'phaser';
import './style.css';
import { GAME_H, GAME_W } from './game/constants';
import { BootScene } from './game/scenes/BootScene';
import { TitleScene } from './game/scenes/TitleScene';
import { TutorialScene } from './game/scenes/TutorialScene';
import { CharacterSelectScene } from './game/scenes/CharacterSelectScene';
import { CityScene } from './game/scenes/CityScene';
import { CampusScene } from './game/scenes/CampusScene';
import { LondonScene } from './game/scenes/LondonScene';
import { BridgeFinalScene } from './game/scenes/BridgeFinalScene';
import { PauseScene } from './game/scenes/PauseScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_W,
  height: GAME_H,
  backgroundColor: '#0f1e34',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, TitleScene, TutorialScene, CharacterSelectScene, CityScene, CampusScene, LondonScene, BridgeFinalScene, PauseScene]
});

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});
