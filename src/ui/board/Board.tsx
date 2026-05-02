import React, { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { TileType, type Property, PropertyGroup, type BoardTile, type Player } from '../../game-engine/types/game';
import { motion, AnimatePresence } from 'framer-motion';

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

const TileContent: React.FC<{ tile: BoardTile; isProperty: boolean; property: Property | null }> = ({ tile, isProperty, property }) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = !!tile.imageUrl && !imageError;

  const isCornerOrSpecial = [
    TileType.START, 
    TileType.CHANCE, 
    TileType.FORTUNE, 
    TileType.JAIL, 
    TileType.REST, 
    TileType.GO_TO_JAIL
  ].includes(tile.type);

  if (hasImage && isCornerOrSpecial) {
    return (
      <img 
        src={tile.imageUrl} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover" 
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-1 py-2">
      {hasImage && (
        <img 
          src={tile.imageUrl} 
          alt="" 
          className="w-8 h-8 object-contain mb-1 opacity-80" 
          onError={() => setImageError(true)}
        />
      )}
      {(!hasImage || tile.type !== TileType.START) && (
        <>
          <span className="font-bold leading-tight break-words px-1 text-center" style={{ fontSize: '12px' }}>
            {tile.name}
          </span>
          {isProperty && <span className="font-bold text-gray-700" style={{ fontSize: '11px' }}>${property?.price}</span>}
        </>
      )}
    </div>
  );
};

const PlayerToken: React.FC<{ player: Player }> = ({ player }) => {
  const [imageError, setImageError] = useState(false);
  const hasAvatar = !!player.avatarUrl && !imageError;

  return (
    <motion.div
      layoutId={`player-${player.id}`}
      initial={false}
      transition={{ 
        type: "spring", 
        stiffness: 400,
        damping: 15,
        mass: 0.8
      }}
      className="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[16px] font-black text-white bg-slate-800 m-0.5 overflow-hidden"
      style={{ backgroundColor: player.color }}
      title={player.name}
    >
      {hasAvatar ? (
        <img 
          src={player.avatarUrl} 
          alt={player.name} 
          className="w-full h-full object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        player.name.charAt(0)
      )}
    </motion.div>
  );
};

export const Board: React.FC = () => {
  const { state } = useGameStore();

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50 p-4">
      <div 
        className="grid w-full max-w-[1200px] aspect-square bg-slate-200 border-4 border-slate-300 shadow-2xl p-2 rounded-[2.5rem]"
        style={{ 
          gridTemplateColumns: '1.5fr repeat(9, 1fr) 1.5fr',
          gridTemplateRows: '1.5fr repeat(9, 1fr) 1.5fr',
          gap: '2px'
        }}
      >
        {/* Center content */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-white rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-50" />
          <h1 className="text-6xl font-black text-slate-800 tracking-tighter transform -rotate-12 uppercase drop-shadow-sm z-10">
            Property <span className="text-blue-600">Tycoon</span>
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
              className={`relative flex flex-col items-center border border-slate-200 bg-white shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md ${
                tile.position % 10 === 0 ? 'justify-center text-center' : 'justify-between text-xs text-center'
              }`}
            >
              {/* Property Group Color Header */}
              {isProperty && property?.groupId && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY && (
                <div className={`w-full h-6 ${getGroupColor(property.groupId)} border-b border-slate-200 shrink-0 z-10`} />
              )}
              
              <TileContent tile={tile} isProperty={isProperty} property={property} />

              {/* Owner Indicator */}
              {owner && (
                <div className="w-full h-1 mt-auto flex z-10" style={{ backgroundColor: owner.color }} title={`Sở hữu bởi ${owner.name}`}>
                  {property?.isMortgaged && (
                    <div className="flex-1 bg-gray-900 bg-opacity-80 flex items-center justify-center grayscale blur-[1px]">
                      <span className="text-[6px] text-white font-bold">M</span>
                    </div>
                  )}
                </div>
              )}

              {/* Building Level */}
              {property?.buildingLevel && property.buildingLevel > 0 ? (
                <div className="absolute top-0 right-0 p-0.5 flex gap-px z-10">
                  {Array.from({ length: property.buildingLevel }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-green-600 rounded-sm" />
                  ))}
                </div>
              ) : null}

              {/* Players */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <AnimatePresence>
                  {playersOnTile.map((p) => (
                    <PlayerToken key={p.id} player={p} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
