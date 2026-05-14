import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { useUIStore } from '../../app/store/useUIStore';
import { type Property, PropertyKind } from '@property-tycoon/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Landmark, Info, MapPin } from 'lucide-react';
import { STATION_RENT_BY_COUNT, UTILITY_MULTIPLIER_BY_COUNT, BUILDING_LEVEL_NAMES } from '@property-tycoon/shared';
import { GROUP_THEMES } from '../../config/text';

export const PropertyInfoModal: React.FC = () => {
  const { state } = useGameStore();
  const { inspectedPropertyId, setInspectedPropertyId } = useUIStore();
  
  const property = state.board.find(t => t.id === inspectedPropertyId) as Property | undefined;

  const groupColors: Record<string, string> = {
    BROWN: 'bg-amber-900',
    LIGHT_BLUE: 'bg-sky-300',
    PINK: 'bg-pink-400',
    ORANGE: 'bg-orange-500',
    RED: 'bg-red-600',
    YELLOW: 'bg-yellow-400',
    GREEN: 'bg-emerald-600',
    DARK_BLUE: 'bg-indigo-800',
    STATION: 'bg-slate-700',
    UTILITY: 'bg-zinc-600',
  };

  const isProperty = property && 'groupId' in property;
  const colorClass = isProperty ? (groupColors[property.groupId] || 'bg-slate-400') : 'bg-slate-900';
  const rentLevels = isProperty ? (property.rentLevels || [property.rent]) : [];

  return (
    <AnimatePresence>
      {inspectedPropertyId && property && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" 
          onClick={() => setInspectedPropertyId(null)}
        >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, rotateY: 90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.9, opacity: 0, rotateY: -90 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-100 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Debug Info */}
          {state.config.enableDebug && (
            <div className="absolute top-4 left-4 z-[20] bg-rose-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg border border-white/20">
              POS: {property.position}
            </div>
          )}
          
          {/* Card Header (Monopoly Style) */}
          <div className="p-4 border-b-2 border-slate-100">
            <div className={`${colorClass} w-full py-6 px-4 rounded-lg text-white text-center border-2 border-black shadow-inner relative overflow-hidden`}>
              {/* Pattern Background for header */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '12px 12px' }} />
              
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 rounded-full backdrop-blur-sm mb-1">
                  <MapPin size={10} className="text-white/80" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">
                    {isProperty ? GROUP_THEMES[property.groupId] : 'Ô chức năng'}
                  </p>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight drop-shadow-md">{property.name}</h2>
              </div>
            </div>
          </div>
          
          {/* Property Image (Conditional) */}
          {property.imageUrl && (
            <div className="w-full h-40 bg-slate-100 overflow-hidden border-b border-slate-100">
              <img 
                src={property.imageUrl} 
                alt={property.name} 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.parentElement!.style.display = 'none')}
              />
            </div>
          )}

          {/* Card Content */}
          <div className="p-6 flex flex-col gap-4">
            {isProperty ? (
              <>
                {/* Current Ownership Status */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sở hữu bởi</span>
                    <div className="flex items-center gap-2">
                      {property.ownerId ? (
                        <>
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: state.players.find(p => p.id === property.ownerId)?.color }} />
                          <span className="font-black text-slate-800 tracking-tight">
                            {state.players.find(p => p.id === property.ownerId)?.name}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-slate-400 italic">Chưa có chủ sở hữu</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cấp độ hiện tại</span>
                    <p className="font-black text-blue-600 uppercase tracking-tighter">
                      {property.isMortgaged ? 'ĐANG THẾ CHẤP' : BUILDING_LEVEL_NAMES[property.buildingLevel]}
                    </p>
                  </div>
                </div>

                {/* Rent Table */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm font-black border-b border-slate-50 pb-2 mb-2">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Cấp công trình</span>
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Tiền thuê</span>
                  </div>
                  
                  {property.kind === PropertyKind.LAND && (
                    <>
                      {rentLevels.map((rent, i) => {
                        const isCurrentLevel = property.buildingLevel === i;
                        const ownerColor = property.ownerId ? state.players.find(p => p.id === property.ownerId)?.color : '#3b82f6';
                        
                        return (
                          <div 
                            key={i} 
                            className={`flex justify-between items-center px-3 py-1.5 rounded-xl transition-all ${
                              isCurrentLevel ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'group hover:bg-slate-50'
                            }`}
                            style={isCurrentLevel ? { backgroundColor: ownerColor } : {}}
                          >
                            <div className="flex gap-2 items-center">
                              {i === 0 ? (
                                <span className={isCurrentLevel ? 'text-white' : 'text-slate-700 font-bold'}>Giá thuê đất</span>
                              ) : (
                                <div className="flex gap-1 items-center">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: i }).map((_, j) => (
                                      <Home key={j} size={10} className={isCurrentLevel ? 'text-white fill-white' : 'text-emerald-600 fill-emerald-600'} />
                                    ))}
                                    {i === 5 && <Landmark size={12} className={isCurrentLevel ? 'text-white fill-white' : 'text-amber-500 fill-amber-500'} />}
                                  </div>
                                  <span className={`text-xs font-bold ${isCurrentLevel ? 'text-white' : 'text-slate-600'}`}>
                                    {BUILDING_LEVEL_NAMES[i]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <span className={`font-black ${isCurrentLevel ? 'text-white' : 'text-slate-900'}`}>${rent}</span>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {property.kind === PropertyKind.STATION && (
                    <>
                      {[1, 2, 3, 4].map((count) => (
                        <div key={count} className="flex justify-between items-center px-3 py-2 group hover:bg-slate-50 rounded-xl">
                          <span className="text-slate-700 font-bold">Sở hữu {count} Bến xe</span>
                          <span className="font-black text-slate-900">${STATION_RENT_BY_COUNT[count]}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {property.kind === PropertyKind.UTILITY && (
                    <>
                      <div className="flex justify-between items-center px-3 py-2 group hover:bg-slate-50 rounded-xl">
                        <span className="text-slate-700 font-bold text-xs">Sở hữu 1 Tiện ích</span>
                        <span className="font-black text-slate-900 text-xs">Xúc xắc x {UTILITY_MULTIPLIER_BY_COUNT[1]}</span>
                      </div>
                      <div className="flex justify-between items-center px-3 py-2 group hover:bg-slate-50 rounded-xl">
                        <span className="text-slate-700 font-bold text-xs">Sở hữu 2 Tiện ích</span>
                        <span className="font-black text-slate-900 text-xs">Xúc xắc x {UTILITY_MULTIPLIER_BY_COUNT[2]}</span>
                      </div>
                    </>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Costs */}
                <div className="grid grid-cols-2 gap-4">
                  {property.kind === PropertyKind.LAND && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Giá nhà</p>
                      <p className="text-lg font-black text-slate-800">${property.buildingCost}</p>
                    </div>
                  )}
                  {property.kind !== PropertyKind.LAND && (
                     <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loại</p>
                      <p className="text-xs font-black text-slate-800 uppercase">{property.kind === PropertyKind.STATION ? 'Bến xe' : 'Tiện ích'}</p>
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thế chấp</p>
                    <p className="text-lg font-black text-slate-800">${property.mortgageValue}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    {property.kind === PropertyKind.LAND 
                      ? 'Nếu sở hữu tất cả lô đất cùng nhóm màu, tiền thuê đất trống được gấp đôi.'
                      : 'Tiền thuê tăng lên khi bạn sở hữu nhiều bất động sản cùng loại.'
                    }
                  </p>
                </div>
              </>
            ) : (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Info size={32} />
                </div>
                <p className="text-sm text-slate-500 font-medium px-4">
                  Đây là ô chức năng đặc biệt. Bạn không thể mua hoặc xây dựng trên ô này.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <button 
            onClick={() => setInspectedPropertyId(null)}
            className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} />
            ĐÓNG LẠI
          </button>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};
