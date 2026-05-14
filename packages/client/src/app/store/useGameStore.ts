import { create } from 'zustand'
import { type GameState, type GameAction, Phase } from '@property-tycoon/shared'
import { gameReducer } from '@property-tycoon/engine'
import { saveGame } from '../../storage/gameStorage'
import { eventBus } from '../../core/EventBus'
import type { NetworkManager } from '../network/NetworkManager'

interface GameStore {
  mode: 'offline' | 'online'
  state: GameState
  activeSlotId: string
  roomId: string | null
  playerId: string | null
  networkManager: NetworkManager | null
  isConnected: boolean

  dispatch: (action: GameAction | { type: 'LOAD_GAME'; payload: GameState; slotId: string }) => void
  setActiveSlot: (slotId: string) => void
  setMode: (mode: 'offline' | 'online') => void
  setNetworkManager: (nm: NetworkManager | null) => void
  setFullState: (state: GameState) => void
}

const defaultState: GameState = {
  players: [],
  currentPlayerId: '',
  phase: Phase.SETUP,
  board: [],
  doublesCount: 0,
  log: [],
  chanceDeck: [],
  fortuneDeck: [],
  temporaryModifiers: [],
  config: { startingCash: 1500, passStartBonus: 200, enableAuction: false, rentMultiplier: 1 },
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'offline',
  state: { ...defaultState },
  activeSlotId: '1',
  roomId: null,
  playerId: null,
  networkManager: null,
  isConnected: false,

  setActiveSlot: (slotId) => set({ activeSlotId: slotId }),

  setMode: (mode) => {
    const { networkManager } = get()
    if (networkManager) networkManager.disconnect()
    set({ mode, networkManager: null, isConnected: false, roomId: null, playerId: null })
  },

  setNetworkManager: (nm) => set({ networkManager: nm, isConnected: true }),

  setFullState: (newState) => {
    const prev = get().state
    set({ state: newState })
    eventBus.emit('state:changed', { prev, next: newState })
  },

  dispatch: (action) => {
    const { mode, networkManager, roomId } = get()

    if (mode === 'online') {
      networkManager?.sendAction(action as GameAction, roomId ?? undefined)
      return
    }

    // Offline mode (unchanged behavior)
    set((store) => {
      let newState: GameState
      let newSlotId = store.activeSlotId

      if (action.type === 'LOAD_GAME') {
        newState = action.payload
        newSlotId = action.slotId
      } else {
        newState = gameReducer(store.state, action)
      }

      if (action.type !== 'START_GAME' && newState.phase !== Phase.SETUP) {
        saveGame(newState, newSlotId)
      }

      eventBus.emit('state:changed', { prev: store.state, next: newState })

      return { state: newState, activeSlotId: newSlotId }
    })
  },
}))
