import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TileType } from '../../game-engine/types/game';
import type { BoardTile, Player } from '../../game-engine/types/game';
import { BOARD_TILE_EFFECTS } from '../../config/assets';

export const BoardStatusLeftPanel: React.FC<{ currentTile?: BoardTile; players: Player[] }> = ({
  currentTile,
}) => {
  if (!currentTile) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTile.id}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        className="board-status-left-panel flex w-full max-w-[250px] shrink-0 items-center justify-center sm:max-w-[270px] lg:max-w-[290px]"
      >
        <div className="board-status-left-content flex min-h-[280px] w-full items-center justify-center px-2 py-3 md:min-h-[320px] md:px-3">
          <TileEffectSprite currentTile={currentTile} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const TileEffectSprite: React.FC<{ currentTile: BoardTile }> = ({ currentTile }) => {
  const startGate = BOARD_TILE_EFFECTS.startGateActivate;

  if (currentTile.type === TileType.START) {
    return (
      <div className="relative w-full">
        <div className="absolute inset-x-6 bottom-2 h-6 rounded-full bg-amber-300/35 blur-md" />
        <div className="relative mx-auto h-[168px] w-[168px] md:h-[196px] md:w-[196px]">
          <div
            className="board-status-start-sprite absolute left-1/2 top-1/2"
            style={
              {
                '--sprite-frame-width': `${startGate.frameWidth}px`,
                '--sprite-frame-height': `${startGate.frameHeight}px`,
                '--sprite-columns': `${startGate.columns}`,
                '--sprite-rows': `${startGate.rows}`,
                '--sprite-frame-count': `${startGate.frameCount}`,
                '--sprite-sheet-url': `url(${startGate.path})`,
              } as React.CSSProperties
            }
          />
        </div>
      </div>
    );
  }

  if (currentTile.imageUrl) {
    return (
      <div className="relative w-full">
        <div className="absolute inset-x-8 bottom-2 h-6 rounded-full bg-slate-900/10 blur-md" />
        <div className="relative flex h-[168px] items-center justify-center md:h-[196px]">
          <img
            src={currentTile.imageUrl}
            alt={currentTile.name}
            className="h-[98%] w-[98%] object-contain drop-shadow-[0_18px_34px_rgba(15,23,42,0.26)]"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="mx-auto flex h-[168px] w-[168px] items-center justify-center md:h-[196px] md:w-[196px]">
        <span className="text-7xl drop-shadow-[0_10px_24px_rgba(15,23,42,0.24)] md:text-8xl">{getTileEmoji(currentTile)}</span>
      </div>
    </div>
  );
};

const getTileEmoji = (tile: BoardTile) => {
  switch (tile.type) {
    case TileType.PROPERTY:
      return '🏙️';
    case TileType.CHANCE:
      return '🎴';
    case TileType.FORTUNE:
      return '✨';
    case TileType.TAX:
      return '💸';
    case TileType.JAIL:
      return '🚔';
    case TileType.GO_TO_JAIL:
      return '⛓️';
    case TileType.REST:
      return '🌿';
    case TileType.START:
    default:
      return '🚩';
  }
};
