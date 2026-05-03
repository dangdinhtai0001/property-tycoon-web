import React, { useEffect } from 'react';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';

export const DiceRollAnimation: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'DICE_ROLL') {
        setAnimating(true);
        const targetResult = currentEvent.payload?.result || [1, 1];

        // Trigger Phaser animation
        PhaserBridge.showDiceRoll(targetResult);

        // Sync React state with Phaser animation duration
        // Phaser roll is ~1.2s + 0.2s land + 1.5s wait + 0.4s fade = ~3.3s
        setTimeout(() => {
          dequeue();
          setAnimating(false);
        }, 3300);
      } else {
        dequeue();
      }
    }
  }, [queue, isAnimating, dequeue, setAnimating]);

  return null; // Visuals are now handled by Phaser
};
