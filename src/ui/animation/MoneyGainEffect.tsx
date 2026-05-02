import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { Sparkles, TrendingUp, DollarSign, PartyPopper } from 'lucide-react';

export const MoneyGainEffect: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'MONEY_GAIN') {
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
          {/* Background Highlight */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/10 backdrop-blur-[1px]"
          />

          {/* Main Notification */}
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 1.2 }}
            className="relative z-10 bg-white/95 backdrop-blur-xl px-12 py-8 rounded-[3rem] shadow-[0_30px_100px_rgba(34,197,94,0.3)] border-4 border-green-100 flex flex-col items-center gap-4"
          >
            <motion.div 
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="p-5 bg-green-500 rounded-full text-white shadow-lg shadow-green-200"
            >
              <PartyPopper size={48} strokeWidth={2.5} />
            </motion.div>
            <div className="text-center">
              <p className="text-green-500 font-black uppercase tracking-[0.3em] text-xs mb-1">Thanh toán!</p>
              <h2 className="text-6xl font-black text-slate-800 tracking-tighter">
                <span className="text-green-600">+</span>${amount}
              </h2>
            </div>
            <div className="flex gap-2">
              <Sparkles className="text-amber-400" size={20} />
              <Sparkles className="text-amber-400" size={20} />
              <Sparkles className="text-amber-400" size={20} />
            </div>
          </motion.div>

          {/* Floating Coins Particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 100, 
                rotate: Math.random() * 360,
                opacity: 0
              }}
              animate={{ 
                y: -100,
                rotate: Math.random() * 720,
                opacity: [0, 1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5 + Math.random() * 1.5, 
                delay: Math.random() * 0.8,
                ease: "easeOut"
              }}
              className="absolute text-amber-500"
            >
              <div className="bg-amber-400 w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center shadow-md">
                <DollarSign size={16} strokeWidth={4} className="text-amber-700" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
