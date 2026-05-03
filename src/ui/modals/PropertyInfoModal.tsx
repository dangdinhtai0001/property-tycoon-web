import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { type Property } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Landmark, Info } from 'lucide-react';

export const PropertyInfoModal: React.FC = () => {
  const { state, inspectedPropertyId, setInspectedPropertyId } = useGameStore();
  
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
            <div className={`${colorClass} w-full py-6 px-4 rounded-lg text-white text-center border-2 border-black shadow-inner`}>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1 opacity-80">
                {isProperty ? 'Giấy chứng nhận' : 'Thông tin ô'}
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight leading-tight">{property.name}</h2>
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
                {/* Rent Table */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-black border-b border-slate-50 pb-2">
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Tình trạng</span>
                    <span className="text-slate-400 uppercase tracking-widest text-[10px]">Tiền thuê</span>
                  </div>
                  
                  <div className="flex justify-between items-center group">
                    <span className="text-slate-700 font-bold">Tiền thuê đất</span>
                    <span className="font-black text-slate-900">${rentLevels[0]}</span>
                  </div>

                  {rentLevels.slice(1, 5).map((rent, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex gap-1 items-center">
                        <div className="flex gap-0.5">
                          {Array.from({ length: i + 1 }).map((_, j) => (
                            <Home key={j} size={12} className="text-emerald-600 fill-emerald-600" />
                          ))}
                        </div>
                        <span className="text-slate-600 text-sm font-bold ml-1">Với {i + 1} Căn nhà</span>
                      </div>
                      <span className="font-black text-slate-900">${rent}</span>
                    </div>
                  ))}

                  {rentLevels[5] && (
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-slate-200">
                      <div className="flex gap-2 items-center">
                        <Landmark size={14} className="text-red-600 fill-red-600" />
                        <span className="text-slate-900 font-black">Với KHÁCH SẠN</span>
                      </div>
                      <span className="font-black text-red-600 text-lg">${rentLevels[5]}</span>
                    </div>
                  )}
                </div>

                <hr className="border-slate-100" />

                {/* Costs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Giá nhà</p>
                    <p className="text-lg font-black text-slate-800">${property.buildingCost}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thế chấp</p>
                    <p className="text-lg font-black text-slate-800">${property.mortgageValue}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-400 italic font-medium">
                    Nếu một người chơi sở hữu tất cả các lô đất của một Nhóm cùng Màu, tiền thuê sẽ được gấp đôi trên các lô đất chưa được cải tạo trong nhóm đó.
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
