# Codebase Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the property-tycoon-web codebase on a new branch with centralized config, a unified EventBus, an explicit phase StateMachine, object pooling, and web performance optimizations — without changing any gameplay logic or visuals.

**Architecture:** The existing three-layer architecture (game-engine / store / Phaser / React UI) is preserved. Two new foundational layers are added beneath everything: `src/config/` (pure typed constants) and `src/core/` (EventBus, StateMachine, ObjectPool). All cross-layer communication migrates from a mix of Zustand subscriptions + Phaser `game.events` to a single typed EventBus singleton.

**Tech Stack:** TypeScript 6, React 19, Phaser 4, Zustand 5, Vite 8, Vitest 4, Framer Motion 12, Tailwind CSS 4.

---

## Assumptions

1. Work is done on a new git branch (`refactor/clean-architecture`) branched from the current `main`.
2. The existing `src/` is the reference implementation — copy logic, change structure.
3. `vitest` is the test runner (`npm test`). All new tests use Vitest + `@testing-library/react` where needed.
4. `vite-plugin-spritesmith` is evaluated for atlas generation; if it lacks Phaser 4 JSON support, `vite-plugin-texture-packer` or `free-tex-packer-core` is used instead (research in Task 15).
5. `unplugin-imagemin` is the compression plugin (supports Vite 8).
6. The `AnimationEvent` type is imported from `src/app/store/useAnimationQueue.ts` in `core/EventBus.ts` to avoid circular imports — EventBus imports only from `config/` and `game-engine/types/`.
7. `GAME_LOG_TEMPLATES` in `config/text.ts` uses per-action typed overloads resolved during Task 4 (the type is narrowed to `(params: Record<string, unknown>) => string` at the config boundary).
8. `tokenAnimState` (`idle | run | win | sad`) stays in `useUIStore` since it is pure UI state not needed by the game engine.

---

## File Map

### Created (new files)

| File | Role |
|------|------|
| `src/config/assets.ts` | All asset paths and sprite metadata |
| `src/config/gameplay.ts` | All gameplay numeric parameters |
| `src/config/ui.ts` | Canvas dims, animation durations, colors, z-indices, fonts |
| `src/config/audio.ts` | Audio keys and volume defaults |
| `src/config/text.ts` | All user-facing strings, log templates, card texts, tile names |
| `src/core/EventBus.ts` | Typed singleton pub/sub |
| `src/core/StateMachine.ts` | Transition table engine |
| `src/core/ObjectPool.ts` | Generic object pool |
| `src/core/animationSubscriber.ts` | Detects state deltas, enqueues animations via EventBus |
| `src/game-engine/state/phaseMachine.ts` | TRANSITIONS array for all 14 phases |
| `src/app/store/useUIStore.ts` | UI-only Zustand store (split from useGameStore) |
| `src/phaser/pool/TokenSpritePool.ts` | ObjectPool adapter for TokenSprite |
| `src/phaser/pool/BuildingSpritePool.ts` | ObjectPool adapter for BuildingSprite |
| `src/ui/screens/setup/PlayerConfigRow.tsx` | Split from SetupGameScreen |
| `src/ui/screens/setup/CharacterPicker.tsx` | Split from SetupGameScreen |
| `src/ui/screens/setup/GameOptions.tsx` | Split from SetupGameScreen |
| `src/ui/screens/setup/SaveSlotLoader.tsx` | Split from SetupGameScreen |
| `src/ui/panels/actions/RollDiceAction.tsx` | Split from ActionPanel |
| `src/ui/panels/actions/PropertyActions.tsx` | Split from ActionPanel |
| `src/ui/panels/actions/TradeActions.tsx` | Split from ActionPanel |
| `src/ui/panels/actions/JailActions.tsx` | Split from ActionPanel |
| `src/ui/animation/dice/DiceFace.tsx` | Split from DiceRollAnimation |
| `src/ui/animation/dice/DiceRollSequence.tsx` | Split from DiceRollAnimation |
| `src/ui/animation/MoneyEffectPool.ts` | ObjectPool for money floater effects |
| `src/ui/animation/ParticlePool.ts` | ObjectPool for particles |
| `src/core/README.md` | Module README |
| `src/config/README.md` | Module README |
| `src/game-engine/README.md` | Module README |
| `src/phaser/README.md` | Module README |
| `src/ui/README.md` | Module README |
| `src/app/README.md` | Module README |
| `src/storage/README.md` | Module README |

### Modified (existing files)

| File | Change |
|------|--------|
| `src/game-engine/data/boards/basicBoard.ts` | Tile name strings → `config/text.ts`; `MORTGAGE_RATIO` → `config/gameplay.ts` |
| `src/game-engine/data/cards.ts` | Card text strings → `config/text.ts` |
| `src/game-engine/data/characters.ts` | Sprite paths/dims → `config/assets.ts`; retains id + displayName |
| `src/game-engine/state/setupGame.ts` | `startingCash: 1500`, `passStartBonus: 200` → `config/gameplay.ts` |
| `src/game-engine/state/gameReducer.ts` | Phase guard `if (state.phase !== X)` calls → `phaseMachine.transition()`; hardcoded tax amounts → `config/gameplay.ts` |
| `src/game-engine/rules/jailRules.ts` | `JAIL_FINE = 50` → `config/gameplay.ts` |
| `src/game-engine/rules/financeRules.ts` | `MORTGAGE_RATIO = 0.5` → `config/gameplay.ts` |
| `src/game-engine/rules/rentRules.ts` | `25 * Math.pow(2, ...)` station base → `config/gameplay.ts`; utility multipliers (4/10) → `config/gameplay.ts` |
| `src/game-engine/rules/buildingRules.ts` | Building limits → `config/gameplay.ts` |
| `src/game-engine/rules/auctionRules.ts` | Min bid, bid increment → `config/gameplay.ts` |
| `src/app/store/useGameStore.ts` | Remove UI state; emit EventBus events after dispatch |
| `src/app/store/useAnimationQueue.ts` | Wire enqueue to `EventBus.on('animation:enqueue')` |
| `src/phaser/bridge/PhaserBridge.ts` | Replace Zustand subscribe → EventBus; emit `tile:clicked` via EventBus; emit `phaser:ready` |
| `src/phaser/scenes/PreloaderScene.ts` | Asset paths → `config/assets.ts`; deferred loading strategy |
| `src/phaser/scenes/BoardScene.ts` | Dims → `config/ui.ts`; use pools; `dirtyTiles` tracking |
| `src/phaser/sprites/TokenSprite.ts` | Implement `PooledObject`; dims → `config/assets.ts` |
| `src/phaser/sprites/BuildingSprite.ts` | Implement `PooledObject` |
| `src/phaser/sprites/TileSprite.ts` | Colors → `config/ui.ts`; strings → `config/text.ts` |
| `src/phaser/sprites/DiceSprite.ts` | Timing → `config/ui.ts` |
| `src/ui/screens/SetupGameScreen.tsx` | Refactor to orchestrator; extract 4 sub-components; strings → `config/text.ts` |
| `src/ui/panels/ActionPanel.tsx` | Refactor to orchestrator; extract 4 sub-components; strings → `config/text.ts` |
| `src/ui/animation/DiceRollAnimation.tsx` | Extract DiceFace + DiceRollSequence; timing → `config/ui.ts` |
| `src/ui/animation/MoneyGainEffect.tsx` | Implement `PooledObject` interface |
| `src/ui/animation/MoneyLossEffect.tsx` | Implement `PooledObject` interface |
| `src/ui/animation/ParticleSystem.tsx` | Implement `PooledObject` interface |
| `src/ui/shared/CharacterSprite.tsx` | Sprite path lookup → `config/assets.ts` |
| `src/ui/board/BoardStatus.tsx` | Strings → `config/text.ts`; colors → `config/ui.ts` |
| `src/ui/panels/PlayerListPanel.tsx` | Strings + colors → config |
| `src/ui/panels/CurrentTilePanel.tsx` | Strings + colors → config |
| `src/ui/panels/GameLogPanel.tsx` | Strings → config |
| `src/ui/modals/*.tsx` | Strings → `config/text.ts`; colors → `config/ui.ts` |
| `src/ui/screens/MainMenu.tsx` | Strings → config |
| `src/ui/screens/EndGameScreen.tsx` | Strings → config |
| `src/App.tsx` | Read UI state from `useUIStore`; call `initAnimationSubscriber()`; subscribe to `phaser:error` |
| `src/main.tsx` | Add `ErrorBoundary` wrapper |
| `src/storage/gameStorage.ts` | Save key → `config/gameplay.ts`; add save version field |
| `vite.config.ts` | Add chunk splitting, imagemin, atlas plugin, `assetsInlineLimit: 0` |
| `package.json` | Remove `three`, `@react-three/fiber`, `@react-three/drei`, `@types/three`; add Vite plugins |

### Deleted

| File | Reason |
|------|--------|
| `src/ui/theme/tokens.ts` | Absorbed into `src/config/ui.ts` |
| `src/ui/animation/MoneyWatcher.tsx` | Logic moved to `core/animationSubscriber.ts` |
| `src/ui/animation/BuildingWatcher.tsx` | Logic moved to `core/animationSubscriber.ts` |

---

## Task 1: Create new branch and scaffold directory structure

**Files:**
- Create: `src/config/` (empty dir)
- Create: `src/core/` (empty dir)
- Create: `src/game-engine/state/phaseMachine.ts` (stub)
- Create: `src/app/store/useUIStore.ts` (stub)
- Create: `src/phaser/pool/` (empty dir)

- [ ] **Step 1: Create the branch**

```bash
git checkout -b refactor/clean-architecture
```

Expected: switched to a new branch `refactor/clean-architecture`

- [ ] **Step 2: Scaffold directories and stub files**

```bash
mkdir -p src/config src/core src/phaser/pool
```

Create `src/config/.gitkeep`, `src/core/.gitkeep`, `src/phaser/pool/.gitkeep` as placeholders (will be replaced in subsequent tasks).

- [ ] **Step 3: Verify TypeScript still compiles**

```bash
npm run build
```

Expected: build succeeds (no new files imported yet, no changes to existing code).

- [ ] **Step 4: Commit scaffold**

```bash
git add src/config src/core src/phaser/pool
git commit -m "chore: scaffold config, core, phaser/pool directories for refactor"
```

---

## Task 2: Create `src/config/gameplay.ts`

**Files:**
- Create: `src/config/gameplay.ts`
- Create: `src/config/gameplay.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/config/gameplay.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  STARTING_CASH,
  PASS_START_BONUS,
  JAIL_FINE,
  MAX_JAIL_TURNS,
  BUILDING_LIMITS,
  AUCTION_MIN_BID,
  AUCTION_BID_INCREMENT,
  MORTGAGE_RATE,
  UNMORTGAGE_RATE,
  GROUP_RENT_MULTIPLIER,
  STATION_BASE_RENT,
  UTILITY_MULTIPLIER_SINGLE,
  UTILITY_MULTIPLIER_BOTH,
  TAX_LUXURY_AMOUNT,
  TAX_INCOME_AMOUNT,
  SAVE_STORAGE_KEY,
} from './gameplay'

describe('config/gameplay sanity checks', () => {
  it('STARTING_CASH is positive', () => expect(STARTING_CASH).toBeGreaterThan(0))
  it('PASS_START_BONUS is positive', () => expect(PASS_START_BONUS).toBeGreaterThan(0))
  it('JAIL_FINE is positive', () => expect(JAIL_FINE).toBeGreaterThan(0))
  it('MAX_JAIL_TURNS is at least 1', () => expect(MAX_JAIL_TURNS).toBeGreaterThanOrEqual(1))
  it('MORTGAGE_RATE is between 0 and 1', () => {
    expect(MORTGAGE_RATE).toBeGreaterThan(0)
    expect(MORTGAGE_RATE).toBeLessThan(1)
  })
  it('UNMORTGAGE_RATE is greater than MORTGAGE_RATE', () => {
    expect(UNMORTGAGE_RATE).toBeGreaterThan(MORTGAGE_RATE)
  })
  it('GROUP_RENT_MULTIPLIER is at least 1', () => expect(GROUP_RENT_MULTIPLIER).toBeGreaterThanOrEqual(1))
  it('BUILDING_LIMITS.house is positive', () => expect(BUILDING_LIMITS.house).toBeGreaterThan(0))
  it('SAVE_STORAGE_KEY is a non-empty string', () => expect(SAVE_STORAGE_KEY.length).toBeGreaterThan(0))
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/config/gameplay.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/config/gameplay.ts`**

```typescript
/** Starting cash given to each player at game start. Consumed by setupGame.ts. */
export const STARTING_CASH = 1500

/** Bonus cash received when passing or landing on START. Consumed by movementRules.ts. */
export const PASS_START_BONUS = 200

/** Fine paid to exit jail voluntarily. Consumed by jailRules.ts. */
export const JAIL_FINE = 50

/** Maximum turns a player can remain jailed before forced fine. Consumed by jailRules.ts. */
export const MAX_JAIL_TURNS = 3

/** Max buildings per property type. Consumed by buildingRules.ts. */
export const BUILDING_LIMITS = { house: 4, hotel: 1 } as const

/** Minimum opening bid in an auction. Consumed by auctionRules.ts. */
export const AUCTION_MIN_BID = 10

/** Minimum raise increment per auction bid. Consumed by auctionRules.ts. */
export const AUCTION_BID_INCREMENT = 10

/** Fraction of property price received when mortgaging (0.5 = 50%). Consumed by financeRules.ts, basicBoard.ts. */
export const MORTGAGE_RATE = 0.5

/** Fraction of property price paid to unmortgage (0.55 = 55%). Consumed by financeRules.ts. */
export const UNMORTGAGE_RATE = 0.55

/** Rent multiplier when owner holds a full color group with no buildings. Consumed by rentRules.ts. */
export const GROUP_RENT_MULTIPLIER = 2

/** Base station rent for 1 station owned; doubles per additional station. Consumed by rentRules.ts. */
export const STATION_BASE_RENT = 25

/** Dice total multiplier for single utility ownership. Consumed by rentRules.ts. */
export const UTILITY_MULTIPLIER_SINGLE = 4

/** Dice total multiplier when owning both utilities. Consumed by rentRules.ts. */
export const UTILITY_MULTIPLIER_BOTH = 10

/** Tax amount for the luxury tax tile. Consumed by gameReducer.ts. */
export const TAX_LUXURY_AMOUNT = 150

/** Tax amount for the income tax tile. Consumed by gameReducer.ts. */
export const TAX_INCOME_AMOUNT = 200

/** localStorage key prefix for save slots. Consumed by gameStorage.ts. */
export const SAVE_STORAGE_KEY = 'property-tycoon-save'

/** Save file schema version — increment when GameState shape changes. Consumed by gameStorage.ts. */
export const SAVE_VERSION = 1
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/config/gameplay.test.ts
```

Expected: PASS — all 9 assertions green.

- [ ] **Step 5: Commit**

```bash
git add src/config/gameplay.ts src/config/gameplay.test.ts
git commit -m "feat: add config/gameplay.ts with all game numeric constants"
```

---

## Task 3: Create `src/config/assets.ts`

**Files:**
- Create: `src/config/assets.ts`

- [ ] **Step 1: Create `src/config/assets.ts`**

```typescript
/** All static asset paths and sprite frame metadata. No imports from src/. */

export type CharacterId = 'ghost' | 'cat' | 'magician' | 'rouge' | 'light knight'

/** Sprite sheet metadata for each selectable character. Consumed by characters.ts, TokenSprite.ts, CharacterSprite.tsx. */
export const CHARACTER_SPRITES: Record<CharacterId, {
  /** Public path to the sprite sheet PNG */
  path: string
  /** Phaser texture key for this character */
  phaserKey: string
  /** Width of a single frame in pixels */
  frameWidth: number
  /** Height of a single frame in pixels */
  frameHeight: number
  /** Total number of animation frames */
  frameCount: number
  /** Emoji icon shown in character selector */
  icon: string
}> = {
  ghost: {
    path: '/assets/characters/ghost_character.png',
    phaserKey: 'ghost_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '👻',
  },
  cat: {
    path: '/assets/characters/charming-chibi-cat.png',
    phaserKey: 'cat_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🐱',
  },
  magician: {
    path: '/assets/characters/chibi-cat-magican.png',
    phaserKey: 'magician_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🧙‍♂️',
  },
  rouge: {
    path: '/assets/characters/chibi-rouge.png',
    phaserKey: 'rouge_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🕵️',
  },
  'light knight': {
    path: '/assets/characters/chibi-knight.png',
    phaserKey: 'light_knight_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '⚔️',
  },
}

/** Full-page background images. Consumed by PreloaderScene.ts, MainMenu.tsx. */
export const BACKGROUND_IMAGES = {
  mainMenu: '/assets/bg/main-menu.png',
  board: '/assets/bg/bg-02.png',
} as const

/** Card back images shown when drawing cards. Consumed by PreloaderScene.ts. */
export const TILE_CARD_BACKS = {
  chance: '/assets/tiles/chance_back.png',
  fortune: '/assets/tiles/fortune_back.png',
} as const

/** SVG icon sprite sheet path. Consumed by PreloaderScene.ts. */
export const ICON_SVG_PATH = '/icons.svg' as const

/** Audio file paths keyed by logical audio key. Consumed by config/audio.ts. */
export const AUDIO_FILES: Record<string, string> = {
  // Placeholder keys — add actual audio paths when audio is implemented
  bgMusic: '/assets/audio/bg-music.mp3',
  diceRoll: '/assets/audio/dice-roll.mp3',
  purchase: '/assets/audio/purchase.mp3',
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/config/assets.ts
git commit -m "feat: add config/assets.ts with all asset paths and sprite metadata"
```

---

## Task 4: Create `src/config/ui.ts`, `src/config/text.ts`, `src/config/audio.ts`

**Files:**
- Create: `src/config/ui.ts`
- Create: `src/config/text.ts`
- Create: `src/config/audio.ts`

- [ ] **Step 1: Create `src/config/ui.ts`** (absorbs `src/ui/theme/tokens.ts`)

```typescript
/** Phaser canvas logical width in pixels. */
export const CANVAS_WIDTH = 1940

/** Phaser canvas logical height in pixels. */
export const CANVAS_HEIGHT = 1380

/** Canvas aspect ratio used for responsive scaling. */
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT

/** Duration constants for all animations in milliseconds. */
export const ANIMATION_DURATIONS = {
  /** Full dice roll animation sequence */
  diceRoll: 1200,
  /** Time to tween one board step during token movement */
  tokenMove: 150,
  /** Money floater display duration */
  moneyFloat: 1000,
  /** Card reveal transition */
  cardReveal: 400,
} as const

/** z-index layers for React overlay stacking. */
export const Z_INDICES = {
  board: 0,
  overlay: 10,
  modal: 20,
  toast: 30,
} as const

/**
 * Hex color values for each property group strip.
 * Consumed by TileSprite.ts (Phaser canvas) and any React tile renderers.
 */
export const TILE_COLORS: Record<string, number> = {
  BROWN: 0x92400E,
  LIGHT_BLUE: 0x38BDF8,
  PINK: 0xF472B6,
  ORANGE: 0xFB923C,
  RED: 0xEF4444,
  YELLOW: 0xFACC15,
  GREEN: 0x22C55E,
  DARK_BLUE: 0x1E40AF,
  STATION: 0x334155,
  UTILITY: 0x0D9488,
  CHANCE: 0xF43F5E,
  FORTUNE: 0x10B981,
  TAX: 0xD97706,
  START: 0x2563EB,
  JAIL: 0x475569,
  REST: 0x059669,
  GO_TO_JAIL: 0xDC2626,
}

/** Corner tile colors (background, accent, text) for special corner tiles. */
export const CORNER_COLORS = {
  START: { bg: 0xEFF6FF, accent: 0xF4B740, text: '#1E3A8A' },
  JAIL: { bg: 0xF1F5F9, accent: 0x475569, text: '#1E293B' },
  REST: { bg: 0xECFDF5, accent: 0x10B981, text: '#065F46' },
  GO_TO_JAIL: { bg: 0xFEF2F2, accent: 0xDC2626, text: '#7F1D1D' },
} as const

/** Surface/background colors for tile rendering. */
export const SURFACE_COLORS = {
  DEFAULT: 0xFFFFFF,
  MUTED: 0xF8FAFC,
  BORDER: 0xDBE4EF,
  HOVER: 0x93C5FD,
} as const

/** Text color strings for tile labels. */
export const TEXT_COLORS = {
  PRIMARY: '#1E293B',
  SECONDARY: '#64748B',
  PRICE: '#334155',
  MUTED: '#94A3B8',
} as const

/** Typography configuration for tile/token rendering. */
export const TYPOGRAPHY = {
  fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
  nameSize: '17px',
  priceSize: '20px',
  labelSize: '18px',
  cornerSize: '25px',
  cornerHintSize: '15px',
  tokenSize: 30,
} as const

/** Spacing constants for tile layout. */
export const SPACING = {
  stripHeight: 25,
  padding: 6,
  radius: 12,
} as const

/** Visual effect parameters for token and tile rendering. */
export const EFFECTS = {
  tokenShadow: { color: 0x0f172a, alpha: 0.22, blur: 18 },
  tokenGlowAlpha: 0.35,
  tileHighlightWidth: 4,
  ownerBadgeSize: 12,
  buildingPipSize: 5,
  buildingPipGap: 2,
  mortgageAlpha: 0.35,
  mortgageStampColor: 0xDC2626,
} as const

/** Player token colors in order of player index. */
export const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899',
]
```

- [ ] **Step 2: Create `src/config/text.ts`**

```typescript
/**
 * All user-facing strings. Import from here instead of
 * hardcoding strings in component or rule files.
 */

/** Labels for action buttons and UI controls. */
export const UI_LABELS = {
  rollDice: 'Tung xúc xắc',
  buyProperty: 'Mua ngay',
  buildHouse: 'Xây nhà',
  passAction: 'Bỏ qua',
  payRent: 'Trả tiền thuê',
  payJailFine: 'Nộp phạt ra tù',
  endTurn: 'Kết thúc lượt',
  proposeTrade: 'Đề nghị giao dịch',
  acceptTrade: 'Chấp nhận',
  rejectTrade: 'Từ chối',
  cancelTrade: 'Hủy',
  mortgage: 'Thế chấp',
  unmortgage: 'Chuộc lại',
  sellBuilding: 'Bán nhà',
  declareBankruptcy: 'Phá sản',
  startGame: 'Bắt đầu chơi',
  saveGame: 'Lưu game',
  loadGame: 'Tải game',
  quitGame: 'Thoát game',
  pauseGame: 'Tạm dừng',
  resumeGame: 'Tiếp tục',
  bid: 'Đấu giá',
  passBid: 'Bỏ qua',
} as const

/** Modal and panel titles. */
export const MODAL_TITLES = {
  auction: 'Đấu giá tài sản',
  trade: 'Giao dịch',
  debtResolution: 'Giải quyết nợ',
  propertyInfo: 'Thông tin tài sản',
  card: 'Rút thẻ',
  pauseMenu: 'Tạm dừng',
  saveSlot: 'Chọn slot lưu',
} as const

/** Error messages shown in UI. */
export const ERROR_MESSAGES = {
  insufficientFunds: 'Không đủ tiền',
  notYourTurn: 'Chưa đến lượt của bạn',
  assetLoadFailed: 'Tải tài nguyên thất bại. Vui lòng tải lại trang.',
  saveIncompatible: 'File lưu không tương thích với phiên bản này.',
  unknownError: 'Đã xảy ra lỗi. Vui lòng thử lại.',
} as const

/** Corner tile hint text shown in the corner label. */
export const CORNER_HINTS: Record<string, string> = {
  START: 'NHẬN TIỀN KHI ĐI QUA',
  JAIL: 'THĂM TÙ / BỊ GIAM',
  REST: 'Ô AN TOÀN',
  GO_TO_JAIL: 'VÀO TÙ NGAY',
}

/** Tile icon emoji by tile type and optional group. */
export const getTileIcon = (type: string, groupId?: string): string => {
  switch (type) {
    case 'FORTUNE': return '⚡'
    case 'CHANCE': return '🍀'
    case 'TAX': return '💸'
    case 'START': return '🚩'
    case 'JAIL': return '⛓️'
    case 'REST': return '🌳'
    case 'GO_TO_JAIL': return '👮'
    case 'PROPERTY':
      if (groupId === 'STATION') return '🚉'
      if (groupId === 'UTILITY') return '💧'
      return '🏠'
    default: return '📍'
  }
}

/**
 * Tile names keyed by board position index (0–39).
 * Migrated from basicBoard.ts — update here, not in the board definition.
 */
export const TILE_NAMES: Record<number, string> = {
  0: 'Xuất phát',
  // Remaining 39 tile names populated in Task 8 when basicBoard.ts is migrated
}

/**
 * Game log message templates. Each function returns a formatted Vietnamese string.
 * Consumed by gameReducer.ts and rules/*.ts.
 */
export const GAME_LOG = {
  gameStarted: () => 'Game đã bắt đầu!',
  playerLandedOn: (playerName: string, tileName: string) =>
    `${playerName} đã dừng lại tại ${tileName}.`,
  playerPaidRent: (playerName: string, amount: number, ownerName: string, propertyName: string) =>
    `${playerName} đã trả ${amount}$ tiền thuê cho ${ownerName} tại ${propertyName}.`,
  playerPaidJailFine: (playerName: string, amount: number) =>
    `${playerName} đã nộp phạt ${amount}$ để ra tù.`,
  playerMortgaged: (playerName: string, propertyName: string, amount: number) =>
    `${playerName} đã thế chấp ${propertyName} và nhận ${amount}$.`,
  auctionStarted: (propertyName: string) =>
    `Bắt đầu đấu giá tài sản ${propertyName}`,
  tradeProposed: (offererName: string, targetName: string) =>
    `${offererName} đề nghị giao dịch với ${targetName}`,
  tradeRejected: () => 'Giao dịch bị từ chối.',
  playerDrewCard: (playerName: string, cardType: string, description: string) =>
    `${playerName} rút thẻ ${cardType}: ${description}`,
  playerPaidTax: (playerName: string, taxName: string, amount: number) =>
    `${playerName} nộp ${taxName} $${amount}.`,
  debugAddedCash: (playerName: string, amount: number) =>
    `[DEBUG] Đã thêm $${amount} cho ${playerName}`,
  debugJumped: (tileName: string, steps: number) =>
    `[DEBUG] Nhảy đến ${tileName} (Vượt qua ${steps} ô)`,
}

/**
 * Card texts keyed by card id. Populated in Task 8 when cards.ts is migrated.
 */
export const CARD_TEXTS: Record<string, { title: string; description: string }> = {}
```

- [ ] **Step 3: Create `src/config/audio.ts`**

```typescript
/** Logical audio keys used throughout the app. */
export const AUDIO_KEYS = {
  bgMusic: 'bgMusic',
  diceRoll: 'diceRoll',
  purchase: 'purchase',
} as const

/** Default volume levels (0.0 – 1.0). */
export const DEFAULT_VOLUME = {
  music: 0.5,
  sfx: 0.8,
} as const

/** Whether audio starts muted. */
export const MUTE_DEFAULT = false
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/config/ui.ts src/config/text.ts src/config/audio.ts
git commit -m "feat: add config/ui.ts, config/text.ts, config/audio.ts"
```

---

## Task 5: Create `src/core/ObjectPool.ts` and `src/core/StateMachine.ts`

**Files:**
- Create: `src/core/ObjectPool.ts`
- Create: `src/core/StateMachine.ts`
- Create: `src/core/ObjectPool.test.ts`
- Create: `src/core/StateMachine.test.ts`

- [ ] **Step 1: Write failing tests for ObjectPool**

Create `src/core/ObjectPool.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ObjectPool } from './ObjectPool'

interface TestObj {
  value: number
  active: boolean
  reset(): void
  activate(): void
}

const makeFactory = () => {
  let n = 0
  return (): TestObj => ({
    value: ++n,
    active: false,
    reset() { this.active = false },
    activate() { this.active = true },
  })
}

describe('ObjectPool', () => {
  it('acquire returns an instance and calls activate()', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    const obj = pool.acquire()
    expect(obj.active).toBe(true)
  })

  it('release calls reset() and returns the instance to the pool', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    const obj = pool.acquire()
    pool.release(obj)
    expect(obj.active).toBe(false)
    expect(pool.availableCount).toBe(2)
  })

  it('acquire/release cycle — same object is reused', () => {
    const pool = new ObjectPool(makeFactory(), 1)
    const a = pool.acquire()
    pool.release(a)
    const b = pool.acquire()
    expect(a).toBe(b)
  })

  it('creates new instance when pool is exhausted (soft cap)', () => {
    const pool = new ObjectPool(makeFactory(), 1)
    const a = pool.acquire()
    const b = pool.acquire()
    expect(b).not.toBe(a)
    expect(b.active).toBe(true)
  })

  it('releaseAll returns all active instances to the pool', () => {
    const pool = new ObjectPool(makeFactory(), 3)
    pool.acquire()
    pool.acquire()
    pool.acquire()
    pool.releaseAll()
    expect(pool.availableCount).toBe(3)
  })

  it('size reflects total allocated instances', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    expect(pool.size).toBe(2)
    pool.acquire(); pool.acquire(); pool.acquire()
    expect(pool.size).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/ObjectPool.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/core/ObjectPool.ts`**

```typescript
/** Objects managed by ObjectPool must implement this interface. */
export interface PooledObject {
  /** Called when the object is returned to the pool — clear all state. */
  reset(): void
  /** Called when the object is taken from the pool — set up for use. */
  activate(): void
}

/**
 * Generic object pool that pre-allocates instances and recycles them
 * to avoid runtime allocations in the game loop.
 *
 * The pool is a soft cap: if all instances are active when acquire() is called,
 * a new instance is created rather than blocking. A dev-mode warning is logged
 * so pool sizes can be tuned.
 */
export class ObjectPool<T extends PooledObject> {
  private readonly _available: T[] = []
  private readonly _active: Set<T> = new Set()
  private readonly factory: () => T

  /**
   * @param factory - Function that creates a new T instance
   * @param initialSize - Number of instances to pre-allocate
   */
  constructor(factory: () => T, initialSize: number) {
    this.factory = factory
    for (let i = 0; i < initialSize; i++) {
      this._available.push(factory())
    }
  }

  /** Total allocated instances (available + active). */
  get size(): number {
    return this._available.length + this._active.size
  }

  /** Number of instances currently available to acquire. */
  get availableCount(): number {
    return this._available.length
  }

  /** Returns an available instance, creating a new one if the pool is exhausted. */
  acquire(): T {
    let obj = this._available.pop()
    if (!obj) {
      if (import.meta.env.DEV) {
        console.warn('[ObjectPool] Pool exhausted — creating new instance. Consider increasing initialSize.')
      }
      obj = this.factory()
    }
    obj.activate()
    this._active.add(obj)
    return obj
  }

  /** Returns an instance to the pool and calls reset(). */
  release(obj: T): void {
    if (!this._active.has(obj)) return
    obj.reset()
    this._active.delete(obj)
    this._available.push(obj)
  }

  /** Returns all currently active instances to the pool. */
  releaseAll(): void {
    for (const obj of this._active) {
      obj.reset()
      this._available.push(obj)
    }
    this._active.clear()
  }
}
```

- [ ] **Step 4: Run ObjectPool tests**

```bash
npm test -- src/core/ObjectPool.test.ts
```

Expected: PASS — all 6 tests green.

- [ ] **Step 5: Write failing tests for StateMachine**

Create `src/core/StateMachine.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { StateMachine } from './StateMachine'
import type { Transition } from './StateMachine'

type Phase = 'IDLE' | 'RUNNING' | 'PAUSED' | 'DONE'
type Action = 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'INVALID_ACTION'

const transitions: Transition<Phase, Action>[] = [
  { from: 'IDLE', action: 'START', to: 'RUNNING' },
  { from: 'RUNNING', action: 'PAUSE', to: 'PAUSED' },
  { from: 'PAUSED', action: 'RESUME', to: 'RUNNING' },
  { from: ['RUNNING', 'PAUSED'], action: 'STOP', to: 'DONE' },
  {
    from: 'RUNNING',
    action: 'START',
    to: 'RUNNING',
    guard: (s: any) => s.speed < 100,
  },
]

const machine = new StateMachine<Phase, Action>(transitions)
const state: any = { speed: 50 }
const fastState: any = { speed: 100 }

describe('StateMachine', () => {
  it('returns target phase for a valid transition', () => {
    expect(machine.transition('IDLE', 'START', state)).toBe('RUNNING')
  })

  it('returns null for an invalid action from the current phase', () => {
    expect(machine.transition('IDLE', 'PAUSE', state)).toBeNull()
  })

  it('returns null for a completely unknown action', () => {
    expect(machine.transition('IDLE', 'INVALID_ACTION', state)).toBeNull()
  })

  it('supports array of source phases', () => {
    expect(machine.transition('RUNNING', 'STOP', state)).toBe('DONE')
    expect(machine.transition('PAUSED', 'STOP', state)).toBe('DONE')
  })

  it('guard passes — transition allowed', () => {
    expect(machine.transition('RUNNING', 'START', state)).toBe('RUNNING')
  })

  it('guard fails — transition blocked, returns null', () => {
    expect(machine.transition('RUNNING', 'START', fastState)).toBeNull()
  })

  it('canTransition returns true for valid transition', () => {
    expect(machine.canTransition('IDLE', 'START', state)).toBe(true)
  })

  it('canTransition returns false for invalid transition', () => {
    expect(machine.canTransition('IDLE', 'PAUSE', state)).toBe(false)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
npm test -- src/core/StateMachine.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 7: Create `src/core/StateMachine.ts`**

```typescript
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
```

- [ ] **Step 8: Run StateMachine tests**

```bash
npm test -- src/core/StateMachine.test.ts
```

Expected: PASS — all 8 tests green.

- [ ] **Step 9: Commit**

```bash
git add src/core/ObjectPool.ts src/core/ObjectPool.test.ts src/core/StateMachine.ts src/core/StateMachine.test.ts
git commit -m "feat: add core/ObjectPool and core/StateMachine with tests"
```

---

## Task 6: Create `src/core/EventBus.ts`

**Files:**
- Create: `src/core/EventBus.ts`
- Create: `src/core/EventBus.test.ts`

- [ ] **Step 1: Write failing tests for EventBus**

Create `src/core/EventBus.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus } from './EventBus'

let bus: EventBus

beforeEach(() => {
  bus = new EventBus()
})

describe('EventBus', () => {
  it('handler receives emitted payload', () => {
    const handler = vi.fn()
    bus.on('test-event' as any, handler)
    bus.emit('test-event' as any, { value: 42 } as any)
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('on() returns an unsubscribe function that stops future events', () => {
    const handler = vi.fn()
    const unsub = bus.on('test-event' as any, handler)
    unsub()
    bus.emit('test-event' as any, {} as any)
    expect(handler).not.toHaveBeenCalled()
  })

  it('off() removes a specific handler', () => {
    const handler = vi.fn()
    bus.on('test-event' as any, handler)
    bus.off('test-event' as any, handler)
    bus.emit('test-event' as any, {} as any)
    expect(handler).not.toHaveBeenCalled()
  })

  it('a failing handler does not prevent other handlers from running', () => {
    const bad = vi.fn(() => { throw new Error('boom') })
    const good = vi.fn()
    bus.on('test-event' as any, bad)
    bus.on('test-event' as any, good)
    expect(() => bus.emit('test-event' as any, {} as any)).not.toThrow()
    expect(good).toHaveBeenCalled()
  })

  it('multiple subscribers all receive the event', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on('test-event' as any, h1)
    bus.on('test-event' as any, h2)
    bus.emit('test-event' as any, { x: 1 } as any)
    expect(h1).toHaveBeenCalledWith({ x: 1 })
    expect(h2).toHaveBeenCalledWith({ x: 1 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- src/core/EventBus.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/core/EventBus.ts`**

```typescript
import type { GameState, Phase } from '../game-engine/types/game'
import type { AnimationEvent } from '../app/store/useAnimationQueue'

/**
 * All typed events that flow through the EventBus.
 * Add new events here — never use untyped string keys.
 */
export type GameEventMap = {
  /** Emitted by useGameStore after every dispatch that changes state. */
  'state:changed': { prev: GameState; next: GameState }
  /** Emitted by useGameStore when the phase changes as part of a dispatch. */
  'phase:transition': { from: Phase; to: Phase }
  /** Emitted by animationSubscriber to add an event to the animation queue. */
  'animation:enqueue': AnimationEvent
  /** Emitted by TileSprite (via BoardScene → PhaserBridge) when a tile is clicked. */
  'tile:clicked': { tileIndex: number }
  /** Emitted by PreloaderScene once the BoardScene is fully ready. */
  'phaser:ready': void
  /** Emitted by PreloaderScene when asset loading fails. */
  'phaser:error': { reason: string }
}

type Handler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void

/**
 * Typed pub/sub event bus. All cross-layer communication routes through this bus.
 * The singleton export `eventBus` is used throughout the app.
 * A plain `EventBus` class is also exported for testing with isolated instances.
 */
export class EventBus {
  private readonly listeners: Map<string, Set<Handler<any>>> = new Map()

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * @param event - Event name from GameEventMap
   * @param handler - Callback receiving the typed payload
   * @returns Unsubscribe function — call to stop receiving this event
   */
  on<K extends keyof GameEventMap>(event: K, handler: Handler<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as Handler<any>)
    return () => this.off(event, handler)
  }

  /** Remove a specific handler for an event. */
  off<K extends keyof GameEventMap>(event: K, handler: Handler<K>): void {
    this.listeners.get(event)?.delete(handler as Handler<any>)
  }

  /**
   * Emit an event to all subscribers.
   * Each handler is wrapped in try/catch — a failing handler does not
   * prevent other handlers from running.
   */
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(payload)
      } catch (err) {
        console.error(`[EventBus] Handler error for event "${event}":`, err)
      }
    }
  }
}

/** App-wide singleton EventBus instance. Import this throughout the app. */
export const eventBus = new EventBus()
```

- [ ] **Step 4: Run EventBus tests**

```bash
npm test -- src/core/EventBus.test.ts
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Run full test suite**

```bash
npm test
```

Expected: all existing + new tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/core/EventBus.ts src/core/EventBus.test.ts
git commit -m "feat: add core/EventBus typed singleton pub/sub with tests"
```

---

## Task 7: Create `phaseMachine.ts` and wire into `gameReducer.ts`

**Files:**
- Create: `src/game-engine/state/phaseMachine.ts`
- Modify: `src/game-engine/state/gameReducer.ts`

- [ ] **Step 1: Create `src/game-engine/state/phaseMachine.ts`**

```typescript
import { Phase } from '../types/game'
import { StateMachine, type Transition } from '../../core/StateMachine'
import type { GameState } from '../types/game'

/**
 * Complete transition table for all 14 game phases.
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
  // DECLINE with auction disabled — guard fails → falls through to END_TURN
  {
    from: Phase.BUY_DECISION, action: 'DECLINE_BUY_PROPERTY', to: Phase.AUCTION,
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
  { from: Phase.BUILD_DECISION, action: 'END_TURN', to: Phase.WAITING_TO_ROLL },

  // Debug — always pass through
  ...Object.values(Phase).flatMap(p => [
    { from: p, action: 'DEBUG_ADD_CASH', to: p },
    { from: p, action: 'TELEPORT_PLAYER', to: Phase.RESOLVING_TILE },
  ]),
]

/** Singleton phase machine used by gameReducer.ts to validate all phase transitions. */
export const phaseMachine = new StateMachine<Phase, string>(TRANSITIONS)
```

- [ ] **Step 2: Update `src/game-engine/state/gameReducer.ts`**

Add at top of imports:
```typescript
import { GAME_LOG } from '../../config/text'
import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '../../config/gameplay'
import { phaseMachine } from './phaseMachine'
```

In each action case that has `if (state.phase !== X) return state`, replace with:
```typescript
if (!phaseMachine.canTransition(state.phase, 'ACTION_TYPE', state)) return state
```

Replace the hardcoded `RESOLVE_TILE` log:
```typescript
const logEntry = GAME_LOG.playerLandedOn(currentPlayer.name, tile.name)
```

Replace the hardcoded tax amounts:
```typescript
const taxAmount = tile.name.includes('xa xỉ') ? TAX_LUXURY_AMOUNT : TAX_INCOME_AMOUNT
```

Replace the `DRAW_CARD` log:
```typescript
log: [GAME_LOG.playerDrewCard(currentPlayer.name, tile.type === TileType.CHANCE ? 'Khí Vận' : 'Cơ Hội', card.description), ...state.log]
```

- [ ] **Step 3: Run existing game-engine tests to confirm no regressions**

```bash
npm test -- src/game-engine
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/game-engine/state/phaseMachine.ts src/game-engine/state/gameReducer.ts
git commit -m "feat: add phaseMachine.ts and wire StateMachine into gameReducer"
```

---

## Task 8: Migrate game-engine data files to config

**Files:**
- Modify: `src/game-engine/rules/jailRules.ts`
- Modify: `src/game-engine/rules/financeRules.ts`
- Modify: `src/game-engine/rules/rentRules.ts`
- Modify: `src/game-engine/rules/buildingRules.ts`
- Modify: `src/game-engine/rules/auctionRules.ts`
- Modify: `src/game-engine/state/setupGame.ts`
- Modify: `src/game-engine/data/characters.ts`
- Modify: `src/game-engine/data/cards.ts`
- Modify: `src/game-engine/data/boards/basicBoard.ts`
- Modify: `src/config/text.ts` (populate TILE_NAMES and CARD_TEXTS)

- [ ] **Step 1: Update `jailRules.ts`**

Remove `const JAIL_FINE = 50`. Add:
```typescript
import { JAIL_FINE } from '../../config/gameplay'
import { GAME_LOG } from '../../config/text'
```
Replace log string: `GAME_LOG.playerPaidJailFine(currentPlayer.name, JAIL_FINE)`

- [ ] **Step 2: Update `financeRules.ts`**

Remove `const MORTGAGE_RATIO = 0.5`. Add:
```typescript
import { MORTGAGE_RATE } from '../../config/gameplay'
import { GAME_LOG } from '../../config/text'
```
Replace all `MORTGAGE_RATIO` with `MORTGAGE_RATE`. Replace log strings with `GAME_LOG.playerMortgaged(...)`.

- [ ] **Step 3: Update `rentRules.ts`**

Add:
```typescript
import {
  STATION_BASE_RENT, UTILITY_MULTIPLIER_SINGLE, UTILITY_MULTIPLIER_BOTH, GROUP_RENT_MULTIPLIER,
} from '../../config/gameplay'
```
Replace:
- `25 * Math.pow(2, stationCount - 1)` → `STATION_BASE_RENT * Math.pow(2, stationCount - 1)`
- `const multiplier = utilityCount === 2 ? 10 : 4` → `const multiplier = utilityCount === 2 ? UTILITY_MULTIPLIER_BOTH : UTILITY_MULTIPLIER_SINGLE`
- `property.rent * 2` → `property.rent * GROUP_RENT_MULTIPLIER`

- [ ] **Step 4: Update `buildingRules.ts` and `auctionRules.ts`**

`buildingRules.ts`: import `BUILDING_LIMITS` from `../../config/gameplay`. Replace hardcoded house (4) / hotel (1) limits.

`auctionRules.ts`: import `AUCTION_MIN_BID`, `AUCTION_BID_INCREMENT` from `../../config/gameplay`. Replace hardcoded values.

- [ ] **Step 5: Update `setupGame.ts`**

```typescript
import { STARTING_CASH, PASS_START_BONUS } from '../../config/gameplay'
import { GAME_LOG } from '../../config/text'
```
Update `DEFAULT_CONFIG` to use `STARTING_CASH` and `PASS_START_BONUS`.
Replace `'Game đã bắt đầu!'` with `GAME_LOG.gameStarted()`.

- [ ] **Step 6: Update `characters.ts`**

```typescript
import { CHARACTER_SPRITES, type CharacterId } from '../../config/assets'

export interface CharacterDef {
  id: CharacterId
  name: string
}

export const CHARACTERS: CharacterDef[] = [
  { id: 'ghost', name: 'Ghosty' },
  { id: 'cat', name: 'Chibi Cat' },
  { id: 'magician', name: 'Cat Magician' },
  { id: 'rouge', name: 'Chibi Rogue' },
  { id: 'light knight', name: 'Light Knight' },
]

export const getCharacter = (id: string): CharacterDef =>
  CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0]
```

- [ ] **Step 7: Populate `config/text.ts` TILE_NAMES from `basicBoard.ts`**

Read all 40 tile `name` strings from `basicBoard.ts` and populate `TILE_NAMES` in `config/text.ts` (positions 0–39).

Then in `basicBoard.ts` add:
```typescript
import { TILE_NAMES } from '../../config/text'
import { MORTGAGE_RATE } from '../../config/gameplay'
```
Replace hardcoded tile name strings: `name: TILE_NAMES[position] ?? ''`
Replace `const MORTGAGE_RATIO = 0.5` with `MORTGAGE_RATE`.

- [ ] **Step 8: Migrate card texts to `config/text.ts`**

Read all card `description` strings from `cards.ts` and populate `CARD_TEXTS` in `config/text.ts`.

In `cards.ts`:
```typescript
import { CARD_TEXTS } from '../../config/text'
// Each card: description: CARD_TEXTS[id]?.description ?? ''
```

- [ ] **Step 9: Run all game-engine tests**

```bash
npm test -- src/game-engine
```

Expected: all tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/game-engine src/config/text.ts src/config/gameplay.ts
git commit -m "feat: migrate game-engine magic numbers and strings to config layer"
```

---

## Task 9: Split `useGameStore`, create `useUIStore`, wire EventBus

**Files:**
- Modify: `src/app/store/useGameStore.ts`
- Create: `src/app/store/useUIStore.ts`
- Modify: `src/app/store/useAnimationQueue.ts`
- Create: `src/app/store/useGameStore.test.ts`
- Create: `src/app/store/useUIStore.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/app/store/useGameStore.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { eventBus } from '../../core/EventBus'
import { useGameStore } from './useGameStore'

describe('useGameStore', () => {
  it('emits state:changed on dispatch', () => {
    const handler = vi.fn()
    const unsub = eventBus.on('state:changed', handler)
    useGameStore.getState().dispatch({ type: 'END_TURN' })
    unsub()
    expect(handler).toHaveBeenCalled()
  })

  it('state:changed payload contains prev and next', () => {
    const handler = vi.fn()
    const unsub = eventBus.on('state:changed', handler)
    useGameStore.getState().dispatch({ type: 'END_TURN' })
    unsub()
    const call = handler.mock.calls[0][0]
    expect(call).toHaveProperty('prev')
    expect(call).toHaveProperty('next')
  })
})
```

Create `src/app/store/useUIStore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { useUIStore } from './useUIStore'

describe('useUIStore', () => {
  it('openTradeModal sets showTradeModal to true', () => {
    useUIStore.getState().openTradeModal()
    expect(useUIStore.getState().showTradeModal).toBe(true)
  })

  it('closeTradeModal sets showTradeModal to false', () => {
    useUIStore.getState().openTradeModal()
    useUIStore.getState().closeTradeModal()
    expect(useUIStore.getState().showTradeModal).toBe(false)
  })

  it('setInspectedProperty updates inspectedPropertyId', () => {
    useUIStore.getState().setInspectedProperty('prop-1')
    expect(useUIStore.getState().inspectedPropertyId).toBe('prop-1')
  })

  it('togglePause flips pauseOpen', () => {
    const initial = useUIStore.getState().pauseOpen
    useUIStore.getState().togglePause()
    expect(useUIStore.getState().pauseOpen).toBe(!initial)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- src/app/store
```

Expected: FAIL.

- [ ] **Step 3: Create `src/app/store/useUIStore.ts`**

```typescript
import { create } from 'zustand'

export type TokenAnimState = 'idle' | 'run' | 'win' | 'sad'

interface UIStore {
  showTradeModal: boolean
  inspectedPropertyId: string | null
  pauseOpen: boolean
  saveSlotModalOpen: boolean
  tokenAnimState: TokenAnimState
  openTradeModal(): void
  closeTradeModal(): void
  setInspectedProperty(id: string | null): void
  togglePause(): void
  setSaveSlotModalOpen(open: boolean): void
  setTokenAnimState(state: TokenAnimState): void
}

export const useUIStore = create<UIStore>((set) => ({
  showTradeModal: false,
  inspectedPropertyId: null,
  pauseOpen: false,
  saveSlotModalOpen: false,
  tokenAnimState: 'idle',
  openTradeModal: () => set({ showTradeModal: true }),
  closeTradeModal: () => set({ showTradeModal: false }),
  setInspectedProperty: (id) => set({ inspectedPropertyId: id }),
  togglePause: () => set((s) => ({ pauseOpen: !s.pauseOpen })),
  setSaveSlotModalOpen: (open) => set({ saveSlotModalOpen: open }),
  setTokenAnimState: (animState) => set({ tokenAnimState: animState }),
}))
```

- [ ] **Step 4: Update `src/app/store/useGameStore.ts`**

Remove `showTradeModal`, `inspectedPropertyId`, `tokenAnimState`, and their setters.
Move `TokenAnimState` type export to `useUIStore.ts`.
Add EventBus emissions:

```typescript
import { create } from 'zustand'
import { type GameState, type GameAction, Phase } from '../../game-engine/types/game'
import { gameReducer } from '../../game-engine/state/gameReducer'
import { saveGame } from '../../storage/gameStorage'
import { eventBus } from '../../core/EventBus'

interface GameStore {
  state: GameState
  activeSlotId: string
  dispatch: (action: GameAction | { type: 'LOAD_GAME'; payload: GameState; slotId: string }) => void
  setActiveSlot: (slotId: string) => void
}

export const useGameStore = create<GameStore>((set) => ({
  state: {
    players: [],
    currentPlayerId: '',
    phase: Phase.SETUP,
    board: [],
    doublesCount: 0,
    log: [],
    config: { startingCash: 1500, passStartBonus: 200, enableAuction: false, rentMultiplier: 1 },
  },
  activeSlotId: '1',
  setActiveSlot: (slotId) => set({ activeSlotId: slotId }),
  dispatch: (action) =>
    set((store) => {
      let newState: GameState
      let newSlotId = store.activeSlotId

      if (action.type === 'LOAD_GAME') {
        newState = action.payload
        newSlotId = action.slotId
      } else {
        newState = gameReducer(store.state, action)
      }

      if (action.type !== 'START_GAME' && newState.phase !== Phase.SETUP) {
        saveGame(newState, newSlotId)
      }

      // Emit to EventBus for cross-layer subscribers (Phaser, animationSubscriber)
      eventBus.emit('state:changed', { prev: store.state, next: newState })
      if (newState.phase !== store.state.phase) {
        eventBus.emit('phase:transition', { from: store.state.phase, to: newState.phase })
      }

      return { state: newState, activeSlotId: newSlotId }
    }),
}))
```

- [ ] **Step 5: Update `src/app/store/useAnimationQueue.ts`**

Add EventBus listener at the bottom of the file (after store creation):

```typescript
import { eventBus } from '../../core/EventBus'

// Wire EventBus animation:enqueue → store queue
eventBus.on('animation:enqueue', (event) => {
  useAnimationQueue.getState().enqueue(event)
})
```

- [ ] **Step 6: Run tests**

```bash
npm test -- src/app/store
```

Expected: all new store tests pass.

- [ ] **Step 7: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/app/store/
git commit -m "feat: split useGameStore/useUIStore, wire EventBus emissions"
```

---

## Task 10: Create `animationSubscriber.ts`, delete watcher components, update `App.tsx`

**Files:**
- Create: `src/core/animationSubscriber.ts`
- Delete: `src/ui/animation/MoneyWatcher.tsx`
- Delete: `src/ui/animation/BuildingWatcher.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `src/core/animationSubscriber.ts`**

```typescript
import { eventBus } from './EventBus'
import type { GameState } from '../game-engine/types/game'

/**
 * Sets up EventBus listeners that detect state changes and enqueue
 * animation events. Call once at app startup (App.tsx useEffect).
 * Returns a cleanup function that removes all listeners.
 */
export function initAnimationSubscriber(): () => void {
  return eventBus.on('state:changed', ({ prev, next }) => {
    detectMoneyChanges(prev, next)
    detectBuildingChanges(prev, next)
  })
}

function detectMoneyChanges(prev: GameState, next: GameState): void {
  for (const nextPlayer of next.players) {
    const prevPlayer = prev.players.find(p => p.id === nextPlayer.id)
    if (!prevPlayer) continue
    const delta = nextPlayer.cash - prevPlayer.cash
    if (delta > 0) {
      eventBus.emit('animation:enqueue', {
        type: 'MONEY_GAIN',
        payload: { playerId: nextPlayer.id, amount: delta },
      } as any)
    } else if (delta < 0) {
      eventBus.emit('animation:enqueue', {
        type: 'MONEY_LOSS',
        payload: { playerId: nextPlayer.id, amount: Math.abs(delta) },
      } as any)
    }
  }
}

function detectBuildingChanges(prev: GameState, next: GameState): void {
  for (let i = 0; i < next.board.length; i++) {
    const nextTile = next.board[i] as any
    const prevTile = prev.board[i] as any
    if (
      nextTile.buildingLevel !== undefined &&
      prevTile.buildingLevel !== undefined &&
      nextTile.buildingLevel > prevTile.buildingLevel
    ) {
      eventBus.emit('animation:enqueue', {
        type: 'BUILDING_SPARKLE',
        payload: { propertyId: nextTile.id },
      } as any)
    }
  }
}
```

- [ ] **Step 2: Delete watcher files**

```bash
git rm src/ui/animation/MoneyWatcher.tsx src/ui/animation/BuildingWatcher.tsx
```

- [ ] **Step 3: Update `App.tsx`**

Remove `<MoneyWatcher />` and `<BuildingWatcher />` JSX and their imports.

Add:
```typescript
import { useEffect, useState } from 'react'
import { initAnimationSubscriber } from './core/animationSubscriber'
import { eventBus } from './core/EventBus'
import { useUIStore } from './app/store/useUIStore'
import { ERROR_MESSAGES } from './config/text'
```

Inside the App component:
```typescript
// Init animation subscriber once at startup
useEffect(() => initAnimationSubscriber(), [])

// Listen for Phaser asset errors
const [phaserError, setPhaserError] = useState<string | null>(null)
useEffect(() => {
  return eventBus.on('phaser:error', ({ reason }) => setPhaserError(reason))
}, [])

// Listen for tile clicks and set inspected property
useEffect(() => {
  return eventBus.on('tile:clicked', ({ tileIndex }) => {
    useUIStore.getState().setInspectedProperty(String(tileIndex))
  })
}, [])
```

Replace `useGameStore` reads of `showTradeModal`, `inspectedPropertyId`, `tokenAnimState`, `pauseOpen` with `useUIStore`.

Add fallback render before the board:
```typescript
if (phaserError) {
  return <div style={{ padding: 32, textAlign: 'center' }}>{ERROR_MESSAGES.assetLoadFailed}</div>
}
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/core/animationSubscriber.ts src/App.tsx
git commit -m "feat: add animationSubscriber, remove MoneyWatcher/BuildingWatcher, update App.tsx"
```

---

## Task 11: Update PhaserBridge to use EventBus

**Files:**
- Modify: `src/phaser/bridge/PhaserBridge.ts`
- Modify: `src/phaser/scenes/BoardScene.ts`
- Modify: `src/phaser/scenes/PreloaderScene.ts`

- [ ] **Step 1: Rewrite `PhaserBridge.ts`**

```typescript
import Phaser from 'phaser'
import { eventBus } from '../../core/EventBus'
import type { GameState } from '../../game-engine/types/game'

/**
 * Connects the Phaser game instance to the app-wide EventBus.
 * Subscribes to state:changed to push updates into BoardScene.
 * Emits tile:clicked and phaser:ready on behalf of Phaser scenes.
 * Does not import Zustand — Phaser never reads from the store directly.
 */
export class PhaserBridge {
  private static game: Phaser.Game | null = null
  private static unsubscribeState: (() => void) | null = null

  /** Call once after the Phaser game is created. */
  static initialize(game: Phaser.Game): void {
    this.game = game

    // Push state updates from EventBus into BoardScene
    this.unsubscribeState = eventBus.on('state:changed', ({ next }) => {
      this.updatePhaser(next)
    })

    // Re-emit tile clicks from Phaser on the EventBus
    game.events.on('tile-clicked', (tileId: string) => {
      eventBus.emit('tile:clicked', { tileIndex: parseInt(tileId, 10) })
    })
  }

  /** Called by BoardScene.create() once the board is fully initialized. */
  static notifyReady(): void {
    eventBus.emit('phaser:ready', undefined as any)
  }

  /** Called by PreloaderScene on asset load failure. */
  static notifyError(reason: string): void {
    eventBus.emit('phaser:error', { reason })
  }

  private static updatePhaser(state: GameState): void {
    if (!this.game) return
    const boardScene = this.game.scene.getScene('BoardScene')
    if (boardScene && boardScene.scene.isActive()) {
      boardScene.events.emit('update-state', state)
    } else {
      this.game.events.once('poststep', () => this.updatePhaser(state))
    }
  }

  static destroy(): void {
    this.unsubscribeState?.()
    this.unsubscribeState = null
    this.game = null
  }
}
```

- [ ] **Step 2: Call `PhaserBridge.notifyReady()` at end of `BoardScene.create()`**

```typescript
import { PhaserBridge } from '../bridge/PhaserBridge'
// At end of create():
PhaserBridge.notifyReady()
```

- [ ] **Step 3: Call `PhaserBridge.notifyError()` in `PreloaderScene.ts` on load error**

```typescript
this.load.on('loaderror', (file: Phaser.Loader.File) => {
  PhaserBridge.notifyError(`Failed to load asset: ${file.key}`)
})
```

- [ ] **Step 4: Verify no Zustand imports remain in Phaser layer**

```bash
grep -r "zustand" src/phaser/
```

Expected: 0 results.

- [ ] **Step 5: Build and verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/phaser/
git commit -m "feat: migrate PhaserBridge to EventBus, remove Zustand from Phaser layer"
```

---

## Task 12: Update Phaser sprites to use config

**Files:**
- Modify: `src/phaser/sprites/TileSprite.ts`
- Modify: `src/phaser/sprites/TokenSprite.ts`
- Modify: `src/phaser/sprites/BuildingSprite.ts`
- Modify: `src/phaser/sprites/DiceSprite.ts`
- Modify: `src/phaser/scenes/PreloaderScene.ts`
- Modify: `src/phaser/scenes/BoardScene.ts`

- [ ] **Step 1: Update `TileSprite.ts`**

Add imports:
```typescript
import { TILE_COLORS, CORNER_COLORS, SURFACE_COLORS, TEXT_COLORS, TYPOGRAPHY, SPACING, EFFECTS } from '../../config/ui'
import { CORNER_HINTS, getTileIcon } from '../../config/text'
```

Remove `import { THEME } from '../../ui/theme/tokens'`.
Replace all `THEME.colors.*` with `TILE_COLORS`, `CORNER_COLORS`, `SURFACE_COLORS`, `TEXT_COLORS`.
Replace all `THEME.typography.*` with `TYPOGRAPHY`.
Replace all `THEME.spacing.*` with `SPACING`.
Replace all `THEME.effects.*` with `EFFECTS`.
Replace `getCornerHint(type)` (old import) with `CORNER_HINTS[type] ?? ''`.
Replace `getTileIcon(type, groupId)` with the imported version from `config/text`.

- [ ] **Step 2: Update `TokenSprite.ts`** — add PooledObject interface and use config

Add:
```typescript
import type { PooledObject } from '../../core/ObjectPool'
import { CHARACTER_SPRITES } from '../../config/assets'
import { ANIMATION_DURATIONS, EFFECTS } from '../../config/ui'
```

Add `implements PooledObject` to the class.
Add `reset()` and `activate()` methods.
Replace hardcoded frame dims with `CHARACTER_SPRITES[charId].frameWidth` etc.
Replace hardcoded animation duration with `ANIMATION_DURATIONS.tokenMove`.

- [ ] **Step 3: Update `BuildingSprite.ts`** — add PooledObject interface

Add `import type { PooledObject } from '../../core/ObjectPool'`.
Add `implements PooledObject` to the class.
Add `reset()` (hide, zero position) and `activate()` (show) methods.

- [ ] **Step 4: Update `PreloaderScene.ts`** — use config/assets, deferred loading

```typescript
import { CHARACTER_SPRITES, BACKGROUND_IMAGES, TILE_CARD_BACKS, ICON_SVG_PATH } from '../../config/assets'
import { ANIMATION_DURATIONS } from '../../config/ui'
```

Replace all hardcoded string paths/keys with config constants.
Deferred loading: load card backs and audio in a callback triggered by `eventBus.on('phaser:ready', ...)` within the scene.

- [ ] **Step 5: Update `BoardScene.ts`** — config dims, dirtyTiles

```typescript
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../config/ui'
```

Replace hardcoded canvas size references.

Add dirty tile tracking:
```typescript
private dirtyTiles = new Set<number>()

private onStateChanged(prev: GameState, next: GameState): void {
  this.dirtyTiles.clear()
  for (let i = 0; i < next.board.length; i++) {
    if (next.board[i] !== prev.board[i]) this.dirtyTiles.add(i)
  }
  // Pass dirtyTiles to redraw — only update changed tiles
  this.updateBoardTiles(next, this.dirtyTiles)
}
```

Ensure `update()` method contains no `new` expressions or array allocations.

- [ ] **Step 6: Build and verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/phaser/
git commit -m "feat: migrate Phaser sprites to config, add PooledObject interface, add dirtyTiles tracking"
```

---

## Task 13: Create Phaser object pools

**Files:**
- Create: `src/phaser/pool/TokenSpritePool.ts`
- Create: `src/phaser/pool/BuildingSpritePool.ts`
- Modify: `src/phaser/scenes/BoardScene.ts`

- [ ] **Step 1: Create `src/phaser/pool/TokenSpritePool.ts`**

```typescript
import { ObjectPool } from '../../core/ObjectPool'
import { TokenSprite } from '../sprites/TokenSprite'
import type Phaser from 'phaser'

/**
 * Pre-allocated pool of TokenSprite instances.
 * Size 6 = maximum player count.
 * Pre-allocated at scene init so no TokenSprite is created during active gameplay.
 */
export class TokenSpritePool {
  private readonly pool: ObjectPool<TokenSprite>

  constructor(scene: Phaser.Scene) {
    // 6 = max players — covers every token that can ever be active simultaneously
    this.pool = new ObjectPool(() => new TokenSprite(scene, 0, 0), 6)
  }

  acquire(): TokenSprite { return this.pool.acquire() }
  release(token: TokenSprite): void { this.pool.release(token) }
  releaseAll(): void { this.pool.releaseAll() }
}
```

- [ ] **Step 2: Create `src/phaser/pool/BuildingSpritePool.ts`**

```typescript
import { ObjectPool } from '../../core/ObjectPool'
import { BuildingSprite } from '../sprites/BuildingSprite'
import type Phaser from 'phaser'

/**
 * Pre-allocated pool of BuildingSprite instances.
 * Size 40 = 10 buildable tiles × 4 max buildings per tile.
 * Pre-allocated at scene init to avoid runtime allocation during gameplay.
 */
export class BuildingSpritePool {
  private readonly pool: ObjectPool<BuildingSprite>

  constructor(scene: Phaser.Scene) {
    // 40 = 10 buildable property tiles × 4 max buildings each
    this.pool = new ObjectPool(() => new BuildingSprite(scene, 0, 0), 40)
  }

  acquire(): BuildingSprite { return this.pool.acquire() }
  release(sprite: BuildingSprite): void { this.pool.release(sprite) }
  releaseAll(): void { this.pool.releaseAll() }
}
```

- [ ] **Step 3: Update `BoardScene.ts`** — initialize pools in `create()`

```typescript
import { TokenSpritePool } from '../pool/TokenSpritePool'
import { BuildingSpritePool } from '../pool/BuildingSpritePool'

// In class:
private tokenPool!: TokenSpritePool
private buildingPool!: BuildingSpritePool

// In create():
this.tokenPool = new TokenSpritePool(this)
this.buildingPool = new BuildingSpritePool(this)
```

Replace all `new TokenSprite(...)` with `this.tokenPool.acquire()`.
Replace all `new BuildingSprite(...)` with `this.buildingPool.acquire()`.
In scene shutdown: `this.tokenPool.releaseAll(); this.buildingPool.releaseAll()`.

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/phaser/pool/
git commit -m "feat: add TokenSpritePool and BuildingSpritePool, wire into BoardScene"
```

---

## Task 14: Migrate UI layer — config strings/colors, file splits, animation pools

**Files:**
- Delete: `src/ui/theme/tokens.ts`
- Modify: all `src/ui/` files (string + color migration)
- Create: `src/ui/screens/setup/PlayerConfigRow.tsx`, `CharacterPicker.tsx`, `GameOptions.tsx`, `SaveSlotLoader.tsx`
- Create: `src/ui/panels/actions/RollDiceAction.tsx`, `PropertyActions.tsx`, `TradeActions.tsx`, `JailActions.tsx`
- Create: `src/ui/animation/dice/DiceFace.tsx`, `DiceRollSequence.tsx`
- Create: `src/ui/animation/MoneyEffectPool.ts`, `ParticlePool.ts`

- [ ] **Step 1: Delete `src/ui/theme/tokens.ts`**

```bash
git rm src/ui/theme/tokens.ts
```

Grep for remaining imports:
```bash
grep -r "theme/tokens" src/
```

For each result, replace `THEME.*` references with the equivalent from `config/ui.ts` and `config/text.ts`. Run `npx tsc --noEmit` after each file to confirm.

- [ ] **Step 2: Migrate string literals across all UI files**

For each file in `src/ui/`, replace hardcoded Vietnamese strings with imports from `config/text.ts`.

Order: `MainMenu.tsx` → `EndGameScreen.tsx` → `BoardStatus.tsx` → all modals → `PlayerListPanel.tsx` → `CurrentTilePanel.tsx` → `GameLogPanel.tsx` → `QuickGuidePanel.tsx`.

After each file:
```bash
npx tsc --noEmit
```

- [ ] **Step 3: Update UI components to read from `useUIStore`**

```bash
grep -r "showTradeModal\|inspectedPropertyId\|tokenAnimState\|pauseOpen\|setShowTradeModal\|setInspectedPropertyId\|setTokenAnimState" src/ui/
```

For each result, replace `useGameStore` read with `useUIStore`. Replace setter calls (e.g. `setShowTradeModal(true)` → `openTradeModal()`, `setInspectedPropertyId(id)` → `setInspectedProperty(id)`).

- [ ] **Step 4: Split `SetupGameScreen.tsx`**

Create the 4 sub-components, extracting JSX and local state from the current 22.6 KB file:

`src/ui/screens/setup/PlayerConfigRow.tsx`:
```typescript
interface PlayerConfigRowProps {
  index: number
  playerName: string
  selectedCharacterId: string
  onNameChange: (index: number, name: string) => void
  onCharacterChange: (index: number, characterId: string) => void
}
```

`src/ui/screens/setup/CharacterPicker.tsx`:
```typescript
interface CharacterPickerProps {
  selected: string
  onSelect: (id: string) => void
}
```

`src/ui/screens/setup/GameOptions.tsx`:
```typescript
interface GameOptionsProps {
  enableAuction: boolean
  onToggleAuction: (enabled: boolean) => void
}
```

`src/ui/screens/setup/SaveSlotLoader.tsx`:
```typescript
interface SaveSlotLoaderProps {
  onLoad: (state: GameState, slotId: string) => void
}
```

`SetupGameScreen.tsx` becomes the orchestrator — imports and composes these four.

- [ ] **Step 5: Split `ActionPanel.tsx`**

`src/ui/panels/actions/RollDiceAction.tsx`:
```typescript
interface RollDiceActionProps {
  onRoll: () => void
  lastDice?: [number, number]
  isJailed: boolean
  isRolling: boolean
}
```

`src/ui/panels/actions/PropertyActions.tsx`:
```typescript
interface PropertyActionsProps {
  phase: Phase
  currentPlayer: Player
  currentTile: BoardTile
  onBuy: () => void
  onDecline: () => void
  onBuild: (propertyId: string) => void
  onPass: () => void
}
```

`src/ui/panels/actions/TradeActions.tsx`:
```typescript
interface TradeActionsProps {
  players: Player[]
  currentPlayer: Player
  onPropose: (offer: TradeOffer) => void
}
```

`src/ui/panels/actions/JailActions.tsx`:
```typescript
interface JailActionsProps {
  onPayFine: () => void
  onRollDoubles: () => void
  cash: number
  jailFine: number
}
```

`ActionPanel.tsx` becomes orchestrator — phase-gates and renders the correct sub-component.

- [ ] **Step 6: Split `DiceRollAnimation.tsx`**

`src/ui/animation/dice/DiceFace.tsx`:
```typescript
interface DiceFaceProps {
  value: 1 | 2 | 3 | 4 | 5 | 6
  rolling: boolean
}
```

`src/ui/animation/dice/DiceRollSequence.tsx`:
```typescript
interface DiceRollSequenceProps {
  targetDice: [number, number]
  onComplete: () => void
  durationMs: number  // pass ANIMATION_DURATIONS.diceRoll from parent
}
```

`DiceRollAnimation.tsx` becomes the orchestrator.

- [ ] **Step 7: Create animation pool stubs**

`src/ui/animation/MoneyEffectPool.ts`:
```typescript
import { ObjectPool, type PooledObject } from '../../core/ObjectPool'

/**
 * Pool for money floater DOM effects.
 * Size 10 = max concurrent gain/loss floaters visible simultaneously.
 * Effects call pool.acquire() on mount and pool.release() on unmount.
 */
export class MoneyEffectPool {
  // Stub — full portal pooling wired up when MoneyGainEffect/MoneyLossEffect
  // are refactored to call acquire/release on mount/unmount
  readonly pool = new ObjectPool<PooledObject>(
    () => ({ reset() {}, activate() {} }),
    10 // 10 = max simultaneous floaters
  )
}

export const moneyEffectPool = new MoneyEffectPool()
```

`src/ui/animation/ParticlePool.ts`:
```typescript
import { ObjectPool, type PooledObject } from '../../core/ObjectPool'

/**
 * Pool for particle DOM nodes.
 * Size 20 = typical burst particle count per celebration effect.
 */
export class ParticlePool {
  readonly pool = new ObjectPool<PooledObject>(
    () => ({ reset() {}, activate() {} }),
    20 // 20 = typical burst size for PurchaseCelebration
  )
}

export const particlePool = new ParticlePool()
```

- [ ] **Step 8: Build and run all tests**

```bash
npm run build && npm test
```

Expected: build succeeds, all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/ui/ src/config/text.ts
git commit -m "feat: migrate UI to config, split SetupGameScreen/ActionPanel/DiceRollAnimation, delete tokens.ts"
```

---

## Task 15: Web performance — remove unused deps, configure Vite

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `src/ui/board/Board.tsx`
- Modify: `index.html`

- [ ] **Step 1: Remove unused dependencies**

```bash
npm uninstall three @react-three/fiber @react-three/drei @types/three
```

- [ ] **Step 2: Verify build after removal**

```bash
npm run build
```

Expected: build succeeds.

Verify Three.js is absent:
```bash
grep -r "three" dist/assets/ || echo "three not found"
```

Expected: `three not found`.

- [ ] **Step 3: Install image compression plugin**

Check Vite 8 compatibility:
```bash
npm show unplugin-imagemin version
```

If compatible: `npm install -D unplugin-imagemin`
Otherwise: `npm install -D vite-plugin-imagemin`

- [ ] **Step 4: Update `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Add imagemin plugin result from Step 3 here
  ],
  build: {
    // Never base64-inline assets — keep all assets as separate cacheable files
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          // Phaser is lazy-loaded — separate chunk keeps it out of the initial bundle
          phaser: ['phaser'],
          // Framer Motion is large — separate chunk for better caching
          'framer-motion': ['framer-motion'],
          // React + Zustand core vendor chunk
          vendor: ['react', 'react-dom', 'zustand'],
        },
      },
    },
  },
})
```

- [ ] **Step 5: Lazy-load Phaser in `Board.tsx`**

Replace static Phaser imports with dynamic imports:

```typescript
import { useEffect, useRef } from 'react'

export function Board() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function initPhaser() {
      const [{ default: Phaser }, { PhaserBridge }, { GAME_CONFIG }] = await Promise.all([
        import('phaser'),
        import('../../phaser/bridge/PhaserBridge'),
        import('../../phaser/GameConfig'),
      ])
      if (!containerRef.current) return
      const game = new Phaser.Game({ ...GAME_CONFIG, parent: containerRef.current })
      PhaserBridge.initialize(game)
      cleanup = () => {
        PhaserBridge.destroy()
        game.destroy(true)
      }
    }

    initPhaser()
    return () => cleanup?.()
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
```

Remove any static `import Phaser` or `import { PhaserBridge }` from `Board.tsx`.

- [ ] **Step 6: Add preload hint to `index.html`**

```html
<link rel="preload" href="/assets/bg/main-menu.png" as="image" />
```

Add inside `<head>` before existing tags.

- [ ] **Step 7: Build and check bundle sizes**

```bash
npm run build
```

Check gzip sizes:
```bash
ls dist/assets/*.js | while read f; do gzip -c "$f" | wc -c | awk -v name="$f" '{printf "%.1f KB\t%s\n", $1/1024, name}'; done | sort -n
```

Targets: vendor + main < 200 KB gz, Phaser chunk < 500 KB gz.

- [ ] **Step 8: Commit**

```bash
git add package.json vite.config.ts src/ui/board/Board.tsx index.html
git commit -m "perf: remove three.js, lazy-load Phaser, configure Vite manualChunks and imagemin"
```

---

## Task 16: Add module READMEs

**Files:**
- Create: `src/config/README.md`
- Create: `src/core/README.md`
- Create: `src/game-engine/README.md`
- Create: `src/phaser/README.md`
- Create: `src/ui/README.md`
- Create: `src/app/README.md`
- Create: `src/storage/README.md`

- [ ] **Step 1: Create `src/config/README.md`**

```markdown
# config

## Purpose
Pure typed constants. All configurable values live here: asset paths, gameplay parameters, UI constants, audio keys, and user-facing strings. No business logic, no `src/` imports.

## Public API
All named exports from `assets.ts`, `gameplay.ts`, `ui.ts`, `audio.ts`, `text.ts`.

## Depends On
Nothing — no imports from `src/`.

## Must NOT Be Imported By
N/A — all other modules may import from `config/`.
```

- [ ] **Step 2: Create `src/core/README.md`**

```markdown
# core

## Purpose
Framework-agnostic infrastructure: EventBus (typed pub/sub), StateMachine (transition table engine), ObjectPool (generic recycling pool), animationSubscriber (state delta → animation queue bridge).

## Public API
`eventBus`, `EventBus`, `GameEventMap`, `StateMachine`, `Transition`, `ObjectPool`, `PooledObject`, `initAnimationSubscriber`.

## Depends On
`config/` only.

## Must NOT Be Imported By
Nothing blocked — but `core/` itself must never import from `game-engine/rules/`, `ui/`, `phaser/`, or `app/store/`.
```

- [ ] **Step 3: Create `src/game-engine/README.md`**

```markdown
# game-engine

## Purpose
Pure TypeScript game logic. All functions are pure (no side effects, no framework dependency). The reducer is the single source of truth for all game state transitions.

## Public API
`gameReducer`, `createInitialGame`, all rule functions (`buyProperty`, `payRent`, `buildProperty`, etc.), `GameState`, `GameAction`, `Phase`, all game types.

## Depends On
`config/gameplay.ts`, `config/text.ts`, `core/StateMachine.ts`.

## Must NOT Be Imported By
`ui/` components must not call rule functions directly. `phaser/` must not import from `game-engine/`. All game state changes go through `useGameStore.dispatch()`.
```

- [ ] **Step 4: Create `src/phaser/README.md`**

```markdown
# phaser

## Purpose
Phaser 4 canvas rendering — board tiles, player tokens, dice, buildings. Communicates with the rest of the app exclusively through EventBus. Never reads Zustand directly.

## Public API
None exported — Phaser layer is self-contained. Entry point: `PhaserBridge.initialize(game)`.

## Depends On
`core/EventBus.ts`, `core/ObjectPool.ts`, `config/assets.ts`, `config/ui.ts`.

## Must NOT Be Imported By
`ui/` React components must never import Phaser classes. `app/store/` must never import from `phaser/`. `game-engine/` must never import from `phaser/`.
```

- [ ] **Step 5: Create `src/ui/README.md`**

```markdown
# ui

## Purpose
All React UI — screens, panels, modals, animations. Reads game state from `useGameStore`, UI state from `useUIStore`. Uses EventBus for cross-layer subscriptions (tile clicks, phaser errors).

## Public API
None exported outside `ui/` — consumed only by `App.tsx`.

## Depends On
`config/text.ts`, `config/ui.ts`, `core/EventBus.ts`, `app/store/`.

## Must NOT Be Imported By
`phaser/` must never import React components. `game-engine/` must never import UI components. UI components must never call game-engine rule functions directly.
```

- [ ] **Step 6: Create `src/app/README.md`**

```markdown
# app/store

## Purpose
Zustand stores bridging game logic and UI. `useGameStore` owns `GameState` and dispatches actions. `useUIStore` owns all UI-only state. `useAnimationQueue` drives animation sequencing.

## Public API
`useGameStore`, `useUIStore`, `useAnimationQueue`, `dispatch`.

## Depends On
`game-engine/`, `core/EventBus.ts`, `storage/`.

## Must NOT Be Imported By
`phaser/` reads state via EventBus only — must not import stores. `game-engine/` is pure — must not import stores.
```

- [ ] **Step 7: Create `src/storage/README.md`**

```markdown
# storage

## Purpose
localStorage persistence for game saves. Handles named save slots, schema versioning, and corruption detection.

## Public API
`saveGame`, `loadGame`, `listSaves`, `hasSave`, `deleteSave`, `clearSave`.

## Depends On
`config/gameplay.ts` (save key and version).

## Must NOT Be Imported By
Nothing blocked — but `storage/` must never import from `ui/`, `phaser/`, or `app/store/`.
```

- [ ] **Step 8: Commit all READMEs**

```bash
git add src/config/README.md src/core/README.md src/game-engine/README.md src/phaser/README.md src/ui/README.md src/app/README.md src/storage/README.md
git commit -m "docs: add module READMEs with purpose, public API, and boundary rules"
```

---

## Task 17: Update `storage/gameStorage.ts` and add `ErrorBoundary` to `main.tsx`

**Files:**
- Modify: `src/storage/gameStorage.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `gameStorage.ts`**

```typescript
import { SAVE_STORAGE_KEY, SAVE_VERSION } from '../config/gameplay'
```

Replace hardcoded save key string with `SAVE_STORAGE_KEY`.

Add version field to save metadata structure:
```typescript
interface SaveMetadata {
  slotId: string
  playerNames: string[]
  savedAt: number
  version: number
}
```

In `saveGame()`, include version:
```typescript
const metadata: SaveMetadata = {
  slotId,
  playerNames: state.players.map(p => p.name),
  savedAt: Date.now(),
  version: SAVE_VERSION,
}
```

In `loadGame()`, check version before returning state:
```typescript
if (!metadata || metadata.version !== SAVE_VERSION) {
  console.warn('[Storage] Save version mismatch — returning null.')
  return null
}
```

- [ ] **Step 2: Add `ErrorBoundary` to `main.tsx`**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ERROR_MESSAGES } from './config/text'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    console.error('[ErrorBoundary] Uncaught React error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <p>{ERROR_MESSAGES.unknownError}</p>
          <button onClick={() => window.location.reload()}>Tải lại</button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
```

- [ ] **Step 3: Build and run full test suite**

```bash
npm run build && npm test
```

Expected: build succeeds, all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/storage/gameStorage.ts src/main.tsx
git commit -m "feat: add save version field to storage, add ErrorBoundary to main.tsx"
```

---

## Task 18: Final verification

- [ ] **Step 1: Run full test suite with coverage**

```bash
npm test -- --coverage
```

Expected:
- All tests pass
- `src/game-engine/` coverage ≥ 80%
- `src/core/` coverage ≥ 80%

- [ ] **Step 2: TypeScript strict check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 3: Verify no Zustand in Phaser layer**

```bash
grep -r "zustand" src/phaser/
```

Expected: 0 results.

- [ ] **Step 4: Verify no Phaser in UI**

```bash
grep -r "from 'phaser'\|from \"phaser\"" src/ui/
```

Expected: 0 results.

- [ ] **Step 5: Verify Three.js removed**

```bash
grep -r "three\|@react-three" package.json src/
```

Expected: 0 results.

- [ ] **Step 6: Verify no old tokens.ts imports**

```bash
grep -r "theme/tokens" src/
```

Expected: 0 results.

- [ ] **Step 7: Check bundle sizes**

```bash
npm run build
ls dist/assets/*.js | while read f; do gzip -c "$f" | wc -c | awk -v name="$f" '{printf "%.1f KB gz\t%s\n", $1/1024, name}'; done | sort -n
```

Targets: main/vendor chunk < 200 KB gz; Phaser chunk < 500 KB gz.

- [ ] **Step 8: Manual smoke test**

```bash
npm run dev
```

Open browser and verify:
- [ ] MainMenu loads without console errors
- [ ] Starting a 2-player game works
- [ ] Dice roll → token moves → tile resolves (full turn loop)
- [ ] Property purchase works
- [ ] End turn passes to next player
- [ ] Trade modal opens and closes correctly
- [ ] Pause menu saves and loads
- [ ] No visible regressions in UI appearance

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "chore: refactor complete — all verification checks pass"
```

---

## Verification Summary

| Check | Command | Expected |
|-------|---------|---------|
| Tests pass | `npm test` | All green |
| Coverage ≥ 80% on core + engine | `npm test -- --coverage` | ≥ 80% |
| No TS errors | `npx tsc --noEmit` | 0 errors |
| No Zustand in Phaser | `grep -r "zustand" src/phaser/` | 0 results |
| No Phaser in UI | `grep -r "from 'phaser'" src/ui/` | 0 results |
| Three.js removed | `grep -r "three" package.json` | 0 results |
| No old tokens.ts imports | `grep -r "theme/tokens" src/` | 0 results |
| Phaser chunk size | gzip check | < 500 KB |
| Main chunk size | gzip check | < 200 KB |
| Manual smoke test | `npm run dev` | Full game loop works |
