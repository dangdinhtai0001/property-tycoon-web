import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';
import { Dice } from './Dice';
import { ANIMATION } from '../../config/animation';

const randomDie = () => Math.floor(Math.random() * 6) + 1;

const randomDieExcept = (previous?: number) => {
  const next = randomDie();
  return previous && next === previous ? (next % 6) + 1 : next;
};

const nextRollingFaces = (previous: number[] = []) => [
  randomDieExcept(previous[0]),
  randomDieExcept(previous[1]),
];

const { rollDuration, resultHoldDuration, exitDuration, faceChangeInterval, reducedMotionRollDuration, reducedMotionTotalDuration } = ANIMATION.dice;
const SOFT_EASE = ANIMATION.easing.soft;
const SLOT_EASE = ANIMATION.easing.slot;
const FLOAT_EASE = ANIMATION.easing.float;

type JackpotDiceProps = {
  face: number;
  index: number;
  rolling: boolean;
  shouldReduceMotion: boolean;
};

const JackpotDice: React.FC<JackpotDiceProps> = ({
  face,
  index,
  rolling,
  shouldReduceMotion,
}) => {
  const enableMotion = rolling && !shouldReduceMotion;

  return (
    <motion.div
      className="relative"
      animate={
        enableMotion
          ? {
            // Rung nhẹ để vẫn có cảm giác dice đang bị kéo bởi motor jackpot.
            x: index === 0 ? [0, -2, 2, -1, 1, 0] : [0, 2, -2, 1, -1, 0],
            y: [0, -2, 1, -1, 2, 0],
            rotate: index === 0 ? [0, -1, 0.8, -0.5, 0] : [0, 1, -0.8, 0.5, 0],
          }
          : {
            x: 0,
            y: [0, -8, 0],
            rotate: 0,
          }
      }
      transition={
        enableMotion
          ? {
            duration: 0.18,
            repeat: Infinity,
            ease: 'linear',
            delay: index * 0.025,
          }
          : {
            duration: 0.42,
            ease: SOFT_EASE,
            delay: index * 0.08,
          }
      }
      style={{ willChange: 'transform' }}
    >
      <div className="relative overflow-hidden rounded-3xl shadow-[inset_0_18px_30px_rgba(255,255,255,0.28),inset_0_-18px_30px_rgba(0,0,0,0.18)]">
        {/* Giữ kích thước theo Dice thật, còn Dice đang chạy sẽ nằm absolute bên trên. */}
        <div className="invisible">
          <Dice value={face} isRolling={rolling} />
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={`${index}-${face}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={
              enableMotion
                ? {
                  y: '118%',
                  opacity: 0.2,
                  scale: 0.96,
                  filter: 'blur(7px)',
                }
                : {
                  y: -10,
                  opacity: 0,
                  scale: 0.9,
                  filter: 'blur(0px)',
                }
            }
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={
              enableMotion
                ? {
                  y: '-118%',
                  opacity: 0.15,
                  scale: 1.03,
                  filter: 'blur(8px)',
                }
                : {
                  y: 10,
                  opacity: 0,
                  scale: 0.96,
                  filter: 'blur(0px)',
                }
            }
            transition={
              enableMotion
                ? {
                  duration: 0.08,
                  ease: 'linear',
                }
                : {
                  duration: 0.24,
                  ease: SLOT_EASE,
                }
            }
            style={{ willChange: 'transform, opacity, filter' }}
          >
            <Dice value={face} isRolling={rolling} />
          </motion.div>
        </AnimatePresence>

        {enableMotion && (
          <>
            {/* Vệt sáng chạy dọc giống khung quay jackpot. */}
            <motion.div
              className="pointer-events-none absolute -inset-x-8 z-10 h-1/2 bg-gradient-to-b from-transparent via-white/35 to-transparent"
              initial={{ y: '-120%' }}
              animate={{ y: ['-120%', '220%'] }}
              transition={{ duration: 0.22, repeat: Infinity, ease: 'linear' }}
              style={{ willChange: 'transform' }}
            />

            {/* Che nhẹ phía trên/dưới để tạo motion blur khi trượt tốc độ cao. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-1/4 bg-gradient-to-b from-white/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1/4 bg-gradient-to-t from-slate-900/35 to-transparent" />
          </>
        )}
      </div>
    </motion.div>
  );
};

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
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        x: Math.random() * 560 - 280,
        y: Math.random() * 340 - 170,
        delay: Math.random() * 0.22,
        size: Math.random() * 8 + 5,
      })),
    []
  );

  const speedLines = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        id: index,
        x: Math.random() * 620 - 310,
        y: Math.random() * 360 - 180,
        delay: Math.random() * 0.18,
        width: Math.random() * 80 + 70,
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
    setTempFaces(nextRollingFaces());
    setShowVisual(true);
    setRolling(true);

    // Also trigger Phaser one for syncing if needed, though React is primary visual
    PhaserBridge.showDiceRoll(targetResult);

    if (!shouldReduceMotion) {
      intervalRef.current = window.setInterval(() => {
        setTempFaces((previous) => nextRollingFaces(previous));
      }, faceChangeInterval);
    }

    const stopRollingTimer = window.setTimeout(() => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setTempFaces(targetResult);
      setRolling(false);
    }, shouldReduceMotion ? reducedMotionRollDuration : rollDuration);

    const hideTimer = window.setTimeout(
      () => {
        setShowVisual(false);
      },
      shouldReduceMotion ? reducedMotionTotalDuration : rollDuration + resultHoldDuration
    );

    const finishTimer = window.setTimeout(
      () => {
        dequeue();
        setAnimating(false);
      },
      shouldReduceMotion
        ? reducedMotionTotalDuration + exitDuration
        : rollDuration + resultHoldDuration + exitDuration
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
          transition={{ duration: 0.24, ease: SOFT_EASE }}
          style={{ willChange: 'opacity' }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),rgba(15,23,42,0.45)_42%,rgba(0,0,0,0.72))]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: SOFT_EASE }}
          />

          {!shouldReduceMotion &&
            particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute rounded-full bg-white/70 blur-[1px]"
                style={{
                  width: particle.size,
                  height: particle.size,
                  willChange: 'transform, opacity',
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
                  opacity: [0, 0.75, 0.2, 0],
                  scale: [0, 1, 0.65, 0.2],
                }}
                transition={{
                  duration: 1.35,
                  delay: particle.delay,
                  ease: SOFT_EASE,
                }}
              />
            ))}

          {rolling &&
            !shouldReduceMotion &&
            speedLines.map((line) => (
              <motion.span
                key={line.id}
                className="absolute h-[2px] rounded-full bg-white/45 blur-[1px]"
                style={{
                  width: line.width,
                  willChange: 'transform, opacity',
                }}
                initial={{ opacity: 0, scaleX: 0.35, x: line.x - 240, y: line.y }}
                animate={{
                  opacity: [0, 0.85, 0],
                  scaleX: [0.35, 1, 0.55],
                  x: line.x + 260,
                  y: line.y,
                }}
                transition={{
                  duration: 0.42,
                  repeat: Infinity,
                  delay: line.delay,
                  ease: 'linear',
                }}
              />
            ))}

          <motion.div
            className="relative flex flex-col items-center gap-8"
            initial={{ opacity: 0, scale: 0.76, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -18 }}
            transition={{
              opacity: { duration: 0.24, ease: SOFT_EASE },
              scale: { type: 'spring', stiffness: 190, damping: 24, mass: 0.9 },
              y: { type: 'spring', stiffness: 190, damping: 24, mass: 0.9 },
            }}
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute -inset-10 rounded-[4rem] bg-blue-500/25 blur-3xl"
              animate={
                rolling && !shouldReduceMotion
                  ? {
                    scale: [1, 1.14, 0.98, 1.1, 1],
                    opacity: [0.35, 0.68, 0.42, 0.72, 0.4],
                  }
                  : {
                    scale: 1,
                    opacity: 0.35,
                  }
              }
              transition={{
                duration: 0.58,
                repeat: rolling && !shouldReduceMotion ? Infinity : 0,
                ease: FLOAT_EASE,
              }}
              style={{ willChange: 'transform, opacity' }}
            />

            {/* Dice Container */}
            <motion.div
              className="relative flex gap-6 rounded-[3rem] border border-white/35 bg-white/20 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              animate={
                rolling && !shouldReduceMotion
                  ? {
                    // Khung máy jackpot rung nhẹ vì tốc độ trượt cao.
                    x: [0, -4, 4, -3, 3, 0],
                    y: [0, 2, -3, 2, -1, 0],
                    rotate: [0, -0.8, 0.9, -0.5, 0.4, 0],
                  }
                  : {
                    x: 0,
                    y: 0,
                    rotate: 0,
                  }
              }
              transition={
                rolling && !shouldReduceMotion
                  ? {
                    duration: 0.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }
                  : {
                    type: 'spring',
                    stiffness: 220,
                    damping: 24,
                  }
              }
              style={{ willChange: 'transform' }}
            >
              {displayFaces.map((face, index) => (
                <JackpotDice
                  key={index}
                  face={face}
                  index={index}
                  rolling={rolling}
                  shouldReduceMotion={Boolean(shouldReduceMotion)}
                />
              ))}
            </motion.div>

            <AnimatePresence mode="wait">
              {!rolling && (
                <motion.div
                  key={total}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.35, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.82, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 22,
                    mass: 0.8,
                  }}
                  style={{ willChange: 'transform, opacity' }}
                >
                  <motion.div
                    className="absolute -inset-3 rounded-3xl bg-white/45 blur-xl"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: [0, 0.72, 0.35], scale: [0.75, 1.12, 1] }}
                    transition={{ duration: 0.7, ease: SOFT_EASE }}
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