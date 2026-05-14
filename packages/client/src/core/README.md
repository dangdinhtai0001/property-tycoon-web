# core/

Core utilities and patterns used throughout the application.

## Files

- **`EventBus.ts`** - Typed pub/sub event bus for cross-layer communication
- **`ObjectPool.ts`** - Generic object pool for reducing GC pressure

## EventBus

Central communication hub for all layers (UI, game engine, Phaser).

```typescript
import { eventBus } from './core/EventBus'

// Subscribe
const unsubscribe = eventBus.on('state:changed', ({ prev, next }) => {
  console.log('State changed:', prev, next)
})

// Emit
eventBus.emit('animation:enqueue', { type: 'DICE_ROLL', payload: [3, 5] })

// Unsubscribe
unsubscribe()
```

All events are typed in `GameEventMap`. Never use untyped string keys.

## ObjectPool

Pre-allocates objects to avoid runtime allocations in hot paths.

```typescript
import { ObjectPool } from './core/ObjectPool'

const pool = new ObjectPool(() => new MyObject(), 10)
const obj = pool.acquire()  // Calls activate()
pool.release(obj)           // Calls reset()
```

Objects must implement `PooledObject` interface with `reset()` and `activate()` methods.

## StateMachine

Type-safe state machine with transition validation.

```typescript
import { StateMachine } from '@property-tycoon/shared'

const machine = new StateMachine('idle', {
  idle: ['running', 'paused'],
  running: ['paused', 'stopped'],
  paused: ['running', 'stopped'],
  stopped: []
})

machine.transition('running')  // OK
machine.transition('stopped')  // Throws - invalid transition
```
