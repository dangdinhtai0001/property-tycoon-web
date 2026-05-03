import React, { useEffect, useRef, useState, useMemo } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../../phaser/GameConfig';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';
import { BoardStatus } from './BoardStatus';

export const Board: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    if (outerRef.current) {
      observer.observe(outerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Calculate board size based on available space and aspect ratio (1940:1380)
  const boardDims = useMemo(() => {
    if (dimensions.width === 0) return { w: 981, h: 700 };

    const padding = dimensions.height < 700 ? 0 : (dimensions.height < 800 ? 8 : 32);
    const availW = dimensions.width - padding;
    const availH = dimensions.height - padding;
    const ratio = 1940 / 1380;

    let w, h;
    if (availW / availH > ratio) {
      h = Math.min(availH, 950); 
      w = h * ratio;
    } else {
      w = Math.min(availW, 1400); 
      h = w / ratio;
    }

    return { w: Math.max(w, 562), h: Math.max(h, 400) };
  }, [dimensions]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = getGameConfig('phaser-game-container');
    const game = new Phaser.Game(config);
    gameRef.current = game;

    PhaserBridge.initialize(game);

    return () => {
      PhaserBridge.destroy();
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={outerRef}
      className="w-full h-full flex items-center justify-center p-0 md:p-1 lg:p-2 overflow-hidden bg-transparent"
    >
      <style>{`
        #phaser-game-container canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
          border-radius: calc(var(--board-radius) - var(--board-padding));
        }
      `}</style>

      {/* Background Frame (Rectangle/Card) */}
      <div 
        className="relative flex items-center justify-center shadow-2xl transition-all duration-500 ease-out"
        style={{
          width: 'min(100%, 1860px)',
          height: 'min(100%, 1200px)',
          backgroundColor: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(12px)',
          borderRadius: '3rem',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 32px 128px -16px rgba(15, 23, 42, 0.15)',
        }}
      >
        {/* Square Board Container */}
        <div 
          className="relative overflow-hidden"
          style={{
            width: `${boardDims.w}px`,
            height: `${boardDims.h}px`,
            backgroundColor: 'var(--board-bg)',
            borderRadius: 'var(--board-radius)',
            boxShadow: 'var(--board-shadow)',
            border: '1px solid var(--board-border)',
            padding: 'var(--board-padding)',
          }}
        >
          {/* Inner Surface with highlight */}
          <div 
            className="relative w-full h-full overflow-hidden"
            style={{
              borderRadius: 'calc(var(--board-radius) - var(--board-padding))',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.75)',
            }}
          >
            {/* React Status Overlay BEHIND Phaser - allowing Phaser dice to be on top */}
            <div className="absolute inset-0 z-[5]">
              <BoardStatus />
            </div>

            {/* Phaser Game Container ON TOP of Status Overlay */}
            <div
              id="phaser-game-container"
              ref={containerRef}
              className="w-full h-full absolute inset-0 z-[10]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
