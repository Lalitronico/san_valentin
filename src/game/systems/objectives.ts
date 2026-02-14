import { getState } from '../state';

export const getObjectiveText = (): string => {
  const state = getState();
  const memories = state.memories.length;
  const encounters = state.solvedEncounters.length;

  if (state.currentScene === 'CityScene') {
    if (memories < 3 || !state.solvedEncounters.includes('duda')) {
      return 'Ciudad: habla, junta 3 recuerdos y transforma la Duda.';
    }
    return 'Objetivo: cruza a la derecha para ir al campus.';
  }

  if (state.currentScene === 'CampusScene') {
    if (memories < 6 || encounters < 3 || state.loveMeter < 55) {
      return `Campus: recuerdos ${memories}/6, momentos ${encounters}/3, love ${state.loveMeter}/55.`;
    }
    return 'Objetivo: salida inferior derecha para ir a Londres.';
  }

  if (state.currentScene === 'LondonScene') {
    if (!state.flags.reunionUnlocked) {
      return 'Londres: habla con la Guarda del Puente para abrir el reencuentro.';
    }
    return 'Objetivo: cruza a la derecha y corre al puente final.';
  }

  if (state.currentScene === 'BridgeFinalScene') {
    return 'Final: abre la carta interactiva con E/ENTER.';
  }

  return 'Sigue explorando juntos.';
};
