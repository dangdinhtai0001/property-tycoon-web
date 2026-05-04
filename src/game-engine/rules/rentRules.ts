import { type GameState, type Property, TileType, PropertyGroup, Phase, PropertyKind } from '../types/game';
import { STATION_RENT_BY_COUNT, UTILITY_MULTIPLIER_BY_COUNT, GROUP_RENT_MULTIPLIER } from '../../config/gameplay';

export const calculateRent = (state: GameState, property: Property, diceTotal: number = 0): number => {
  const ownerId = property.ownerId;
  if (!ownerId) return 0;

  const owner = state.players.find(p => p.id === ownerId);
  if (!owner || owner.isBankrupt) return 0;

  if (property.isMortgaged) return 0;

  const ownerProperties = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).ownerId === ownerId
  ) as Property[];

  const rentMultiplier = state.config?.rentMultiplier || 1;

  // STATION logic
  if (property.kind === PropertyKind.STATION) {
    const stationCount = ownerProperties.filter(p => p.kind === PropertyKind.STATION).length;
    const baseStationRent = STATION_RENT_BY_COUNT[Math.min(stationCount, STATION_RENT_BY_COUNT.length - 1)] || 0;
    return baseStationRent * rentMultiplier;
  }

  // UTILITY logic
  if (property.kind === PropertyKind.UTILITY) {
    const utilityCount = ownerProperties.filter(p => p.kind === PropertyKind.UTILITY).length;
    const multiplier = UTILITY_MULTIPLIER_BY_COUNT[Math.min(utilityCount, UTILITY_MULTIPLIER_BY_COUNT.length - 1)] || 0;
    return diceTotal * multiplier * rentMultiplier;
  }

  // LAND logic
  let baseRent = property.rent;

  if (property.buildingLevel > 0 && property.rentLevels) {
    baseRent = property.rentLevels[property.buildingLevel];
  } else {
    // No buildings, check full color group
    const propertiesInGroup = state.board.filter(
      t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
    ) as Property[];
    
    const ownsAllInGroup = propertiesInGroup.every(p => p.ownerId === ownerId);
    const anyMortgagedInGroup = propertiesInGroup.some(p => p.isMortgaged);

    if (ownsAllInGroup && !anyMortgagedInGroup) {
      baseRent = property.rent * GROUP_RENT_MULTIPLIER;
    }
  }

  return baseRent * rentMultiplier;
};

export const payRent = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) return state;

  const tile = state.board[currentPlayer.position];
  if (tile.type !== TileType.PROPERTY) return state;

  const property = tile as Property;
  if (!property.ownerId || property.ownerId === currentPlayer.id) return state;

  const owner = state.players.find(p => p.id === property.ownerId);
  if (!owner) return state;

  const diceTotal = state.lastDiceRoll ? state.lastDiceRoll[0] + state.lastDiceRoll[1] : 0;
  const rentAmount = calculateRent(state, property, diceTotal);

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      // Don't go below 0, instead create debt
      const finalCash = Math.max(0, p.cash - rentAmount);
      return { ...p, cash: finalCash };
    }
    if (p.id === owner.id) {
      // Owner only receives what the player can afford immediately? 
      // Rule: Owner receives full amount, even if player goes into debt.
      return { ...p, cash: p.cash + rentAmount };
    }
    return p;
  });

  const logEntry = `${currentPlayer.name} đã trả ${rentAmount}$ tiền thuê cho ${owner.name} tại ${property.name}.`;

  let nextPhase = Phase.END_TURN;
  let debtState = undefined;

  if (currentPlayer.cash < rentAmount) {
    nextPhase = Phase.DEBT_RESOLUTION;
    debtState = {
      oweTo: owner.id,
      amount: rentAmount - currentPlayer.cash
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: nextPhase,
    debtState,
    log: [logEntry, ...state.log],
  };
};
