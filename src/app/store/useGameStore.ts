import { create } from 'zustand';
import { type GameState, type GameAction, Phase } from '../../game-engine/types/game';
import { gameReducer } from '../../game-engine/state/gameReducer';

interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: {
    players: [],
    currentPlayerId: '',
    phase: Phase.SETUP,
    board: [],
    doublesCount: 0,
    log: [],
  },
  dispatch: (action: GameAction) =>
    set((store) => ({
      state: gameReducer(store.state, action),
    })),
}));
