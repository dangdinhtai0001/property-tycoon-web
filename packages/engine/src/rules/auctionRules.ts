import { type GameState, Phase, type Property, type Money, type PlayerId } from '@property-tycoon/shared';

export const handleBid = (state: GameState, amount: Money): GameState => {
  if (!state.auctionState) return state;
  const { auctionState } = state;
  const bidderId = auctionState.biddingPlayerIds[auctionState.turnIndex];
  const bidder = state.players.find(p => p.id === bidderId)!;

  if (amount <= auctionState.currentBid || amount > bidder.cash) {
    return state;
  }

  const nextTurnIndex = (auctionState.turnIndex + 1) % auctionState.biddingPlayerIds.length;

  return {
    ...state,
    auctionState: {
      ...auctionState,
      currentBid: amount,
      highestBidderId: bidderId,
      turnIndex: nextTurnIndex,
    },
    log: [`${bidder.name} đã đặt giá ${amount}$`, ...state.log],
  };
};

export const handlePassBid = (state: GameState): GameState => {
  if (!state.auctionState) return state;
  const { auctionState } = state;
  const bidderId = auctionState.biddingPlayerIds[auctionState.turnIndex];
  const bidder = state.players.find(p => p.id === bidderId)!;

  const nextBiddingIds = auctionState.biddingPlayerIds.filter(id => id !== bidderId);
  
  // If no one is left
  if (nextBiddingIds.length === 0) {
    // If there was a highest bidder, they win (should have been handled when they became the last one)
    // But if everyone passed without bidding:
    return {
      ...state,
      phase: Phase.END_TURN,
      auctionState: undefined,
      log: [`Phiên đấu giá kết thúc mà không có người mua.`, ...state.log],
    };
  }

  // If only one person left and they are already the highest bidder
  if (nextBiddingIds.length === 1 && auctionState.highestBidderId === nextBiddingIds[0]) {
    return finalizeAuction(state, nextBiddingIds[0], auctionState.currentBid, auctionState.propertyId);
  }

  const nextTurnIndex = auctionState.turnIndex % nextBiddingIds.length;

  return {
    ...state,
    auctionState: {
      ...auctionState,
      biddingPlayerIds: nextBiddingIds,
      turnIndex: nextTurnIndex,
    },
    log: [`${bidder.name} đã bỏ qua đấu giá.`, ...state.log],
  };
};

const finalizeAuction = (state: GameState, winnerId: PlayerId, amount: Money, propertyId: string): GameState => {
  const winner = state.players.find(p => p.id === winnerId)!;
  const property = state.board.find(t => (t as any).id === propertyId) as Property;

  const updatedPlayers = state.players.map(p => {
    if (p.id === winnerId) {
      return { ...p, cash: p.cash - amount };
    }
    return p;
  });

  const updatedBoard = state.board.map(t => {
    if ((t as any).id === propertyId) {
      return { ...t, ownerId: winnerId };
    }
    return t;
  });

  return {
    ...state,
    players: updatedPlayers,
    board: updatedBoard,
    phase: Phase.END_TURN,
    auctionState: undefined,
    log: [`${winner.name} đã thắng đấu giá ${property.name} với giá ${amount}$`, ...state.log],
  };
};
