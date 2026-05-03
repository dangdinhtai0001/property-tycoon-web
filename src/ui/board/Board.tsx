import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../../phaser/GameConfig';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';
import { BoardStatus } from './BoardStatus';

export const Board: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

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
    <div className="w-full h-full flex items-center justify-center p-4 md:p-10 overflow-hidden bg-transparent">
      <style>{`
        #phaser-game-container canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2rem;
        }
      `}</style>
      <div className="relative w-full h-full max-w-[1200px] max-h-[1200px] aspect-square bg-white shadow-[0_50px_100px_rgba(0,0,0,0.15)] rounded-[3rem] overflow-hidden border-8 border-white">
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
  );
};
