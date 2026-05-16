---
project_name: 'property-tycoon-web'
user_name: Dangd
date: '2026-05-16'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - style_rules
  - workflow_rules
  - anti_patterns
  - esm_gotchas
  - state_management_rules
  - server_multiplayer_rules
existing_patterns_found: 44
status: 'complete'
rule_count: 60
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in Property Tycoon Web. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Language | TypeScript | ~6.0.2 | strict, verbatimModuleSyntax, moduleResolution: bundler |
| Runtime | Node.js (ESM) | — | `type: "module"` in all packages |
| Frontend | React | 19.2.5 | No React Compiler on Zustand-selector components |
| Build | Vite | 8.0.10 | Chunk limit raised to 1000 KB for Phaser |
| Styling | Tailwind CSS | 4.2.4 | via `@tailwindcss/vite` plugin |
| Game Engine | Phaser | 4.1.0 | Board rendering, canvas overlay |
| State | Zustand | 5.0.12 | No persist middleware, no middleware at all |
| Animation | Framer Motion | 12.38.0 | UI animations only |
| Icons | Lucide React | 1.14.0 | — |
| Realtime | Socket.IO (client + server) | 4.8.1 | Room-based, reconnect via player token |
| Server | Express | 5.1.0 | Minimal — Socket.IO attachment only |
| Dev runner | tsx | 4.19.0 | `tsx watch` for server dev |
| Test | Vitest | 4.1.5 | globals: true |
| Test env | jsdom | 29.1.1 | Client tests only |
| Test UI | @testing-library/react | 16.3.2 | setup at `src/tests/setup.ts` |
| Monorepo | npm workspaces | — | 4 packages |

**Critical version constraints:**
- Vite pre-bundles: `phaser`, `zustand`, `framer-motion` — new large deps may need the same
- Socket.IO client: `autoConnect: false`, `reconnection: true`, `reconnectionAttempts: 10`, `reconnectionDelay: 3000`
- Server env vars: `PORT`, `CORS_ORIGIN`, `TURN_TIMEOUT_MS` (all have defaults). No `.env` committed.
- Server state is **in-memory only** — restart = total game loss. Do not design features that assume persistence.

---

## ESM & TypeScript Rules

### Import Conventions

- **`.js` extension required in ALL intra-package relative imports**, including barrel file re-exports:
  ```ts
  // CORRECT — relative import within same package
  import { gameReducer } from './state/gameReducer.js';
  export { Phase } from './enums.js';           // barrel re-export
  export type { GameState } from './types.js';   // type re-export
  // WRONG
  import { gameReducer } from './state/gameReducer';
  export { Phase } from './enums';
  ```
- **Cross-package imports use bare specifiers** (resolved by workspace `exports` field):
  ```ts
  // CORRECT
  import { Phase } from '@property-tycoon/shared';
  // WRONG — deep path into another package
  import { Phase } from '@property-tycoon/shared/src/enums.js';
  ```
- The `exports` field in each package's `package.json` gates visibility. Only `shared` and `engine` expose `.` — deep imports into another package's internals are forbidden.
- **Client and server packages must NOT create barrel files.** Import by direct path only.

### `verbatimModuleSyntax` Enforcement

- **`import type` is mandatory for type-only imports.**
- **Never mix types and values in a single import statement** — split them:
  ```ts
  // WRONG
  import { GameState, gameReducer } from './reducer.js';
  // CORRECT
  import type { GameState } from './reducer.js';
  import { gameReducer } from './reducer.js';
  ```
- **`enum` imports are VALUE imports** — `enum` emits a JS object at runtime:
  ```ts
  // CORRECT — Phase is a runtime enum object
  import { Phase } from '@property-tycoon/shared';
  // WRONG — import type erases it, runtime access fails
  import type { Phase } from '@property-tycoon/shared';
  ```
- **`as const` objects are values, not types** — use `import { ... }`, not `import type`.
- **`export type` required for type-only re-exports** in barrel files.

### ESM Runtime Gotchas

- **No CommonJS globals**: `__dirname`, `__filename`, `require`, `module`, `exports` are all `undefined`.
  - Use `import.meta.dirname` (Node 20.11+) or `path.dirname(fileURLToPath(import.meta.url))`
  - Use dynamic `await import()` — note it returns a Promise, so `await` is required
- **`node:` protocol prefix required for builtins**:
  ```ts
  import { readFileSync } from 'node:fs';
  import { fileURLToPath } from 'node:url';
  // NOT: import ... from 'fs';
  ```
- `import.meta.url` is a `file://` URL — convert with `fileURLToPath()` before using with `path.join`.

### Type Conventions

- `interface` for object shapes (`Player`, `GameState`, `BoardTile`)
- `enum` for phases, tile types, property groups, property kinds, card effects
- `type` for unions and aliases (`PlayerId = string`, `Money = number`)
- `as const` for readonly constants (`BUILDING_LIMITS = { house: 4, hotel: 1 } as const`)

---

## State Management Rules (Zustand + EventBus + Phaser)

### Store Architecture

- **Two stores**: `useGameStore` (game state + mode + network) and `useUIStore` (modals, inspection, animations)
- **No middleware** — no `persist`, no devtools. Save/load handled separately via `gameStorage.ts` (versioned schema).
- **Dual-mode dispatch**: `mode` field in `useGameStore` controls routing:
  - `offline` → call `gameReducer(state, action)` locally
  - `online` → send action via `NetworkManager.sendAction()` → receive `gameStateUpdate` from server

### Mode Transition (Critical)

- **Mode transition must be atomic or use 3-state**: `'offline' | 'connecting' | 'online'`.
- Dispatch must never silently drop. Guard: if `mode === 'online' && !networkManager`, throw or queue — do NOT use optional chaining that drops the action.
- `setMode` must not leave a window where `mode === 'online'` but `networkManager` is `null`.

### Zustand Selectors

- **Always select minimal leaf values** — never `useGameStore(s => s.state)`:
  ```ts
  // WRONG — re-renders on every dispatch
  const state = useGameStore(s => s.state);
  // CORRECT — minimal leaf
  const cash = useGameStore(s => s.state.players[0].cash);
  // CORRECT — object selector with shallow
  import { useShallow } from 'zustand/react/shallow';
  const { cash, position } = useGameStore(useShallow(s => ({
    cash: s.state.players[0].cash,
    position: s.state.players[0].position,
  })));
  ```

### EventBus Rules

- **React components must NEVER call `eventBus.on()` directly.** Use a `useEventSubscription(event, handler)` custom hook that returns the unsubscribe function from `useEffect` cleanup.
- Every `eventBus.on()` call in non-React code must store the unsubscribe return value and call it at teardown.
- EventBus wraps each handler in try/catch — a failing handler does not block others.
- Event keys are colon-namespaced: `'state:changed'`, `'phase:transition'`, `'animation:enqueue'`, `'tile:clicked'`. New events must be added to the `GameEventMap` type.

### Phaser-React Bridge

- React renders UI **overlays on top of Phaser canvas** — not inside Phaser.
- `Board` component creates `new Phaser.Game()` in `useEffect` — cleanup must call `game.destroy(true)`.
- `PhaserBridge` is a **static class** singleton. `initialize()` stores `this.game`.
- **`PhaserBridge.destroy()` MUST unsubscribe all EventBus handlers** registered in `initialize()`. Store handler refs and call `eventBus.off()` — otherwise handlers leak and double-fire on remount.
- **React Compiler must NOT run on components reading Zustand state via selectors** — it can over-optimize and skip re-renders when selectors return new references with identical content.

### Animation & State Transitions

- **UIStore must maintain an `animationQueue: AnimationEvent[]`** — not scalar fields. Server updates enqueue animations; a drain mechanism processes one-at-a-time. Rapid `gameStateUpdate` events must not overwrite in-progress animation state.
- **`lastPurchaseId` belongs in UIStore, NOT GameState.** It is a UI-only concern (celebration trigger). Derive from state diff (`prev` vs `next` in `state:changed`) or track as a UI-side effect.
- **`LOAD_GAME` and `setFullState` must set an `isTransitioning` guard**: abort running Phaser animations, wait for scene sync, then allow new actions. No user input accepted while transitioning.
- **`setFullState` in online mode must clear/drain any pending optimistic updates** — the server is the source of truth.

### GameState Correctness

- **Every new `GameState` field requires a corresponding `GameAction` type and reducer branch in the same PR.** Orphan fields compile but silently produce no state change at runtime.
- Game state is immutable — all rule functions return new state via spread operators.
- Rule functions return original `state` on guard failure — never throw, never return `undefined`.
- `assertGameInvariants()` logs warning, does not throw. Called at end of every reducer call.

---

## Server & Multiplayer Rules (Socket.IO + Express)

### Authentication & Security

- **Socket authentication middleware**: `io.use(...)` must authenticate on initial connection (JWT or session token). Unauthenticated sockets disconnected immediately.
- **Join validation**: `joinRoom` must verify the requesting player is authorized for that `roomId` — not just that the room exists. Use a room-specific join token or pre-registered player list.
- **Schema-validate all incoming payloads** — use Zod to validate every `playerAction`, `joinRoom`, `createRoom` payload before any state mutation. Invalid payloads return `{ message: string, code?: string }`.
- **Server-authoritative model**: clients send intentions (`{ type: 'playCard', cardId: 'X', target: 'Y' }`), server computes and broadcasts results. Never accept client-pushed state snapshots.

### Turn & Action Handling

- **Per-room action serialization**: incoming `playerAction` events must be queued while the auto-phase `while` loop runs. Use a per-room mutex/queue — no action handler runs mid phase-transition.
- **Explicit rejection for wrong-turn actions**: if `socket.playerId !== state.currentPlayerId`, respond with error — do not silently ignore.
- **Turn timeout enforcement**: start a timer when a turn begins using `TURN_TIMEOUT_MS`. Auto-skip the player when it fires, broadcast the skip.
- **Use Socket.IO acknowledgments** for critical events (`createRoom`, `joinRoom`, `playerAction`) — callback-style emits so the client knows the server processed or rejected the action.

### Disconnect & Reconnect

- **Reconnect protocol**: socket ID changes on reconnect. Implement a `reconnect` event sending a player-scoped token (not socket ID). Server verifies against room's active player roster before restoring state.
- **Disconnection timeout**: configurable timer (e.g., 30s). If player reconnects within window, restore state. If not: pause, remove player + redistribute assets, or substitute AI — document per game mode. Never leave games in half-dead state.
- **Abandoned room garbage collection**: rooms where all players disconnected past timeout must be deleted from memory. Hook into final disconnect or run periodic sweep.

### CORS & Configuration

- **Dual CORS configuration**: Express and Socket.IO each maintain independent CORS configs. Both must be set to the same `CORS_ORIGIN`:
  ```ts
  app.use(cors({ origin: process.env.CORS_ORIGIN }));
  io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });
  ```
  Mismatched configs cause Express routes to work while Socket.IO handshakes fail (or vice versa).

### Event Naming

- Server events are camelCase: `'createRoom'`, `'joinRoom'`, `'playerAction'`, `'roomCreated'`, `'joinedSuccess'`, `'gameStateUpdate'`, `'gameEvent'`, `'gameStarted'`, `'gameOver'`, `'actionError'`, `'playerJoined'`, `'playerLeft'`, `'playerList'`, `'assignedPlayerId'`.
- Room-based broadcasting: `io.to(roomId).emit(...)`, `socket.to(roomId).emit(...)`.
- Each socket joins a room via `socket.join(roomId)`.

---

## Framework-Specific Rules (React + Phaser)

### React

- Components: PascalCase named exports (`export const AuctionModal: React.FC = ...`)
- **No Redux, no Context API** — state flows through Zustand + EventBus only.
- React 19 `useActionState` is not applicable — dispatch is through Zustand, not server actions.

### Phaser

- Scenes: PascalCase classes extending `Phaser.Scene` (`BoardScene`, `PreloaderScene`)
- Sprites: PascalCase (`TileSprite`, `TokenSprite`, `DiceSprite`, `BuildingSprite`)
- Scenes emit events; React listens via EventBus (not direct Phaser events)
- Phaser chunk is large — Vite chunk size warning limit raised to 1000 KB. Don't add heavy dependencies on top.

---

## Testing Rules

- **Vitest with `globals: true`** — `describe`, `it`, `expect` are global.
- **Test file naming**: `*.test.ts` — sibling to source in `shared`, in `src/tests/` directory for `engine`/`client`.
- **Structure**: `describe('Module Name', () => { it('should ...', () => { ... }) })`.
- **Mock game states built inline** — minimal `GameState` objects with only needed fields, `as Property` type assertions.
- **Tests import from source paths directly**: `import { payRent } from '../rules/rentRules'`.
- Client tests: `jsdom` environment, `@testing-library/react`, setup at `src/tests/setup.ts`.
- Engine/server: Node default environment, `--passWithNoTests`.
- Config sanity tests validate constant ranges (e.g., `MORTGAGE_RATE` between 0 and 1).

---

## Code Quality & Style Rules

### ESLint

- Client only has config: `eslint.config.js` flat config with `@eslint/js`, `typescript-eslint`, `react-hooks`, `react-refresh`.
- No ESLint config in `shared`, `engine`, or `server`.
- Root `"lint": "eslint ."` likely only works with client config.

### Naming Conventions

- **PascalCase for ALL source files**: `StateMachine.ts`, `AuctionModal.tsx`, `useGameStore.ts`, `rentRules.ts`
- **kebab-case only in npm package names**: `@property-tycoon/client`
- React components: PascalCase named exports
- Rule functions: camelCase (`buyProperty`, `payRent`, `canMortgage`)
- Boolean guards: `can*` prefix (`canMortgage`, `canUnmortgage`, `canSellBuilding`)
- EventBus keys: colon-namespaced (`state:changed`, `phase:transition`, `tile:clicked`)
- Socket events: camelCase (see Server section above)

### File Organization

- `shared/` — flat (`types.ts`, `constants.ts`, `StateMachine.ts`, `index.ts`)
- `engine/` — layered (`state/`, `rules/`, `data/`, `utils/`, `tests/`)
- `server/` — flat (`index.ts`, `SocketHandler.ts`, `RoomManager.ts`, `Config.ts`, `types.ts`)
- `client/` — by UI layer (`app/`, `core/`, `config/`, `phaser/`, `ui/`, `storage/`, `tests/`)

### Documentation

- Minimal inline comments — code is self-documenting.
- No JSDoc convention observed.

---

## Development Workflow Rules

- **npm workspaces** — 4 packages: `shared`, `engine`, `server`, `client`.
- **Scripts**:
  - `npm run dev` → client only (Vite)
  - `npm run dev --workspace=@property-tycoon/server` → `tsx watch`
  - `npm run build` → all workspaces
  - `npm run test` → all workspaces
- `.gitignore` excludes `.env*`, `dist/`, `node_modules/`.

---

## Critical Anti-Patterns & Edge Cases

### MUST NOT Do

1. **Never mutate game state directly** — all rule functions return new state via spread.
2. **Don't add inline phase guards** — new valid transitions go in `TRANSITIONS` array in `phaseMachine.ts`, not new `if (state.phase !== X) return state` checks.
3. **Don't use Redux or Context API** — Zustand + EventBus only.
4. **Don't add `.env` files** — server uses env vars with defaults.
5. **Don't localize game logs to English** — `GAME_LOG.*` factory functions produce Vietnamese text. Do not "correct" these.
6. **Don't assume 40-tile board** — this project has **48 tiles (indices 0-47)**.
7. **Don't use standard Monopoly building names** — Vietnamese domain-specific:
   - Level 0: "Dat trong"
   - Level 1: "Nha pho"
   - Level 2: "Shophouse"
   - Level 3: "Chung cu mini"
   - Level 4: "Cao oc"
   - Level 5: "Landmark"
8. **Don't create barrel files in `client` or `server`** — only `shared` and `engine` may have them.
9. **Don't enable React Compiler on Zustand-selector components** — it over-optimizes and skips re-renders.

### Edge Cases

- `DEBUG_ADD_CASH` and `TELEPORT_PLAYER` are valid from ALL phases — don't guard them.
- `GameController` validates via `phaseMachine.canTransition()` before calling reducer — this is the authority, not inline guards.
- Server auto-phases via `while` loop — client relies entirely on server-pushed state in online mode.
- Board has 48 tiles, not 40. `TILE_NAMES` constant in `shared/constants.ts` covers all 48 positions.
- `lastPurchaseId` is a UI-only flag (belongs in UIStore) for purchase celebration animations — diff `prev` vs `next` in `state:changed` to detect purchases.

### Performance Gotchas

- Phaser chunk is large — don't add heavy dependencies without adding to Vite pre-bundle list.
- Zustand `useGameStore(s => s.state)` causes full re-render on every dispatch — always select minimal leaf or use `useShallow`.
- EventBus handler leaks from `PhaserBridge.initialize()` without unsubscribe on `destroy()` — double-fires handlers on remount.
- Rapid server `gameStateUpdate` events overwrite scalar animation fields — use an `animationQueue` with drain mechanism.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge or conventions change.
- Rules marked "Critical" or "MUST NOT" are non-negotiable — violations will cause runtime errors or architectural drift.
- Code examples showing CORRECT/WRONG patterns should be followed verbatim for structure.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when technology stack or conventions change.
- Review quarterly for outdated rules — remove rules that become obvious over time.
- Each rule should prevent a specific mistake — if no mistake is being prevented, delete the rule.
- New rules should be added only when an AI agent makes a mistake that existing rules don't cover.

Last Updated: 2026-05-16
