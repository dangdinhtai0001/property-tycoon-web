import { type GameState, type Property, TileType, PropertyGroup, Phase } from '../types/game';

export const calculateRent = (state: GameState, property: Property, diceTotal: number = 0): number => {
  const ownerId = property.ownerId;
  if (!ownerId) return 0;

  const ownerProperties = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).ownerId === ownerId
  ) as Property[];

  if (property.isMortgaged) return 0;

  if (property.groupId === PropertyGroup.STATION) {
    const stationCount = ownerProperties.filter(p => p.groupId === PropertyGroup.STATION).length;
    return 25 * Math.pow(2, stationCount - 1) * (state.config?.quickModeMultiplier || 1);
  }

  if (property.groupId === PropertyGroup.UTILITY) {
    const utilityCount = ownerProperties.filter(p => p.groupId === PropertyGroup.UTILITY).length;
    const multiplier = utilityCount === 2 ? 10 : 4;
    return diceTotal * multiplier * (state.config?.quickModeMultiplier || 1);
  }

  let baseRent = property.rent;

  // LAND properties
  if (property.buildingLevel > 0 && property.rentLevels) {
    baseRent = property.rentLevels[property.buildingLevel];
  } else {
    // No buildings
    const propertiesInGroup = state.board.filter(
      t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
    ) as Property[];
    const ownsAllInGroup = propertiesInGroup.every(p => p.ownerId === ownerId);
    const anyMortgagedInGroup = propertiesInGroup.some(p => p.isMortgaged);

    if (ownsAllInGroup && !anyMortgagedInGroup) {
      baseRent = property.rent * 2;
    } else {
      baseRent = property.rent;
    }
  }

  return baseRent * (state.config?.quickModeMultiplier || 1);
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
