import { type GameState, type Property, TileType } from '@property-tycoon/shared';
import { GAME_LOG } from '@property-tycoon/shared';

export const buyProperty = (state: GameState, propertyId: string): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  const property = state.board.find(t => t.id === propertyId) as Property;

  if (!currentPlayer || !property || property.type !== TileType.PROPERTY || property.ownerId || currentPlayer.cash < property.price) {
    return state;
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash - property.price };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, ownerId: currentPlayer.id };
    }
    return t;
  });

  const logEntry = GAME_LOG.buyProperty(currentPlayer.name, property.name, property.price);

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    log: [logEntry, ...state.log],
  };
};
