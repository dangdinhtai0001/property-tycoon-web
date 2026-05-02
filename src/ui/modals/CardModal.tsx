import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, Phase } from '../../game-engine/types/game';
import { Info, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

export const CardModal: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const isOpen = state.phase === Phase.SHOWING_CARD && !!state.activeCard;
  const card = state.activeCard;

  if (!isOpen || !card) return null;

  const isChance = card.type === TileType.CHANCE;
  const colorClass = isChance ? 'from-orange-500 to-red-600' : 'from-blue-500 to-indigo-600';
  const icon = isChance ? <TrendingUp size={48} /> : <Sparkles size={48} />;
  const title = isChance ? 'KHÍ VẬN' : 'CƠ HỘI';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: -180 }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          {/* Card Header */}
          <div className={`h-32 bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center text-white p-6 relative`}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              {icon}
            </div>
            <div className="bg-white/20 p-3 rounded-2xl mb-2 backdrop-blur-md">
              {icon}
            </div>
            <h2 className="text-2xl font-black tracking-[0.2em] uppercase">{title}</h2>
          </div>

          {/* Card Content */}
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                <AlertCircle size={12} />
                Thông báo từ trò chơi
              </div>
              <p className="text-xl font-bold text-slate-700 leading-relaxed italic">
                "{card.description}"
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'APPLY_CARD' })}
              className={`w-full py-4 rounded-2xl bg-gradient-to-r ${colorClass} text-white font-black uppercase tracking-widest shadow-lg shadow-blue-200 transition-all hover:shadow-xl`}
            >
              CHẤP NHẬN
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
