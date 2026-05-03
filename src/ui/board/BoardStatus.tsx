import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, TileType } from '../../game-engine/types/game';
import type { Property, GameState, BoardTile, Player } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  MapPin, 
  Wallet, 
  ShieldAlert, 
  HelpCircle, 
  ArrowRightCircle, 
  Lock,
  Construction
} from 'lucide-react';

export const BoardStatus: React.FC = () => {
  const { state } = useGameStore();
  const [displayedState, setDisplayedState] = useState<GameState>(state);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initial loading delay (1.2s)
    const timer = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Sync display state when not actively animating movement
    if (state.phase !== Phase.ROLLING && state.phase !== Phase.MOVING) {
      setDisplayedState(state);
    }
  }, [state]);

  if (!isReady) return null;

  const { players, currentPlayerId, phase, board, lastDiceRoll, log } = displayedState;
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentTile = board.find(t => t.position === currentPlayer?.position);

  // 1. Phase Guidance & Styling
  const getPhaseInfo = () => {
    switch (phase) {
      case Phase.WAITING_TO_ROLL:
        return {
          label: 'Chờ tung xúc xắc',
          hint: 'Tung xúc xắc để bắt đầu di chuyển',
          theme: 'blue',
          icon: <Dices size={18} />
        };
      case Phase.ROLLING:
        return {
          label: 'Đang tung',
          hint: 'Đang xác định kết quả...',
          theme: 'slate',
          icon: <Dices size={18} className="animate-bounce" />
        };
      case Phase.MOVING:
        return {
          label: 'Đang di chuyển',
          hint: 'Quân cờ đang tới vị trí mới',
          theme: 'blue',
          icon: <MapPin size={18} />
        };
      case Phase.BUY_DECISION:
        return {
          label: 'Quyết định mua',
          hint: 'Bạn muốn sở hữu tài sản này không?',
          theme: 'amber',
          icon: <Wallet size={18} />
        };
      case Phase.BUILD_DECISION:
        return {
          label: 'Quản lý tài sản',
          hint: 'Bạn có thể xây thêm nhà hoặc kết thúc lượt',
          theme: 'emerald',
          icon: <Construction size={18} />
        };
      case Phase.DEBT_RESOLUTION:
        return {
          label: 'Xử lý nợ',
          hint: 'Cần huy động tiền mặt ngay lập tức',
          theme: 'rose',
          icon: <ShieldAlert size={18} />
        };
      case Phase.JAIL_DECISION:
        return {
          label: 'Đang ở tù',
          hint: 'Chọn cách để rời khỏi Trại Giam',
          theme: 'slate',
          icon: <Lock size={18} />
        };
      default:
        return {
          label: 'Lượt chơi mới',
          hint: 'Vui lòng chờ hành động tiếp theo',
          theme: 'slate',
          icon: <HelpCircle size={18} />
        };
    }
  };

  const info = getPhaseInfo();
  const themeColors = {
    blue: { bg: 'bg-blue-50/90', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-600' },
    amber: { bg: 'bg-amber-50/90', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-600' },
    emerald: { bg: 'bg-emerald-50/90', border: 'border-emerald-200', text: 'text-emerald-600', badge: 'bg-emerald-600' },
    rose: { bg: 'bg-rose-50/90', border: 'border-rose-200', text: 'text-rose-600', badge: 'bg-rose-600' },
    slate: { bg: 'bg-slate-50/90', border: 'border-slate-200', text: 'text-slate-600', badge: 'bg-slate-600' },
  }[info.theme as keyof typeof themeColors];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-8 md:p-12 lg:p-16">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full max-w-[340px] md:max-w-sm rounded-[2.5rem] border-2 shadow-2xl backdrop-blur-xl ${themeColors.bg} ${themeColors.border} overflow-hidden`}
      >
        <div className="p-5 md:p-7 space-y-4 md:space-y-6">
          {/* A. Turn Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="flex items-center gap-3 bg-white/80 px-4 py-1.5 rounded-full shadow-sm border border-white/50">
              <div className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-2 ring-slate-100" style={{ backgroundColor: currentPlayer?.color }} />
              <span className="text-sm font-black tracking-tight text-slate-800">{currentPlayer?.name}</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${themeColors.badge} text-white`}>
              {info.icon}
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">{info.label}</span>
            </div>
            <p className="text-[13px] font-bold text-slate-500 italic leading-snug">{info.hint}</p>
          </div>

          <div className="h-px bg-slate-200/50 w-full" />

          {/* B. Dice & Tile Summary */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPlayerId + phase + (currentTile?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Dice Focus */}
              {lastDiceRoll && (phase === Phase.WAITING_TO_ROLL || phase === Phase.MOVING || phase === Phase.RESOLVING_TILE) && (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center justify-center gap-3">
                    {[lastDiceRoll[0], lastDiceRoll[1]].map((val, i) => (
                      <div key={i} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-lg font-black text-slate-700">
                        {val}
                      </div>
                    ))}
                  </div>
                  {lastDiceRoll[0] === lastDiceRoll[1] && (
                    <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Tung đôi!</span>
                  )}
                </div>
              )}

              {/* Current Tile Card */}
              {currentTile && (
                <div className="bg-white/50 rounded-3xl p-4 border border-white/80 shadow-inner text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Vị trí hiện tại</p>
                      <h3 className="text-sm font-black text-slate-800 leading-tight">{currentTile.name}</h3>
                      
                      {currentTile.type === TileType.PROPERTY && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center text-left">
                          <PropertyInfo tile={currentTile as Property} players={players} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* C. Mini Log */}
          <div className="pt-2 border-t border-slate-200/50">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightCircle size={12} className="text-slate-400" />
              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Gần nhất</span>
            </div>
            <div className="space-y-1">
              {log.slice(0, 2).map((entry, i) => (
                <p key={i} className={`text-[11px] font-bold leading-tight ${i === 0 ? 'text-slate-600' : 'text-slate-400 opacity-60'}`}>
                  {entry}
                </p>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PropertyInfo: React.FC<{ tile: Property, players: Player[] }> = ({ tile, players }) => {
  const owner = tile.ownerId ? players.find(p => p.id === tile.ownerId) : null;
  return (
    <>
      <div className="flex-1">
        <p className="text-[8px] font-bold text-slate-400 uppercase">Chủ sở hữu</p>
        <div className="flex items-center gap-1.5">
          {owner ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: owner.color }} />
              <span className="text-[11px] font-black" style={{ color: owner.color }}>{owner.name}</span>
            </>
          ) : (
            <span className="text-[11px] font-black text-slate-400 italic">Chưa có chủ</span>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-[8px] font-bold text-slate-400 uppercase">Giá niêm yết</p>
        <p className="text-xs font-black text-slate-800">${tile.price}</p>
      </div>
    </>
  );
};
