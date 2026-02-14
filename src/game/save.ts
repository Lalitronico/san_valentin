import { MAX_MEMORIES } from './constants';
import type { SaveData } from './state';
import { getState, initialState } from './state';

const SAVE_KEY = 'pixel-love-adventure-save-v2';

export const loadSave = (): SaveData => {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return { ...initialState, flags: { ...initialState.flags } };

  try {
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...initialState,
      ...parsed,
      flags: {
        ...initialState.flags,
        ...(typeof parsed.flags === 'object' && parsed.flags ? parsed.flags : {})
      },
      memories: Array.isArray(parsed.memories) ? parsed.memories.slice(0, MAX_MEMORIES) : [],
      solvedEncounters: Array.isArray(parsed.solvedEncounters)
        ? (parsed.solvedEncounters.filter((v) => ['duda', 'distancia', 'extrañar'].includes(v)) as SaveData['solvedEncounters'])
        : []
    };
  } catch {
    return { ...initialState, flags: { ...initialState.flags } };
  }
};

export const persistSave = (): void => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(getState()));
};

export const clearSave = (): void => {
  localStorage.removeItem(SAVE_KEY);
};
