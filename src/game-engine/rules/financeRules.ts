import { type GameState, type Property, TileType, Phase } from '../types/game';

export const canMortgage = (state: GameState, propertyId: string): boolean => {
  const property = state.board.find(t => t.id === propertyId) as Property | undefined;
  if (!property || property.type !== TileType.PROPERTY || property.isMortgaged) return false;
  
  // Cannot mortgage if there are buildings
  if (property.buildingLevel > 0) return false;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer || property.ownerId !== currentPlayer.id) return false;

  return true;
};

export const mortgageProperty = (state: GameState, propertyId: string): GameState => {
  if (!canMortgage(state, propertyId)) return state;

  const property = state.board.find(t => t.id === propertyId) as Property;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash + property.mortgageValue };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, isMortgaged: true };
    }
    return t;
  });

  const logEntry = `${currentPlayer.name} đã thế chấp ${property.name} và nhận ${property.mortgageValue}$.`;

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    log: [logEntry, ...state.log],
  };
};

export const canUnmortgage = (state: GameState, propertyId: string): boolean => {
  const property = state.board.find(t => t.id === propertyId) as Property | undefined;
  if (!property || property.type !== TileType.PROPERTY || !property.isMortgaged) return false;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer || property.ownerId !== currentPlayer.id) return false;

  const unmortgageCost = Math.ceil(property.mortgageValue * 1.1);
  if (currentPlayer.cash < unmortgageCost) return false;

  return true;
};

export const unmortgageProperty = (state: GameState, propertyId: string): GameState => {
  if (!canUnmortgage(state, propertyId)) return state;

  const property = state.board.find(t => t.id === propertyId) as Property;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const unmortgageCost = Math.ceil(property.mortgageValue * 1.1);

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash - unmortgageCost };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, isMortgaged: false };
    }
    return t;
  });

  const logEntry = `${currentPlayer.name} đã giải chấp ${property.name} với giá ${unmortgageCost}$.`;

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    log: [logEntry, ...state.log],
  };
};

export const canSellBuilding = (state: GameState, propertyId: string): boolean => {
  const property = state.board.find(t => t.id === propertyId) as Property | undefined;
  if (!property || property.type !== TileType.PROPERTY || property.buildingLevel === 0) return false;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer || property.ownerId !== currentPlayer.id) return false;

  // Even-selling rule: Cannot sell if this building level is < any other property in group
  const propertiesInGroup = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
  ) as Property[];

  const maxLevelInGroup = Math.max(...propertiesInGroup.map(p => p.buildingLevel));
  if (property.buildingLevel < maxLevelInGroup) return false;

  return true;
};

export const sellBuilding = (state: GameState, propertyId: string): GameState => {
  if (!canSellBuilding(state, propertyId)) return state;

  const property = state.board.find(t => t.id === propertyId) as Property;
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const sellValue = Math.floor(property.buildingCost / 2);

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash + sellValue };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.id === propertyId) {
      return { ...t, buildingLevel: property.buildingLevel - 1 };
    }
    return t;
  });

  const buildingName = property.buildingLevel === 5 ? 'Khách sạn' : `Nhà`;
  const logEntry = `${currentPlayer.name} đã bán 1 ${buildingName} tại ${property.name} và nhận ${sellValue}$.`;

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    log: [logEntry, ...state.log],
  };
};

export const resolveDebt = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  if (!state.debtState || currentPlayer.cash < state.debtState.amount) return state;

  const oweTo = state.debtState.oweTo;
  const amount = state.debtState.amount;

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, cash: p.cash - amount };
    }
    if (oweTo !== 'BANK' && p.id === oweTo) {
      return { ...p, cash: p.cash + amount };
    }
    return p;
  });

  const creditorName = oweTo === 'BANK' ? 'Ngân hàng' : state.players.find(p => p.id === oweTo)?.name;
  const logEntry = `${currentPlayer.name} đã thanh toán khoản nợ ${amount}$ cho ${creditorName}.`;

  return {
    ...state,
    players: updatedPlayers,
    phase: Phase.END_TURN,
    debtState: undefined,
    log: [logEntry, ...state.log],
  };
};

export const declareBankruptcy = (state: GameState): GameState => {
  if (!state.debtState) return state;

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)!;
  const oweTo = state.debtState.oweTo;

  // Transfer all properties to creditor
  const updatedBoard = state.board.map(t => {
    if (t.type === TileType.PROPERTY) {
      const p = t as Property;
      if (p.ownerId === currentPlayer.id) {
        if (oweTo === 'BANK') {
          // Bank gets properties, unmortgaged, no buildings
          return { ...p, ownerId: undefined, isMortgaged: false, buildingLevel: 0 };
        } else {
          // Player gets properties as is, but must pay 10% interest for mortgaged ones immediately (simplified: keep mortgaged status)
          return { ...p, ownerId: oweTo };
        }
      }
    }
    return t;
  });

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      return { ...p, isBankrupt: true, cash: 0 };
    }
    return p;
  });

  const creditorName = oweTo === 'BANK' ? 'Ngân hàng' : state.players.find(p => p.id === oweTo)?.name;
  const logEntry = `${currentPlayer.name} đã tuyên bố phá sản trước ${creditorName}!`;

  // Check if only one player remains
  const activePlayers = updatedPlayers.filter(p => !p.isBankrupt);
  if (activePlayers.length === 1) {
    return {
      ...state,
      players: updatedPlayers,
      board: updatedBoard,
      phase: Phase.GAME_OVER,
      winnerId: activePlayers[0].id,
      log: [logEntry, `${activePlayers[0].name} đã chiến thắng!`, ...state.log],
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    phase: Phase.END_TURN,
    debtState: undefined,
    log: [logEntry, ...state.log],
  };
};
