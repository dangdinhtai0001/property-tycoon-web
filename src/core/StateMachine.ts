/**
 * A single entry in the state machine transition table.
 * TPhase = the phase enum type; TAction = the action type string.
 */
export interface Transition<TPhase, TAction> {
  /** Source phase(s) this transition applies from. */
  from: TPhase | TPhase[]
  /** The action that triggers this transition. */
  action: TAction
  /** The target phase after the transition. */
  to: TPhase
  /**
   * Optional guard condition. If provided and returns false,
   * the transition is blocked and transition() returns null.
   */
  guard?: (state: unknown) => boolean
  /**
   * Optional hook called after the transition is accepted.
   * Must be pure — returns a new state without mutation.
   */
  onEnter?: (state: unknown) => unknown
}

/**
 * Explicit transition table state machine.
 * The full phase graph is expressed as a Transition[] array,
 * making all valid transitions machine-readable and testable.
 */
export class StateMachine<TPhase, TAction> {
  private readonly transitions: Transition<TPhase, TAction>[]

  /** @param transitions - Complete list of valid phase transitions */
  constructor(transitions: Transition<TPhase, TAction>[]) {
    this.transitions = transitions
  }

  /**
   * Returns the target phase if the transition is valid, or null if not.
   * Null means the action is invalid from the current phase, or a guard blocked it.
   */
  transition(current: TPhase, action: TAction, state: unknown): TPhase | null {
    const match = this.transitions.find((t) => {
      const fromMatch = Array.isArray(t.from)
        ? t.from.includes(current)
        : t.from === current
      return fromMatch && t.action === action
    })
    if (!match) return null
    if (match.guard && !match.guard(state)) return null
    return match.to
  }

  /**
   * Returns true if the given action is a valid transition from the current phase
   * and any guard condition passes.
   */
  canTransition(current: TPhase, action: TAction, state: unknown): boolean {
    return this.transition(current, action, state) !== null
  }
}
