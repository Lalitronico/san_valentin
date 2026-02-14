export type EncounterKey = 'duda' | 'distancia' | 'extrañar';

export type SaveData = {
  currentScene: string;
  finalSeen: boolean;
  loveMeter: number;
  selectedCharacter: 'my' | 'her' | null;
  memories: string[];
  solvedEncounters: EncounterKey[];
  flags: {
    reunionUnlocked: boolean;
    tutorialSeen: boolean;
  };
};

export const initialState: SaveData = {
  currentScene: 'TitleScene',
  finalSeen: false,
  loveMeter: 10,
  selectedCharacter: null,
  memories: [],
  solvedEncounters: [],
  flags: {
    reunionUnlocked: false,
    tutorialSeen: false
  }
};

const mutableState: SaveData = { ...initialState, flags: { ...initialState.flags } };

export const getState = (): SaveData => mutableState;

export const resetState = (): SaveData => {
  Object.assign(mutableState, { ...initialState, flags: { ...initialState.flags } });
  return mutableState;
};
