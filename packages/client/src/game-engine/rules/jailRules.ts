import { type GameState, Phase } from '../types/game';
import { rollDice, isDouble } from './diceRules';
import { JAIL_FINE } from '@property-tycoon/shared';
import { GAME_LOG } from '@property-tycoon/shared';

export const payJailFine = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer || currentPlayer.jailTurns === 0) return state;

  if (currentPlayer.cash < JAIL_FINE) return state; // handled by debt resolution in phase 2, basic logic fails if not enough cash

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return {
        ...p,
        cash: p.cash - JAIL_FINE,
        jailTurns: 0,
      };
    }
    return p;
  });

  return {
    ...state,
    players: updatedPlayers,
    log: [GAME_LOG.playerPaidJailFine(currentPlayer.name, JAIL_FINE), ...state.log],
    phase: Phase.WAITING_TO_ROLL, // After paying fine, can roll normally
  };
};

export const rollToEscapeJail = (state: GameState, dicePayload?: [number, number]): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer || currentPlayer.jailTurns === 0) return state;

  const dice = dicePayload || rollDice();
  const escaped = isDouble(dice);
  
  let updatedPlayers = state.players;
  let nextPhase = Phase.END_TURN; // usually wait to roll or end turn
  let logMsg = '';

  if (escaped) {
    logMsg = `${currentPlayer.name} đã đổ được xúc xắc đôi và ra tù!`;
    updatedPlayers = state.players.map(p => p.id === currentPlayer.id ? { ...p, jailTurns: 0 } : p);
    nextPhase = Phase.ROLLING; // Proceeds to apply movement in next action
  } else {
    const newJailTurns = currentPlayer.jailTurns + 1;
    if (newJailTurns > 3) {
      // Must pay fine
      logMsg = `${currentPlayer.name} đã ở tù quá 3 lượt, phải nộp phạt ${JAIL_FINE}$ để ra.`;
      // We will handle forced payment by allowing them to pay or resolving bankruptcy later
      updatedPlayers = state.players.map(p => p.id === currentPlayer.id ? { ...p, jailTurns: 3 } : p); // Lock at 3
      nextPhase = Phase.WAITING_TO_ROLL; // Needs to trigger pay fine or sell
    } else {
      logMsg = `${currentPlayer.name} đổ xúc xắc không được đôi, tiếp tục ở tù (lượt ${newJailTurns}).`;
      updatedPlayers = state.players.map(p => p.id === currentPlayer.id ? { ...p, jailTurns: newJailTurns } : p);
    }
  }

  return {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: dice,
    log: [logMsg, ...state.log],
    phase: nextPhase,
  };
};
