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
import { Menu, Info, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { state, dispatch, showTradeModal, setShowTradeModal } = useGameStore();
  const [isPauseOpen, setIsPauseOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isActionExpanded, setIsActionExpanded] = React.useState(true);

  if (state.phase === Phase.SETUP) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
        <MainMenu />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 flex flex-col font-sans selection:bg-blue-100">
      
      {/* Immersive Game Board - Background/Main Layer */}
      <main className="absolute inset-0 z-0 flex items-center justify-center bg-slate-50">
        <Board />
      </main>

      {/* Top HUD / Header Overlay */}
      <header className="relative z-20 p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 leading-none">
              PROPERTY <span className="text-blue-600">TYCOON</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Immersive Board Engine</p>
          </div>
          
          <div className="hidden md:flex gap-4 items-center bg-white/80 backdrop-blur-md px-6 py-4 rounded-[2rem] border border-white shadow-xl shadow-slate-200/50">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng thái</span>
              <span className="text-sm font-black text-blue-600 uppercase leading-none mt-1">{state.phase.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-4 rounded-[1.5rem] transition-all shadow-xl backdrop-blur-md flex items-center gap-2 ${
              isHistoryOpen ? 'bg-blue-600 text-white' : 'bg-white/80 text-slate-600 border border-white hover:bg-white'
            }`}
          >
            <ScrollText size={20} />
            <span className="font-bold text-sm hidden sm:inline">LỊCH SỬ</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsPauseOpen(true)}
            className="p-4 bg-white/80 border border-white text-slate-600 rounded-[1.5rem] hover:bg-white transition-all shadow-xl backdrop-blur-md flex items-center gap-2"
          >
            <Menu size={20} />
            <span className="font-bold text-sm hidden sm:inline">MENU</span>
          </motion.button>
        </div>
      </header>

      {/* Left Overlay: Player List */}
      <aside className="absolute left-6 top-32 bottom-8 z-10 w-80 pointer-events-none flex flex-col justify-start">
        <motion.div 
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pointer-events-auto"
        >
          <PlayerListPanel />
        </motion.div>
      </aside>

      {/* Right Overlay: Action Panel */}
      <aside className="absolute right-6 top-32 bottom-8 z-10 pointer-events-none flex flex-col items-end">
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`pointer-events-auto transition-all duration-500 ease-in-out ${isActionExpanded ? 'w-96' : 'w-20'}`}
        >
          <div className="relative bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-2xl h-full flex flex-col overflow-hidden">
            <button 
              onClick={() => setIsActionExpanded(!isActionExpanded)}
              className="p-4 w-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isActionExpanded ? <Menu size={24} /> : <Menu size={24} className="rotate-90" />}
            </button>
            
            <div className={`flex-1 overflow-y-auto px-6 pb-6 transition-opacity duration-300 ${isActionExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <ActionPanel />
              
              <div className="mt-6 p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Info size={60} />
                </div>
                <h3 className="font-black mb-2 uppercase text-xs tracking-wider">Hướng dẫn nhanh</h3>
                <ul className="text-[11px] space-y-1.5 text-blue-50">
                  <li className="flex gap-2"><span>•</span><span>Mua đất để bắt đầu đế chế.</span></li>
                  <li className="flex gap-2"><span>•</span><span>Thu thập đủ bộ màu để xây nhà.</span></li>
                  <li className="flex gap-2"><span>•</span><span>Thế chấp nếu kẹt tiền mặt.</span></li>
                </ul>
              </div>
            </div>
          </div>
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
