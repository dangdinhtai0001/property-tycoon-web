import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { getGameConfig } from '../../phaser/GameConfig';
import { PhaserBridge } from '../../phaser/bridge/PhaserBridge';

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
    <div className="flex-1 w-full h-full min-h-[600px] flex items-center justify-center bg-slate-50 p-2 overflow-hidden">
      <div 
        id="phaser-game-container" 
        ref={containerRef}
        className="w-full h-full max-w-[1000px] max-h-[1000px] aspect-square bg-slate-200 border-4 border-slate-300 shadow-2xl rounded-[2.5rem] overflow-hidden"
      />
    </div>
  );
};
