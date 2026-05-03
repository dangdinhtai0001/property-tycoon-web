import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType } from '../../game-engine/types/game';
import type { Property, GameState } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';

export const BoardStatus: React.FC = () => {
  const { state } = useGameStore();
  
  // Local state to delay UI updates until movement is finished
  const [displayedState, setDisplayedState] = useState<GameState>(state);

  useEffect(() => {
    // Only update the displayed information when not in ROLLING or MOVING phases
    // This ensures the status card doesn't jump to the destination before the token gets there
    if (state.phase !== Phase.ROLLING && state.phase !== Phase.MOVING) {
      setDisplayedState(state);
    }
  }, [state]);

  const { players, currentPlayerId, phase, board, lastDiceRoll, log } = displayedState;

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentTile = board.find(t => t.position === currentPlayer?.position);
  
  const formatPhase = (phase: Phase) => {
    switch (phase) {
      case Phase.WAITING_TO_ROLL: return 'Chờ tung xúc xắc';
      case Phase.ROLLING: return 'Đang tung...';
      case Phase.MOVING: return 'Đang di chuyển';
      case Phase.RESOLVING_TILE: return 'Đang xử lý ô';
      case Phase.BUY_DECISION: return 'Quyết định mua';
      case Phase.BUILD_DECISION: return 'Quyết định xây';
      case Phase.DEBT_RESOLUTION: return 'Giải quyết nợ';
      case Phase.END_TURN: return 'Kết thúc lượt';
      case Phase.AUCTION: return 'Đang đấu giá';
      case Phase.TRADE: return 'Đang giao dịch';
      default: return phase.replace(/_/g, ' ');
    }
  };

  const isProperty = currentTile?.type === TileType.PROPERTY;
  const property = isProperty ? (currentTile as Property) : null;
  const owner = property?.ownerId ? players.find(p => p.id === property.ownerId) : null;

  const getPhaseHint = () => {
    switch (state.phase) {
      case Phase.WAITING_TO_ROLL:
        return {
          title: 'Đến lượt bạn',
          text: 'Tung xúc xắc để di chuyển trên bàn cờ.',
          color: 'text-amber-600',
          bg: 'bg-amber-50/90'
        };
      case Phase.BUY_DECISION:
        return {
          title: 'Quyết định mua',
          text: 'Bạn có muốn sở hữu ô đất này không?',
          color: 'text-blue-600',
          bg: 'bg-blue-50/90'
        };
      case Phase.BUILD_DECISION:
        return {
          title: 'Nâng cấp nhà',
          text: 'Xây thêm nhà để tối ưu hóa lợi nhuận.',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50/90'
        };
      case Phase.DEBT_RESOLUTION:
        return {
          title: 'CẢNH BÁO NỢ',
          text: 'Bạn đang nợ tiền! Hãy thế chấp hoặc bán nhà.',
          color: 'text-rose-600',
          bg: 'bg-rose-50/90'
        };
      default:
        return {
          title: 'Đang diễn ra',
          text: 'Vui lòng chờ xử lý hệ thống...',
          color: 'text-slate-600',
          bg: 'bg-white/90'
        };
    }
  };

  const hint = getPhaseHint();

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm w-full"
      >
        {/* Main Status Card */}
        <div className={`backdrop-blur-md border-2 border-white rounded-[3rem] p-8 shadow-2xl shadow-slate-300/30 w-full transition-all duration-500 ${hint.bg}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayerId + phase + (currentTile?.id || '')}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Turn Guide / Hint */}
              <div className="space-y-1">
                <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${hint.color}`}>
                  {hint.title}
                </p>
                <p className="text-sm font-bold text-slate-700 leading-tight">
                  {hint.text}
                </p>
              </div>

              <div className="h-px bg-slate-200/60 w-3/4 mx-auto" />

              {/* Player & Location */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPlayer?.color }} />
                  <span className="text-base font-black text-slate-900 tracking-tight">{currentPlayer?.name}</span>
                </div>
                <p className="text-xs font-bold text-slate-500">
                  đang ở <span className="text-slate-800">{currentTile?.name}</span>
                </p>
              </div>

              {/* Contextual Action Info */}
              {isProperty && property && (
                <div className="bg-white/60 rounded-3xl p-4 border border-white/80 shadow-sm">
                  <div className="flex justify-between items-center text-left">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Chủ sở hữu</p>
                      <p className="text-xs font-black" style={{ color: owner?.color || '#94a3b8' }}>
                        {owner ? owner.name : 'Chưa có'}
                      </p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Giá niêm yết</p>
                      <p className="text-xs font-black text-slate-900">${property.price}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mini Log */}
              <div className="pt-1">
                <p className="text-[10px] text-slate-400 font-bold italic line-clamp-1 opacity-70">
                  "{log[0] || 'Game đang chạy...'}"
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Dice Result (Floating above center) */}
        {lastDiceRoll && (phase === Phase.MOVING || phase === Phase.RESOLVING_TILE) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-black shadow-lg"
          >
            🎲 {lastDiceRoll[0]} + {lastDiceRoll[1]} = {lastDiceRoll[0] + lastDiceRoll[1]}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
