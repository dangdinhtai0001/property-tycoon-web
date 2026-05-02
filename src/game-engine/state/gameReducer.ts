import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game';
import { createInitialGame } from './setupGame';
import { rollDice } from '../rules/diceRules';
import { applyMovement } from '../rules/movementRules';
import { buyProperty } from '../rules/propertyRules';
import { payRent } from '../rules/rentRules';
import { buildProperty } from '../rules/buildingRules';
import { payJailFine } from '../rules/jailRules';
import { mortgageProperty, unmortgageProperty, sellBuilding, resolveDebt, declareBankruptcy } from '../rules/financeRules';
import { handleBid, handlePassBid } from '../rules/auctionRules';
import { acceptTrade } from '../rules/tradeRules';

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
      nextState = createInitialGame(action.payload.players, action.payload.config);
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
      
      if (state.config.enableAuction) {
        const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
        const property = state.board[currentPlayer.position] as Property;
        const activePlayers = state.players.filter(p => !p.isBankrupt).map(p => p.id);
        
        nextState = {
          ...state,
          phase: Phase.AUCTION,
          auctionState: {
            propertyId: property.id,
            currentBid: 0,
            biddingPlayerIds: activePlayers,
            turnIndex: activePlayers.indexOf(state.currentPlayerId),
          },
          log: [`Bắt đầu đấu giá tài sản ${property.name}`, ...state.log],
        };
      } else {
        nextState = { ...state, phase: Phase.END_TURN };
      }
      break;
    }

    case 'BID': {
      if (state.phase !== Phase.AUCTION) return state;
      nextState = handleBid(state, action.payload.amount);
      break;
    }

    case 'PASS_BID': {
      if (state.phase !== Phase.AUCTION) return state;
      nextState = handlePassBid(state);
      break;
    }

    case 'PROPOSE_TRADE': {
      nextState = {
        ...state,
        phase: Phase.TRADE,
        tradeOffer: action.payload.offer,
        log: [`${state.players.find(p => p.id === action.payload.offer.offererId)?.name} đề nghị giao dịch với ${state.players.find(p => p.id === action.payload.offer.targetId)?.name}`, ...state.log],
      };
      break;
    }

    case 'ACCEPT_TRADE': {
      if (state.phase !== Phase.TRADE) return state;
      nextState = acceptTrade(state);
      break;
    }

    case 'REJECT_TRADE': {
      if (state.phase !== Phase.TRADE) return state;
      nextState = {
        ...state,
        phase: Phase.WAITING_TO_ROLL,
        tradeOffer: undefined,
        log: [`Giao dịch bị từ chối.`, ...state.log],
      };
      break;
    }

    case 'CANCEL_TRADE': {
      nextState = {
        ...state,
        phase: Phase.WAITING_TO_ROLL,
        tradeOffer: undefined,
      };
      break;
    }

    case 'PAY_RENT': {
      nextState = payRent(state);
      break;
    }

    case 'MORTGAGE_PROPERTY': {
      nextState = mortgageProperty(state, action.payload.propertyId);
      break;
    }

    case 'UNMORTGAGE_PROPERTY': {
      nextState = unmortgageProperty(state, action.payload.propertyId);
      break;
    }

    case 'SELL_BUILDING': {
      nextState = sellBuilding(state, action.payload.propertyId);
      break;
    }

    case 'RESOLVE_DEBT': {
      if (state.phase !== Phase.DEBT_RESOLUTION) return state;
      nextState = resolveDebt(state);
      break;
    }

    case 'DECLARE_BANKRUPTCY': {
      if (state.phase !== Phase.DEBT_RESOLUTION) return state;
      nextState = declareBankruptcy(state);
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
