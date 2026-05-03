import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, Lock, Timer, User, Skull, AlertCircle } from 'lucide-react';

export const PlayerListPanel: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between px-3 flex-none">
        <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase italic">Danh sách người chơi</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{state.players.length} PLAYERS</span>
      </div>

      <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
        {state.players.map((player) => {
          const isCurrent = state.currentPlayerId === player.id;
          const playerProperties = state.board.filter(t => 
            t.type === TileType.PROPERTY && (t as Property).ownerId === player.id
          ) as Property[];
          
          const propertyCount = playerProperties.length;
          const buildingCount = playerProperties.reduce((sum, p) => sum + (p.buildingLevel || 0), 0);
          const mortgagedCount = playerProperties.filter(p => p.isMortgaged).length;
          
          const currentTileName = state.board.find(t => t.position === player.position)?.name || 'Khởi hành';

          let statusLabel = 'ĐANG ĐỢI';
          if (player.isBankrupt) statusLabel = 'PHÁ SẢN';
          else if (player.jailTurns > 0) statusLabel = 'TRONG TÙ';
          else if (state.debtState?.oweTo === player.id) statusLabel = 'ĐANG NỢ';
          else if (isCurrent) statusLabel = 'LƯỢT NÀY';

          return (
            <motion.div
              key={player.id}
              initial={false}
              animate={{ 
                height: isCurrent ? 'auto' : '80px',
                opacity: player.isBankrupt ? 0.6 : 1
              }}
              className={`relative overflow-hidden rounded-[1.5rem] border-2 transition-all duration-300 ${
                isCurrent 
                  ? 'bg-white shadow-lg z-10' 
                  : 'bg-slate-100/80 border-transparent'
              }`}
              style={{ 
                borderColor: isCurrent ? player.color : 'transparent',
                borderLeftWidth: '8px',
                borderLeftColor: player.color
              }}
            >
              <div className="p-3 flex flex-col gap-2">
                {/* Main Row: Avatar, Name, Cash */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: player.color }}
                    >
                      <User size={16} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-black text-sm tracking-tight ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>
                        {player.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-base font-black tracking-tight ${player.cash < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      ${player.cash.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Sub Row: Status & Location */}
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                    style={{ backgroundColor: isCurrent ? player.color : undefined }}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 truncate">
                    · Đang ở: <span className="text-slate-700">{currentTileName}</span>
                  </span>
                </div>

                {/* Expanded Section: Assets */}
                <AnimatePresence>
                  {isCurrent && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-4 pt-1 mt-1 border-t border-slate-50"
                    >
                      <div className="flex items-center gap-1">
                        <Building2 size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-700">Tài sản {propertyCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Home size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-700">Nhà {buildingCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Lock size={12} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-700">Thế chấp {mortgagedCount}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
