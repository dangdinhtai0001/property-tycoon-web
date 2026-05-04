# game-engine/

Pure game logic and state management. No UI or rendering concerns.

## Structure

- **`state/`** - State management (reducer, phase machine)
- **`actions/`** - Action creators and handlers
- **`data/`** - Static game data (board, properties, characters)
- **`utils/`** - Pure utility functions (board geometry, rent calculation)
- **`types/`** - TypeScript type definitions

## Key Concepts

### State Management

The game state is managed through a Redux-style reducer:

```typescript
import { useGameStore } from '../app/store/useGameStore'

const { state, dispatch } = useGameStore()
dispatch({ type: 'ROLL_DICE', payload: { dice: [3, 5] } })
```

All state changes flow through `gameReducer`, which delegates to action handlers.

### Phase Machine

Game phases are managed by a finite state machine (`phaseMachine.ts`):

- `SETUP` → `ROLL` → `MOVE` → `LANDED` → `END_TURN` → `ROLL`
- Validates transitions and prevents invalid state changes

### Action Handlers

Each action type has a dedicated handler in `actions/`:

- `rollDiceAction.ts` - Dice rolling and doubles detection
- `movePlayerAction.ts` - Token movement and passing GO
- `buyPropertyAction.ts` - Property purchases
- `buildAction.ts` - Building houses/hotels
- etc.

## Guidelines

- Keep game logic pure (no side effects)
- All state changes must go through the reducer
- Use config values from `config/gameplay.ts`
- Emit events via EventBus for cross-layer communication
