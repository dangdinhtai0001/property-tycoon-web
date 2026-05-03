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

  return (
    <AnimatePresence>
      {show && data && (
        <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            className="bg-white/95 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_40px_100px_rgba(16,185,129,0.3)] border-4 border-emerald-100 flex flex-col items-center gap-4"
          >
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={`p-6 ${data.level === 5 ? 'bg-red-500' : 'bg-emerald-500'} rounded-full text-white shadow-xl`}
            >
              {data.level === 5 ? <Landmark size={48} /> : <Home size={48} />}
            </motion.div>
            
            <div className="text-center">
              <p className="text-emerald-600 font-black uppercase tracking-[0.3em] text-xs mb-1">Công trình mới!</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">
                {data.level === 5 ? 'Đã xây Khách sạn' : `Đã xây Nhà cấp ${data.level}`}
              </h2>
              <p className="text-slate-400 font-bold mt-2">tại {data.name}</p>
            </div>

            <div className="flex gap-2 mt-2">
              <Sparkles className="text-amber-400" size={24} />
              <Sparkles className="text-emerald-400" size={24} />
              <Sparkles className="text-amber-400" size={24} />
            </div>
          </motion.div>
          
          {/* Sparkle particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: (Math.random() - 0.5) * 600, 
                y: (Math.random() - 0.5) * 600, 
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{ duration: 1 + Math.random(), delay: Math.random() * 0.5 }}
              className="absolute text-emerald-400"
            >
              <Sparkles size={16 + Math.random() * 16} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
