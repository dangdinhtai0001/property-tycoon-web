import { create } from 'zustand';
import { type GameState, type GameAction, Phase } from '../../game-engine/types/game';
import { gameReducer, createInitialGame } from '../../game-engine/state/gameReducer';

interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

const initialPlayers = [
  { name: 'Người chơi 1', color: '#ef4444' },
  { name: 'Người chơi 2', color: '#3b82f6' },
];

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialGame(initialPlayers),
  dispatch: (action: GameAction) =>
    set((store) => ({
      state: gameReducer(store.state, action),
    })),
}));
