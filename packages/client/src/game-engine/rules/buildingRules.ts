import { type GameState, type Property, TileType, PropertyKind } from '../types/game';
import { BUILDING_LIMITS } from '@property-tycoon/shared';

export const getBuildingCost = (state: GameState, property: Property): number => {
  let cost = property.buildingCost;
  state.temporaryModifiers.forEach(mod => {
    if (mod.effect === 'TEMP_BUILD_COST_MODIFIER' && mod.playerId === state.currentPlayerId) {
      cost *= mod.value;
    }
  });
  return Math.round(cost);
};

export const canBuild = (state: GameState, propertyId: string): boolean => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  const property = state.board.find(t => t.id === propertyId) as Property | undefined;

  if (!currentPlayer || !property || property.type !== TileType.PROPERTY) return false;
  if (property.ownerId !== currentPlayer.id) return false;
  if (property.id === state.lastPurchaseId) return false; // Cannot build on turn bought
  if (property.isMortgaged) return false;
  if (property.buildingLevel >= BUILDING_LIMITS.house + BUILDING_LIMITS.hotel) return false; // Max houses + hotel
  
  const currentCost = getBuildingCost(state, property);
  if (currentPlayer.cash < currentCost) return false;

  // Check if owner has all properties in the group
  const propertiesInGroup = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
  ) as Property[];

  const ownsAll = propertiesInGroup.every(p => p.ownerId === currentPlayer.id);
  const anyMortgaged = propertiesInGroup.some(p => p.isMortgaged);
  
  // Rule: Must own all properties in the group AND none can be mortgaged
  if (!ownsAll || anyMortgaged) return false;

  // Rule: Only normal properties (LAND) can have buildings
  if (property.kind !== PropertyKind.LAND) return false;

  // Optional even-build rule: Cannot build if this building level is > any other property in group (that you own)
  const ownedPropertiesInGroup = propertiesInGroup.filter(p => p.ownerId === currentPlayer.id);
  const minLevelInGroup = Math.min(...ownedPropertiesInGroup.map(p => p.buildingLevel));
  if (property.buildingLevel > minLevelInGroup) return false;

  return true;
};

export const buildProperty = (state: GameState, propertyId: string): GameState => {
  if (!canBuild(state, propertyId)) return state;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const property = state.board.find(t => t.id === propertyId) as Property;
  const currentCost = getBuildingCost(state, property);

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash - currentCost };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, buildingLevel: property.buildingLevel + 1 };
    }
    return t;
  });

  // Consume build cost modifier
  const remainingModifiers = state.temporaryModifiers.filter(
    mod => !(mod.effect === 'TEMP_BUILD_COST_MODIFIER' && mod.playerId === currentPlayer.id)
  );

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    temporaryModifiers: remainingModifiers,
  };
};
