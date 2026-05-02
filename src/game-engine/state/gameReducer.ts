import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game';
import { createInitialGame } from './setupGame';
import { rollDice } from '../rules/diceRules';
import { applyMovement } from '../rules/movementRules';
import { buyProperty } from '../rules/propertyRules';
import { payRent } from '../rules/rentRules';
import { buildProperty } from '../rules/buildingRules';
import { payJailFine } from '../rules/jailRules';

export function assertGameInvariants(state: GameState): void {
  for (const player of state.players) {
    if (player.cash < 0 && !player.isBankrupt && state.phase !== Phase.GAME_OVER && state.phase !== Phase.DEBT_RESOLUTION) {
      console.warn(`Invariant violated: Player ${player.name} has negative cash (${player.cash}) but is not bankrupt and game is not in Debt Resolution or Game Over.`);
    }
  }
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  let nextState = state;
  switch (action.type) {
    case 'START_GAME':
      nextState = createInitialGame(action.payload.players);
      break;

    case 'ROLL_DICE': {
      if (state.phase !== Phase.WAITING_TO_ROLL) return state;
      const dice = action.payload?.dice || rollDice();
      const steps = dice[0] + dice[1];
      
      const movedState = applyMovement({
        ...state,
        lastDiceRoll: dice,
        phase: Phase.ROLLING,
      }, steps);

      const currentPlayer = movedState.players.find(p => p.id === movedState.currentPlayerId)!;
      const tile = movedState.board[currentPlayer.position];

      let nextPhase = Phase.RESOLVING_TILE;
      if (tile.type === TileType.PROPERTY) {
        const property = tile as Property;
        if (!property.ownerId) {
          nextPhase = Phase.BUY_DECISION;
        } else if (property.ownerId !== currentPlayer.id) {
          nextState = gameReducer(movedState, { type: 'PAY_RENT' });
          break;
        } else {
          nextPhase = Phase.END_TURN;
        }
      } else {
        nextPhase = Phase.END_TURN;
      }

      nextState = { ...movedState, phase: nextPhase };
      break;
    }

    case 'BUY_PROPERTY': {
      if (state.phase !== Phase.BUY_DECISION) return state;
      const boughtState = buyProperty(state, action.payload.propertyId);
      nextState = { ...boughtState, phase: Phase.END_TURN };
      break;
    }

    case 'DECLINE_BUY_PROPERTY': {
      if (state.phase !== Phase.BUY_DECISION) return state;
      nextState = { ...state, phase: Phase.END_TURN };
      break;
    }

    case 'PAY_RENT': {
      const rentedState = payRent(state);
      const currentPlayer = rentedState.players.find(p => p.id === rentedState.currentPlayerId)!;
      
      if (currentPlayer.cash < 0) {
        nextState = {
          ...rentedState,
          phase: Phase.GAME_OVER,
          winnerId: rentedState.players.find(p => p.id !== currentPlayer.id)?.id,
          log: [`${currentPlayer.name} đã phá sản!`, ...rentedState.log],
        };
      } else {
        nextState = { ...rentedState, phase: Phase.END_TURN };
      }
      break;
    }

    case 'BUILD': {
      if (state.phase !== Phase.WAITING_TO_ROLL && state.phase !== Phase.END_TURN) return state;
      nextState = buildProperty(state, action.payload.propertyId);
      break;
    }

    case 'PAY_FINE': {
      if (state.phase !== Phase.WAITING_TO_ROLL) return state;
      nextState = payJailFine(state);
      break;
    }

    case 'END_TURN': {
      if (state.phase !== Phase.END_TURN) return state;
      
      const currentIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      
      nextState = {
        ...state,
        currentPlayerId: state.players[nextIndex].id,
        phase: Phase.WAITING_TO_ROLL,
        lastDiceRoll: undefined,
      };
      break;
    }

    default:
      nextState = state;
  }
  
  assertGameInvariants(nextState);
  return nextState;
};
