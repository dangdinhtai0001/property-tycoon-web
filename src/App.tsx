import React from 'react';
import { Board } from './ui/board/Board';
import { DiceRollAnimation } from './ui/animation/DiceRollAnimation';
import { PurchaseCelebration } from './ui/animation/PurchaseCelebration';
import { ParticleSystem } from './ui/animation/ParticleSystem';
import { PlayerListPanel } from './ui/panels/PlayerListPanel';
import { ActionPanel } from './ui/panels/ActionPanel';
import { GameLogPanel } from './ui/panels/GameLogPanel';
import { useGameStore } from './app/store/useGameStore';
import { useUIStore } from './app/store/useUIStore';
import { MainMenu } from './ui/screens/MainMenu';
import { CurrentTilePanel } from './ui/panels/CurrentTilePanel';
import { Phase } from './game-engine/types/game';
import { DebtResolutionModal } from './ui/modals/DebtResolutionModal';
import { AuctionModal } from './ui/modals/AuctionModal';
import { TradeModal } from './ui/modals/TradeModal';
import { PauseMenu } from './ui/modals/PauseMenu';
import { CardModal } from './ui/modals/CardModal';
import { MoneyLossEffect } from './ui/animation/MoneyLossEffect';
import { MoneyGainEffect } from './ui/animation/MoneyGainEffect';
import { MoneyWatcher } from './ui/animation/MoneyWatcher';
import { BuildingCelebration } from './ui/animation/BuildingCelebration';
import { BuildingWatcher } from './ui/animation/BuildingWatcher';
import { BuildModal } from './ui/modals/BuildModal';
import { PropertyInfoModal } from './ui/modals/PropertyInfoModal';
import { EndGameScreen } from './ui/screens/EndGameScreen';
import { QuickGuidePanel } from './ui/panels/QuickGuidePanel';
import { Menu, ScrollText, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { state, dispatch } = useGameStore();
  const { showTradeModal, setShowTradeModal } = useUIStore();
  const [isPauseOpen, setIsPauseOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isActionExpanded, setIsActionExpanded] = React.useState(true);
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);

  React.useEffect(() => {
    (window as any).game = {
      jumpTo: (pos: number) => dispatch({ type: 'TELEPORT_PLAYER', payload: { position: pos } }),
      addCash: (amount: number) => dispatch({ type: 'DEBUG_ADD_CASH', payload: { amount } }),
      state: state
    };
  }, [dispatch, state]);

  if (state.phase === Phase.SETUP) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
        <MainMenu />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-50 flex flex-col font-sans selection:bg-blue-100">
      {/* Ambient Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none scale-105"
        style={{ 
          backgroundImage: 'url(/assets/bg/main-menu.png)',
          filter: 'blur(8px) saturate(0.8)'
        }}
      />

      {/* Soft Gradient Overlay - Darker for more contrast */}
      <div className="absolute inset-0 z-[1] bg-slate-900/10 pointer-events-none" />
      <div className="absolute inset-0 z-[2] bg-gradient-to-tr from-white/60 via-transparent to-white/80 pointer-events-none" />

      {/* Main UI Layout - 3 Columns */}
      <div className="relative z-10 flex-1 flex flex-row gap-[clamp(16px,2vw,32px)] px-4 lg:px-6 py-0 md:py-2 lg:py-4 overflow-hidden">
        
        {/* Left Column: Player List */}
        <aside className="w-64 lg:w-72 flex flex-col pointer-events-auto overflow-hidden">
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 shrink-0"
          >
            <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
              <h1 className="text-xl font-black tracking-tighter text-slate-800 leading-[0.8]">
                ÔNG TRÙM <br />
                <span className="text-blue-600 text-2xl">BẤT ĐỘNG SẢN</span>
              </h1>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2">Mô phỏng Bàn cờ Chân thực</p>
            </div>
          </motion.header>

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1 overflow-hidden"
          >
            <PlayerListPanel />
          </motion.div>

          {/* Bottom-left: Buttons */}
          <div className="mt-auto pt-6 flex flex-col gap-3">
            <AnimatePresence>
              {isGuideOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 280 }}
                >
                  <QuickGuidePanel isExpanded={isGuideOpen} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={`px-3 py-2 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 border ${isHistoryOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/80 text-slate-700 border-white hover:bg-white'
                  }`}
              >
                <ScrollText size={14} />
                <span className="font-bold text-xs">LỊCH SỬ</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPauseOpen(true)}
                className="px-3 py-2 bg-white/80 border border-white text-slate-700 rounded-xl hover:bg-white transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5"
              >
                <Menu size={14} />
                <span className="font-bold text-xs">MENU</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className={`px-3 py-2 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 border ${isGuideOpen ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white/80 text-slate-700 border-white hover:bg-white'
                  }`}
              >
                <HelpCircle size={14} />
              </motion.button>
            </div>
          </div>
        </aside>

        {/* Center Column: Board */}
        <main className="flex-1 flex items-center justify-center overflow-hidden">
          <Board />
        </main>

        {/* Right Column: Action Panel & Current Tile */}
        <aside className="w-72 lg:w-80 flex flex-col gap-4 pointer-events-auto overflow-hidden">
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className={`transition-all duration-500 ease-in-out ${isActionExpanded ? 'flex-[1.2] min-h-0' : 'h-16 shrink-0'}`}
          >
            <div className={`h-full relative bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl flex flex-col overflow-hidden transition-all duration-500`}>
              <button
                onClick={() => setIsActionExpanded(!isActionExpanded)}
                className="p-4 w-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors shrink-0"
              >
                {isActionExpanded ? <Menu size={20} /> : <Menu size={20} className="rotate-90" />}
              </button>

              <div className={`flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar transition-all duration-300 ${isActionExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ActionPanel />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`transition-all duration-500 ease-in-out ${isActionExpanded ? 'flex-1 min-h-0' : 'flex-1'}`}
          >
            <CurrentTilePanel />
          </motion.div>
        </aside>
      </div>


      {/* Game Log Overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.aside
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 z-50 w-full max-w-sm shadow-2xl"
          >
            <GameLogPanel onClose={() => setIsHistoryOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Modals & Overlays */}
      <DebtResolutionModal />
      <AuctionModal />
      {(state.phase === Phase.TRADE || showTradeModal) && (
        <TradeModal
          onClose={() => {
            if (state.phase === Phase.TRADE) dispatch({ type: 'CANCEL_TRADE' });
            setShowTradeModal(false);
          }}
        />
      )}
      <PauseMenu isOpen={isPauseOpen} onClose={() => setIsPauseOpen(false)} />
      {state.phase === Phase.GAME_OVER && <EndGameScreen />}
      <CardModal />
      <BuildModal />
      <PropertyInfoModal />
      <MoneyLossEffect />
      <MoneyGainEffect />
      <BuildingCelebration />
      <MoneyWatcher />
      <BuildingWatcher />
      <DiceRollAnimation />
      <PurchaseCelebration />
      <ParticleSystem />
    </div>
  );
}

export default App;
