import { type GameState, Phase, type Property } from '../types/game';

export const acceptTrade = (state: GameState): GameState => {
  if (!state.tradeOffer) return state;
  const { tradeOffer } = state;

  const offerer = state.players.find(p => p.id === tradeOffer.offererId)!;
  const target = state.players.find(p => p.id === tradeOffer.targetId)!;

  // Final validation
  if (offerer.cash < tradeOffer.offeredCash || target.cash < tradeOffer.requestedCash) {
    return {
      ...state,
      phase: Phase.WAITING_TO_ROLL,
      tradeOffer: undefined,
      log: [`Giao dịch thất bại: Một trong hai bên không đủ tiền mặt.`, ...state.log],
    };
  }

  const updatedPlayers = state.players.map(p => {
    if (p.id === offerer.id) {
      return { ...p, cash: p.cash - tradeOffer.offeredCash + tradeOffer.requestedCash };
    }
    if (p.id === target.id) {
      return { ...p, cash: p.cash + tradeOffer.offeredCash - tradeOffer.requestedCash };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if (t.type === 'PROPERTY') {
      const property = t as Property;
      if (tradeOffer.offeredPropertyIds.includes(property.id)) {
        return { ...property, ownerId: target.id };
      }
      if (tradeOffer.requestedPropertyIds.includes(property.id)) {
        return { ...property, ownerId: offerer.id };
      }
    }
    return t;
  });

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    phase: Phase.WAITING_TO_ROLL,
    currentPlayerId: tradeOffer.offererId,
    tradeOffer: undefined,
    log: [`Giao dịch thành công giữa ${offerer.name} và ${target.name}.`, ...state.log],
  };
};
