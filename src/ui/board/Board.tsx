import React from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property, PropertyGroup } from '../../game-engine/types/game';

const getTileGridStyles = (position: number) => {
  if (position <= 10) {
    return { gridRowStart: 11, gridColumnStart: 11 - position };
  } else if (position <= 20) {
    return { gridColumnStart: 1, gridRowStart: 11 - (position - 10) };
  } else if (position <= 30) {
    return { gridRowStart: 1, gridColumnStart: 1 + (position - 20) };
  } else {
    return { gridColumnStart: 11, gridRowStart: 1 + (position - 30) };
  }
};

const getGroupColor = (groupId?: PropertyGroup) => {
  switch (groupId) {
    case PropertyGroup.BROWN: return 'bg-yellow-900';
    case PropertyGroup.LIGHT_BLUE: return 'bg-blue-300';
    case PropertyGroup.PINK: return 'bg-pink-400';
    case PropertyGroup.ORANGE: return 'bg-orange-500';
    case PropertyGroup.RED: return 'bg-red-600';
    case PropertyGroup.YELLOW: return 'bg-yellow-400';
    case PropertyGroup.GREEN: return 'bg-green-600';
    case PropertyGroup.DARK_BLUE: return 'bg-blue-800';
    default: return 'bg-gray-400';
  }
};

export const Board: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex-1 flex items-center justify-center bg-green-50 p-4">
      <div className="grid grid-cols-11 grid-rows-11 gap-0.5 w-[800px] h-[800px] bg-gray-300 border-2 border-gray-800 shadow-xl">
        {/* Center content */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-green-100 flex flex-col items-center justify-center p-8 text-center shadow-inner">
          <h1 className="text-6xl font-black text-red-600 tracking-tighter transform -rotate-12 uppercase drop-shadow-md">
            Property Tycoon
          </h1>
        </div>

        {/* Tiles */}
        {state.board.map((tile) => {
          const playersOnTile = state.players.filter((p) => p.position === tile.position);
          const isProperty = tile.type === TileType.PROPERTY;
          const property = isProperty ? (tile as Property) : null;
          const owner = property?.ownerId ? state.players.find(p => p.id === property.ownerId) : null;

          const gridStyle = getTileGridStyles(tile.position);

          return (
            <div
              key={tile.id}
              style={gridStyle}
              className={`relative flex flex-col items-center border border-gray-400 bg-gray-50 overflow-hidden ${
                tile.position % 10 === 0 ? 'p-2 justify-center text-center' : 'p-1 justify-between text-xs text-center'
              }`}
            >
              {/* Property Group Color Header */}
              {isProperty && property?.groupId && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY && (
                <div className={`w-full h-4 ${getGroupColor(property.groupId)} border-b border-gray-400 shrink-0`} />
              )}
              
              <div className="flex-1 flex flex-col justify-center items-center py-0.5">
                <span className="font-bold leading-tight break-words px-0.5" style={{ fontSize: '10px' }}>{tile.name}</span>
                {isProperty && <span className="font-semibold text-gray-700" style={{ fontSize: '9px' }}>${property?.price}</span>}
              </div>

              {/* Owner Indicator */}
              {owner && (
                <div className="w-full h-1 mt-auto" style={{ backgroundColor: owner.color }} title={`Sở hữu bởi ${owner.name}`} />
              )}

              {/* Building Level */}
              {property?.buildingLevel && property.buildingLevel > 0 ? (
                <div className="absolute top-0 right-0 p-0.5 flex gap-px">
                  {Array.from({ length: property.buildingLevel }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-green-600 rounded-sm" />
                  ))}
                </div>
              ) : null}

              {/* Players */}
              {playersOnTile.length > 0 && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-wrap gap-1 justify-center z-10 w-full px-1">
                  {playersOnTile.map((p) => (
                    <div
                      key={p.id}
                      className="w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white bg-gray-800"
                      style={{ backgroundColor: p.color }}
                      title={p.name}
                    >
                      {p.name.charAt(0)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
