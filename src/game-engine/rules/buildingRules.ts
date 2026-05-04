import { type GameState, type Property, TileType } from '../types/game';
import { BUILDING_LIMITS } from '../../config/gameplay';

export const canBuild = (state: GameState, propertyId: string): boolean => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  const property = state.board.find(t => t.id === propertyId) as Property | undefined;

  if (!currentPlayer || !property || property.type !== TileType.PROPERTY) return false;
  if (property.ownerId !== currentPlayer.id) return false;
  if (property.id === state.lastPurchaseId) return false; // Cannot build on turn bought
  if (property.isMortgaged) return false;
  if (property.buildingLevel >= BUILDING_LIMITS.house + BUILDING_LIMITS.hotel) return false; // Max houses + hotel
  if (currentPlayer.cash < property.buildingCost) return false;

  // Check if owner has all properties in the group
  const propertiesInGroup = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
  ) as Property[];

  const ownsAll = propertiesInGroup.every(p => p.ownerId === currentPlayer.id);
  const anyMortgaged = propertiesInGroup.some(p => p.isMortgaged);
  // Rule: Must own all properties in the group AND none can be mortgaged
  if (!ownsAll || anyMortgaged) return false;

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

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash - property.buildingCost };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, buildingLevel: property.buildingLevel + 1 };
    }
    return t;
  });

  const buildingName = property.buildingLevel === BUILDING_LIMITS.house ? 'Khách sạn' : `Nhà cấp ${property.buildingLevel + 1}`;
  const logEntry = `${currentPlayer.name} đã xây ${buildingName} tại ${property.name} với chi phí ${property.buildingCost}$.`;

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    log: [logEntry, ...state.log],
  };
};
