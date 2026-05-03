import { type GameState } from '../game-engine/types/game';

const SAVE_PREFIX = 'property-tycoon-save-';
const METADATA_KEY = 'property-tycoon-saves-metadata';

export interface SaveMetadata {
  id: string;
  name: string;
  date: string;
  playerCount: number;
  currentPlayerName: string;
  currentPlayerCash: number;
}

export const listSaves = (): SaveMetadata[] => {
  try {
    const meta = localStorage.getItem(METADATA_KEY);
    return meta ? JSON.parse(meta) : [];
  } catch (err) {
    console.error('Could not list saves', err);
    return [];
  }
};

const updateMetadata = (metadata: SaveMetadata): void => {
  const allMeta = listSaves();
  const index = allMeta.findIndex(m => m.id === metadata.id);
  if (index >= 0) {
    allMeta[index] = metadata;
  } else {
    allMeta.push(metadata);
  }
  localStorage.setItem(METADATA_KEY, JSON.stringify(allMeta));
};

export const saveGame = (state: GameState, slotId: string = '1'): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(`${SAVE_PREFIX}${slotId}`, serializedState);
    
    // Update metadata
    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
    updateMetadata({
      id: slotId,
      name: `Game ${slotId}`,
      date: new Date().toISOString(),
      playerCount: state.players.length,
      currentPlayerName: currentPlayer?.name || 'Unknown',
      currentPlayerCash: currentPlayer?.cash || 0
    });
  } catch (err) {
    console.error('Could not save game', err);
  }
};

export const loadGame = (slotId: string = '1'): GameState | null => {
  try {
    const serializedState = localStorage.getItem(`${SAVE_PREFIX}${slotId}`);
    if (serializedState === null) {
      return null;
    }
    return JSON.parse(serializedState) as GameState;
  } catch (err) {
    console.error('Could not load game', err);
    return null;
  }
};

export const hasSave = (slotId?: string): boolean => {
  if (slotId) {
    return localStorage.getItem(`${SAVE_PREFIX}${slotId}`) !== null;
  }
  return listSaves().length > 0;
};

export const deleteSave = (slotId: string): void => {
  try {
    localStorage.removeItem(`${SAVE_PREFIX}${slotId}`);
    const allMeta = listSaves().filter(m => m.id !== slotId);
    localStorage.setItem(METADATA_KEY, JSON.stringify(allMeta));
  } catch (err) {
    console.error('Could not delete save', err);
  }
};

export const clearSave = (): void => {
  const allMeta = listSaves();
  allMeta.forEach(m => localStorage.removeItem(`${SAVE_PREFIX}${m.id}`));
  localStorage.removeItem(METADATA_KEY);
  // Also clear legacy save if exists
  localStorage.removeItem('property-tycoon-save');
};
