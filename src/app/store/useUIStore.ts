import { create } from 'zustand'

export type TokenAnimState = 'idle' | 'run' | 'win' | 'sad'

interface UIStore {
  // Modal visibility
  showTradeModal: boolean
  showAuctionModal: boolean
  showCardModal: boolean
  showDebtModal: boolean
  showPropertyInfoModal: boolean
  showPauseMenu: boolean
  showSaveSlotModal: boolean

  // Inspected/selected items
  inspectedPropertyId: string | null
  selectedBuildPropertyId: string | null

  // Animation state
  tokenAnimState: TokenAnimState

  // Actions
  setShowTradeModal: (show: boolean) => void
  setShowAuctionModal: (show: boolean) => void
  setShowCardModal: (show: boolean) => void
  setShowDebtModal: (show: boolean) => void
  setShowPropertyInfoModal: (show: boolean) => void
  setShowPauseMenu: (show: boolean) => void
  setShowSaveSlotModal: (show: boolean) => void
  setInspectedPropertyId: (id: string | null) => void
  setSelectedBuildPropertyId: (id: string | null) => void
  setTokenAnimState: (animState: TokenAnimState) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  showTradeModal: false,
  showAuctionModal: false,
  showCardModal: false,
  showDebtModal: false,
  showPropertyInfoModal: false,
  showPauseMenu: false,
  showSaveSlotModal: false,
  inspectedPropertyId: null,
  selectedBuildPropertyId: null,
  tokenAnimState: 'idle',

  // Actions
  setShowTradeModal: (show) => set({ showTradeModal: show }),
  setShowAuctionModal: (show) => set({ showAuctionModal: show }),
  setShowCardModal: (show) => set({ showCardModal: show }),
  setShowDebtModal: (show) => set({ showDebtModal: show }),
  setShowPropertyInfoModal: (show) => set({ showPropertyInfoModal: show }),
  setShowPauseMenu: (show) => set({ showPauseMenu: show }),
  setShowSaveSlotModal: (show) => set({ showSaveSlotModal: show }),
  setInspectedPropertyId: (id) => set({ inspectedPropertyId: id }),
  setSelectedBuildPropertyId: (id) => set({ selectedBuildPropertyId: id }),
  setTokenAnimState: (animState) => set({ tokenAnimState: animState }),
  closeAllModals: () =>
    set({
      showTradeModal: false,
      showAuctionModal: false,
      showCardModal: false,
      showDebtModal: false,
      showPropertyInfoModal: false,
      showPauseMenu: false,
      showSaveSlotModal: false,
    }),
}))
