import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Coins, User, Info, Building } from 'lucide-react';

export const CurrentTilePanel: React.FC = () => {
  const { state } = useGameStore();
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  
  // Local state to track the "stable" position for UI display
  const [displayPosition, setDisplayPosition] = React.useState(currentPlayer?.position || 0);

  // Only update displayPosition when the game is NOT in a movement phase
  React.useEffect(() => {
    if (currentPlayer && state.phase !== 'ROLLING' && state.phase !== 'MOVING') {
      setDisplayPosition(currentPlayer.position);
    }
  }, [currentPlayer?.position, state.phase]);

  if (!currentPlayer) return null;

  const currentTile = state.board[displayPosition];
  const isProperty = currentTile.type === TileType.PROPERTY;
  const property = isProperty ? (currentTile as Property) : null;
  const owner = property?.ownerId ? state.players.find(p => p.id === property.ownerId) : null;

  const getTileTypeLabel = () => {
    switch (currentTile.type) {
      case TileType.PROPERTY: return 'Bất động sản';
      case TileType.START: return 'Khởi hành';
      case TileType.CHANCE: return 'Khí vận';
      case TileType.FORTUNE: return 'Cơ hội';
      case TileType.TAX: return 'Thuế';
      case TileType.JAIL: return 'Nhà tù';
      case TileType.GO_TO_JAIL: return 'Vào tù';
      case TileType.REST: return 'Nghỉ ngơi';
      default: return 'Ô đặc biệt';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTile.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="backdrop-blur-md overflow-hidden flex flex-col pointer-events-auto transition-all duration-300"
        style={{
          backgroundColor: 'var(--panel-bg)',
          borderRadius: 'var(--panel-radius)',
          border: '1px solid var(--panel-border)',
          boxShadow: 'var(--panel-shadow)',
        }}
      >
        {/* Header with Type Color */}
        <div 
          className="h-3 w-full" 
          style={{ backgroundColor: property ? property.groupId : '#cbd5e1' }}
        />
        
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ô hiện tại</span>
              <div className="flex items-center gap-2 mt-1">
                <h3 className="text-lg font-black text-slate-800 leading-tight">{currentTile.name}</h3>
                {state.config.enableDebug && (
                  <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                    POS: {currentTile.position}
                  </span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <MapPin size={20} />
            </div>
          </div>

          <div className="h-[1px] bg-slate-100 w-full" />

          {/* Details List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tighter">
                <Info size={14} />
                <span>Loại</span>
              </div>
              <span className="font-black text-slate-700">{getTileTypeLabel()}</span>
            </div>

            {property && (
              <>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tighter">
                    <Coins size={14} />
                    <span>Giá mua</span>
                  </div>
                  <span className="font-black text-slate-700">${property.price.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tighter">
                    <Building size={14} />
                    <span>Tiền thuê hiện tại</span>
                  </div>
                  <span className="font-black text-emerald-600">
                    ${(property.rentLevels ? property.rentLevels[property.buildingLevel] : property.rent).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tighter">
                    <User size={14} />
                    <span>Chủ sở hữu</span>
                  </div>
                  {owner ? (
                    <div className="flex items-center gap-2">
                      <span className="font-black" style={{ color: owner.color }}>{owner.name}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: owner.color }} />
                    </div>
                  ) : (
                    <span className="font-bold text-slate-400 italic">Chưa có</span>
                  )}
                </div>
              </>
            )}

            {!property && currentTile.type === TileType.TAX && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-tighter">
                  <Coins size={14} />
                  <span>Tiền thuế</span>
                </div>
                <span className="font-black text-rose-600">
                  ${currentTile.name.includes('xa xỉ') ? '150' : '200'}
                </span>
              </div>
            )}
          </div>

          {/* Property Specific Progress (House Levels) */}
          {property && property.rentLevels && (
            <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cấp độ xây dựng</span>
                <span className="text-[10px] font-black text-blue-600">{property.buildingLevel}/5</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div 
                    key={lvl}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      lvl <= property.buildingLevel ? 'bg-blue-500 shadow-sm shadow-blue-200' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
