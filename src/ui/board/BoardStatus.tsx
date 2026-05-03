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

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center space-y-4"
      >
        {/* Title */}
        <div className="mb-2">
          <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-slate-800/10 leading-none select-none">
            PROPERTY <span className="text-blue-600">TYCOON</span>
          </h2>
        </div>

        {/* Dynamic Status Card */}
        <div className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/20 max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayerId + phase + (currentTile?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Player & Location */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái hiện tại</p>
                <h3 className="text-lg font-black text-slate-800">
                  <span style={{ color: currentPlayer?.color }}>{currentPlayer?.name}</span> đang ở: {currentTile?.name}
                </h3>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent w-full" />

              {/* Phase & Dice */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phase</p>
                  <p className="text-sm font-black text-blue-600 uppercase">{formatPhase(state.phase)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dice</p>
                  <p className="text-sm font-black text-slate-700">
                    {lastDiceRoll ? `${lastDiceRoll[0]} + ${lastDiceRoll[1]} = ${lastDiceRoll[0] + lastDiceRoll[1]}` : '— / —'}
                  </p>
                </div>
              </div>

              {/* Contextual Tile Info */}
              {isProperty && property && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 mt-2"
                >
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Chủ sở hữu</p>
                      <p className="text-xs font-bold" style={{ color: owner?.color || '#94a3b8' }}>
                        {owner ? owner.name : 'Chưa có'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Giá mua</p>
                      <p className="text-xs font-bold text-slate-700">${property.price}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Last Event */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sự kiện gần nhất</p>
                <p className="text-xs text-slate-500 font-medium italic line-clamp-2">
                  {log[0] || 'Đang chờ khởi tạo...'}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
