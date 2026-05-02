import { type GameState, type Property, TileType } from '../types/game';

export const payRent = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) return state;

  const tile = state.board[currentPlayer.position];
  if (tile.type !== TileType.PROPERTY) return state;

  const property = tile as Property;
  if (!property.ownerId || property.ownerId === currentPlayer.id) return state;

  const owner = state.players.find(p => p.id === property.ownerId);
  if (!owner) return state;

  const rentAmount = property.rent;

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
