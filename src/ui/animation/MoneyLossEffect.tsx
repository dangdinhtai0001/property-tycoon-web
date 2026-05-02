import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { Frown, TrendingDown, DollarSign } from 'lucide-react';

export const MoneyLossEffect: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'MONEY_LOSS') {
        setAnimating(true);
        setAmount(currentEvent.payload?.amount || 0);
        setShow(true);
      }
    }
  }, [queue, isAnimating, setAnimating]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        setShow(false);
        setTimeout(() => {
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
        // Wait for exit animation
        const exitTimer = setTimeout(() => {
          dequeue();
          setAnimating(false);
        }, 500);
        return () => clearTimeout(exitTimer);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [show, dequeue, setAnimating]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center overflow-hidden">
          {/* Background Dimming */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-900/10 backdrop-blur-[1px]"
          />

          {/* Main Notification */}
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            className="relative z-10 bg-white/90 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] shadow-2xl border-4 border-red-100 flex flex-col items-center gap-2"
          >
            <div className="p-4 bg-red-100 rounded-full text-red-600">
              <TrendingDown size={48} strokeWidth={3} />
            </div>
            <div className="text-center">
              <p className="text-red-500 font-black uppercase tracking-widest text-xs mb-1">Mất tiền!</p>
              <h2 className="text-5xl font-black text-slate-800 tracking-tighter">-${amount}</h2>
            </div>
            <motion.div 
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-red-400 mt-2"
            >
              <Frown size={24} />
            </motion.div>
          </motion.div>

          {/* Falling Money Particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -100, 
                rotate: Math.random() * 360,
                opacity: 0
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: Math.random() * 720,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                delay: Math.random() * 0.5,
                ease: "linear"
              }}
              className="absolute text-red-400/30"
            >
              {i % 3 === 0 ? <TrendingDown size={32} /> : i % 3 === 1 ? <DollarSign size={24} /> : <Frown size={28} />}
            </motion.div>
          ))}

          {/* Screen Shake Effect */}
          <motion.div
            animate={{ 
              x: [-5, 5, -5, 5, 0],
              y: [-2, 2, -2, 2, 0]
            }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 border-[20px] border-red-500/10 pointer-events-none"
          />
        </div>
      )}
    </AnimatePresence>
  );
};
