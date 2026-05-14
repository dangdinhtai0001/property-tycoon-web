# Multiplayer Online Upgrade — Design Spec

**Date:** 2026-05-14
**Status:** Validated
**Version:** 1.0

---

## 0. Summary of Decisions

| Decision | Choice |
|----------|--------|
| Engine approach | **Hybrid** — keep existing `gameReducer` as core, wrap in thin `GameController` for server |
| Client dispatch | **Mode-Switch (Approach A)** — offline calls reducer locally, online sends to server |
| Game modes | **Both** — offline hot-seat AND online multiplayer in same client |
| Feature scope | **Match engine** — all 13 phases, auction, trade, 48-tile board. No feature regression |
| Deployment | **Single server** — one Node.js process, in-memory game state, no Redis |
| Monorepo | **Full npm workspaces** — `packages/shared`, `packages/engine`, `packages/server`, `packages/client` |

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────┐
│              packages/shared                      │
│         Types, Constants, Enums                   │
│         (zero dependencies)                       │
└──────┬───────────────┬───────────────┬────────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   engine     │ │   server     │ │   client     │
│              │ │              │ │              │
│ gameReducer  │ │ RoomManager  │ │ React+Phaser │
│ phaseMachine │ │ SocketHandler│ │ Zustand store│
│ rules/*      │ │ GameController│ │ NetworkMgr  │
│ data/*       │ │              │ │ ui/*         │
│ GameController│ │              │ │ core/*       │
└──────────────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │         Socket.IO (ws)          │
       │         ◄──────────────►        │
       │                │                │
       └──────── shared types ───────────┘
```

**Key principle:** The `gameReducer` remains untouched. All multiplayer functionality is added *around* it, not *inside* it.

### Dependency Graph

| Package | Depends On | Runtime |
|---------|-----------|---------|
| `shared` | nothing | N/A (types only) |
| `engine` | `shared` | Node + Browser |
| `server` | `engine`, `shared` | Node.js only |
| `client` | `engine`, `shared` | Browser only |

---

## 2. Monorepo Structure

```
property-tycoon-web/
├── package.json              (npm workspaces root: ["packages/*"])
├── tsconfig.base.json        (shared TS compiler options)
├── packages/
│   ├── shared/
│   │   ├── package.json      (name: @property-tycoon/shared)
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts      # GameState, GameAction, Phase, Player, Tile, Card, etc.
│   │       ├── constants.ts  # MORTGAGE_RATE, JAIL_FINE, PASS_START_BONUS, economy values
│   │       └── index.ts
│   │
│   ├── engine/
│   │   ├── package.json      (name: @property-tycoon/engine)
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── gameReducer.ts        # existing reducer (moved, unchanged)
│   │       ├── phaseMachine.ts       # transition table + StateMachine
│   │       ├── setupGame.ts          # createInitialGame()
│   │       ├── GameController.ts     # NEW: thin class wrapping the reducer
│   │       ├── diffEvents.ts         # NEW: state diff → GameEvent[]
│   │       ├── rules/                # all rule modules (moved, unchanged)
│   │       ├── data/                 # board defs, cards, characters (moved)
│   │       ├── utils/                # boardGeometry (moved)
│   │       └── index.ts
│   │
│   ├── server/
│   │   ├── package.json      (name: @property-tycoon/server)
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              # Express + Socket.IO bootstrap
│   │       ├── RoomManager.ts        # Map<roomId, GameRoom>
│   │       ├── SocketHandler.ts      # event wiring + action processing
│   │       ├── Config.ts             # PORT, CORS_ORIGIN, turn timeout
│   │       └── types.ts              # server-internal types
│   │
│   └── client/
│       ├── package.json      (name: @property-tycoon/client)
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── app/
│           │   ├── store/           # Zustand stores (adapted for dual-mode)
│           │   ├── subscribers/     # EventBus subscribers
│           │   └── network/         # NEW: NetworkManager, Socket.IO client
│           ├── core/                # EventBus, StateMachine, ObjectPool (stays)
│           ├── phaser/              # Phaser scenes, sprites, bridge (stays)
│           ├── ui/                  # React components (stays, lobby screens added)
│           ├── config/              # UI configs: ui.ts, animation.ts, text.ts, assets.ts
│           └── storage/             # gameStorage.ts (offline saves only)
```

**What moves:**
- `src/game-engine/` → `packages/engine/src/`
- `src/config/gameplay.ts` constants → `packages/shared/src/constants.ts`
- Types from `src/game-engine/types/game.ts` → `packages/shared/src/types.ts`

**What stays in client:**
- `src/core/` (EventBus, StateMachine, ObjectPool) — client infrastructure
- `src/config/` (ui.ts, animation.ts, text.ts, assets.ts) — presentation-layer configs
- `src/phaser/` — Phaser scenes, sprites, bridge (no changes needed)
- `src/ui/` — React components (adapted for dual-mode, lobby screens added)

---

## 3. Engine — `GameController` (Thin Wrapper)

The `GameController` wraps the existing `gameReducer` without modifying it. It provides a class-based API for the server while delegating all rule logic to the reducer.

```typescript
class GameController {
  private state: GameState;
  private phaseMachine: StateMachine<Phase, string>;

  constructor(config: NewGameConfig) {
    this.state = createInitialGame(config);
    this.phaseMachine = createPhaseMachine();
  }

  applyAction(action: GameAction): ActionResult {
    // 1. Validate phase transition
    if (!this.phaseMachine.canTransition(this.state.phase, action.type, this.state)) {
      return { success: false, error: `Invalid action ${action.type} in phase ${this.state.phase}` };
    }

    // 2. Run the pure reducer
    const newState = gameReducer(this.state, action);

    // 3. Diff old vs new state, extract events
    const events = diffEvents(this.state, newState);

    // 4. Commit
    this.state = newState;

    return { success: true, state: this.state, events };
  }

  getState(): GameState { return this.state; }
}
```

### `diffEvents()` — State Diffing

Compares old and new `GameState` and produces typed `GameEvent[]`. Events include:

| Event | Trigger |
|-------|---------|
| `DICE_ROLLED` | `diceResult` changed |
| `TOKEN_MOVED` | Player position changed |
| `PASSED_START` | Player passed position 0 |
| `RENT_PAID` | Money transferred between players for rent |
| `PROPERTY_BOUGHT` | Property gained an owner |
| `BUILDING_PLACED` | `buildingLevel` increased |
| `BUILDING_SOLD` | `buildingLevel` decreased |
| `MORTGAGED` | Property `mortgaged` → true |
| `UNMORTGAGED` | Property `mortgaged` → false |
| `CARD_DRAWN` | `activeCard` populated |
| `CARD_RESOLVED` | `activeCard` cleared |
| `JAILED` | Player `jailTurns` > 0 |
| `JAIL_ESCAPED` | Player `jailTurns` → 0 |
| `PHASE_CHANGED` | `phase` changed |
| `PLAYER_BANKRUPT` | Player `isBankrupt` → true |
| `GAME_OVER` | `phase` → `GAME_OVER` |

These map naturally to the client's existing `AnimationQueue` event types.

### Recursive Dispatch (Chained Phases)

The reducer may chain phases internally (e.g., `RESOLVE_TILE` → `PAY_RENT` → `DRAW_CARD`). The server handles this by looping `applyAction()` until the phase requires player input:

```typescript
let result = controller.applyAction(action);
while (result.success && isAutoPhase(result.state.phase)) {
  result = controller.applyAction(getAutoAction(result.state));
}
```

`isAutoPhase()` returns true for phases that don't require player input: `RESOLVING_TILE`, `SHOWING_CARD`, `MOVING`, `ROLLING`. It returns false for `WAITING_TO_ROLL`, `BUY_DECISION`, `BUILD_DECISION`, `DEBT_RESOLUTION`, `AUCTION`, `TRADE`.

---

## 4. Server Design

### 4.1 Technology

- **Node.js** + **TypeScript**
- **Express** — lightweight HTTP server (port from env or 3000)
- **Socket.IO** — real-time bidirectional communication, room management, automatic reconnection

### 4.2 Room Lifecycle

```
Client                Server                   All Clients in Room
  │                     │                         │
  ├─ createRoom ──────►│ create GameController    │
  │◄─ roomCreated ─────┤                         │
  │                     │                         │
  ├─ joinRoom ────────►│ add player to room      │
  │◄─ joinedSuccess ────┤                         │
  │                     │◄─ playerJoined ─────────┤ (broadcast)
  │                     │                         │
  │  ... more players join ...                   │
  │                     │                         │
  │                     │ all players ready       │
  │◄─ gameStarted ──────┤◄─ gameStarted ─────────┤
  │◄─ gameStateUpdate ──┤◄─ gameStateUpdate ─────┤
  │                     │                         │
  ├─ playerAction ─────►│ applyAction()           │
  │                     │◄─ gameStateUpdate ──────┤ (broadcast new state)
  │                     │◄─ gameEvent(RENT) ──────┤
  │                     │                         │
  │  ... turns continue ...                      │
  │                     │                         │
  │                     │◄─ gameEvent(GAME_OVER) ─┤
```

### 4.3 Socket Events

#### Client → Server

| Event | Payload | Server Action |
|-------|---------|---------------|
| `createRoom` | `{ config: NewGameConfig }` | Create GameController, generate roomId, return `roomCreated` |
| `joinRoom` | `{ roomId, playerName, characterId }` | Validate room, add player socket to room, return `joinedSuccess` or `error` |
| `playerAction` | `{ roomId, action: GameAction }` | Validate turn, call `controller.applyAction()`, broadcast results |
| `leaveRoom` | `{ roomId }` | Remove player, broadcast `playerLeft`. If current turn, auto-end turn |

#### Server → Client

| Event | Payload | Who Receives |
|-------|---------|-------------|
| `roomCreated` | `{ roomId }` | Requester only |
| `joinedSuccess` | `{ roomId, players, playerId }` | Requester only |
| `error` | `{ message, code }` | Requester only |
| `playerJoined` | `{ playerName, characterId, slot }` | All in room |
| `playerLeft` | `{ playerId }` | All in room |
| `gameStarted` | `{ initialState: GameState }` | All in room |
| `gameStateUpdate` | `{ state: GameState }` | All in room |
| `gameEvent` | `{ type, payload }` | All in room |
| `actionError` | `{ message }` | Requester only |
| `gameOver` | `{ winnerId, finalState }` | All in room |

### 4.4 Turn Enforcement

Before processing any `playerAction`, the server validates:

1. **Room exists** — `roomId` maps to a live `GameRoom`
2. **Correct player** — `socket.id` matches the current turn's player socket
3. **Valid phase** — the action is valid for the current phase (handled inside `GameController.applyAction()`)

If any check fails → `actionError` to requester only. State unchanged.

### 4.5 Turn Timer (Optional, Configurable)

- **Default:** off (no timeout)
- **If enabled:** configurable duration (default 60s)
- **On timeout:** server auto-dispatches `END_TURN`, broadcasts `gameEvent(TURN_TIMEOUT)`
- **Timer management:** per-room, managed by `RoomManager`

### 4.6 RoomManager

```typescript
class RoomManager {
  private rooms: Map<string, GameRoom>;

  createRoom(config: NewGameConfig): string;  // returns roomId
  joinRoom(roomId: string, socket: Socket, playerInfo: PlayerInfo): JoinResult;
  leaveRoom(roomId: string, socketId: string): void;
  getRoom(roomId: string): GameRoom | undefined;
  garbageCollect(): void;  // removes rooms idle > configurable timeout
}

interface GameRoom {
  id: string;
  controller: GameController;
  players: Map<string, PlayerSocket>;  // socketId → { name, characterId, slot }
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  lastActivityAt: number;
}
```

---

## 5. Client Architecture

### 5.1 Adapted Zustand Store (`useGameStore`)

The store gains a `mode` flag. Dispatch behavior depends on mode:

```typescript
interface GameStoreState {
  mode: 'offline' | 'online';
  state: GameState;
  activeSlotId: string | null;

  // Online additions
  roomId: string | null;
  playerId: string | null;
  networkManager: NetworkManager | null;
  isConnected: boolean;

  dispatch: (action: GameAction) => void;
  setMode: (mode: 'offline' | 'online') => void;
  setFullState: (state: GameState) => void;
}

// Offline dispatch (unchanged):
//   dispatch(action) → gameReducer(state, action) → emit 'state:changed'

// Online dispatch (new):
//   dispatch(action) → networkManager.sendAction(action)
//   ... server processes ...
//   networkManager.onStateUpdate → setFullState(newState) → emit 'state:changed'
```

**What changes:** `dispatch()` gets an `if (mode === 'online')` branch. `setFullState()` is added. Everything else — reducer import, EventBus, auto-save logic — stays identical.

### 5.2 NetworkManager

New class in `packages/client/src/app/network/NetworkManager.ts`:

```typescript
class NetworkManager {
  constructor(serverUrl: string);

  connect(): Promise<void>;
  disconnect(): void;

  // Room operations (return Promises — request/response pattern)
  createRoom(config: NewGameConfig): Promise<string>;
  joinRoom(roomId: string, playerName: string, characterId: string): Promise<JoinResult>;
  leaveRoom(): void;

  // Fire-and-forget action
  sendAction(action: GameAction): void;

  // Callbacks (registered by store)
  onStateUpdate: (state: GameState) => void;
  onGameEvent: (event: GameEvent) => void;
  onPlayerJoined: (player: PlayerInfo) => void;
  onPlayerLeft: (playerId: string) => void;
  onGameStarted: (initialState: GameState) => void;
  onGameOver: (winnerId: string) => void;
  onError: (message: string) => void;
  onDisconnect: (reason: string) => void;
}
```

**Reconnection strategy:**
- On disconnect: store `roomId` + `playerId`, show "Reconnecting..." overlay
- Retry every 3 seconds for 30 seconds
- On reconnect: emit `joinRoom` with stored `roomId` + `playerName`
- Server detects existing player, rebinds socket, sends current `GameState` via `gameStateUpdate`
- Overlay disappears, game continues

### 5.3 Animation Flow in Online Mode

1. `ActionPanel` enqueues **optimistic** animations (e.g., dice roll visual start) before dispatching
2. `dispatch()` sends action to server — store does NOT change state locally
3. `gameEvent` arrives → `animationSubscriber` processes it → enqueues definitive animations
4. `gameStateUpdate` arrives → `setFullState()` updates store → React re-renders

The existing `animationSubscriber` (in `app/subscribers/`) already listens to `state:changed`. In online mode, it additionally subscribes to `NetworkManager.onGameEvent` for richer event-driven animations.

### 5.4 New UI Screens

**`screens/LobbyScreen.tsx`** — Pre-game lobby (React-only, no Phaser):
- Two tabs: "Create Room" / "Join Room"
- Create: game config form → creates room → displays roomId → waits for players
- Join: roomId input + player name + character picker → joins → waits for host to start
- Player list with ready indicators
- Host controls: start game button

**`screens/GameScreen.tsx`** — Refactored in-game layout:
- Mounts `Board.tsx` (Phaser canvas) + all existing panels and modals
- Online mode: shows connection status indicator
- All existing panels work in both modes (they read from the same Zustand store)

### 5.5 Phaser Bridge (No Changes)

`PhaserBridge` subscribes to EventBus `state:changed` — this event fires identically in both modes. Token movement, building rendering, tile status all work without modification.

### 5.6 Save/Load

| Mode | Save | Load |
|------|------|------|
| Offline | `localStorage` via `gameStorage.ts` (unchanged) | From `localStorage` via Main Menu |
| Online | No client-side save. Server holds state in memory. | Via reconnection (server sends current state) |

Save/Load buttons hidden in online mode. No server-side persistence.

---

## 6. Error Handling

### 6.1 Server-Side

| Scenario | Behavior |
|----------|----------|
| Invalid action for phase | `actionError` to requester only. State unchanged. |
| Wrong player's turn | `actionError: "Not your turn"`. Ignored. |
| Unknown roomId | `error: "Room not found"` on join. |
| Room full | `error: "Room is full"` on join. |
| Game already started | `error: "Game in progress"` on join. |
| Malformed action payload | `actionError`. Server validates all fields before `applyAction`. |
| Duplicate socket join | Rebind existing player to new socket (reconnection). |

### 6.2 Client-Side

| Scenario | Behavior |
|----------|----------|
| Server unreachable on connect | `onError("Connection failed")`. UI shows retry button. |
| Mid-game disconnect | "Reconnecting..." overlay. Retry 3s intervals, 30s timeout. Success: rebind + state. Failure: "Return to menu." |
| Server rejects action | `actionError` → toast notification. Button stays enabled. |
| Invalid state received | `ErrorBoundary` catches. Logged to console. |

### 6.3 Turn Timer Edge Cases

| Scenario | Behavior |
|----------|----------|
| Player times out | Server dispatches `END_TURN`. Broadcasts `gameEvent(TURN_TIMEOUT)`. |
| Disconnected player's turn | Server waits for timeout or reconnect. No-timer fallback: 120s grace period then auto-skip. |
| All players disconnected | Room kept alive for 10 minutes (configurable), then garbage-collected. |

### 6.4 Mode Boundary

- Switching mode during active game: **not allowed**
- Main Menu always resets mode flag
- `setMode()` clears any active `NetworkManager` connection and game state

---

## 7. Testing Strategy

### 7.1 Engine Tests (Vitest)

- Existing tests: unchanged (32+ tests)
- New tests:
  - `GameController.applyAction()` — success, invalid phase rejection, event generation
  - `diffEvents()` — correct events for all action types
  - Chained action resolution — phase loops terminate correctly

### 7.2 Server Tests (Vitest + `socket.io-client`)

- `RoomManager` — create, join, full rejection, garbage collection
- `SocketHandler` — full game flow: create → join → start → actions → game over
- Turn enforcement — wrong player action rejected
- Reconnection — disconnect mid-game, reconnect, receive current state
- Multiple concurrent rooms — isolation verified

### 7.3 Client Tests (Vitest + jsdom + @testing-library/react)

- `NetworkManager` — mocked socket, event callbacks fire correctly
- `useGameStore` — offline dispatch unchanged, online dispatch calls `sendAction`
- `LobbyScreen` — render create/join flows
- `GameScreen` — renders in both modes with correct store state

### 7.4 E2E Tests (Playwright)

- Full multiplayer flow: two browser contexts, create room, join, play complete game
- Reconnection: close one browser, reopen, verify game continues

---

## 8. Migration Path

Incremental, each step verified independently:

1. **Create `packages/shared`**
   - Extract types (`GameState`, `GameAction`, `Phase`, etc.) and gameplay constants from `src/config/gameplay.ts`
   - Update all source imports to use `@property-tycoon/shared`
   - Verify: `npm run build` passes, all tests pass

2. **Create `packages/engine`**
   - Move `src/game-engine/` into it
   - Add `GameController.ts`, `diffEvents.ts`
   - Export everything through `index.ts`
   - Client imports engine from `@property-tycoon/engine`
   - Verify: all existing tests pass, `npm run build` passes

3. **Create `packages/server`** (greenfield)
   - Implement `RoomManager`, `SocketHandler`, `index.ts`
   - Write server tests
   - Verify: server starts, processes full game flow via test sockets

4. **Restructure `packages/client`**
   - Integrate `NetworkManager`
   - Adapt `useGameStore` for dual-mode
   - Add `LobbyScreen`
   - Keep `src/core/`, `src/phaser/`, `src/ui/`, `src/config/` in place (fix imports only)
   - Verify: offline mode unchanged, online mode connects and plays

**Rule:** At every step, the project must build and pass all tests. No big-bang migration.

---

## 9. Non-Goals (Explicitly Out of Scope)

- Player accounts / authentication — join by roomId + name only
- Persistent server state — server restart = all games lost
- AI bots in multiplayer — AI exists in engine but not wired to online rooms (offline AI unchanged)
- Chat system — can be added later as a `chatMessage` Socket.IO event
- Spectator mode — only players in the room see the game
- Mobile-responsive layout — desktop browser only
- Match history / leaderboards / replays
- Server-side save/load — only client-side `localStorage` for offline mode
- Horizontal scaling — single process, no Redis, no load balancing

---

## 10. Extension Points (for Future Phases)

These are intentionally designed for but NOT implemented now:

- **Accounts/Auth:** Add Express `/api/auth` routes + JWT. Socket.IO middleware validates token on connect. `Player` gets `accountId` field.
- **Chat:** Already defined as `chatMessage` Socket.IO event. Server broadcasts only. Add persistence layer (Redis/DB) if needed later.
- **Replay:** `actionLog` in `GameRoom` can be written to file/DB at game end. Replay = create `GameController`, replay log sequentially.
- **AI/Bots:** Write a package `ai-player` that imports `engine`, computes moves, sends actions via Socket.IO like a real client.
- **Horizontal scaling:** Add Redis adapter for Socket.IO. Move game state to Redis. Requires sticky sessions or state migration.
- **Leaderboards:** On game end, call internal API to persist results to MongoDB/Postgres.

---

## 11. Open Questions (Deferred)

These are noted but do not block this spec. To be resolved during implementation:

1. Should the server also serve the client's static build (single deploy) or deploy separately (client to Vercel, server to Railway)?
2. `diffEvents()` implementation detail: compute events inside the reducer (return events alongside state) or compute externally via state comparison?
3. How are chained auto-actions identified? Via `isAutoPhase()` on phase name, or via explicit metadata returned by the reducer?
4. Should roomId be a short human-readable code (e.g., "ABCD") or a UUID?
5. Exact timeout values for turn timer, reconnection retry, idle room garbage collection?
