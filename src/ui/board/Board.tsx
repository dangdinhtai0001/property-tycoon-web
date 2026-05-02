import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property } from '../../game-engine/types/game';

export const Board: React.FC = () => {
  const { state } = useGameStore();

  // For P0, we just render a simple grid or list of tiles
  // We'll try to arrange them in a square loop eventually, but for now, a scrollable list/grid is fine
  return (
    <div className="grid grid-cols-10 gap-1 p-4 bg-gray-200 rounded-lg shadow-inner overflow-auto max-h-[600px]">
      {state.board.map((tile) => {
        const playersOnTile = state.players.filter((p) => p.position === tile.position);
        const isProperty = tile.type === TileType.PROPERTY;
        const property = isProperty ? (tile as Property) : null;
        const owner = property?.ownerId ? state.players.find(p => p.id === property.ownerId) : null;

        return (
          <div
            key={tile.id}
            className={`relative flex flex-col items-center justify-center p-2 h-24 border ${
              isProperty ? 'bg-white' : 'bg-gray-100'
            } transition-all`}
          >
            {owner && (
              <div 
                className="absolute top-0 left-0 right-0 h-1" 
                style={{ backgroundColor: owner.color }}
              />
            )}
            <span className="text-[10px] font-bold text-center uppercase truncate w-full">
              {tile.name}
            </span>
            {isProperty && (
              <span className="text-[8px] text-gray-500">${property?.price}</span>
            )}
            
            <div className="flex mt-1 gap-1">
              {playersOnTile.map((p) => (
                <div
                  key={p.id}
                  className="w-3 h-3 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
