import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, MessageSquare, X } from 'lucide-react';

interface GameLogPanelProps {
  onClose?: () => void;
}

export const GameLogPanel: React.FC<GameLogPanelProps> = ({ onClose }) => {
  const { state } = useGameStore();

  return (
    <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden min-h-[300px] h-full">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-blue-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Lịch sử
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100">
            {state.log.length} sự kiện
          </span>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/30">
        <AnimatePresence initial={false}>
          {state.log.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 opacity-50">
              <MessageSquare size={32} />
              <span className="text-xs font-bold uppercase tracking-widest">Chưa có dữ liệu</span>
            </div>
          ) : (
            state.log.map((entry, index) => (
              <motion.div
                key={`${index}-${entry.substring(0, 10)}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-2xl text-xs font-medium border-l-4 shadow-sm ${
                  index === 0 
                    ? 'bg-white border-blue-500 text-slate-800 shadow-blue-50' 
                    : 'bg-white/50 border-slate-200 text-slate-500'
                }`}
              >
                {entry}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
