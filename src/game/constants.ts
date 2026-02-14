export const TILE_SIZE = 24;
export const GRID_W = 32;
export const GRID_H = 18;
export const GAME_W = TILE_SIZE * GRID_W;
export const GAME_H = TILE_SIZE * GRID_H;

// Gameplay thresholds
export const MAX_MEMORIES = 6;
export const MAX_ENCOUNTERS = 3;
export const LOVE_THRESHOLD_LONDON = 55;
export const MEMORY_LOVE_BONUS = 8;
export const INITIAL_LOVE = 10;

// Timing (ms)
export const MUSIC_TICK_MS = 200;
export const STEP_SOUND_MS = 210;
export const DIALOG_CHAR_MS = 18;

// Player
export const PLAYER_SPEED = 96;
export const INTERACT_RANGE = TILE_SIZE + 6;

export const COLORS = {
  night0: 0x0f1e34,
  night1: 0x1c3354,
  brick: 0x6f4f50,
  wall: 0xbfc8dc,
  grass0: 0x335f4e,
  grass1: 0x427460,
  water0: 0x365e96,
  water1: 0x4b7fbb,
  path0: 0x8f7e64,
  path1: 0xa69577,
  uiBg: 0x15233b,
  uiEdge: 0xe6f1ff,
  heart: 0xf47ab5,
  love: 0xff9dc1,
  memory: 0xffdd8b,
  text: '#eef6ff'
};
