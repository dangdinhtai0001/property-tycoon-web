import React from 'react';
import { motion } from 'framer-motion';

interface DiceProps {
  value: number;
  isRolling: boolean;
}

export const Dice: React.FC<DiceProps> = ({ value, isRolling }) => {
  const renderDots = () => {
    const dotsMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };

    const dots = dotsMap[value] || [];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {dots.includes(i) && (
              <div
                className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      animate={isRolling ? {
        rotate: [0, 10, -10, 10, 0],
        x: [0, -2, 2, -2, 0],
        y: [0, 2, -2, 2, 0],
      } : {
        rotate: 0,
        x: 0,
        y: 0,
      }}
      transition={isRolling ? {
        duration: 0.2,
        repeat: Infinity,
        ease: "linear"
      } : {
        type: "spring",
        stiffness: 400,
        damping: 12
      }}
      className="w-16 h-16 bg-gradient-to-br from-white to-slate-100 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.1),inset_0_-4px_0_rgba(0,0,0,0.1)] flex items-center justify-center border-b-2 border-slate-300 relative overflow-hidden"
    >
      {renderDots()}
    </motion.div>
  );
};
