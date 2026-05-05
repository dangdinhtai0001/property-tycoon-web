import { create } from 'zustand'
import { type GameState, type GameAction, Phase } from '../../game-engine/types/game'
import { gameReducer } from '../../game-engine/state/gameReducer'
import { saveGame } from '../../storage/gameStorage'
import { eventBus } from '../../core/EventBus'

interface GameStore {
  state: GameState
  activeSlotId: string
  dispatch: (action: GameAction | { type: 'LOAD_GAME'; payload: GameState; slotId: string }) => void
  setActiveSlot: (slotId: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  state: {
    players: [],
    currentPlayerId: '',
    phase: Phase.SETUP,
    board: [],
    doublesCount: 0,
    log: [],
    config: { startingCash: 1500, passStartBonus: 200, enableAuction: false, rentMultiplier: 1 },
  },
  activeSlotId: '1',
  setActiveSlot: (slotId) => set({ activeSlotId: slotId }),
  dispatch: (action) =>
    set((store) => {
      let newState: GameState
      let newSlotId = store.activeSlotId

      if (action.type === 'LOAD_GAME') {
        newState = action.payload
        newSlotId = action.slotId
      } else {
        newState = gameReducer(store.state, action)
      }

      // Auto-save on significant actions
      if (action.type !== 'START_GAME' && newState.phase !== Phase.SETUP) {
        saveGame(newState, newSlotId)
      }

      // Emit state change event to EventBus
      eventBus.emit('state:changed', {
        prev: store.state,
        next: newState,
      })

      return {
        state: newState,
        activeSlotId: newSlotId,
      }
    }),
}))
