import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { Dice } from './Dice';

export const DiceRollAnimation: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [currentRoll, setCurrentRoll] = useState<number[]>([1, 1]);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'DICE_ROLL') {
        setAnimating(true);
        setIsFinishing(false);
        const targetResult = currentEvent.payload?.result || [
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1
        ];

        // Visual roll simulation
        const interval = setInterval(() => {
          setCurrentRoll([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1
          ]);
        }, 80);

        // Stop rolling after 1.2s and show the actual result
        setTimeout(() => {
          clearInterval(interval);
          setCurrentRoll(targetResult);
          setIsFinishing(true);

          // Wait for 1s to show the result before continuing
          setTimeout(() => {
            dequeue();
            setAnimating(false);
            setIsFinishing(false);
          }, 1000);
        }, 1200);
      } else {
        dequeue();
      }
    }
  }, [queue, isAnimating, dequeue, setAnimating]);

  if (!isAnimating || queue.length === 0 || queue[0].type !== 'DICE_ROLL') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex flex-col items-center gap-6 p-10 bg-white/90 backdrop-blur-md rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50"
        >
          <div className="flex gap-6">
            {currentRoll.map((value, i) => (
              <Dice key={i} value={value} isRolling={!isFinishing} />
            ))}
          </div>
          
          {isFinishing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Tổng điểm</span>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tabular-nums">
                {currentRoll[0] + currentRoll[1]}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
