import React, { useEffect, useState } from 'react';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';

export const ParticleSystem: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      // If there are other particle types in the future, handle them here
      // For now, PURCHASE_SPARKLE is handled by PurchaseCelebration
      if (currentEvent.type === 'PURCHASE_SPARKLE') {
        // Do nothing here, or we could add global confetti
      }
    }
  }, [queue, isAnimating, dequeue, setAnimating]);

  return null;
};
