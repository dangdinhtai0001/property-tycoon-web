import { type GameState, type GameAction } from '@property-tycoon/shared';
import { createInitialGame } from './state/setupGame.js';
import { gameReducer } from './state/gameReducer.js';
import { phaseMachine } from './state/phaseMachine.js';
import { diffEvents, type GameEvent } from './diffEvents.js';

export interface ActionResult {
  success: boolean;
  state: GameState;
  events: GameEvent[];
  error?: string;
}

export class GameController {
  private state: GameState;

  constructor(config: Parameters<typeof createInitialGame>[0]) {
    this.state = createInitialGame(config);
  }

  applyAction(action: GameAction): ActionResult {
    const canTransition = phaseMachine.canTransition(this.state.phase, action.type, this.state as any);
    if (!canTransition) {
      return { success: false, state: this.state, events: [], error: `Invalid action ${action.type} in phase ${this.state.phase}` };
    }
    const newState = gameReducer(this.state, action);
    const events = diffEvents(this.state, newState);
    this.state = newState;
    return { success: true, state: this.state, events };
  }

  getState(): GameState { return this.state; }
}
