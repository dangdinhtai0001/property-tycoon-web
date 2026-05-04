import { Phase } from '../types/game'
import { StateMachine, type Transition } from '../../core/StateMachine'
import type { GameState } from '../types/game'

/**
 * Complete transition table for all 13 game phases.
 * Guards mirror the inline `if (state.phase !== X) return state` checks
 * that previously lived in gameReducer.ts. Adding a new phase only
 * requires a new entry here — the reducer does not need to change.
 */
const TRANSITIONS: Transition<Phase, string>[] = [
  // START_GAME resets from any phase
  ...Object.values(Phase).map(p => ({ from: p, action: 'START_GAME', to: Phase.WAITING_TO_ROLL })),

  // Dice roll — only from WAITING_TO_ROLL
  { from: Phase.WAITING_TO_ROLL, action: 'ROLL_DICE', to: Phase.MOVING },

  // Movement
  { from: Phase.MOVING, action: 'MOVE_ONE_STEP', to: Phase.MOVING },
  { from: Phase.MOVING, action: 'RESOLVE_TILE', to: Phase.RESOLVING_TILE },

  // Tile resolution
  { from: Phase.RESOLVING_TILE, action: 'RESOLVE_TILE', to: Phase.BUY_DECISION },
  { from: Phase.RESOLVING_TILE, action: 'DRAW_CARD', to: Phase.SHOWING_CARD },
  { from: Phase.RESOLVING_TILE, action: 'PAY_RENT', to: Phase.END_TURN },
  { from: Phase.RESOLVING_TILE, action: 'PAY_RENT', to: Phase.DEBT_RESOLUTION },

  // Buy decision
  { from: Phase.BUY_DECISION, action: 'BUY_PROPERTY', to: Phase.END_TURN },
  {
    from: Phase.BUY_DECISION,
    action: 'DECLINE_BUY_PROPERTY',
    to: Phase.AUCTION,
    guard: (s) => (s as GameState).config.enableAuction,
  },
  { from: Phase.BUY_DECISION, action: 'DECLINE_BUY_PROPERTY', to: Phase.END_TURN },

  // Auction
  { from: Phase.AUCTION, action: 'BID', to: Phase.AUCTION },
  { from: Phase.AUCTION, action: 'PASS_BID', to: Phase.AUCTION },
  { from: Phase.AUCTION, action: 'PASS_BID', to: Phase.END_TURN },

  // Build decision
  { from: Phase.BUILD_DECISION, action: 'BUILD', to: Phase.BUILD_DECISION },
  { from: Phase.BUILD_DECISION, action: 'END_TURN', to: Phase.WAITING_TO_ROLL },

  // Card
  { from: Phase.SHOWING_CARD, action: 'APPLY_CARD', to: Phase.END_TURN },
  { from: Phase.SHOWING_CARD, action: 'APPLY_CARD', to: Phase.RESOLVING_TILE },

  // Trade
  { from: Phase.WAITING_TO_ROLL, action: 'PROPOSE_TRADE', to: Phase.TRADE },
  { from: Phase.TRADE, action: 'ACCEPT_TRADE', to: Phase.WAITING_TO_ROLL },
  { from: Phase.TRADE, action: 'REJECT_TRADE', to: Phase.WAITING_TO_ROLL },
  { from: Phase.TRADE, action: 'CANCEL_TRADE', to: Phase.WAITING_TO_ROLL },

  // Debt resolution
  { from: Phase.DEBT_RESOLUTION, action: 'RESOLVE_DEBT', to: Phase.END_TURN },
  { from: Phase.DEBT_RESOLUTION, action: 'DECLARE_BANKRUPTCY', to: Phase.END_TURN },
  { from: Phase.DEBT_RESOLUTION, action: 'DECLARE_BANKRUPTCY', to: Phase.GAME_OVER },

  // Finance actions (multi-phase)
  ...[Phase.WAITING_TO_ROLL, Phase.END_TURN, Phase.DEBT_RESOLUTION].flatMap(p => [
    { from: p, action: 'MORTGAGE_PROPERTY', to: p },
    { from: p, action: 'UNMORTGAGE_PROPERTY', to: p },
    { from: p, action: 'SELL_BUILDING', to: p },
  ]),

  // Build from WAITING_TO_ROLL or END_TURN
  { from: Phase.WAITING_TO_ROLL, action: 'BUILD', to: Phase.WAITING_TO_ROLL },
  { from: Phase.END_TURN, action: 'BUILD', to: Phase.END_TURN },

  // Jail fine
  { from: Phase.WAITING_TO_ROLL, action: 'PAY_FINE', to: Phase.WAITING_TO_ROLL },

  // End turn
  { from: Phase.END_TURN, action: 'END_TURN', to: Phase.WAITING_TO_ROLL },

  // Debug — always pass through
  ...Object.values(Phase).flatMap(p => [
    { from: p, action: 'DEBUG_ADD_CASH', to: p },
    { from: p, action: 'TELEPORT_PLAYER', to: Phase.RESOLVING_TILE },
  ]),
]

/** Singleton phase machine used by gameReducer.ts to validate all phase transitions. */
export const phaseMachine = new StateMachine<Phase, string>(TRANSITIONS)
