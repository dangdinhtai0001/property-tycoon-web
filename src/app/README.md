# app/

Application layer - connects UI, game engine, and Phaser.

## Structure

- **`store/`** - Zustand stores for state management
- **`subscribers/`** - Event subscribers that bridge layers

## Stores

### useGameStore

Main game state store. Wraps the game reducer and emits events.

```typescript
import { useGameStore } from './app/store/useGameStore'

const { state, dispatch } = useGameStore()
dispatch({ type: 'ROLL_DICE', payload: { dice: [3, 5] } })
```

### useUIStore

UI-specific state (modals, inspected property, animation queue).

```typescript
import { useUIStore } from './app/store/useUIStore'

const { showModal, setInspectedPropertyId } = useUIStore()
showModal('property-details')
```

### useAnimationQueue

Manages the animation queue for visual effects.

```typescript
import { useAnimationQueue } from './app/store/useAnimationQueue'

const { enqueue, dequeue, current } = useAnimationQueue()
enqueue({ type: 'DICE_ROLL', payload: [3, 5] })
```

## Subscribers

### animationSubscriber

Listens to `state:changed` events and enqueues animations based on state diffs.

Replaces the old watcher components (MoneyWatcher, BuildingWatcher).

```typescript
import { initializeAnimationSubscriber } from './app/subscribers/animationSubscriber'

// Call once at app startup
initializeAnimationSubscriber()
```

## Event Flow

1. User action → UI component
2. UI dispatches action → `useGameStore`
3. Store updates state via reducer
4. Store emits `state:changed` event
5. `animationSubscriber` detects changes and enqueues animations
6. `PhaserBridge` updates Phaser scene
7. UI components re-render with new state
