import { type GameState, type Player } from '../types/game';

export const calculateNewPosition = (currentPosition: number, steps: number, boardSize: number): { position: number; passedStart: boolean } => {
  const newPosition = (currentPosition + steps) % boardSize;
  const passedStart = (currentPosition + steps) >= boardSize;
  return { position: newPosition, passedStart };
};

export const applyMovement = (state: GameState, steps: number): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) return state;

  const { position, passedStart } = calculateNewPosition(currentPlayer.position, steps, state.board.length);
  
  const passStartBonus = state.config.passStartBonus;

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return {
        ...p,
        position,
        cash: passedStart ? p.cash + passStartBonus : p.cash,
      };
    }
    return p;
  });

  const logEntry = `${currentPlayer.name} di chuyển ${steps} ô đến ${state.board[position].name}${passedStart ? ` và nhận ${passStartBonus}$ khi đi qua Bắt đầu` : ''}.`;

  return {
    ...state,
    players: updatedPlayers,
    log: [logEntry, ...state.log],
  };
};

export const moveToJail = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) return state;

  // Assume jail is at position 10, we can also look it up by TileType.JAIL
  const jailTile = state.board.find(t => t.type === 'JAIL');
  const jailPosition = jailTile ? jailTile.position : 10;

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return {
        ...p,
        position: jailPosition,
        jailTurns: 1, // Start jail counter
      };
    }
    return p;
  });

  const logEntry = `${currentPlayer.name} đã bị đưa vào tù!`;

  return {
    ...state,
    players: updatedPlayers,
    log: [logEntry, ...state.log],
  };
};
