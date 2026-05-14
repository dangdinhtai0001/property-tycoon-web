import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { Phase, type Property } from '@property-tycoon/shared';
import { canBuild } from '../../game-engine/rules/buildingRules';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Landmark, X, ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

export const BuildModal: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const isOpen = state.phase === Phase.BUILD_DECISION;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const currentTile = state.board[currentPlayer.position];

  if (currentTile.type !== 'PROPERTY') return null;
  const property = currentTile as Property;
  const buildPossible = canBuild(state, property.id);

  // Group color class
  const groupColors: Record<string, string> = {
    BROWN: 'from-amber-900 to-amber-700',
    LIGHT_BLUE: 'from-sky-400 to-sky-600',
    PINK: 'from-pink-400 to-pink-600',
    ORANGE: 'from-orange-400 to-orange-600',
    RED: 'from-red-500 to-red-700',
    YELLOW: 'from-yellow-400 to-yellow-600',
    GREEN: 'from-emerald-500 to-emerald-700',
    DARK_BLUE: 'from-indigo-700 to-indigo-900',
  };

  const colorClass = groupColors[property.groupId] || 'from-slate-600 to-slate-800';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white"
          >
            {/* Header Section */}
            <div className={`p-8 bg-gradient-to-br ${colorClass} text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Home size={120} />
              </div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4 ring-1 ring-white/30 shadow-xl">
                  <Landmark size={48} />
                </div>
                <h2 className="text-3xl font-black tracking-tight uppercase text-center">Nâng cấp tài sản</h2>
                <p className="text-white/80 font-bold mt-1 uppercase tracking-widest text-xs">Chào mừng bạn quay lại {property.name}!</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-10 flex flex-col gap-8">
              {!buildPossible ? (
                <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                  <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-black text-amber-800 text-sm uppercase">Chưa thể xây nhà</h4>
                    <p className="text-amber-700/80 text-sm font-medium mt-1">
                      Bạn cần sở hữu trọn bộ tài sản cùng màu và đảm bảo không có tài sản nào đang thế chấp để bắt đầu xây dựng.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cấp độ hiện tại</p>
                      <div className="flex gap-1 mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-4 h-4 rounded-full ${i < property.buildingLevel ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-200'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tiếp theo</p>
                      <p className="text-xl font-black text-green-600 mt-1">
                        {property.buildingLevel === 4 ? 'Khách sạn' : `Nhà cấp ${property.buildingLevel + 1}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Giá xây dựng</p>
                        <p className="text-xl font-black text-slate-800">${property.buildingCost}</p>
                      </div>
                    </div>
                    <div className="h-10 w-[2px] bg-slate-100" />
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiền thuê mới</p>
                        <p className="text-xl font-black text-slate-800">${property.rentLevels?.[property.buildingLevel + 1] || '??'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => dispatch({ type: 'END_TURN' })}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 font-black uppercase tracking-widest rounded-[2rem] hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  BỎ QUA
                </motion.button>
                
                {buildPossible && (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      dispatch({ type: 'BUILD', payload: { propertyId: property.id } });
                      dispatch({ type: 'END_TURN' });
                    }}
                    className={`flex-[1.5] py-5 bg-gradient-to-r ${colorClass} text-white font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-slate-200 flex items-center justify-center gap-3`}
                  >
                    <Home size={22} />
                    XÂY NGAY
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const TrendingUp = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
