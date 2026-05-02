import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game';
import { BASIC_BOARD } from '../data/boards/basicBoard';
import { rollDice } from '../rules/diceRules';
import { applyMovement } from '../rules/movementRules';
import { buyProperty } from '../rules/propertyRules';
import { payRent } from '../rules/rentRules';

export const createInitialGame = (playerConfigs: { name: string; color: string }[]): GameState => {
  const players = playerConfigs.map((config, index) => ({
    id: `player-${index}`,
    name: config.name,
    cash: 1500,
    position: 0,
    isBankrupt: false,
    color: config.color,
  }));

  return {
    players,
    currentPlayerId: players[0].id,
    phase: Phase.WAITING_TO_ROLL,
    board: BASIC_BOARD,
    log: ['Game đã bắt đầu!'],
  };
};

export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return createInitialGame(action.payload.players);

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
          return gameReducer(movedState, { type: 'PAY_RENT' });
        } else {
          nextPhase = Phase.END_TURN;
        }
      } else {
        nextPhase = Phase.END_TURN;
      }

      return { ...movedState, phase: nextPhase };
    }

    case 'BUY_PROPERTY': {
      if (state.phase !== Phase.BUY_DECISION) return state;
      const boughtState = buyProperty(state, action.payload.propertyId);
      return { ...boughtState, phase: Phase.END_TURN };
    }

    case 'DECLINE_BUY_PROPERTY': {
      if (state.phase !== Phase.BUY_DECISION) return state;
      return { ...state, phase: Phase.END_TURN };
    }

    case 'PAY_RENT': {
      const rentedState = payRent(state);
      const currentPlayer = rentedState.players.find(p => p.id === rentedState.currentPlayerId)!;
      
      if (currentPlayer.cash < 0) {
        return {
          ...rentedState,
          phase: Phase.GAME_OVER,
          winnerId: rentedState.players.find(p => p.id !== currentPlayer.id)?.id,
          log: [`${currentPlayer.name} đã phá sản!`, ...rentedState.log],
        };
      }
      
      return { ...rentedState, phase: Phase.END_TURN };
    }

    case 'END_TURN': {
      if (state.phase !== Phase.END_TURN) return state;
      
      const currentIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      
      return {
        ...state,
        currentPlayerId: state.players[nextIndex].id,
        phase: Phase.WAITING_TO_ROLL,
        lastDiceRoll: undefined,
      };
    }

    default:
      return state;
  }
};
