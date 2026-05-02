import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { PartyPopper, Sparkles } from 'lucide-react';

export const PurchaseCelebration: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<{ propertyName: string; color: string } | null>(null);

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
        }, 500);
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
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, dequeue, setAnimating]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {show && (
          <>
            {/* Background Asset with Shaking */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: [0, 5, -5, 5, 0],
                x: [0, 10, -10, 10, 0],
                y: [0, -10, 10, -10, 0]
              }}
              transition={{ 
                scale: { type: 'spring', damping: 10 },
                opacity: { duration: 0.5 },
                rotate: { repeat: Infinity, duration: 2 },
                x: { repeat: Infinity, duration: 0.15 },
                y: { repeat: Infinity, duration: 0.1 }
              }}
              style={{ background: 'none', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
              className="absolute z-0 pointer-events-none flex items-center justify-center"
            >
              <img 
                src="/assets/celebration/success.png" 
                alt="" 
                className="max-w-[800px] max-h-[800px] w-auto h-auto object-contain opacity-90"
                style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </motion.div>

            {/* Confetti-like particles */}
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={`p-${i}`}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 1200, 
                  y: (Math.random() - 0.5) * 1200, 
                  scale: Math.random() * 2 + 0.5,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 2.5, ease: "easeOut", delay: Math.random() * 0.2 }}
                className="absolute w-4 h-4 z-20"
                style={{ 
                  backgroundColor: [data.color, '#FFD700', '#FFFFFF', '#FF69B4', '#00FFFF'][Math.floor(Math.random() * 5)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '4px',
                  boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                }}
              />
            ))}

            {/* Central Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ 
                scale: 1, 
                rotate: 0, 
                opacity: 1,
                y: [0, -10, 0]
              }}
              exit={{ scale: 2, opacity: 0, filter: 'blur(10px)' }}
              transition={{ 
                scale: { type: "spring", stiffness: 400, damping: 15 },
                rotate: { type: "spring", stiffness: 200, damping: 10 },
                y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
              }}
              className="relative z-10 flex flex-col items-center gap-6 p-12 bg-white rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,0.5)] border-[12px] border-white ring-2 ring-slate-100"
            >
              <motion.div 
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl mb-2"
                style={{ backgroundColor: data.color }}
              >
                <PartyPopper size={56} />
              </motion.div>
              
              <div className="text-center">
                <motion.h2 
                  animate={{ scale: [1, 1.2, 1], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-6xl font-black text-slate-800 uppercase tracking-tighter drop-shadow-md"
                >
                  TUYỆT VỜI!
                </motion.h2>
                <p className="text-slate-400 font-black mt-3 uppercase tracking-[0.3em] text-sm">
                  Giao dịch thành công
                </p>
                
                <div className="mt-8 relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative px-10 py-5 bg-slate-900 rounded-[2rem] border-4 border-slate-800 flex flex-col items-center">
                    <span className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">Bạn đã sở hữu</span>
                    <span className="text-3xl font-black text-white flex items-center gap-3">
                      <Sparkles className="text-amber-400" size={28} />
                      {data.propertyName}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
