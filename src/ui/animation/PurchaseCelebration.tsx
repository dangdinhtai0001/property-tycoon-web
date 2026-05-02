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

        setTimeout(() => {
          setShow(false);
          setTimeout(() => {
            setData(null);
            dequeue();
            setAnimating(false);
          }, 500);
        }, 2500); 
      }
    }
  }, [queue, isAnimating, dequeue, setAnimating]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {show && (
          <>
            {/* Confetti-like particles */}
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={`p-${i}`}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 600, 
                  y: (Math.random() - 0.5) * 600, 
                  scale: Math.random() * 1.5 + 0.5,
                  rotate: Math.random() * 360,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-3 h-3"
                style={{ 
                  backgroundColor: [data.color, '#FFD700', '#FFFFFF'][Math.floor(Math.random() * 3)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px'
                }}
              />
            ))}

            {/* Central Badge */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4 p-10 bg-white/95 backdrop-blur-xl rounded-[40px] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border-4 border-white"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg mb-2"
                style={{ backgroundColor: data.color }}
              >
                <PartyPopper size={40} />
              </div>
              
              <div className="text-center">
                <motion.h2 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-4xl font-black text-slate-800 uppercase tracking-tighter"
                >
                  Chúc mừng!
                </motion.h2>
                <p className="text-slate-500 font-bold mt-2">
                  Bạn đã sở hữu
                </p>
                <div className="mt-4 px-6 py-3 bg-slate-100 rounded-2xl border-2 border-slate-200">
                  <span className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={24} />
                    {data.propertyName}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
