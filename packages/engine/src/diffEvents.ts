import { type GameState, Phase } from '@property-tycoon/shared';

export interface GameEvent {
  type: string;
  payload: Record<string, unknown>;
}

export function diffEvents(prev: GameState, next: GameState): GameEvent[] {
  const events: GameEvent[] = [];

  if (prev.phase !== next.phase) {
    events.push({ type: 'PHASE_CHANGED', payload: { from: prev.phase, to: next.phase } });
  }

  if (prev.lastDiceRoll && next.lastDiceRoll &&
      (prev.lastDiceRoll[0] !== next.lastDiceRoll[0] || prev.lastDiceRoll[1] !== next.lastDiceRoll[1])) {
    events.push({ type: 'DICE_ROLLED', payload: { dice: next.lastDiceRoll, playerId: next.currentPlayerId } });
  }

  const prevPlayer = prev.players.find(p => p.id === prev.currentPlayerId);
  const nextPlayer = next.players.find(p => p.id === next.currentPlayerId);
  if (prevPlayer && nextPlayer && prevPlayer.position !== nextPlayer.position) {
    events.push({ type: 'TOKEN_MOVED', payload: { playerId: nextPlayer.id, from: prevPlayer.position, to: nextPlayer.position } });
  }

  for (const np of next.players) {
    const pp = prev.players.find(p => p.id === np.id);
    if (pp && pp.cash !== np.cash) {
      const diff = np.cash - pp.cash;
      events.push({ type: diff > 0 ? 'MONEY_GAINED' : 'MONEY_LOST', payload: { playerId: np.id, amount: Math.abs(diff) } });
    }
  }

  for (const np of next.players) {
    const pp = prev.players.find(p => p.id === np.id);
    if (pp && !pp.isBankrupt && np.isBankrupt) {
      events.push({ type: 'PLAYER_BANKRUPT', payload: { playerId: np.id } });
    }
  }

  if (next.phase === Phase.GAME_OVER && prev.phase !== Phase.GAME_OVER) {
    const winner = next.players.find(p => !p.isBankrupt);
    events.push({ type: 'GAME_OVER', payload: { winnerId: winner?.id } });
  }

  return events;
}
