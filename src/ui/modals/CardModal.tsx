import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, Phase } from '../../game-engine/types/game';
import { AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

type InteractionState = 'SHUFFLING' | 'PICKING' | 'REVEALING' | 'REVEALED';

export const CardModal: React.FC = () => {
  const { state, dispatch } = useGameStore();
  const [interaction, setInteraction] = useState<InteractionState>('SHUFFLING');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isOpen = state.phase === Phase.SHOWING_CARD && !!state.activeCard;
  const card = state.activeCard;

  useEffect(() => {
    if (isOpen) {
      setInteraction('SHUFFLING');
      setSelectedIndex(null);
      const timer = setTimeout(() => setInteraction('PICKING'), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !card) return null;

  const isChance = card.type === TileType.CHANCE;
  // Khí Vận -> Vàng (Yellow/Amber), Cơ Hội -> Đỏ (Red/Rose)
  const colorClass = isChance ? 'from-amber-400 to-orange-500' : 'from-red-500 to-rose-700';
  const icon = isChance ? <TrendingUp size={48} /> : <Sparkles size={48} />;
  const titleText = isChance ? 'CƠ HỘI' : 'KHÍ VẬN';

  const getEffectSummary = (effect: any) => {
    const { type, value, target, position } = effect;
    switch (type) {
      case 'RECEIVE_MONEY': return `Nhận $${value}${target === 'LOWEST_CASH' ? ' (Hỗ trợ người khó khăn)' : ''}`;
      case 'PAY_MONEY': return `Trả $${value}`;
      case 'PAY_PER_PROPERTY': return `Trả $${value} cho mỗi tài sản`;
      case 'PAY_PER_BUILDING': return `Trả $${value} cho mỗi cấp công trình`;
      case 'MOVE_TO_TILE': return `Di chuyển đến ô số ${position}`;
      case 'MOVE_STEPS': return `Di chuyển ${value > 0 ? 'tiến' : 'lùi'} ${Math.abs(value)} bước`;
      case 'MOVE_TO_NEAREST_UNOWNED_PROPERTY': return `Tiến đến bất động sản trống gần nhất`;
      case 'TEMP_RENT_MODIFIER': return `Nhân ${value} lần tiền thuê tại ${target === 'STATION' ? 'Bến xe' : 'nhóm đất'} trong ${effect.duration} lượt`;
      case 'TEMP_BUILD_COST_MODIFIER': return `Giảm ${Math.round((1 - value) * 100)}% chi phí xây dựng lượt tới`;
      case 'ADJUST_BUILDING_LEVEL': return `${value > 0 ? 'Tăng' : 'Giảm'} ${Math.abs(value)} cấp công trình`;
      case 'DISABLE_ACTION_UNTIL_ROUND_END': return `Tạm dừng hành động: ${target}`;
      case 'ONE_TIME_RENT_DISCOUNT': return `Giảm ${Math.round((1 - value) * 100)}% tiền thuê lần tới`;
      case 'ONE_TIME_PURCHASE_DISCOUNT': return `Giảm ${Math.round((1 - value) * 100)}% giá mua đất lần tới`;
      default: return 'Có biến động xảy ra';
    }
  };

  const handlePick = (index: number) => {
    setSelectedIndex(index);
    setInteraction('REVEALING');
    setTimeout(() => setInteraction('REVEALED'), 600);
  };

  const cardBackUrl = isChance ? '/assets/tiles/chance_back.png' : '/assets/tiles/fortune_back.png';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <div className="relative w-full max-w-4xl flex flex-col items-center">
          
          {/* Title / Instruction */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl font-black tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-r ${colorClass}`}>
              {interaction === 'REVEALED' ? titleText : 'ĐANG RÚT THẺ...'}
            </h2>
            <p className="text-slate-400 font-bold mt-2 uppercase tracking-widest">
              {interaction === 'PICKING' ? 'Hãy chọn 1 trong 3 tấm thẻ bên dưới' : ''}
            </p>
          </motion.div>

          <div className="flex gap-6 justify-center items-center h-[400px] w-full">
            {interaction === 'SHUFFLING' ? (
              <div className="relative w-64 h-96">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, (i - 2) * 50, 0],
                      y: [0, i * 5, 0],
                      rotate: [0, (i - 2) * 10, 0]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.6, 
                      delay: i * 0.1 
                    }}
                    className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${colorClass} border-4 border-white shadow-xl flex items-center justify-center text-white/20 overflow-hidden`}
                  >
                    <img 
                      src={cardBackUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <div className="relative z-10 opacity-30">
                      {icon}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : interaction === 'PICKING' || interaction === 'REVEALING' ? (
              <div className="flex gap-8">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      y: 0, 
                      opacity: 1, 
                      scale: selectedIndex === null || selectedIndex === i ? 1 : 0.8,
                      filter: selectedIndex !== null && selectedIndex !== i ? 'grayscale(1) opacity(0.3)' : 'none'
                    }}
                    whileHover={selectedIndex === null ? { y: -20, scale: 1.05 } : {}}
                    onClick={() => selectedIndex === null && handlePick(i)}
                    className={`w-56 h-80 rounded-[2.5rem] bg-gradient-to-br ${colorClass} border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white cursor-pointer relative overflow-hidden`}
                  >
                    <img 
                      src={cardBackUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    
                    <div className="absolute inset-0 bg-black/20" />
                    
                    <div className="relative z-10 bg-white/20 p-4 rounded-3xl backdrop-blur-md mb-4">
                      {icon}
                    </div>
                    <span className="relative z-10 font-black tracking-widest text-white/50 text-2xl">?</span>
                    
                    {selectedIndex === i && interaction === 'REVEALING' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-white z-50 flex items-center justify-center"
                      >
                        <motion.div 
                          animate={{ rotateY: 180 }}
                          transition={{ duration: 0.5 }}
                          className="w-full h-full bg-white"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              /* REVEALED STATE */
              <motion.div
                initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
                className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white ring-1 ring-slate-100"
              >
                {/* Card Header */}
                <div className={`h-40 bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center text-white p-6 relative`}>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    {icon}
                  </div>
                  <div className="bg-white/20 p-4 rounded-[2rem] mb-3 backdrop-blur-md">
                    {icon}
                  </div>
                  <h2 className="text-xl font-black tracking-tighter uppercase px-4 text-center leading-tight">{card.title}</h2>
                </div>

                {/* Card Content */}
                <div className="p-10 text-center bg-white">
                  <div className="mb-8">
                    <p className="text-xl font-bold text-slate-800 leading-relaxed italic px-4 mb-6">
                      "{card.description}"
                    </p>

                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ảnh hưởng thực tế</span>
                      <p className="text-md font-black text-blue-600 uppercase">
                        {getEffectSummary(card.effect)}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: 'APPLY_CARD' })}
                    className={`w-full py-5 rounded-[2rem] bg-gradient-to-r ${colorClass} text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 transition-all hover:shadow-2xl`}
                  >
                    CHẤP NHẬN
                  </motion.button>
                </div>
              </motion.div>
            ) }
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
