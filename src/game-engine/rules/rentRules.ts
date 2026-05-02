import { type GameState, type Property, TileType, PropertyGroup } from '../types/game';

export const calculateRent = (state: GameState, property: Property, diceTotal: number = 0): number => {
  const ownerId = property.ownerId;
  if (!ownerId) return 0;

  const ownerProperties = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).ownerId === ownerId
  ) as Property[];

  if (property.groupId === PropertyGroup.STATION) {
    const stationCount = ownerProperties.filter(p => p.groupId === PropertyGroup.STATION).length;
    return 25 * Math.pow(2, stationCount - 1);
  }

  if (property.groupId === PropertyGroup.UTILITY) {
    const utilityCount = ownerProperties.filter(p => p.groupId === PropertyGroup.UTILITY).length;
    const multiplier = utilityCount === 2 ? 10 : 4;
    return diceTotal * multiplier;
  }

  // LAND properties
  if (property.buildingLevel > 0 && property.rentLevels) {
    return property.rentLevels[property.buildingLevel];
  }

  // No buildings
  const propertiesInGroup = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
  );
  const ownsAllInGroup = propertiesInGroup.every(p => (p as Property).ownerId === ownerId);

  if (ownsAllInGroup) {
    return property.rent * 2;
  }

  return property.rent;
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
      return { ...p, cash: p.cash - rentAmount };
    }
    if (p.id === owner.id) {
      return { ...p, cash: p.cash + rentAmount };
    }
    return p;
  });

  const logEntry = `${currentPlayer.name} đã trả ${rentAmount}$ tiền thuê cho ${owner.name} tại ${property.name}.`;

  return {
    ...state,
    players: updatedPlayers,
    log: [logEntry, ...state.log],
  };
};
