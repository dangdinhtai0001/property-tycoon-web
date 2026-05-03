import React, { useState, useMemo } from 'react';
import { SetupGameScreen } from './SetupGameScreen';
import { listSaves, loadGame, hasSave, deleteSave } from '../../storage/gameStorage';
import { useGameStore } from '../../app/store/useGameStore';
import { Play, RotateCcw, Settings, ScrollText, Volume2, HelpCircle, Dices, Landmark, Coins } from 'lucide-react';
import { SaveSlotModal } from '../modals/SaveSlotModal';
import { motion, AnimatePresence } from 'framer-motion';

export const MainMenu: React.FC = () => {
  const [showSetup, setShowSetup] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const { dispatch } = useGameStore();

  const latestSave = useMemo(() => {
    const saves = listSaves();
    if (saves.length === 0) return null;
    return saves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, []);

  const canLoad = !!latestSave;

  if (showSetup) {
    return <SetupGameScreen />;
  }

  const handleSelectSlot = (slotId: string) => {
    const savedState = loadGame(slotId);
    if (savedState) {
      dispatch({ type: 'LOAD_GAME', payload: savedState, slotId });
      setShowLoadModal(false);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    deleteSave(slotId);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-slate-50">
      {/* Ambient Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.4] grayscale-[0.5] scale-105"
        style={{ backgroundImage: 'url(/assets/bg/main-menu.png)' }}
      />

      {/* Soft Gradient Overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-slate-200/50 via-transparent to-white" />

      {/* Floating Elements for "Game" feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] text-blue-500/20"
        >
          <Dices size={120} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[20%] right-[12%] text-amber-500/20"
        >
          <Landmark size={140} />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[20%] right-[15%] text-emerald-500/10"
        >
          <Coins size={80} />
        </motion.div>
      </div>

      {/* Top Right Utility Buttons */}
      <div className="absolute top-8 right-8 z-[50] flex gap-3">
        <button className="p-3 bg-white/60 backdrop-blur-md rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all border border-white/50">
          <Volume2 size={20} />
        </button>
        <button className="p-3 bg-white/60 backdrop-blur-md rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg transition-all border border-white/50">
          <HelpCircle size={20} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-[10] bg-white/90 backdrop-blur-2xl p-10 md:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-white w-full max-w-2xl flex flex-col items-center gap-12"
      >
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center leading-[0.85]">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter"
            >
              ÔNG TRÙM
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
              className="text-6xl md:text-8xl font-black text-blue-600 tracking-tighter drop-shadow-sm"
            >
              BẤT ĐỘNG SẢN
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3"
          >
            <span>Mua đất</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>Thu thuê</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span>Xây đế chế</span>
          </motion.p>
        </div>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          {/* Primary Action: New Game */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -4, shadow: "0 20px 40px -10px rgba(37, 99, 235, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSetup(true)}
            className="group w-full py-6 bg-blue-600 text-white text-xl font-black rounded-[2rem] shadow-xl shadow-blue-100 flex items-center justify-center gap-4 transition-colors hover:bg-blue-700"
          >
            <Play className="fill-current" size={24} />
            <span>CHƠI VÁN MỚI</span>
          </motion.button>

          {/* Secondary Action: Continue */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            whileHover={canLoad ? { scale: 1.02, y: -4 } : {}}
            whileTap={canLoad ? { scale: 0.98 } : {}}
            onClick={() => setShowLoadModal(true)}
            disabled={!canLoad}
            className={`w-full p-6 rounded-[2rem] transition-all flex flex-col items-center gap-1 border-2 ${canLoad
              ? 'bg-white text-slate-800 border-slate-100 shadow-lg hover:shadow-xl hover:bg-slate-50'
              : 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed'
              }`}
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={20} className={canLoad ? 'text-blue-600' : 'text-slate-300'} />
              <span className="text-lg font-black uppercase tracking-tight">
                {canLoad ? 'TIẾP TỤC VÁN ĐANG LƯU' : 'CHƯA CÓ VÁN ĐÃ LƯU'}
              </span>
            </div>
            {canLoad && latestSave && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-80">
                {latestSave.currentPlayerName} • {latestSave.playerCount} người • ${(latestSave.currentPlayerCash || 0).toLocaleString()}
              </p>
            )}
          </motion.button>
        </div>

        {/* Game Info Footer */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <Settings size={14} />
              Cài đặt
            </button>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 font-bold text-[10px] uppercase tracking-widest transition-colors">
              <ScrollText size={14} />
              Luật chơi
            </button>
          </div>
          <p className="text-[10px] font-black text-slate-300 tracking-widest uppercase">
            v1.1 — Tài chính & Hoàn thiện
          </p>
        </div>
      </motion.div>

      {showLoadModal && (
        <SaveSlotModal
          mode="load"
          onSelect={handleSelectSlot}
          onDelete={handleDeleteSlot}
          onClose={() => setShowLoadModal(false)}
        />
      )}
    </div>
  );
};
