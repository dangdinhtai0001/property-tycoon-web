import React from 'react';
import { Board } from './ui/board/Board';
import { DiceRollAnimation } from './ui/animation/DiceRollAnimation';
import { PurchaseCelebration } from './ui/animation/PurchaseCelebration';
import { ParticleSystem } from './ui/animation/ParticleSystem';
import { PlayerListPanel } from './ui/panels/PlayerListPanel';
import { ActionPanel } from './ui/panels/ActionPanel';
import { GameLogPanel } from './ui/panels/GameLogPanel';
import { useGameStore } from './app/store/useGameStore';
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
  const { state, dispatch, showTradeModal, setShowTradeModal } = useGameStore();
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
        className="absolute inset-0 z-0 bg-cover bg-center opacity-50 pointer-events-none"
        style={{ backgroundImage: 'url(/assets/bg/main-menu.png)' }}
      />
      
      {/* Soft Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-white/40 via-transparent to-white/60 pointer-events-none" />
      <main className="absolute inset-0 z-0 flex items-center justify-center bg-transparent">
        <Board />
      </main>

      {/* Top HUD / Header Overlay */}
      <header className="relative z-20 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
            <h1 className="text-xl font-black tracking-tighter text-slate-800 leading-[0.8]">
              ÔNG TRÙM <br />
              <span className="text-blue-600 text-2xl">BẤT ĐỘNG SẢN</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2">Mô phỏng Bàn cờ Chân thực</p>
          </div>
        </div>

      </header>

      {/* Bottom-left: Quick Guide expanded panel + button row */}
      <div className="absolute left-6 bottom-8 z-20 flex flex-col gap-3 pointer-events-auto">
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
            className={`px-3 py-2 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 border ${
              isHistoryOpen ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/80 text-slate-700 border-white hover:bg-white'
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
            className={`px-3 py-2 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-1.5 border ${
              isGuideOpen ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-white/80 text-slate-700 border-white hover:bg-white'
            }`}
          >
            <HelpCircle size={14} />
          </motion.button>
        </div>
      </div>


      {/* Left Overlay: Player List */}
      <aside className="absolute left-6 top-32 bottom-8 z-10 w-80 pointer-events-none flex flex-col gap-6 justify-between">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pointer-events-auto flex flex-col"
        >
          <PlayerListPanel />
        </motion.div>

      </aside>

      {/* Right Overlay: Action Panel & Current Tile */}
      <aside className="absolute right-6 top-32 bottom-8 z-10 pointer-events-none flex flex-col gap-6 items-end">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`pointer-events-auto transition-all duration-500 ease-in-out ${isActionExpanded ? 'w-96' : 'w-20'}`}
        >
          <div className={`relative bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${isActionExpanded ? 'h-full' : 'h-16'}`}>
            <button 
              onClick={() => setIsActionExpanded(!isActionExpanded)}
              className="p-5 w-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isActionExpanded ? <Menu size={24} /> : <Menu size={24} className="rotate-90" />}
            </button>
            
            <div className={`flex-1 overflow-y-auto px-6 pb-6 transition-all duration-300 ${isActionExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <ActionPanel />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pointer-events-auto w-96"
        >
          <CurrentTilePanel />
        </motion.div>
      </aside>


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
