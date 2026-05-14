import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { PartyPopper } from 'lucide-react';

interface CelebrationData {
  propertyName: string;
  color: string;
  price?: number;
  rent?: number;
  remainingCash?: number;
}

export const PurchaseCelebration: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<CelebrationData | null>(null);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'PURCHASE_SPARKLE') {
        setAnimating(true);
        setData(currentEvent.payload || { propertyName: 'Tài sản', color: '#3b82f6' });
        setShow(true);
      }
    }
  }, [queue, isAnimating, setAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        setShow(false);
        setTimeout(() => {
          setData(null);
          dequeue();
          setAnimating(false);
        }, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, dequeue, setAnimating]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        const exitTimer = setTimeout(() => {
          setData(null);
          dequeue();
          setAnimating(false);
        }, 300);
        return () => clearTimeout(exitTimer);
      }, 1500); // Reduced duration
      
      return () => clearTimeout(timer);
    }
  }, [show, dequeue, setAnimating]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {show && (
          <>
            {/* Background Glow (Replaces checkerboard asset) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: [0, 0.4, 0.2], 
                scale: [0.8, 1.1, 1],
              }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div 
                className="w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
                style={{ background: `radial-gradient(circle, ${data.color} 0%, transparent 70%)` }}
              />
            </motion.div>

            {/* Confetti-like particles (Subtler) */}
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={`p-${i}`}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 800, 
                  y: (Math.random() - 0.5) * 800, 
                  scale: Math.random() * 1.5 + 0.5,
                  rotate: Math.random() * 360,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 1.5, ease: "easeOut", delay: Math.random() * 0.1 }}
                className="absolute w-3 h-3 z-20"
                style={{ 
                  backgroundColor: [data.color, '#FFD700', '#FFFFFF', '#FF69B4', '#00FFFF'][Math.floor(Math.random() * 5)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}

            {/* Central Badge (Medium Celebration) */}
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ 
                scale: 1, 
                y: 0, 
                opacity: 1,
              }}
              exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
              transition={{ 
                type: "spring", stiffness: 300, damping: 20
              }}
              className="relative z-10 flex flex-col items-center gap-4 p-8 bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border-8 border-white ring-1 ring-slate-100 max-w-sm w-full"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg mb-1"
                style={{ backgroundColor: data.color }}
              >
                <PartyPopper size={32} />
              </motion.div>
              
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                  Mua thành công!
                </h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  Giao dịch đã hoàn tất
                </p>
              </div>

              <div className="w-full bg-slate-900 rounded-[1.5rem] p-5 flex flex-col items-center gap-1 border-2 border-slate-800 shadow-inner">
                <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Tài sản mới</span>
                <span className="text-xl font-black text-white text-center leading-tight">
                  {data.propertyName}
                </span>
                
                <div className="w-full h-px bg-slate-700/50 my-2" />
                
                <div className="w-full grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Giá mua</span>
                    <span className="text-sm font-black text-white">${data.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Tiền thuê</span>
                    <span className="text-sm font-black text-emerald-400">${data.rent?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {data.remainingCash !== undefined && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tiền còn lại:</span>
                  <span className="text-xs font-black text-slate-700">${data.remainingCash.toLocaleString()}</span>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

