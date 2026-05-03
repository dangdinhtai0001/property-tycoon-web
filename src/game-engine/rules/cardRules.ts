import { type GameState, type Card, TileType, Phase } from '../types/game';

export const CHANCE_CARDS: Omit<Card, 'id'>[] = [
  {
    type: TileType.CHANCE,
    description: 'Bạn trúng giải đặc biệt xổ số kiến thiết! Nhận ngay $500.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      player.cash += 500;
      return {
        ...state,
        log: [`${player.name} nhận được $500 từ giải xổ số!`, ...state.log]
      };
    }
  },
  {
    type: TileType.CHANCE,
    description: 'Vi phạm luật giao thông. Nộp phạt $100.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      player.cash -= 100;
      return {
        ...state,
        log: [`${player.name} nộp phạt giao thông $100.`, ...state.log]
      };
    }
  },
  {
    type: TileType.CHANCE,
    description: 'Tiến thẳng đến ô Bắt Đầu (START). Nhận $200.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      player.position = 0;
      player.cash += 200;
      return {
        ...state,
        log: [`${player.name} tiến thẳng về ô Bắt Đầu và nhận $200.`, ...state.log]
      };
    }
  },
  {
    type: TileType.CHANCE,
    description: 'Đi du lịch Cố đô Huế (Ô số 11). Nếu đi ngang qua ô Bắt đầu, nhận $200.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      const oldPos = player.position;
      const targetPos = 11;
      if (oldPos > targetPos) {
        player.cash += 200;
      }
      player.position = targetPos;
      return {
        ...state,
        log: [`${player.name} đi du lịch đến Cố đô Huế.`, ...state.log]
      };
    }
  }
];

export const FORTUNE_CARDS: Omit<Card, 'id'>[] = [
  {
    type: TileType.FORTUNE,
    description: 'Ngân hàng trả lãi tiết kiệm. Nhận $200.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      player.cash += 200;
      return {
        ...state,
        log: [`${player.name} nhận $200 lãi tiết kiệm.`, ...state.log]
      };
    }
  },
  {
    type: TileType.FORTUNE,
    description: 'Nộp thuế bất động sản. Trả $50 cho mỗi căn nhà bạn sở hữu.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      // In this basic version, we count building levels across all properties
      let totalBuildings = 0;
      state.board.forEach(tile => {
        if (tile.type === TileType.PROPERTY) {
          const prop = tile as any;
          if (prop.ownerId === player.id) {
            totalBuildings += prop.buildingLevel || 0;
          }
        }
      });
      const totalTax = totalBuildings * 50;
      player.cash -= totalTax;
      return {
        ...state,
        log: [`${player.name} nộp $${totalTax} thuế bất động sản cho ${totalBuildings} căn nhà.`, ...state.log]
      };
    }
  },
  {
    type: TileType.FORTUNE,
    description: 'Đi lùi lại 3 bước.',
    action: (state: GameState) => {
      const player = state.players.find(p => p.id === state.currentPlayerId)!;
      player.position = (player.position - 3 + state.board.length) % state.board.length;
      return {
        ...state,
        log: [`${player.name} đi lùi lại 3 bước.`, ...state.log]
      };
    }
  }
];

export function drawCard(type: TileType.CHANCE | TileType.FORTUNE): Card {
  const cards = type === TileType.CHANCE ? CHANCE_CARDS : FORTUNE_CARDS;
  const randomIndex = Math.floor(Math.random() * cards.length);
  return {
    ...cards[randomIndex],
    id: `card-${Date.now()}-${randomIndex}`
  } as Card;
}

export function applyCardEffect(state: GameState): GameState {
  if (!state.activeCard) return state;
  
  const card = state.activeCard;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const oldPosition = currentPlayer.position;
  
  // Re-attach the function or handle by ID/Type
  const cardTemplate = [...CHANCE_CARDS, ...FORTUNE_CARDS].find(c => c.description === card.description);
  
  if (cardTemplate && cardTemplate.action) {
    // We must be careful about direct mutation. The actions in CHANCE_CARDS/FORTUNE_CARDS 
    // are currently written to mutate the state they receive (which is bad but they were written that way).
    // Let's create a copy.
    const stateCopy = JSON.parse(JSON.stringify(state)) as GameState;
    const resultState = cardTemplate.action(stateCopy);
    
    const newPlayer = resultState.players.find((p: any) => p.id === state.currentPlayerId)!;
    const positionChanged = newPlayer.position !== oldPosition;

    return {
      ...resultState,
      activeCard: undefined,
      phase: positionChanged ? Phase.RESOLVING_TILE : Phase.END_TURN
    };
  }
  
  return {
    ...state,
    activeCard: undefined,
    phase: Phase.END_TURN
  };
}
