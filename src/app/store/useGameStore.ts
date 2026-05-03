import { create } from 'zustand';
import { type GameState, type GameAction, Phase } from '../../game-engine/types/game';
import { gameReducer } from '../../game-engine/state/gameReducer';
import { saveGame } from '../../storage/gameStorage';

interface GameStore {
  state: GameState;
  activeSlotId: string;
  showTradeModal: boolean;
  inspectedPropertyId: string | null;
  setShowTradeModal: (show: boolean) => void;
  setInspectedPropertyId: (id: string | null) => void;
  dispatch: (action: GameAction | { type: 'LOAD_GAME'; payload: GameState; slotId: string }) => void;
  setActiveSlot: (slotId: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: {
    players: [],
    currentPlayerId: '',
    phase: Phase.SETUP,
    board: [],
    doublesCount: 0,
    log: [],
    config: { startingCash: 1500, passStartBonus: 200, enableAuction: false, quickModeMultiplier: 1 },
  },
  activeSlotId: '1',
  showTradeModal: false,
  inspectedPropertyId: null,
  setShowTradeModal: (show) => set({ showTradeModal: show }),
  setInspectedPropertyId: (id) => set({ inspectedPropertyId: id }),
  setActiveSlot: (slotId) => set({ activeSlotId: slotId }),
  dispatch: (action) =>
    set((store) => {
      let newState: GameState;
      let newSlotId = store.activeSlotId;

      if (action.type === 'LOAD_GAME') {
        newState = action.payload;
        newSlotId = action.slotId;
      } else {
        newState = gameReducer(store.state, action);
      }
      
      // Auto-save on significant actions
      if (action.type !== 'START_GAME' && newState.phase !== Phase.SETUP) {
        saveGame(newState, newSlotId);
      }
      
      // Close trade modal if trade is proposed or cancelled
      const shouldCloseTrade = action.type === 'PROPOSE_TRADE' || action.type === 'CANCEL_TRADE' || action.type === 'REJECT_TRADE' || action.type === 'ACCEPT_TRADE';

      return { 
        state: newState, 
        activeSlotId: newSlotId, 
        showTradeModal: shouldCloseTrade ? false : store.showTradeModal 
      };
    }),
}));
