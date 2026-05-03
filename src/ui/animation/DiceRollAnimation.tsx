import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';
import { Dice } from './Dice';

const randomDie = () => Math.floor(Math.random() * 6) + 1;

const ROLL_DURATION = 1350;
const RESULT_HOLD_DURATION = 1450;
const EXIT_DURATION = 360;

export const DiceRollAnimation: React.FC = () => {
  const { queue, dequeue, isAnimating, setAnimating } = useAnimationQueue();

  const [currentResult, setCurrentResult] = useState<number[]>([1, 1]);
  const [tempFaces, setTempFaces] = useState<number[]>([1, 1]);
  const [showVisual, setShowVisual] = useState(false);
  const [rolling, setRolling] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        x: Math.random() * 520 - 260,
        y: Math.random() * 320 - 160,
        delay: Math.random() * 0.25,
        size: Math.random() * 8 + 5,
      })),
    []
  );

  const clearAnimationTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAnimationTimers();
    };
  }, [clearAnimationTimers]);

  useEffect(() => {
    if (queue.length === 0 || isAnimating) return;

    const currentEvent = queue[0];

    if (currentEvent.type !== 'DICE_ROLL') {
      dequeue();
      return;
    }

    clearAnimationTimers();

    const targetResult = currentEvent.payload?.result || [1, 1];

    setAnimating(true);
    setCurrentResult(targetResult);
    setTempFaces([randomDie(), randomDie()]);
    setShowVisual(true);
    setRolling(true);

    // Also trigger Phaser one for syncing if needed, though React is primary visual
    PhaserBridge.showDiceRoll(targetResult);

    if (!shouldReduceMotion) {
      intervalRef.current = window.setInterval(() => {
        setTempFaces([randomDie(), randomDie()]);
      }, 85);
    }

    const stopRollingTimer = window.setTimeout(() => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setTempFaces(targetResult);
      setRolling(false);
    }, shouldReduceMotion ? 450 : ROLL_DURATION);

    const hideTimer = window.setTimeout(
      () => {
        setShowVisual(false);
      },
      shouldReduceMotion ? 1200 : ROLL_DURATION + RESULT_HOLD_DURATION
    );

    const finishTimer = window.setTimeout(
      () => {
        dequeue();
        setAnimating(false);
      },
      shouldReduceMotion
        ? 1200 + EXIT_DURATION
        : ROLL_DURATION + RESULT_HOLD_DURATION + EXIT_DURATION
    );

    timersRef.current.push(stopRollingTimer, hideTimer, finishTimer);
  }, [
    queue,
    isAnimating,
    dequeue,
    setAnimating,
    clearAnimationTimers,
    shouldReduceMotion,
  ]);

  const displayFaces = rolling ? tempFaces : currentResult;
  const total = currentResult[0] + currentResult[1];

  return (
    <AnimatePresence>
      {showVisual && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),rgba(15,23,42,0.45)_42%,rgba(0,0,0,0.72))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {!shouldReduceMotion &&
            particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute rounded-full bg-white/70 blur-[1px]"
                style={{
                  width: particle.size,
                  height: particle.size,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  scale: 0,
                }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: [0, 0.9, 0],
                  scale: [0, 1, 0.25],
                }}
                transition={{
                  duration: 1.25,
                  delay: particle.delay,
                  ease: 'easeOut',
                }}
              />
            ))}

          <motion.div
            className="relative flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.72, y: 34 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.86, y: -28 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute -inset-10 rounded-[4rem] bg-blue-500/25 blur-3xl"
              animate={
                rolling && !shouldReduceMotion
                  ? {
                    scale: [1, 1.14, 0.96, 1.08, 1],
                    opacity: [0.35, 0.65, 0.42, 0.72, 0.4],
                  }
                  : {
                    scale: 1,
                    opacity: 0.35,
                  }
              }
              transition={{
                duration: 0.55,
                repeat: rolling && !shouldReduceMotion ? Infinity : 0,
              }}
            />

            {/* Dice Container */}
            <motion.div
              className="relative flex gap-6 rounded-[3rem] border border-white/35 bg-white/20 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              animate={
                rolling && !shouldReduceMotion
                  ? {
                    x: [0, -10, 12, -8, 8, 0],
                    y: [0, -8, 7, -5, 4, 0],
                    rotate: [0, -2.4, 2.8, -1.8, 1.4, 0],
                  }
                  : {
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }
              }
              transition={{
                duration: 0.42,
                repeat: rolling && !shouldReduceMotion ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              {displayFaces.map((face, index) => (
                <motion.div
                  key={index}
                  animate={
                    rolling && !shouldReduceMotion
                      ? {
                        y: [0, -28, 10, -16, 0],
                        rotate: index === 0
                          ? [0, 160, 310, 470, 720]
                          : [0, -150, -320, -520, -720],
                        scale: [1, 1.08, 0.96, 1.05, 1],
                      }
                      : {
                        y: [0, -10, 0],
                        rotate: 0,
                        scale: [1, 1.12, 1],
                      }
                  }
                  transition={
                    rolling && !shouldReduceMotion
                      ? {
                        duration: 0.55,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.06,
                      }
                      : {
                        duration: 0.34,
                        ease: 'easeOut',
                        delay: index * 0.08,
                      }
                  }
                >
                  <Dice value={face} isRolling={rolling} />
                </motion.div>
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {!rolling && (
                <motion.div
                  key={total}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.25, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.75, y: -12 }}
                  transition={{
                    type: 'spring',
                    stiffness: 430,
                    damping: 18,
                  }}
                >
                  <motion.div
                    className="absolute -inset-3 rounded-3xl bg-white/45 blur-xl"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: [0, 0.8, 0.35], scale: [0.7, 1.18, 1] }}
                    transition={{ duration: 0.55 }}
                  />

                  <div className="relative rounded-3xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-700 px-10 py-4 text-5xl font-black text-white shadow-[0_18px_50px_rgba(37,99,235,0.45)]">
                    {total}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
