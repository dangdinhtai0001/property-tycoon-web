# Codebase Refactor Design Spec
**Date:** 2026-05-04  
**Project:** property-tycoon-web  
**Branch strategy:** New branch rewrite — existing codebase is reference only  
**Status:** Approved baseline

---

## 1. Goals

Rewrite the Property Tycoon Web codebase on a new branch with four equal goals:

1. **Configuration centralization** — all asset paths, gameplay parameters, UI constants, audio keys, and user-facing strings extracted into domain-split config files; no hardcoded values scattered through implementation files
2. **Architecture formalization** — explicit state machine for game phases; unified typed event bus replacing the current mix of Zustand subscriptions and Phaser `game.events`
3. **Web performance** — sprite atlas, image compression, lazy-loaded Phaser chunk, deferred audio, removal of unused dependencies; target: fast initial load + 30 FPS stable on low-end mobile
4. **Maintainability** — oversized files split, module README files added, all exports documented with JSDoc, module boundary rules enforced

**Hard constraints:**
- Zero gameplay logic changes
- Zero visual/UX changes
- All 14 game phases preserved exactly
- Existing unit tests remain valid after path updates

---

## 2. Non-Goals

- No new gameplay features, rules, or game modes
- No new UI screens or modals (file splits only)
- No multiplayer / networking
- No PWA / service worker / offline support
- No i18n framework (strings centralized but no locale switching)
- No new audio implementation (structure prepared, playback not added if absent in MVP)
- No visual redesign
- No new characters or board layout changes
- No Three.js / R3F usage — removed entirely
- No CI/CD changes
- No backend / server-side changes

---

## 3. Overall Architecture

### Layer Model (unchanged)

```
┌─────────────────────────────────────────────┐
│  React UI Layer  (src/ui/)                  │
│  Panels, Modals, Screens, Animations        │
├─────────────────────────────────────────────┤
│  State Layer  (src/app/store/)              │
│  useGameStore · useUIStore · useAnimQueue   │
│    ↕ EventBus                               │
│  Game Engine  (src/game-engine/)            │
│  Pure TS: gameReducer + StateMachine        │
├─────────────────────────────────────────────┤
│  Phaser Layer  (src/phaser/)                │
│  Canvas board, token animation, dice        │
│  Connected via EventBus (not Zustand)       │
└─────────────────────────────────────────────┘
         ↑ all layers read from ↓
┌─────────────────────────────────────────────┐
│  Config Layer  (src/config/)                │
│  assets · gameplay · ui · audio · text      │
├─────────────────────────────────────────────┤
│  Core Layer  (src/core/)                    │
│  EventBus · StateMachine · ObjectPool       │
└─────────────────────────────────────────────┘
```

### Directory Structure

```
src/
├── config/
│   ├── assets.ts
│   ├── gameplay.ts
│   ├── ui.ts
│   ├── audio.ts
│   └── text.ts
├── core/
│   ├── EventBus.ts
│   ├── StateMachine.ts
│   ├── ObjectPool.ts
│   └── animationSubscriber.ts
├── game-engine/
│   ├── types/game.ts
│   ├── state/
│   │   ├── gameReducer.ts
│   │   ├── phaseMachine.ts          ← NEW
│   │   └── setupGame.ts
│   ├── data/
│   │   ├── boards/basicBoard.ts
│   │   ├── cards.ts
│   │   └── characters.ts
│   ├── rules/
│   └── utils/boardGeometry.ts
├── app/
│   └── store/
│       ├── useGameStore.ts
│       ├── useUIStore.ts            ← NEW
│       └── useAnimationQueue.ts
├── phaser/
│   ├── GameConfig.ts
│   ├── bridge/PhaserBridge.ts
│   ├── scenes/
│   │   ├── PreloaderScene.ts
│   │   └── BoardScene.ts
│   ├── sprites/
│   │   ├── TileSprite.ts
│   │   ├── TokenSprite.ts
│   │   ├── DiceSprite.ts
│   │   └── BuildingSprite.ts
│   └── pool/
│       ├── TokenSpritePool.ts       ← NEW
│       └── BuildingSpritePool.ts   ← NEW
├── ui/
│   ├── screens/
│   │   ├── SetupGameScreen.tsx
│   │   ├── setup/
│   │   │   ├── PlayerConfigRow.tsx  ← NEW (split)
│   │   │   ├── CharacterPicker.tsx  ← NEW (split)
│   │   │   ├── GameOptions.tsx      ← NEW (split)
│   │   │   └── SaveSlotLoader.tsx   ← NEW (split)
│   │   ├── MainMenu.tsx
│   │   └── EndGameScreen.tsx
│   ├── panels/
│   │   ├── ActionPanel.tsx
│   │   ├── actions/
│   │   │   ├── RollDiceAction.tsx   ← NEW (split)
│   │   │   ├── PropertyActions.tsx  ← NEW (split)
│   │   │   ├── TradeActions.tsx     ← NEW (split)
│   │   │   └── JailActions.tsx      ← NEW (split)
│   │   ├── PlayerListPanel.tsx
│   │   ├── CurrentTilePanel.tsx
│   │   ├── GameLogPanel.tsx
│   │   └── QuickGuidePanel.tsx
│   ├── modals/
│   ├── animation/
│   │   ├── DiceRollAnimation.tsx
│   │   ├── dice/
│   │   │   ├── DiceFace.tsx         ← NEW (split)
│   │   │   └── DiceRollSequence.tsx ← NEW (split)
│   │   ├── MoneyGainEffect.tsx
│   │   ├── MoneyLossEffect.tsx
│   │   ├── MoneyEffectPool.ts       ← NEW
│   │   ├── ParticleSystem.tsx
│   │   ├── ParticlePool.ts          ← NEW
│   │   ├── PurchaseCelebration.tsx
│   │   └── BuildingCelebration.tsx
│   └── shared/
│       └── CharacterSprite.tsx
├── storage/
│   └── gameStorage.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

## 4. Module Boundary Rules

| Module | Depends On | Must NOT Import |
|--------|-----------|-----------------|
| `config/` | nothing | anything in `src/` |
| `core/` | `config/` only | game-engine, UI, Phaser, Zustand |
| `game-engine/` | `config/gameplay.ts`, `config/text.ts`, `core/StateMachine.ts` | React, Phaser, Zustand |
| `app/store/` | `game-engine/`, `core/EventBus.ts`, `storage/` | Phaser, `ui/` |
| `phaser/` | `core/EventBus.ts`, `core/ObjectPool.ts`, `config/assets.ts`, `config/ui.ts` | React, Zustand, `game-engine/rules/` |
| `ui/` | `config/text.ts`, `config/ui.ts`, `core/EventBus.ts`, `app/store/` | Phaser, `game-engine/rules/`, `core/StateMachine.ts` |
| `storage/` | `config/gameplay.ts` | all other src modules |

---

## 5. Config Layer (`src/config/`)

All config files are pure typed constants — no functions, no imports from `src/`.

### `config/assets.ts`
```typescript
CHARACTER_SPRITES: Record<CharacterId, {
  path: string
  frameWidth: number
  frameHeight: number
  frameCount: number
}>
BACKGROUND_IMAGES: { mainMenu: string; board: string }
TILE_CARD_BACKS: { chance: string; fortune: string }
AUDIO_FILES: Record<AudioKey, string>
ICON_SVG_PATH: string
```

### `config/gameplay.ts`
```typescript
STARTING_CASH: number
PASS_START_BONUS: number
JAIL_FINE: number
MAX_JAIL_TURNS: number
BUILDING_LIMITS: { house: number; hotel: number }
AUCTION_MIN_BID: number
AUCTION_BID_INCREMENT: number
MORTGAGE_RATE: number          // fraction of property price, e.g. 0.5
UNMORTGAGE_RATE: number        // e.g. 0.55
GROUP_RENT_MULTIPLIER: number  // e.g. 2 (monopoly doubles rent)
INITIAL_DICE_COUNT: number
SAVE_STORAGE_KEY: string       // localStorage key prefix
```

### `config/ui.ts`
```typescript
CANVAS_WIDTH: number           // 1940
CANVAS_HEIGHT: number          // 1380
ASPECT_RATIO: number           // CANVAS_WIDTH / CANVAS_HEIGHT
ANIMATION_DURATIONS: {
  diceRoll: number
  tokenMove: number
  moneyFloat: number
  cardReveal: number
}
Z_INDICES: { board: number; overlay: number; modal: number; toast: number }
TILE_COLORS: Record<TileGroup, string>   // replaces theme/tokens.ts
PLAYER_COLORS: string[]
FONT_SIZES: { sm: number; md: number; lg: number; xl: number }
```
> `src/ui/theme/tokens.ts` is deleted; all values move here.

### `config/audio.ts`
```typescript
AUDIO_KEYS: Record<string, string>
DEFAULT_VOLUME: { music: number; sfx: number }
MUTE_DEFAULT: boolean
```

### `config/text.ts`
```typescript
UI_LABELS: Record<string, string>        // rollDice, buyProperty, buildHouse, …
MODAL_TITLES: Record<string, string>     // auction, trade, debtResolution, …
GAME_LOG_TEMPLATES: Record<ActionType, (params: unknown) => string>
CARD_TEXTS: Record<CardId, { title: string; description: string }>
TILE_NAMES: Record<number, string>       // index → Vietnamese tile name
ERROR_MESSAGES: Record<string, string>
```
> Card text and tile name strings move here from `cards.ts` and `basicBoard.ts`.

---

## 6. Core Infrastructure (`src/core/`)

### `EventBus.ts`

Typed singleton pub/sub. All cross-layer communication routes through this bus.

```typescript
type GameEventMap = {
  'state:changed':     { prev: GameState; next: GameState }
  'phase:transition':  { from: Phase; to: Phase }
  'animation:enqueue': AnimationEvent
  'tile:clicked':      { tileIndex: number }
  'phaser:ready':      void
  'phaser:error':      { reason: string }
}

interface IEventBus {
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void
  on<K extends keyof GameEventMap>(event: K, handler: (payload: GameEventMap[K]) => void): () => void
  off<K extends keyof GameEventMap>(event: K, handler: (payload: GameEventMap[K]) => void): void
}
```

- Handlers are wrapped in try/catch internally — a failing handler does not crash the bus or other handlers
- Errors from handlers are logged but not re-thrown
- `on()` returns an unsubscribe function

**Cross-layer wiring:**
- `useGameStore.dispatch()` → emits `state:changed` and `phase:transition`
- `PhaserBridge` → subscribes to `state:changed` (replaces Zustand `subscribe`)
- `animationSubscriber` → subscribes to `state:changed`, enqueues animation events
- `TileSprite` → emits `tile:clicked` via BoardScene → PhaserBridge
- `PreloaderScene` → emits `phaser:ready` / `phaser:error`
- `App.tsx` → subscribes to `phaser:error` to show fallback UI

### `StateMachine.ts`

Explicit transition table engine for game phases.

```typescript
type Transition<TPhase, TAction> = {
  from: TPhase | TPhase[]
  action: TAction
  to: TPhase
  guard?: (state: GameState) => boolean        // optional condition — must be true to allow
  onEnter?: (state: GameState) => GameState    // optional state transform on entry
}

interface IStateMachine<TPhase, TAction> {
  /** Returns the target phase, or null if the transition is invalid */
  transition(current: TPhase, action: TAction, state: GameState): TPhase | null
  /** Returns true if the transition is valid given current state */
  canTransition(current: TPhase, action: TAction, state: GameState): boolean
}
```

`gameReducer` replaces its phase-update `switch` logic with `machine.transition()`.  
All 14-phase graph definitions live in `state/phaseMachine.ts` as a `TRANSITIONS: Transition[]` array.  
Invalid transitions return `null`; `gameReducer` treats `null` as a no-op with a dev-only `console.warn`.

### `ObjectPool.ts`

Generic pool for frequently spawned/destroyed objects.

```typescript
interface PooledObject {
  reset(): void      // called when object is returned to pool
  activate(): void   // called when object is taken from pool
}

class ObjectPool<T extends PooledObject> {
  /** factory: creates new instances; initialSize: pre-allocated count */
  constructor(factory: () => T, initialSize: number)
  /** Returns an available instance (creates new if exhausted — soft cap) */
  acquire(): T
  /** Returns instance to pool and calls reset() */
  release(obj: T): void
  /** Returns all active instances to pool */
  releaseAll(): void
  readonly size: number
  readonly available: number
}
```

Pool instances:

| Pool | File | initialSize | Rationale |
|------|------|-------------|-----------|
| `MoneyEffectPool` | `ui/animation/MoneyEffectPool.ts` | 10 | Max concurrent floaters |
| `ParticlePool` | `ui/animation/ParticlePool.ts` | 20 | Typical burst size |
| `BuildingSpritePool` | `phaser/pool/BuildingSpritePool.ts` | 40 | 10 buildable tiles × 4 max buildings |
| `TokenSpritePool` | `phaser/pool/TokenSpritePool.ts` | 6 | Max players |

### `animationSubscriber.ts`

Replaces `MoneyWatcher.tsx` and `BuildingWatcher.tsx`. Initialized once in `App.tsx` on mount.

```typescript
/** Sets up EventBus listeners that detect state deltas and enqueue animation events */
function initAnimationSubscriber(): () => void  // returns cleanup function
```

Detects: cash delta per player → enqueue `MoneyGain`/`MoneyLoss`; building delta per property → enqueue `BuildingCelebration`.

---

## 7. Game Engine Layer (`src/game-engine/`)

**No logic changes. No file moves. Internal values only.**

| File | Change |
|------|--------|
| `data/boards/basicBoard.ts` | Tile name strings → `config/text.ts`; retains: index, group, price, rent levels, tile type |
| `data/cards.ts` | Card title/description strings → `config/text.ts`; retains: id, type, amount, targetIndex |
| `data/characters.ts` | Sprite paths, frameWidth, frameHeight → `config/assets.ts`; retains: id, displayName |
| `state/setupGame.ts` | `STARTING_CASH`, initial dice → `config/gameplay.ts` |
| `state/gameReducer.ts` | Phase transitions → `StateMachine.transition()` calls; imports `phaseMachine.ts` |
| `state/phaseMachine.ts` | **NEW** — `TRANSITIONS: Transition[]` array for all 14 phases; pure data, no logic |
| `rules/*.ts` | Magic numbers (mortgage rate, multiplier, jail fine, etc.) → `config/gameplay.ts` |
| `types/game.ts` | Unchanged |
| `utils/boardGeometry.ts` | Unchanged |

Existing test files remain valid after updating config import paths.

---

## 8. State & Store Layer (`src/app/store/`)

### `useGameStore.ts`
- Owns `GameState` only (game state, not UI state)
- After every `dispatch`: run reducer → emit `state:changed` → if phase changed emit `phase:transition` → auto-save
- `LOAD_GAME` action unchanged

### `useUIStore.ts` (new)
Owns all UI-only state previously mixed into `useGameStore`:
```typescript
{
  showTradeModal: boolean
  inspectedPropertyId: string | null
  pauseOpen: boolean
  saveSlotModalOpen: boolean
  // actions: setInspectedProperty, openTradeModal, closeTradeModal, togglePause
}
```
Benefit: components reading only UI state do not re-render on game state changes.

### `useAnimationQueue.ts`
- API unchanged
- No longer fed by watcher components — fed by `animationSubscriber` via `animation:enqueue` EventBus event

### Deleted
- `MoneyWatcher.tsx` — logic moved to `animationSubscriber.ts`
- `BuildingWatcher.tsx` — logic moved to `animationSubscriber.ts`

---

## 9. Phaser Layer (`src/phaser/`)

### `bridge/PhaserBridge.ts`
- Replaces `useGameStore.subscribe()` with `EventBus.on('state:changed', ...)`
- Replaces internal `game.events.emit('tile-clicked')` with `EventBus.emit('tile:clicked', ...)`
- Emits `EventBus.emit('phaser:ready')` once BoardScene is initialized
- No longer imports Zustand

### `scenes/PreloaderScene.ts`
- All asset keys and paths → `config/assets.ts`
- Preload only critical assets (board bg + selected player sprites); defer card backs and audio to after `phaser:ready`
- Progress bar duration → `config/ui.ts`

### `scenes/BoardScene.ts`
- Canvas dimensions → `config/ui.ts`
- Token/building initialization via pool adapters
- Tracks `dirtyTiles: Set<number>` — only redraws tiles that changed on `state:changed`
- `update()` contains no object allocations

### `sprites/TokenSprite.ts`
- Implements `PooledObject`: `reset()` clears position/state; `activate()` sets player data
- Frame dimensions → `config/assets.ts`; animation timing → `config/ui.ts`

### `sprites/BuildingSprite.ts`
- Implements `PooledObject`
- Pre-allocated pool of 40 instances at scene init

### `sprites/TileSprite.ts`
- All colors → `config/ui.ts`; all label strings → `config/text.ts`; font sizes → `config/ui.ts`

---

## 10. UI Layer (`src/ui/`)

### Global changes (all UI files)
- All user-facing strings → `config/text.ts`
- All colors, font sizes, z-indices, animation durations → `config/ui.ts`
- `ui/theme/tokens.ts` deleted

### File splits

**`SetupGameScreen.tsx`** (22.6 KB → orchestrator + 4 sub-components):
- `SetupGameScreen.tsx` — composes sub-components, owns no local state beyond form orchestration
- `setup/PlayerConfigRow.tsx` — single player name + character picker row
- `setup/CharacterPicker.tsx` — character grid selector
- `setup/GameOptions.tsx` — turn limit, starting cash options
- `setup/SaveSlotLoader.tsx` — load existing save UI

**`panels/ActionPanel.tsx`** (16.9 KB → orchestrator + 4 sub-components):
- `ActionPanel.tsx` — phase-gated action router
- `actions/RollDiceAction.tsx` — roll button + dice state display
- `actions/PropertyActions.tsx` — buy/build/pass/auction actions
- `actions/TradeActions.tsx` — trade initiation UI
- `actions/JailActions.tsx` — pay fine / roll doubles UI

**`animation/DiceRollAnimation.tsx`** (15.3 KB → orchestrator + 2 sub-components):
- `DiceRollAnimation.tsx` — orchestrator
- `animation/dice/DiceFace.tsx` — single die face renderer
- `animation/dice/DiceRollSequence.tsx` — roll sequence timing logic

### Animation pooling
- `MoneyGainEffect.tsx` / `MoneyLossEffect.tsx` → implement `PooledObject`; managed by `MoneyEffectPool.ts`
- `ParticleSystem.tsx` → implement `PooledObject`; managed by `ParticlePool.ts`

### Deleted
- `animation/MoneyWatcher.tsx`
- `animation/BuildingWatcher.tsx`

### `App.tsx`
- UI state reads from `useUIStore` (not `useGameStore`)
- Calls `initAnimationSubscriber()` once on mount
- Subscribes to `EventBus.on('phaser:error', ...)` to show fallback UI

---

## 11. Web Performance Pipeline

### Build-time (Vite config additions)

| Addition | Purpose |
|----------|---------|
| `vite-plugin-spritesmith` (or equivalent) | Combines character sprites + tile icons → single atlas PNG + JSON at build time |
| `vite-imagemin` (or `unplugin-imagemin`) | Compresses all PNGs in `public/assets/` (target: <100 KB each) |
| `manualChunks` (Rollup option) | Splits: `phaser` chunk, `framer-motion` chunk, `vendor` chunk (react + zustand) |
| `assetsInlineLimit: 0` | No base64 inlining |
| Remove unused deps | Delete `three`, `@react-three/fiber`, `@react-three/drei` from `package.json` |

### Runtime loading strategy

```
Phase 1 — Critical (blocks first render):
  React + Zustand + App shell → inline in main chunk
  MainMenu background → <link rel="preload">

Phase 2 — On game start (lazy import):
  Phaser chunk → dynamic import triggered when user clicks "Start Game"
  Character sprites for selected players only → PreloaderScene loads subset

Phase 3 — Deferred (after phaser:ready event):
  Card back images → loaded after BoardScene ready
  Audio files → loaded on first user interaction (browser autoplay policy)
  Non-selected character sprites → not loaded at all
```

### Runtime rules
- `BoardScene.update()` — no object creation, no array allocation per frame
- Token movement path computed once on `state:changed`, stored on `TokenSprite`, consumed frame-by-frame
- Only dirty tiles redrawn (`dirtyTiles: Set<number>` tracked per state change)
- Separate Zustand stores (`useGameStore` / `useUIStore`) prevent unnecessary cross-concern re-renders
- Animation floaters capped at 10 concurrent via `MoneyEffectPool`

### Browser targets
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: Android Chrome mid-range (Snapdragon 665 class), iOS Safari 14+
- Performance floor: 60 FPS desktop, 30 FPS stable low-end mobile
- No WebGL 2 requirement — Phaser `AUTO` renderer with Canvas 2D fallback

### Bundle size targets
- Main chunk: < 200 KB gzipped
- Phaser chunk: < 500 KB gzipped

---

## 12. Error Handling

| Boundary | Handling |
|----------|---------|
| Config layer | TypeScript compile-time via `satisfies` constraints — no runtime handling needed |
| Game engine / StateMachine | Invalid transitions return `null` → reducer no-ops + `console.warn` in dev mode only |
| EventBus handlers | Wrapped in try/catch internally; errors logged, not re-thrown; other handlers unaffected |
| Phaser asset load failure | `PreloaderScene` emits `phaser:error`; `App.tsx` shows "Failed to load. Please refresh." UI |
| Storage / localStorage | Wrapped in try/catch; load failure returns `null`; corrupt save detected via version field → "Save incompatible" message + start-fresh option |
| React render errors | Single `ErrorBoundary` in `main.tsx`; shows "Something went wrong" + reload button |
| ObjectPool exhausted | Creates new instance (soft cap); logs warning in dev mode for pool size tuning |

---

## 13. Documentation Standards

### Module READMEs
Every module folder (`config/`, `core/`, `game-engine/`, `phaser/`, `ui/`, `storage/`, `app/`) gets a `README.md` containing:
- **Purpose** — what the module does in one paragraph
- **Public API** — exported symbols consumers should use
- **Depends on** — what it imports from other modules
- **Must NOT be imported by** — boundary enforcement in plain language

### Code comments
- Every exported function, class, and type gets a JSDoc `/** */` comment covering: purpose, params, return value
- Non-obvious logic inside functions gets an inline `//` comment explaining *why* (not *what*)
- Every config constant gets an inline `//` comment explaining its effect and where it is consumed
- State machine transitions get comments explaining the guard condition in plain language
- Pool `initialSize` values are commented with the rationale (e.g., `// 40 = 10 buildable tiles × 4 max buildings`)

---

## 14. Testing

### Existing tests (unchanged)
- `game-engine/tests/rentRules.test.ts`
- `game-engine/tests/movementRules.test.ts`

Only import paths for config values update; test logic is identical.

### New tests required

| Test file | Coverage |
|-----------|----------|
| `core/StateMachine.test.ts` | Valid transitions succeed; invalid return null; guards fire correctly |
| `core/EventBus.test.ts` | Emit/subscribe/unsubscribe; failing handler doesn't break others |
| `core/ObjectPool.test.ts` | acquire/release cycle; exhausted pool returns new instance; `reset()` called on release |
| `config/gameplay.test.ts` | Sanity checks: `STARTING_CASH > 0`, `JAIL_FINE > 0`, `MORTGAGE_RATE` in (0, 1) |
| `app/store/useGameStore.test.ts` | After `dispatch`, EventBus receives `state:changed` with correct prev/next |
| `app/store/useUIStore.test.ts` | UI state mutations don't trigger game store re-renders |

### Coverage target
- 80% on `game-engine/` and `core/` modules
- UI components excluded from coverage requirement

### Manual verification checklist
- [ ] All 14 phase transitions reachable via normal gameplay
- [ ] Dice → movement → tile resolution → action → end turn loop works end-to-end
- [ ] Save/load round-trip preserves full `GameState`
- [ ] Sprite atlas loads with no missing texture errors in console
- [ ] `three` / `@react-three/fiber` absent from build output
- [ ] Main chunk < 200 KB gzipped; Phaser chunk < 500 KB gzipped
- [ ] 30 FPS stable on Chrome DevTools low-end mobile emulation
