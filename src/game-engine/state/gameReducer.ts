import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game';
import { createInitialGame } from './setupGame';
import { rollDice } from '../rules/diceRules';
import { applyMovement } from '../rules/movementRules';
import { buyProperty } from '../rules/propertyRules';
import { payRent, calculateRent } from '../rules/rentRules';
import { buildProperty } from '../rules/buildingRules';
import { payJailFine } from '../rules/jailRules';
import { mortgageProperty, unmortgageProperty, sellBuilding, resolveDebt, declareBankruptcy } from '../rules/financeRules';
import { handleBid, handlePassBid } from '../rules/auctionRules';
import { acceptTrade } from '../rules/tradeRules';
import { drawCard, applyCardEffect } from '../rules/cardRules';
import { GAME_LOG, BUILDING_LEVEL_NAMES } from '../../config/text';
import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '../../config/gameplay';
import { phaseMachine } from './phaseMachine';

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
      if (!phaseMachine.canTransition(state.phase, 'ROLL_DICE', state)) return state;
      const dice = action.payload?.dice || rollDice();
      
      // If we only want to set the dice and not move yet (for step-by-step animation)
      return {
        ...state,
        lastDiceRoll: dice,
        phase: Phase.MOVING,
      };
    }

    case 'MOVE_ONE_STEP': {
      return applyMovement(state, 1, true);
    }

    case 'RESOLVE_TILE': {
      if (state.phase !== Phase.MOVING && state.phase !== Phase.RESOLVING_TILE) {
        console.warn(`[DEBUG] Chặn RESOLVE_TILE trùng lặp ở phase: ${state.phase}`);
        return state;
      }

      const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
      const tile = state.board[currentPlayer.position];
      
      console.log(`[DEBUG] Đang xử lý ô ${tile.name} (loại: ${tile.type}) tại vị trí ${tile.position}`);

      const logEntry = GAME_LOG.playerLandedOn(currentPlayer.name, tile.name);
      const stateWithLog = { ...state, log: [logEntry, ...state.log] };

      let nextPhase = Phase.RESOLVING_TILE;
      if (tile.type === TileType.PROPERTY) {
        const property = tile as Property;
        if (!property.ownerId) {
          nextPhase = Phase.BUY_DECISION;
        } else if (property.ownerId !== currentPlayer.id) {
          return gameReducer(stateWithLog, { type: 'PAY_RENT' });
        } else {
          // Landed on own property - prompt for building
          nextPhase = Phase.BUILD_DECISION;
        }
      } else if (tile.type === TileType.CHANCE || tile.type === TileType.FORTUNE) {
        return gameReducer(stateWithLog, { type: 'DRAW_CARD' });
      } else if (tile.type === TileType.TAX) {
        const taxAmount = tile.name.includes('xa xỉ') ? TAX_LUXURY_AMOUNT : TAX_INCOME_AMOUNT;
        
        let nextPhaseForTax = Phase.END_TURN;
        let debtState = undefined;
        
        const updatedPlayers = stateWithLog.players.map(p => {
          if (p.id === state.currentPlayerId) {
            const finalCash = Math.max(0, p.cash - taxAmount);
            if (p.cash < taxAmount) {
              nextPhaseForTax = Phase.DEBT_RESOLUTION;
              debtState = { oweTo: 'BANK' as const, amount: taxAmount - p.cash };
            }
            return { ...p, cash: finalCash };
          }
          return p;
        });

        return {
          ...stateWithLog,
          players: updatedPlayers,
          log: [GAME_LOG.playerPaidTax(currentPlayer.name, tile.name, taxAmount), ...stateWithLog.log],
          phase: nextPhaseForTax,
          debtState
        };
      } else {
        nextPhase = Phase.END_TURN;
      }

      return { ...stateWithLog, phase: nextPhase };
    }

    case 'DRAW_CARD': {
      const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
      const tile = state.board[currentPlayer.position];
      if (tile.type !== TileType.CHANCE && tile.type !== TileType.FORTUNE) return state;
      
      const { card, nextState: stateAfterDraw } = drawCard(tile.type, state);
      return {
        ...stateAfterDraw,
        activeCard: card,
        phase: Phase.SHOWING_CARD,
        log: [`${currentPlayer.name} rút thẻ ${tile.type === TileType.CHANCE ? 'Cơ Hội' : 'Khí Vận'}: ${card.title}`, ...state.log]
      };
    }

    case 'APPLY_CARD': {
      if (!phaseMachine.canTransition(state.phase, 'APPLY_CARD', state) || !state.activeCard) return state;
      const result = applyCardEffect(state);
      // Card moved the player — auto-resolve the new tile so the game doesn't get stuck
      if (result.phase === Phase.RESOLVING_TILE) {
        return gameReducer(result, { type: 'RESOLVE_TILE' });
      }
      return result;
    }

    case 'TELEPORT_PLAYER': {
      const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
      const targetPos = action.payload.position;

      // Calculate steps to reach target position (forward)
      const steps = (targetPos - currentPlayer.position + state.board.length) % state.board.length;

      // If same position, do nothing or just return state
      if (steps === 0) return state;

      const stateAfterMove = applyMovement(state, steps, false);
      const stateWithLog = {
        ...stateAfterMove,
        phase: Phase.RESOLVING_TILE,
        log: [`[DEBUG] Nhảy đến ${state.board[targetPos].name} (Vượt qua ${steps} ô)`, ...stateAfterMove.log]
      };
      // Auto-resolve tile so special tiles (CHANCE, FORTUNE, TAX, etc.) trigger correctly
      return gameReducer(stateWithLog, { type: 'RESOLVE_TILE' });
    }
    
    case 'DEBUG_ADD_CASH': {
      const players = state.players.map(p => 
        p.id === state.currentPlayerId ? { ...p, cash: p.cash + action.payload.amount } : p
      );
      return {
        ...state,
        players,
        log: [`[DEBUG] Đã thêm $${action.payload.amount} cho ${state.players.find(p => p.id === state.currentPlayerId)?.name}`, ...state.log]
      };
    }

    case 'BUY_PROPERTY': {
      if (!phaseMachine.canTransition(state.phase, 'BUY_PROPERTY', state)) return state;
      const boughtState = buyProperty(state, action.payload.propertyId);
      nextState = { ...boughtState, phase: Phase.END_TURN, lastPurchaseId: action.payload.propertyId };
      break;
    }

    case 'DECLINE_BUY_PROPERTY': {
      if (!phaseMachine.canTransition(state.phase, 'DECLINE_BUY_PROPERTY', state)) return state;
      
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
      if (!phaseMachine.canTransition(state.phase, 'BID', state)) return state;
      nextState = handleBid(state, action.payload.amount);
      break;
    }

    case 'PASS_BID': {
      if (!phaseMachine.canTransition(state.phase, 'PASS_BID', state)) return state;
      nextState = handlePassBid(state);
      break;
    }

    case 'PROPOSE_TRADE': {
      nextState = {
        ...state,
        phase: Phase.TRADE,
        tradeOffer: action.payload.offer,
        currentPlayerId: action.payload.offer.targetId,
        log: [`${state.players.find(p => p.id === action.payload.offer.offererId)?.name} đề nghị giao dịch với ${state.players.find(p => p.id === action.payload.offer.targetId)?.name}`, ...state.log],
      };
      break;
    }

    case 'ACCEPT_TRADE': {
      if (!phaseMachine.canTransition(state.phase, 'ACCEPT_TRADE', state)) return state;
      nextState = acceptTrade(state);
      break;
    }

    case 'REJECT_TRADE': {
      if (!phaseMachine.canTransition(state.phase, 'REJECT_TRADE', state)) return state;
      nextState = {
        ...state,
        phase: Phase.WAITING_TO_ROLL,
        currentPlayerId: state.tradeOffer?.offererId ?? state.currentPlayerId,
        tradeOffer: undefined,
        log: [`Giao dịch bị từ chối.`, ...state.log],
      };
      break;
    }

    case 'CANCEL_TRADE': {
      nextState = {
        ...state,
        phase: Phase.WAITING_TO_ROLL,
        currentPlayerId: state.tradeOffer?.offererId ?? state.currentPlayerId,
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
      if (!phaseMachine.canTransition(state.phase, 'RESOLVE_DEBT', state)) return state;
      nextState = resolveDebt(state);
      break;
    }

    case 'DECLARE_BANKRUPTCY': {
      if (!phaseMachine.canTransition(state.phase, 'DECLARE_BANKRUPTCY', state)) return state;
      nextState = declareBankruptcy(state);
      break;
    }

    case 'BUILD': {
      if (!phaseMachine.canTransition(state.phase, 'BUILD', state)) return state;
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      const prop = state.board.find(t => t.id === action.payload.propertyId) as Property;
      const nextLevel = prop.buildingLevel + 1;
      
      const builtState = buildProperty(state, action.payload.propertyId);
      const updatedProp = builtState.board.find(t => t.id === action.payload.propertyId) as Property;
      const newRent = calculateRent(builtState, updatedProp);

      const logMsg = nextLevel === 5 
        ? GAME_LOG.landmarkCompleted(player.name, prop.name)
        : GAME_LOG.playerBuilt(player.name, BUILDING_LEVEL_NAMES[nextLevel], prop.name, newRent);
        
      return {
        ...builtState,
        log: [logMsg, ...builtState.log]
      };
    }

    case 'PAY_FINE': {
      if (!phaseMachine.canTransition(state.phase, 'PAY_FINE', state)) return state;
      nextState = payJailFine(state);
      break;
    }

    case 'END_TURN': {
      if (!phaseMachine.canTransition(state.phase, 'END_TURN', state)) return state;
      
      const currentIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      
      // Update temporary modifiers: decrement rounds and remove expired ones
      const updatedModifiers = state.temporaryModifiers
        .map(m => ({ ...m, remainingRounds: m.remainingRounds - 1 }))
        .filter(m => m.remainingRounds > 0);

      nextState = {
        ...state,
        currentPlayerId: state.players[nextIndex].id,
        phase: Phase.WAITING_TO_ROLL,
        lastDiceRoll: undefined,
        lastPurchaseId: undefined,
        temporaryModifiers: updatedModifiers,
      };
      break;
    }

    default:
      nextState = state;
  }
  
  assertGameInvariants(nextState);
  return nextState;
};
