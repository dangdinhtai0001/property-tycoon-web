import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { type Property, TileType } from '../../game-engine/types/game';

export const BuildingWatcher: React.FC = () => {
  const { state } = useGameStore();
  const { enqueue } = useAnimationQueue();
  const prevLevelsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    state.board.forEach(tile => {
      if (tile.type === TileType.PROPERTY) {
        const property = tile as Property;
        const prevLevel = prevLevelsRef.current[property.id];
        
        if (prevLevel !== undefined && property.buildingLevel > prevLevel) {
          // Building level increased!
          enqueue({
            type: 'BUILDING_SPARKLE',
            payload: {
              name: property.name,
              level: property.buildingLevel
            }
          });
        }
        
        // Update ref
        prevLevelsRef.current[property.id] = property.buildingLevel;
      }
    });
  }, [state.board, enqueue]);

  return null;
};
