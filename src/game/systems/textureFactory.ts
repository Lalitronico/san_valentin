import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

const px = (g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, alpha = 1): void => {
  g.fillStyle(color, alpha);
  g.fillRect(x, y, w, h);
};

const createGrassTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-grass')) return;
  const g = scene.add.graphics();
  // Base with subtle gradient
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x3a6a55);
  px(g, 0, 0, TILE_SIZE, TILE_SIZE / 2, 0x3f705b);
  // Dithered noise for natural feel
  for (let i = 0; i < 40; i += 1) {
    const x = (i * 7 + 3) % TILE_SIZE;
    const y = (i * 11 + 5) % TILE_SIZE;
    const colors = [0x4e846b, 0x355d4b, 0x447a60, 0x3d6d56];
    px(g, x, y, 2, 2, colors[i % 4]);
  }
  // Grass blades (vertical strokes)
  for (let i = 0; i < 8; i += 1) {
    const x = (i * 3 + 1) % TILE_SIZE;
    const y = (i * 5 + 2) % TILE_SIZE;
    px(g, x, y, 1, 3, 0x5a9e78, 0.6);
  }
  // Tiny flowers
  px(g, 4, 6, 1, 1, 0xf0e0a0);
  px(g, 5, 5, 1, 1, 0xe08090);
  px(g, 16, 15, 1, 1, 0xf0e0a0);
  px(g, 17, 14, 1, 1, 0xe08090);
  px(g, 20, 8, 1, 2, 0x6da96f);
  px(g, 10, 20, 1, 1, 0xf5d0a0, 0.7);
  g.generateTexture('tile-grass', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createPathTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-path')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0xbdb6a5);
  px(g, 0, 0, TILE_SIZE, 2, 0x938b7a);
  px(g, 0, TILE_SIZE - 2, TILE_SIZE, 2, 0x938b7a);
  px(g, 0, 0, 2, TILE_SIZE, 0x938b7a);
  px(g, TILE_SIZE - 2, 0, 2, TILE_SIZE, 0x938b7a);
  for (let x = 3; x < TILE_SIZE; x += 6) px(g, x, 0, 1, TILE_SIZE, 0x9f9787, 0.6);
  for (let y = 4; y < TILE_SIZE; y += 8) px(g, 2, y, TILE_SIZE - 4, 1, 0xcfc7b8, 0.4);
  g.generateTexture('tile-path', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createRoadTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-road')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x2a3448);
  for (let i = 1; i < TILE_SIZE; i += 5) {
    px(g, i, 2, 1, 1, 0x3a465f);
    px(g, i + 1, 14, 1, 1, 0x1d2535);
  }
  px(g, 0, TILE_SIZE / 2 - 1, TILE_SIZE, 2, 0xe5d38e, 0.95);
  for (let x = 2; x < TILE_SIZE; x += 7) px(g, x, TILE_SIZE / 2 - 1, 4, 2, 0x2a3448);
  g.generateTexture('tile-road', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createWaterTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-water')) return;
  const g = scene.add.graphics();
  // Depth gradient
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x2e5081);
  px(g, 0, 0, TILE_SIZE, 8, 0x3a6298, 0.5);
  px(g, 0, TILE_SIZE - 6, TILE_SIZE, 6, 0x1e3d67, 0.6);
  // Wave lines (staggered for realism)
  for (let y = 3; y < TILE_SIZE; y += 4) {
    const offset = (y / 4) % 2 === 0 ? 0 : 3;
    px(g, 1 + offset, y, TILE_SIZE - 4, 1, 0x6090c0, 0.4);
  }
  // Shimmer highlights
  px(g, 3, 2, 3, 1, 0xc0e0ff, 0.5);
  px(g, 14, 6, 2, 1, 0xc0e0ff, 0.4);
  px(g, 8, 14, 4, 1, 0xc0e0ff, 0.35);
  px(g, 1, 10, 2, 1, 0xb7d8ff, 0.45);
  px(g, 18, 18, 3, 1, 0xb7d8ff, 0.35);
  g.generateTexture('tile-water', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createBorderTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-border')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x3f4c63);
  for (let y = 0; y < TILE_SIZE; y += 4) {
    px(g, 0, y, TILE_SIZE, 1, 0x2f394c, 0.8);
  }
  for (let x = 0; x < TILE_SIZE; x += 7) {
    px(g, x, 1, 2, 1, 0x657895, 0.6);
  }
  px(g, 0, 0, TILE_SIZE, 2, 0x7083a1, 0.45);
  g.generateTexture('tile-border', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createBrickTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-brick')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x6c3538);
  for (let y = 0; y < TILE_SIZE; y += 6) px(g, 0, y, TILE_SIZE, 1, 0x4f2427);
  for (let y = 0; y < TILE_SIZE; y += 6) {
    const offset = (y / 6) % 2 === 0 ? 0 : 6;
    for (let x = offset; x < TILE_SIZE; x += 12) px(g, x, y, 1, 6, 0x4f2427);
  }
  for (let y = 2; y < TILE_SIZE; y += 6) for (let x = 2; x < TILE_SIZE; x += 12) px(g, x, y, 4, 2, 0x894a4e, 0.45);
  g.generateTexture('tile-brick', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createWindowTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-window')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x6c3538);
  px(g, 3, 3, TILE_SIZE - 6, TILE_SIZE - 6, 0xcfc7b9);
  px(g, 5, 5, TILE_SIZE - 10, TILE_SIZE - 10, 0x93aec7);
  px(g, TILE_SIZE / 2 - 1, 5, 2, TILE_SIZE - 10, 0x6f7d8b);
  px(g, 5, TILE_SIZE / 2 - 1, TILE_SIZE - 10, 2, 0x6f7d8b);
  g.generateTexture('tile-window', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createDoorTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-door')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x6c3538);
  px(g, 5, 3, TILE_SIZE - 10, TILE_SIZE - 4, 0x7a5035);
  px(g, 7, 5, TILE_SIZE - 14, TILE_SIZE - 8, 0x8c6144);
  px(g, TILE_SIZE - 8, TILE_SIZE / 2, 2, 2, 0xf0d48a);
  g.generateTexture('tile-door', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createFloorTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-floor')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0xc8c3b8);
  for (let i = 0; i <= TILE_SIZE; i += 6) {
    px(g, i, 0, 1, TILE_SIZE, 0x9e988e);
    px(g, 0, i, TILE_SIZE, 1, 0x9e988e);
  }
  px(g, 1, 1, TILE_SIZE - 2, 1, 0xded8cc, 0.5);
  px(g, 1, TILE_SIZE - 2, TILE_SIZE - 2, 1, 0x8a8479, 0.6);
  g.generateTexture('tile-floor', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createBusTile = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('tile-bus')) return;
  const g = scene.add.graphics();
  px(g, 0, 0, TILE_SIZE, TILE_SIZE, 0x1f2637);
  px(g, 1, 6, TILE_SIZE - 2, TILE_SIZE - 8, 0xb12d37);
  px(g, 3, 8, TILE_SIZE - 6, 3, 0xe8cd8f);
  px(g, 3, 12, TILE_SIZE - 6, 3, 0x9bb4d3);
  px(g, 3, 16, TILE_SIZE - 6, 4, 0xa4373d);
  px(g, 4, TILE_SIZE - 4, 4, 2, 0x111722);
  px(g, TILE_SIZE - 8, TILE_SIZE - 4, 4, 2, 0x111722);
  g.generateTexture('tile-bus', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

type CharacterStyle = {
  shirt: number;
  skin: number;
  hair: number;
  eye: number;
  pants: number;
};

const createCharacter = (scene: Phaser.Scene, key: string, style: CharacterStyle): void => {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const outline = 0x0a0e16;
  const shadow = 0x00000040;
  const hairHi = Phaser.Display.Color.IntegerToColor(style.hair).brighten(18).color;
  const skinHi = Phaser.Display.Color.IntegerToColor(style.skin).brighten(12).color;
  const skinSh = Phaser.Display.Color.IntegerToColor(style.skin).darken(16).color;
  const shirtHi = Phaser.Display.Color.IntegerToColor(style.shirt).brighten(14).color;
  const shirtSh = Phaser.Display.Color.IntegerToColor(style.shirt).darken(18).color;

  // Hair (rounded top with highlight)
  px(g, 8, 2, 8, 1, style.hair);
  px(g, 7, 3, 10, 4, style.hair);
  px(g, 8, 3, 6, 1, hairHi);

  // Head outline
  px(g, 7, 2, 1, 1, outline);
  px(g, 16, 2, 1, 1, outline);
  px(g, 6, 3, 1, 5, outline);
  px(g, 17, 3, 1, 5, outline);

  // Face
  px(g, 7, 6, 10, 5, style.skin);
  px(g, 8, 6, 8, 1, skinHi);
  px(g, 7, 10, 10, 1, skinSh);

  // Eyes (2px wide with pupil)
  px(g, 9, 7, 2, 2, 0xffffff);
  px(g, 10, 8, 1, 1, style.eye);
  px(g, 13, 7, 2, 2, 0xffffff);
  px(g, 14, 8, 1, 1, style.eye);

  // Mouth
  px(g, 11, 9, 2, 1, skinSh);

  // Body / shirt with shading
  px(g, 7, 11, 10, 7, style.shirt);
  px(g, 8, 11, 8, 1, shirtHi);
  px(g, 7, 17, 10, 1, shirtSh);
  // Collar
  px(g, 10, 11, 4, 1, 0xffffff, 0.3);

  // Body outline
  px(g, 6, 11, 1, 8, outline);
  px(g, 17, 11, 1, 8, outline);

  // Arms with shading
  px(g, 5, 12, 2, 6, style.skin);
  px(g, 5, 12, 2, 1, skinHi);
  px(g, 17, 12, 2, 6, style.skin);
  px(g, 17, 12, 2, 1, skinHi);
  // Arm outline
  px(g, 4, 12, 1, 6, outline);
  px(g, 19, 12, 1, 6, outline);

  // Pants
  px(g, 7, 18, 4, 3, style.pants);
  px(g, 13, 18, 4, 3, style.pants);
  // Gap between legs
  px(g, 11, 19, 2, 2, outline, 0.3);

  // Shoes
  px(g, 7, 21, 4, 2, 0x1a1e28);
  px(g, 13, 21, 4, 2, 0x1a1e28);
  px(g, 8, 21, 2, 1, 0x2a3040);

  // Drop shadow
  px(g, 8, 23, 8, 1, shadow as number, 0.2);

  g.generateTexture(key, TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createNpcVariant = (scene: Phaser.Scene, key: string, style: CharacterStyle): void => {
  if (scene.textures.exists(key)) return;
  createCharacter(scene, key, style);
};

const createPhoneBooth = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-phonebooth')) return;
  const g = scene.add.graphics();
  px(g, 2, 1, TILE_SIZE - 4, TILE_SIZE - 2, 0xa32d34);
  px(g, 4, 3, TILE_SIZE - 8, 4, 0xcc766c);
  px(g, 5, 8, TILE_SIZE - 10, TILE_SIZE - 12, 0x9db0c6);
  px(g, 6, 9, TILE_SIZE - 12, TILE_SIZE - 14, 0x72859c);
  px(g, 1, TILE_SIZE - 3, TILE_SIZE - 2, 2, 0x202636);
  g.generateTexture('prop-phonebooth', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createPostBox = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-postbox')) return;
  const g = scene.add.graphics();
  px(g, 5, 4, TILE_SIZE - 10, TILE_SIZE - 8, 0xa42b32);
  px(g, 6, 6, TILE_SIZE - 12, 2, 0xcf7a70);
  px(g, 8, 10, TILE_SIZE - 16, 2, 0xe6e6e6);
  px(g, 9, 13, TILE_SIZE - 18, 4, 0x7f1d26);
  px(g, 4, TILE_SIZE - 4, TILE_SIZE - 8, 3, 0x242a3a);
  g.generateTexture('prop-postbox', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createLamp = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-lamp')) return;
  const g = scene.add.graphics();
  px(g, TILE_SIZE / 2 - 1, 4, 2, TILE_SIZE - 8, 0x1a1f2a);
  px(g, TILE_SIZE / 2 - 5, 4, 10, 5, 0xf4df9e);
  px(g, TILE_SIZE / 2 - 6, 3, 12, 1, 0x0f131d);
  px(g, TILE_SIZE / 2 - 4, TILE_SIZE - 4, 8, 3, 0x2c3242);
  g.generateTexture('prop-lamp', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createTaxi = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-taxi')) return;
  const g = scene.add.graphics();
  px(g, 2, 10, TILE_SIZE - 4, 8, 0x1b2230);
  px(g, 5, 7, TILE_SIZE - 10, 4, 0x2a3140);
  px(g, 7, 11, 4, 4, 0x7b8ba0);
  px(g, 13, 11, 4, 4, 0x7b8ba0);
  px(g, 4, TILE_SIZE - 4, 4, 2, 0x0d1119);
  px(g, TILE_SIZE - 8, TILE_SIZE - 4, 4, 2, 0x0d1119);
  px(g, TILE_SIZE / 2 - 2, 6, 4, 2, 0xe0c46e);
  g.generateTexture('prop-taxi', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createGuard = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-guard')) return;
  const g = scene.add.graphics();
  px(g, 9, 2, 6, 7, 0x090b10);
  px(g, 10, 9, 4, 4, 0xe6c7a5);
  px(g, 8, 13, 8, 7, 0xc13a3a);
  px(g, 7, TILE_SIZE - 4, 3, 3, 0x0d1119);
  px(g, 14, TILE_SIZE - 4, 3, 3, 0x0d1119);
  g.generateTexture('prop-guard', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createBusProp = (scene: Phaser.Scene): void => {
  if (scene.textures.exists('prop-bus')) return;
  const g = scene.add.graphics();
  // Better London bus silhouette.
  px(g, 1, 6, TILE_SIZE - 2, TILE_SIZE - 8, 0xb6313b);
  px(g, 2, 5, TILE_SIZE - 4, 2, 0xd46f60);
  px(g, 4, 8, TILE_SIZE - 8, 3, 0xe8d09a);
  px(g, 4, 12, TILE_SIZE - 8, 3, 0x98b5d7);
  px(g, TILE_SIZE - 8, 11, 4, 7, 0x2d3647);
  px(g, 4, TILE_SIZE - 4, 4, 2, 0x111722);
  px(g, TILE_SIZE - 8, TILE_SIZE - 4, 4, 2, 0x111722);
  g.generateTexture('prop-bus', TILE_SIZE, TILE_SIZE);
  g.destroy();
};

const createSymbol = (scene: Phaser.Scene, key: string, fill: number): void => {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  const dark = Phaser.Display.Color.IntegerToColor(fill).darken(30).color;
  const light = Phaser.Display.Color.IntegerToColor(fill).brighten(20).color;

  // Rounded container with glow
  px(g, 4, 2, TILE_SIZE - 8, 1, fill, 0.3);
  px(g, 3, 3, TILE_SIZE - 6, TILE_SIZE - 6, dark);
  px(g, 4, 4, TILE_SIZE - 8, TILE_SIZE - 8, fill);
  px(g, 5, 4, TILE_SIZE - 10, 2, light, 0.4);
  px(g, 2, 4, 1, TILE_SIZE - 8, dark, 0.5);
  px(g, TILE_SIZE - 3, 4, 1, TILE_SIZE - 8, dark, 0.5);

  if (key === 'memory') {
    // Heart shape
    px(g, 8, 8, 3, 2, 0xf7f0df);
    px(g, 13, 8, 3, 2, 0xf7f0df);
    px(g, 7, 10, 10, 3, 0xf7f0df);
    px(g, 8, 13, 8, 2, 0xf7f0df);
    px(g, 9, 15, 6, 1, 0xf7f0df);
    px(g, 10, 16, 4, 1, 0xf7f0df);
    px(g, 11, 17, 2, 1, 0xf7f0df);
    // Heart blush
    px(g, 9, 10, 2, 2, 0xffb0b0, 0.5);
  }
  if (key === 'encounter') {
    // Swirl/cloud shape
    px(g, 9, 6, 6, 3, 0x8ba2cf);
    px(g, 7, 9, 10, 5, 0x8ba2cf);
    px(g, 8, 8, 8, 1, 0xa8bde0);
    // Question detail
    px(g, 11, 15, 2, 1, 0x2a3354);
    px(g, 11, 17, 2, 2, 0x2a3354);
  }
  if (key === 'sign') {
    // Signboard
    px(g, 6, 6, TILE_SIZE - 12, 8, 0x214b66);
    px(g, 7, 7, TILE_SIZE - 14, 1, 0x3a7da6);
    px(g, TILE_SIZE / 2 - 1, 14, 2, 6, 0x132636);
    px(g, TILE_SIZE / 2 - 2, 20, 4, 1, 0x1a3040);
  }

  g.generateTexture(key, TILE_SIZE, TILE_SIZE);
  g.destroy();

  const rt = scene.add.renderTexture(-100, -100, TILE_SIZE, TILE_SIZE).setVisible(false);
  rt.draw(key, TILE_SIZE / 2, TILE_SIZE / 2);
  const label = key === 'memory' ? 'R' : key === 'encounter' ? '?' : '!';
  const text = scene.add.text(-100, -100, label, {
    fontFamily: 'Press Start 2P',
    fontSize: '8px',
    color: '#0f1627'
  });
  rt.draw(text, TILE_SIZE - 10, 2);
  rt.saveTexture(`${key}-labeled`);
  text.destroy();
  rt.destroy();
};

export const ensureCoreTextures = (scene: Phaser.Scene): void => {
  createGrassTile(scene);
  createPathTile(scene);
  createRoadTile(scene);
  createWaterTile(scene);
  createBorderTile(scene);
  createBrickTile(scene);
  createWindowTile(scene);
  createDoorTile(scene);
  createFloorTile(scene);
  createBusTile(scene);

  createCharacter(scene, 'player-my', {
    shirt: 0x3d7fc2,
    skin: 0xa56943,
    hair: 0x2a1d14,
    eye: 0x0b0b0b,
    pants: 0x1f2f54
  });
  createCharacter(scene, 'player-her', {
    shirt: 0xd56f99,
    skin: 0xeac1a2,
    hair: 0x5a2f28,
    eye: 0x2a2a2a,
    pants: 0x2e3b60
  });

  createNpcVariant(scene, 'npc-camille', {
    shirt: 0x8e79d7,
    skin: 0xe1b391,
    hair: 0x4a2d22,
    eye: 0x1f1f1f,
    pants: 0x32496f
  });
  createNpcVariant(scene, 'npc-musico', {
    shirt: 0x6aa8d4,
    skin: 0xdcb08e,
    hair: 0x2a2018,
    eye: 0x202020,
    pants: 0x2d3f5f
  });
  createNpcVariant(scene, 'npc-mensajera', {
    shirt: 0xe38e73,
    skin: 0xe5b999,
    hair: 0x4d2f24,
    eye: 0x1f1f1f,
    pants: 0x3f4d69
  });
  createNpcVariant(scene, 'npc-conductor', {
    shirt: 0x3a6db0,
    skin: 0xc89570,
    hair: 0x23160f,
    eye: 0x121212,
    pants: 0x1f2e45
  });
  createNpcVariant(scene, 'npc-default', {
    shirt: 0x6b8fb3,
    skin: 0xe9c4a1,
    hair: 0x4b2f22,
    eye: 0x121212,
    pants: 0x3b4a63
  });

  createPhoneBooth(scene);
  createPostBox(scene);
  createLamp(scene);
  createTaxi(scene);
  createGuard(scene);
  createBusProp(scene);

  createSymbol(scene, 'memory', 0xffdf90);
  createSymbol(scene, 'encounter', 0xc68cff);
  createSymbol(scene, 'sign', 0xa9d7ff);
};
