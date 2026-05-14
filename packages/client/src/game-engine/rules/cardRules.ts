import { type GameState, type Card, TileType, Phase, type Property, type TemporaryModifier } from '../types/game';
import { applyMovement } from './movementRules';

export function drawCard(type: TileType.CHANCE | TileType.FORTUNE, state: GameState): { card: Card; nextState: GameState } {
  const deck = type === TileType.CHANCE ? [...state.chanceDeck] : [...state.fortuneDeck];
  if (deck.length === 0) return { card: {} as Card, nextState: state };

  const card = deck.shift()!;
  // Cards go back to bottom of deck after use (handled in applyCardEffect or here)
  // For now we'll put it back in nextState
  
  const nextState = {
    ...state,
    [type === TileType.CHANCE ? 'chanceDeck' : 'fortuneDeck']: [...deck, card]
  };

  return { card, nextState };
}

export function applyCardEffect(state: GameState): GameState {
  if (!state.activeCard) return state;
  
  const card = state.activeCard;
  const currentPlayerId = state.currentPlayerId;
  const currentPlayer = state.players.find(p => p.id === currentPlayerId)!;
  
  let nextState: GameState = { ...state, activeCard: undefined };
  let logEntries: string[] = [];

  const { type, value = 0, target, duration = 0, position } = card.effect;

  switch (type) {
    case 'RECEIVE_MONEY': {
      if (target === 'LOWEST_CASH') {
        const lowestCashPlayer = [...nextState.players]
          .filter(p => !p.isBankrupt)
          .sort((a, b) => a.cash - b.cash)[0];
        
        nextState.players = nextState.players.map(p => 
          p.id === lowestCashPlayer.id ? { ...p, cash: p.cash + value } : p
        );
        logEntries.push(`${lowestCashPlayer.name} là người cần hỗ trợ nhất và đã nhận được $${value}.`);
      } else {
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: p.cash + value } : p
        );
        logEntries.push(`${currentPlayer.name} nhận được $${value}.`);
      }
      nextState.phase = Phase.END_TURN;
      break;
    }

    case 'PAY_MONEY': {
      const debtAmount = value;
      if (currentPlayer.cash < debtAmount) {
        nextState.phase = Phase.DEBT_RESOLUTION;
        nextState.debtState = { oweTo: 'BANK', amount: debtAmount - currentPlayer.cash };
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: 0 } : p
        );
      } else {
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: p.cash - debtAmount } : p
        );
        nextState.phase = Phase.END_TURN;
      }
      logEntries.push(`${currentPlayer.name} phải chi trả $${debtAmount}.`);
      break;
    }

    case 'PAY_PER_PROPERTY': {
      const propertyCount = state.board.filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === currentPlayerId).length;
      const totalCost = propertyCount * value;
      
      if (currentPlayer.cash < totalCost) {
        nextState.phase = Phase.DEBT_RESOLUTION;
        nextState.debtState = { oweTo: 'BANK', amount: totalCost - currentPlayer.cash };
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: 0 } : p
        );
      } else {
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: p.cash - totalCost } : p
        );
        nextState.phase = Phase.END_TURN;
      }
      logEntries.push(`${currentPlayer.name} đóng $${totalCost} cho ${propertyCount} tài sản sở hữu.`);
      break;
    }

    case 'PAY_PER_BUILDING': {
      const properties = state.board.filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === currentPlayerId) as Property[];
      const buildingCount = properties.reduce((sum, p) => sum + p.buildingLevel, 0);
      const totalCost = buildingCount * value;
      
      if (currentPlayer.cash < totalCost) {
        nextState.phase = Phase.DEBT_RESOLUTION;
        nextState.debtState = { oweTo: 'BANK', amount: totalCost - currentPlayer.cash };
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: 0 } : p
        );
      } else {
        nextState.players = nextState.players.map(p => 
          p.id === currentPlayerId ? { ...p, cash: p.cash - totalCost } : p
        );
        nextState.phase = Phase.END_TURN;
      }
      logEntries.push(`${currentPlayer.name} đóng $${totalCost} bảo trì cho ${buildingCount} cấp công trình.`);
      break;
    }

    case 'MOVE_TO_TILE': {
      if (position !== undefined) {
        const steps = (position - currentPlayer.position + state.board.length) % state.board.length;
        // Check if we pass START (unless it's Go To Jail)
        nextState = applyMovement(nextState, steps, false);
        // Overwrite phase to ensure resolution
        nextState.phase = Phase.RESOLVING_TILE;
      }
      break;
    }

    case 'MOVE_STEPS': {
      const steps = value;
      nextState = applyMovement(nextState, steps, false);
      nextState.phase = Phase.RESOLVING_TILE;
      break;
    }

    case 'MOVE_TO_NEAREST_UNOWNED_PROPERTY': {
      let found = false;
      let targetPos = currentPlayer.position;
      for (let i = 1; i < state.board.length; i++) {
        const checkPos = (currentPlayer.position + i) % state.board.length;
        const tile = state.board[checkPos];
        if (tile.type === TileType.PROPERTY && !(tile as Property).ownerId) {
          targetPos = checkPos;
          found = true;
          break;
        }
      }
      
      if (found) {
        const steps = (targetPos - currentPlayer.position + state.board.length) % state.board.length;
        nextState = applyMovement(nextState, steps, false);
        nextState.phase = Phase.RESOLVING_TILE;
      } else {
        logEntries.push("Không còn bất động sản nào trống trên thị trường.");
        nextState.phase = Phase.END_TURN;
      }
      break;
    }

    case 'TEMP_RENT_MODIFIER':
    case 'TEMP_BUILD_COST_MODIFIER':
    case 'TEMP_UNMORTGAGE_DISCOUNT':
    case 'ONE_TIME_RENT_DISCOUNT':
    case 'ONE_TIME_PURCHASE_DISCOUNT': {
      const newModifier: TemporaryModifier = {
        id: `mod-${Date.now()}`,
        playerId: currentPlayerId,
        effect: type,
        value: value,
        target: target,
        remainingRounds: duration || 1
      };
      nextState.temporaryModifiers = [...nextState.temporaryModifiers, newModifier];
      logEntries.push(`Hiệu ứng mới được áp dụng: ${card.title}.`);
      nextState.phase = Phase.END_TURN;
      break;
    }

    case 'DISABLE_ACTION_UNTIL_ROUND_END': {
      const newModifier: TemporaryModifier = {
        id: `mod-${Date.now()}`,
        effect: type,
        value: 0,
        target: target,
        remainingRounds: 1 // Until end of round usually means 1 round
      };
      nextState.temporaryModifiers = [...nextState.temporaryModifiers, newModifier];
      logEntries.push(`Quy định mới: Tạm thời vô hiệu hóa hành động ${target}.`);
      nextState.phase = Phase.END_TURN;
      break;
    }

    case 'ADJUST_BUILDING_LEVEL': {
      if (target === 'MOST_BUILDINGS') {
        const playersByBuildings = nextState.players
          .filter(p => !p.isBankrupt)
          .map(p => ({
            id: p.id,
            count: nextState.board.filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === p.id).reduce((sum, pr) => sum + (pr as Property).buildingLevel, 0)
          }))
          .sort((a, b) => b.count - a.count);
        
        const targetPlayerId = playersByBuildings[0]?.id;
        if (targetPlayerId) {
          // Find their most expensive property with buildings
          const targetProperties = nextState.board
            .filter(t => t.type === TileType.PROPERTY && (t as Property).ownerId === targetPlayerId && (t as Property).buildingLevel > 0)
            .sort((a, b) => (b as Property).price - (a as Property).price);
          
          if (targetProperties.length > 0) {
            const propId = targetProperties[0].id;
            nextState.board = nextState.board.map(t => 
              t.id === propId ? { ...t, buildingLevel: Math.max(0, (t as Property).buildingLevel + value) } : t
            );
            const targetPlayerName = nextState.players.find(p => p.id === targetPlayerId)!.name;
            logEntries.push(`${targetPlayerName} bị giảm 1 cấp công trình tại ${targetProperties[0].name} do thanh tra.`);
          }
        }
      }
      nextState.phase = Phase.END_TURN;
      break;
    }

    default:
      nextState.phase = Phase.END_TURN;
      break;
  }

  return {
    ...nextState,
    log: [...logEntries, ...nextState.log]
  };
}
