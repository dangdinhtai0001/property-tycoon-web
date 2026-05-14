import React, { useState, useEffect } from 'react';
import { getCharacter } from '@property-tycoon/engine';
import { CHARACTER_SPRITES } from '../../config/assets';

export type AnimState = 'idle' | 'run' | 'win' | 'sad';

const ANIM_ROW: Record<AnimState, number> = {
  idle: 0,
  run: 1,
  win: 2,
  sad: 3,
};

const ANIM_FPS: Record<AnimState, number> = {
  idle: 6,
  run: 8,
  win: 6,
  sad: 6,
};

interface Props {
  charId: string;
  /** Omit for static preview (frame 0, no animation) */
  animState?: AnimState;
  className?: string;
}

export const CharacterSprite: React.FC<Props> = ({ charId, animState, className = '' }) => {
  const [frame, setFrame] = useState(0);
  const char = getCharacter(charId);
  const sprite = CHARACTER_SPRITES[char.id];

  useEffect(() => {
    if (!animState) return;
    const fps = ANIM_FPS[animState];
    const timer = setInterval(() => setFrame(f => (f + 1) % 4), 1000 / fps);
    return () => clearInterval(timer);
  }, [animState]);

  const row = animState ? ANIM_ROW[animState] : 0;
  const xOffset = animState ? frame * 33.333 : 0;
  const yOffset = row * 33.333;

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url(${sprite.path})`,
        backgroundSize: '400% 400%',
        backgroundPosition: `${xOffset}% ${yOffset}%`,
        imageRendering: 'pixelated',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};
