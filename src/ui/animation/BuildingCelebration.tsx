import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { Home, Landmark, Sparkles } from 'lucide-react';

export const BuildingCelebration: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<{ name: string; level: number } | null>(null);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'BUILDING_SPARKLE') {
        setAnimating(true);
        setData(currentEvent.payload);
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

  return (
    <AnimatePresence>
      {show && data && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_30px_80px_rgba(16,185,129,0.2)] border-8 border-white ring-1 ring-slate-100 flex flex-col items-center gap-4 max-w-sm w-full"
          >
            <motion.div 
              animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className={`p-4 ${data.level === 5 ? 'bg-rose-500' : 'bg-emerald-500'} rounded-full text-white shadow-lg`}
            >
              {data.level === 5 ? <Landmark size={32} /> : <Home size={32} />}
            </motion.div>
            
            <div className="text-center space-y-1">
              <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">Cập nhật công trình</p>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {data.level === 5 ? 'Đã xây Khách sạn' : `Đã xây Nhà cấp ${data.level}`}
              </h2>
              <p className="text-slate-400 font-bold text-xs">tại {data.name}</p>
            </div>

            <div className="flex gap-2 py-1">
              <Sparkles className="text-amber-400" size={18} />
              <Sparkles className="text-emerald-400" size={18} />
              <Sparkles className="text-amber-400" size={18} />
            </div>
          </motion.div>
          
          {/* Sparkle particles (Subtler) */}
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 500, 
                y: (Math.random() - 0.5) * 500, 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 1, delay: Math.random() * 0.3 }}
              className="absolute text-emerald-400"
            >
              <Sparkles size={12 + Math.random() * 12} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
