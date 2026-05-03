import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Home, Lock } from 'lucide-react';

const CashDelta: React.FC<{ value: number }> = ({ value }) => {
  const [prevValue, setPrevValue] = React.useState(value);
  const [delta, setDelta] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (value !== prevValue) {
      setDelta(value - prevValue);
      setPrevValue(value);
      const timer = setTimeout(() => setDelta(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  if (delta === null) return null;

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: -20 }}
      exit={{ opacity: 0 }}
      className={`absolute right-0 font-black text-xs ${delta > 0 ? 'text-emerald-500' : 'text-rose-500'}`}
    >
      {delta > 0 ? `+$${delta.toLocaleString()}` : `-$${Math.abs(delta).toLocaleString()}`}
    </motion.span>
  );
};

export const PlayerListPanel: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between px-3 flex-none">
        <h2 className="text-sm font-black text-slate-400 tracking-widest uppercase italic">Danh sách người chơi</h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{state.players.length} NGƯỜI CHƠI</span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10">
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
                height: isCurrent ? '100px' : '72px',
                opacity: player.isBankrupt ? 0.6 : 1
              }}
              className={`relative overflow-hidden transition-all duration-300 ${
                isCurrent 
                   ? 'bg-white shadow-xl shadow-slate-200/50 z-10 border-2' 
                   : 'bg-white/40 backdrop-blur-sm border border-white/50 opacity-90'
              }`}
              style={{ 
                borderRadius: 'calc(var(--panel-radius) / 2)',
                borderColor: isCurrent ? player.color : undefined,
                borderLeftWidth: '12px',
                borderLeftColor: player.color
              }}
            >
              <div className="p-4 flex flex-col justify-center h-full">
                {/* Top Row: Name and Cash */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-sm tracking-tight ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>
                    {player.name}
                  </span>
                  <div className="relative flex items-center gap-1">
                    <CashDelta value={player.cash} />
                    <span className={`text-sm font-black tracking-tighter ${player.cash < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ${player.cash.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Status and Location Row */}
                <div className="flex items-center gap-1 overflow-hidden">
                  <span 
                    className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex-none ${
                      isCurrent ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                    style={{ backgroundColor: isCurrent ? player.color : undefined }}
                  >
                    {statusLabel}
                  </span>
                  <span className="text-slate-300 mx-1">·</span>
                  <span className={`text-[10px] font-black truncate ${isCurrent ? 'text-slate-700' : 'text-slate-400'}`}>
                    {currentTileName}
                  </span>
                </div>

                {/* Wealth Indicators (Only if active or has assets) */}
                <AnimatePresence>
                  {isCurrent && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 pt-2 mt-2 border-t border-slate-50"
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
