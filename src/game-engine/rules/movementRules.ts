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
  
  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return {
        ...p,
        position,
        cash: passedStart ? p.cash + 200 : p.cash,
      };
    }
    return p;
  });

  const logEntry = `${currentPlayer.name} di chuyển ${steps} ô đến ${state.board[position].name}${passedStart ? ' và nhận 200$ khi đi qua Bắt đầu' : ''}.`;

  return {
    ...state,
    players: updatedPlayers,
    log: [logEntry, ...state.log],
  };
};
