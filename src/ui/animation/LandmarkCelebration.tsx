import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { Landmark, Sparkles, PartyPopper, Trophy } from 'lucide-react';
import { BUILDING_LEVEL_NAMES } from '../../config/text';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';

export const LandmarkCelebration: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [show, setShow] = useState(false);
  const [data, setData] = useState<{ propertyName: string; color: string; position: number } | null>(null);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'LANDMARK_COMPLETE') {
        setAnimating(true);
        setData(currentEvent.payload);
        setShow(true);
        
        // Trigger Camera Zoom
        if (currentEvent.payload.position !== undefined) {
          PhaserBridge.zoomToTile(currentEvent.payload.position, 1000);
        }
      }
    }
  }, [queue, isAnimating, setAnimating]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setData(null);
          dequeue();
          setAnimating(false);
        }, 500);
      }, 4000); // Landmark celebration lasts longer
      
      return () => clearTimeout(timer);
    }
  }, [show, dequeue, setAnimating]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center pointer-events-none overflow-hidden">
      <AnimatePresence>
        {show && (
          <>
            {/* Global Flash */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white z-[10]"
            />

            {/* Confetti Particles */}
            {Array.from({ length: 60 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, rotate: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 1200, 
                  y: (Math.random() - 0.5) * 1200, 
                  scale: Math.random() * 2 + 1,
                  rotate: Math.random() * 720,
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 2.5, ease: "easeOut", delay: Math.random() * 0.2 }}
                className="absolute w-4 h-4 z-[20]"
                style={{ 
                  backgroundColor: [data.color, '#FFD700', '#FFFFFF', '#FF69B4', '#00FFFF'][Math.floor(Math.random() * 5)],
                  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                }}
              />
            ))}

            {/* Main Trophy & Title */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative z-[30] flex flex-col items-center gap-6 text-center"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-32 h-32 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.6)] border-8 border-white"
                >
                  <Trophy size={64} className="text-white fill-white/20" />
                </motion.div>
                
                {/* Floating Sparkles */}
                <Sparkles className="absolute -top-4 -left-4 text-amber-300 animate-pulse" size={40} />
                <Sparkles className="absolute -bottom-4 -right-4 text-amber-300 animate-pulse delay-700" size={32} />
              </div>

              <div className="space-y-2">
                <motion.h2 
                  initial={{ letterSpacing: "0.5em", opacity: 0 }}
                  animate={{ letterSpacing: "0.1em", opacity: 1 }}
                  className="text-5xl font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] italic"
                >
                  LANDMARK HOÀN THÀNH!
                </motion.h2>
                <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 inline-block">
                   <p className="text-white font-black uppercase tracking-widest text-sm">
                    {data.propertyName} đã trở thành biểu tượng mới!
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-center bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border-2 border-white/20 shadow-2xl">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Landmark size={24} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest leading-none">Cấp công trình tối đa</p>
                  <p className="text-xl font-black text-white">{BUILDING_LEVEL_NAMES[5]}</p>
                </div>
              </div>
            </motion.div>

            {/* Radial Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute w-[800px] h-[800px] rounded-full"
              style={{ background: `radial-gradient(circle, ${data.color} 0%, transparent 70%)` }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
