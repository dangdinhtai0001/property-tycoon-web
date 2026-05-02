import { describe, it, expect } from 'vitest';
import { payRent } from '../rules/rentRules';
import { type GameState, Phase, TileType, type Property, PropertyGroup } from '../types/game';

describe('Rent Rules', () => {
  const mockProperty: Property = {
    id: 'prop-1',
    type: TileType.PROPERTY,
    name: 'Test Property',
    position: 1,
    price: 100,
    rent: 20,
    ownerId: 'player-2',
    groupId: PropertyGroup.BROWN,
  };

  const initialState: GameState = {
    players: [
      { id: 'player-1', name: 'P1', cash: 1000, position: 1, isBankrupt: false, color: 'red' },
      { id: 'player-2', name: 'P2', cash: 1000, position: 0, isBankrupt: false, color: 'blue' },
    ],
    currentPlayerId: 'player-1',
    phase: Phase.RESOLVING_TILE,
    board: [
      { id: 'tile-0', type: TileType.START, name: 'Start', position: 0 },
      mockProperty,
      { 
        id: 'prop-2', 
        type: TileType.PROPERTY, 
        name: 'Group Mate', 
        position: 2, 
        price: 100, 
        rent: 20, 
        groupId: PropertyGroup.BROWN,
        ownerId: undefined 
      },
    ],
    log: [],
    config: { startingCash: 1500, passStartBonus: 200, enableAuction: false, quickModeMultiplier: 1 },
  };

  it('should transfer rent from current player to owner', () => {
    const newState = payRent(initialState);
    const p1 = newState.players.find(p => p.id === 'player-1')!;
    const p2 = newState.players.find(p => p.id === 'player-2')!;

    expect(p1.cash).toBe(980);
    expect(p2.cash).toBe(1020);
    expect(newState.log[0]).toContain('P1 đã trả 20$ tiền thuê cho P2');
  });

  it('should not pay rent if property has no owner', () => {
    const unownedState = {
      ...initialState,
      board: [
        { id: 'tile-0', type: TileType.START, name: 'Start', position: 0 },
        { ...mockProperty, ownerId: undefined },
      ],
    };
    const newState = payRent(unownedState);
    expect(newState.players[0].cash).toBe(1000);
    expect(newState.players[1].cash).toBe(1000);
  });
});
