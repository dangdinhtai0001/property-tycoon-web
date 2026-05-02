import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { useAnimationQueue } from '../../app/store/useAnimationQueue';
import { TileType, type Property } from '../../game-engine/types/game';

export const MoneyWatcher: React.FC = () => {
  const { state } = useGameStore();
  const { enqueue } = useAnimationQueue();
  const prevCashRef = useRef<Record<string, number>>({});
  const prevAssetsRef = useRef<Record<string, { propertyCount: number; buildingCount: number }>>({});

  useEffect(() => {
    state.players.forEach(player => {
      // Only trigger animations for the current player
      if (player.id !== state.currentPlayerId) {
        // Update refs but don't enqueue
        const playerProperties = state.board.filter(t => 
          t.type === TileType.PROPERTY && (t as Property).ownerId === player.id
        ) as Property[];
        prevCashRef.current[player.id] = player.cash;
        prevAssetsRef.current[player.id] = { 
          propertyCount: playerProperties.length, 
          buildingCount: playerProperties.reduce((sum, p) => sum + (p.buildingLevel || 0), 0) 
        };
        return;
      }

      const prevCash = prevCashRef.current[player.id];
      
      // Calculate current assets
      const playerProperties = state.board.filter(t => 
        t.type === TileType.PROPERTY && (t as Property).ownerId === player.id
      ) as Property[];
      
      const propertyCount = playerProperties.length;
      const buildingCount = playerProperties.reduce((sum, p) => sum + (p.buildingLevel || 0), 0);
      
      const prevAssets = prevAssetsRef.current[player.id];
      
      if (prevCash !== undefined && player.cash < prevCash) {
        const isInvestment = prevAssets && (propertyCount > prevAssets.propertyCount || buildingCount > prevAssets.buildingCount);
        
        if (!isInvestment) {
          const lossAmount = prevCash - player.cash;
          enqueue({
            type: 'MONEY_LOSS',
            payload: { 
              playerId: player.id, 
              amount: lossAmount 
            }
          });
        }
      } else if (prevCash !== undefined && player.cash > prevCash) {
        const isDivestment = prevAssets && (propertyCount < prevAssets.propertyCount || buildingCount < prevAssets.buildingCount);
        
        if (!isDivestment) {
          const gainAmount = player.cash - prevCash;
          enqueue({
            type: 'MONEY_GAIN',
            payload: { 
              playerId: player.id, 
              amount: gainAmount 
            }
          });
        }
      }
      
      // Update refs
      prevCashRef.current[player.id] = player.cash;
      prevAssetsRef.current[player.id] = { propertyCount, buildingCount };
    });
  }, [state.players, state.board, state.currentPlayerId, enqueue]);

  return null;
};
