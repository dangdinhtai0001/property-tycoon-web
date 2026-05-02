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
import { EndGameScreen } from './ui/screens/EndGameScreen';
import { Menu, Info } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const { state, dispatch, showTradeModal, setShowTradeModal } = useGameStore();
  const [isPauseOpen, setIsPauseOpen] = React.useState(false);

  if (state.phase === Phase.SETUP) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
        <MainMenu />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Header */}
        <header className="lg:col-span-12 flex items-center justify-between mb-2">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800">
                PROPERTY <span className="text-blue-600">TYCOON</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Phase 3 — MVP Polish</p>
            </div>
            
            <div className="hidden md:flex gap-4 items-center bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Trạng thái</span>
                <span className="text-sm font-black text-blue-600 uppercase">{state.phase.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPauseOpen(true)}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
            >
              <Menu size={20} />
              <span className="font-bold text-sm hidden sm:inline">MENU</span>
            </motion.button>
          </div>
        </header>

        {/* Left Side: Board */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <Board />
          <GameLogPanel />
        </main>

        {/* Right Side: Panels */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <PlayerListPanel />
          <ActionPanel />
          
          <div className="p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Info size={80} />
            </div>
            <h3 className="font-black mb-2 uppercase tracking-tight">Hướng dẫn nhanh</h3>
            <ul className="text-sm space-y-2 text-blue-50">
              <li className="flex gap-2">
                <span className="font-black opacity-50">01</span>
                <span>Mua đất để bắt đầu xây dựng đế chế.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-black opacity-50">02</span>
                <span>Thu thập đủ bộ màu để xây nhà/khách sạn.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-black opacity-50">03</span>
                <span>Thế chấp hoặc bán bớt nhà nếu kẹt tiền.</span>
              </li>
            </ul>
          </div>
        </aside>

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
        <DiceRollAnimation />
        <PurchaseCelebration />
        <ParticleSystem />
      </div>
    </div>
  );
}

export default App;
