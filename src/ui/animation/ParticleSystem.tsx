import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

export const ParticleSystem: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (queue.length > 0 && !isAnimating) {
      const currentEvent = queue[0];
      
      if (currentEvent.type === 'PURCHASE_SPARKLE') {
        setAnimating(true);
        
        // Generate particles based on payload or screen center
        const newParticles = Array.from({ length: 30 }).map((_, i) => ({
          id: Date.now() + i,
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          color: ['#FFD700', '#FFA500', '#FF4500', '#FFF'][Math.floor(Math.random() * 4)]
        }));

        setParticles(newParticles);

        setTimeout(() => {
          setParticles([]);
          dequeue();
          setAnimating(false);
        }, 1000); 
      }
    }
  }, [queue, isAnimating, dequeue, setAnimating]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: Math.random() * 2 + 1, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
