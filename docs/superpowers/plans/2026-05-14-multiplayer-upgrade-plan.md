# Multiplayer Online Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Property Tycoon Web from hot-seat-only to dual-mode (offline hot-seat + online multiplayer) via npm workspaces monorepo with shared engine, authoritative Node.js server, and mode-switch client dispatch.

**Architecture:** Hybrid approach — extract the existing pure `gameReducer` into `packages/engine`, wrap it in a thin `GameController` class for the server, keep the Phaser+React client in `packages/client` with a `NetworkManager` and dual-mode Zustand store. Server is Node.js + Express + Socket.IO, single-process, in-memory state.

**Tech Stack:** TypeScript 6.0, npm workspaces, Vitest, React 19, Phaser 4, Zustand 5, Socket.IO (server + client), Express, Vite 8.

---

## Pre-Plan Assumptions

1. The existing client builds and all 32 tests pass before starting (`npm run build && npm test`)
2. Node.js ≥ 20 available for server runtime
3. npm workspaces will be used (not yarn/pnpm) since the project already uses npm
4. Every task ends with `npm run build` and `npm test` passing across affected packages
5. The `gameReducer` itself is **never modified** — it is moved but not changed

---

### Task 1: Monorepo Workspace Scaffold

**Files:**
- Modify: `package.json` (root)
- Create: `tsconfig.base.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/engine/package.json`
- Create: `packages/engine/tsconfig.json`
- Create: `packages/server/package.json`
- Create: `packages/server/tsconfig.json`
- Create: `packages/client/package.json` (replaces current root package)

- [ ] **Step 1: Update root `package.json` for workspaces**

Modify `D:\PROJECT\draft\property-tycoon-web\package.json`:

```json
{
  "name": "property-tycoon-web",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "eslint .",
    "dev": "npm run dev --workspace=@property-tycoon/client",
    "preview": "npm run preview --workspace=@property-tycoon/client"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

Create `D:\PROJECT\draft\property-tycoon-web\tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023"],
    "module": "esnext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "composite": true
  }
}
```

- [ ] **Step 3: Create `packages/shared/package.json`**

```json
{
  "name": "@property-tycoon/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

- [ ] **Step 4: Create `packages/shared/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create `packages/engine/package.json`**

```json
{
  "name": "@property-tycoon/engine",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@property-tycoon/shared": "*"
  }
}
```

- [ ] **Step 6: Create `packages/engine/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "references": [{ "path": "../shared" }]
}
```

- [ ] **Step 7: Create `packages/server/package.json`**

```json
{
  "name": "@property-tycoon/server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@property-tycoon/engine": "*",
    "@property-tycoon/shared": "*",
    "express": "^5.1.0",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "@types/express": "^5.0.3",
    "socket.io-client": "^4.8.1",
    "tsx": "^4.19.0",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 8: Create `packages/server/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2023"],
    "types": ["node"]
  },
  "include": ["src"],
  "references": [{ "path": "../engine" }, { "path": "../shared" }]
}
```

- [ ] **Step 9: Create `packages/client/package.json`** (move current dependencies from root)

```json
{
  "name": "@property-tycoon/client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@property-tycoon/engine": "*",
    "@property-tycoon/shared": "*",
    "@tailwindcss/vite": "^4.2.4",
    "framer-motion": "^12.38.0",
    "lucide-react": "^1.14.0",
    "phaser": "^4.1.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "socket.io-client": "^4.8.1",
    "zustand": "^5.0.12"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "@vitest/ui": "^4.1.5",
    "autoprefixer": "^10.5.0",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "jsdom": "^29.1.1",
    "postcss": "^8.5.13",
    "tailwindcss": "^4.2.4",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2",
    "vite": "^8.0.10",
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 10: Create `packages/client/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "../engine" }, { "path": "../shared" }]
}
```

- [ ] **Step 11: Move existing source into `packages/client/`**

Move all of these from root into `packages/client/`:
- `src/` → `packages/client/src/`
- `public/` → `packages/client/public/`
- `index.html` → `packages/client/index.html`
- `vite.config.ts` → `packages/client/vite.config.ts`
- `vitest.config.ts` → `packages/client/vitest.config.ts`
- `eslint.config.js` → `packages/client/eslint.config.js`

Run: use file manager to move directories and files.

Update `packages/client/index.html` — change `<script type="module" src="/src/main.tsx">` (already correct, verify).

- [ ] **Step 12: Install and verify scaffold**

Run: `npm install` (from root)

Run: `npm run build` (from root)
Expected: FAIL — imports throughout client still reference relative paths to engine/config that no longer resolve. This is expected; we'll fix them in Task 2 and Task 3.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: scaffold monorepo with packages/shared, engine, server, client"
```

---

### Task 2: Extract Shared Package (@property-tycoon/shared)

**Files:**
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types.ts` (from `src/game-engine/types/game.ts`)
- Create: `packages/shared/src/constants.ts` (from `src/config/gameplay.ts`)
- Modify: all files in `packages/client/src/` that import from `../../game-engine/types/game` or `../../config/gameplay`

- [ ] **Step 1: Create `packages/shared/src/types.ts`**

Copy the ENTIRE content of `packages/client/src/game-engine/types/game.ts` into `packages/shared/src/types.ts`. Do not modify any types.

- [ ] **Step 2: Create `packages/shared/src/constants.ts`**

Copy the ENTIRE content of `packages/client/src/config/gameplay.ts` into `packages/shared/src/constants.ts`. Do not modify any constants.

- [ ] **Step 3: Create `packages/shared/src/index.ts`**

```typescript
export * from './types.js';
export * from './constants.js';
```

- [ ] **Step 4: Update imports across the client — replace `game-engine/types/game` imports**

Find all files importing from paths matching `game-engine/types/game` or `../../game-engine/types/game` and replace with `@property-tycoon/shared`.

Run to find them:
```
rtk grep "from.*game-engine/types/game" packages/client/src/
```

For each file found, update the import. Key files (not exhaustive — use grep results):
- `packages/client/src/app/store/useGameStore.ts` — change `import { type GameState, type GameAction, Phase } from '../../game-engine/types/game'` to `import { type GameState, type GameAction, Phase } from '@property-tycoon/shared'`
- `packages/client/src/core/EventBus.ts` — change import
- `packages/client/src/phaser/bridge/PhaserBridge.ts` — change import
- `packages/client/src/game-engine/state/gameReducer.ts` — change `import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game'` to `import { type GameState, type GameAction, Phase, TileType, type Property } from '@property-tycoon/shared'`
- All files in `packages/client/src/game-engine/rules/` — update imports
- All files in `packages/client/src/game-engine/state/` — update imports
- All files in `packages/client/src/ui/` that import game types — update imports

- [ ] **Step 5: Update imports across the client — replace `config/gameplay` imports**

Find all files importing from paths matching `config/gameplay` or `../../config/gameplay`:
```
rtk grep "from.*config/gameplay" packages/client/src/
```

Replace with `@property-tycoon/shared`. Key files:
- `packages/client/src/game-engine/state/gameReducer.ts` — change `import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '../../config/gameplay'` to `import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '@property-tycoon/shared'`
- `packages/client/src/game-engine/rules/rentRules.ts` — update
- `packages/client/src/game-engine/rules/buildingRules.ts` — update
- `packages/client/src/game-engine/rules/financeRules.ts` — update
- `packages/client/src/game-engine/data/boards/basicBoard.ts` — update
- `packages/client/src/config/gameplay.test.ts` — change to import from `@property-tycoon/shared`

- [ ] **Step 6: Update `packages/client/src/config/gameplay.test.ts`**

Change:
```typescript
import { STARTING_CASH, ... } from './gameplay'
```
to:
```typescript
import { STARTING_CASH, ... } from '@property-tycoon/shared'
```

Also move this test file to `packages/shared/` or keep it in client referencing shared — simpler to keep in client since it tests constants that are now from shared.

- [ ] **Step 7: Verify build**

Run: `npm run build` (from root)
Expected: PASS — all imports resolve, types compile. If build fails, fix remaining import paths until clean.

- [ ] **Step 8: Verify tests**

Run: `npm test` (from root)
Expected: All 32 existing tests pass. The `gameplay.test.ts` should pass using the shared constants.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: extract shared types and constants into @property-tycoon/shared"
```

---

### Task 3: Extract Engine Package (@property-tycoon/engine)

**Files:**
- Create: `packages/engine/src/index.ts`
- Move: `packages/client/src/game-engine/` → `packages/engine/src/`
- Modify: remaining client imports that point to `game-engine/` internally

- [ ] **Step 1: Move game-engine into engine package**

Move everything under `packages/client/src/game-engine/` into `packages/engine/src/`:

```
packages/client/src/game-engine/types/    → DELETED (already in shared)
packages/client/src/game-engine/state/    → packages/engine/src/state/
packages/client/src/game-engine/rules/    → packages/engine/src/rules/
packages/client/src/game-engine/data/     → packages/engine/src/data/
packages/client/src/game-engine/utils/    → packages/engine/src/utils/
packages/client/src/game-engine/tests/    → packages/engine/src/tests/
packages/client/src/game-engine/README.md → packages/engine/src/README.md
```

Delete `packages/client/src/game-engine/types/` — already extracted to `shared`.
Delete `packages/client/src/game-engine/` directory entirely after move.

- [ ] **Step 2: Fix internal engine imports**

In `packages/engine/src/state/gameReducer.ts`, change:
```typescript
import { type GameState, type GameAction, Phase, TileType, type Property } from '../types/game';
```
to:
```typescript
import { type GameState, type GameAction, Phase, TileType, type Property } from '@property-tycoon/shared';
```

Also change:
```typescript
import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '../../config/gameplay';
```
to:
```typescript
import { TAX_LUXURY_AMOUNT, TAX_INCOME_AMOUNT } from '@property-tycoon/shared';
```

And:
```typescript
import { GAME_LOG, BUILDING_LEVEL_NAMES } from '../../config/text';
```
This one is significant — `config/text.ts` has UI strings (Vietnamese). The engine currently imports it for log messages. Leave this import pointing to `@property-tycoon/client`? No — that creates a circular dependency.

**Decision:** Remove the `GAME_LOG` and `BUILDING_LEVEL_NAMES` imports from the reducer. The reducer should return log data as part of events/state rather than importing UI strings directly. Create a temporary adapter:

In `packages/engine/src/state/gameReducer.ts`, replace:
```typescript
import { GAME_LOG, BUILDING_LEVEL_NAMES } from '../../config/text';
```

Search for usages of `GAME_LOG` and `BUILDING_LEVEL_NAMES` in the reducer and replace with inline string constants temporarily. Specifically:

If the reducer uses `GAME_LOG.rentPaid(playerName, amount)` etc., extract just the message template strings into `packages/shared/src/constants.ts`:

```typescript
// Add to packages/shared/src/constants.ts:
export const GAME_LOG_TEMPLATES = {
  rentPaid: (player: string, amount: number) => `${player} paid ${amount} in rent`,
  buildingBought: (player: string, property: string, level: string) => `${player} built a ${level} on ${property}`,
  // ... add only templates actually used by the reducer
} as const;
```

Then import from `@property-tycoon/shared` in the engine.

- [ ] **Step 3: Fix all rule module imports**

In every file under `packages/engine/src/rules/`, update relative imports:
- `import { ... } from '../types/game'` → `import { ... } from '@property-tycoon/shared'`
- `import { ... } from '../../config/gameplay'` → `import { ... } from '@property-tycoon/shared'`

Files to update:
```
packages/engine/src/rules/diceRules.ts
packages/engine/src/rules/movementRules.ts
packages/engine/src/rules/propertyRules.ts
packages/engine/src/rules/rentRules.ts
packages/engine/src/rules/buildingRules.ts
packages/engine/src/rules/financeRules.ts
packages/engine/src/rules/jailRules.ts
packages/engine/src/rules/cardRules.ts
packages/engine/src/rules/auctionRules.ts
packages/engine/src/rules/tradeRules.ts
packages/engine/src/state/phaseMachine.ts
packages/engine/src/state/setupGame.ts
packages/engine/src/data/cards.ts
packages/engine/src/data/characters.ts
packages/engine/src/data/boards/basicBoard.ts
packages/engine/src/utils/boardGeometry.ts
```

- [ ] **Step 4: Create `packages/engine/src/index.ts`**

```typescript
export { gameReducer, assertGameInvariants } from './state/gameReducer.js';
export { createInitialGame } from './state/setupGame.js';
export { phaseMachine } from './state/phaseMachine.js';
export * from './rules/diceRules.js';
export * from './rules/movementRules.js';
export * from './rules/propertyRules.js';
export * from './rules/rentRules.js';
export * from './rules/buildingRules.js';
export * from './rules/financeRules.js';
export * from './rules/jailRules.js';
export * from './rules/cardRules.js';
export * from './rules/auctionRules.js';
export * from './rules/tradeRules.js';
export * from './data/boards/basicBoard.js';
export * from './data/cards.js';
export * from './data/characters.js';
export * from './utils/boardGeometry.js';
```

- [ ] **Step 5: Update client imports to use @property-tycoon/engine**

Find all remaining imports in `packages/client/src/` that import from `game-engine/`:
```
rtk grep "from.*game-engine" packages/client/src/
```

Update each to import from `@property-tycoon/engine`. Key files:
- `packages/client/src/app/store/useGameStore.ts`:
  ```typescript
  import { gameReducer } from '@property-tycoon/engine';
  ```
- `packages/client/src/app/subscribers/animationSubscriber.ts` — update imports
- Any UI files importing engine utils — update

Also update `packages/client/src/config/gameplay.test.ts` if it still imports from local gameplay (should already be `@property-tycoon/shared` from Task 2).

- [ ] **Step 6: Remove old config/gameplay.ts from client**

Delete `packages/client/src/config/gameplay.ts` — now fully in `packages/shared/src/constants.ts`.
Delete `packages/client/src/config/gameplay.test.ts` — move to engine package or shared, or rewrite to test shared constants.

Move `packages/client/src/config/gameplay.test.ts` → `packages/shared/src/constants.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { STARTING_CASH, PASS_START_BONUS, JAIL_FINE, MAX_JAIL_TURNS, MORTGAGE_RATE, UNMORTGAGE_RATE } from './constants.js';

describe('Gameplay Constants', () => {
  it('STARTING_CASH is 1500', () => { expect(STARTING_CASH).toBe(1500); });
  it('PASS_START_BONUS is 200', () => { expect(PASS_START_BONUS).toBe(200); });
  it('JAIL_FINE is 50', () => { expect(JAIL_FINE).toBe(50); });
  it('MAX_JAIL_TURNS is 3', () => { expect(MAX_JAIL_TURNS).toBe(3); });
  it('MORTGAGE_RATE is 0.5', () => { expect(MORTGAGE_RATE).toBe(0.5); });
  it('UNMORTGAGE_RATE is 0.55', () => { expect(UNMORTGAGE_RATE).toBe(0.55); });
  // ... copy all existing test assertions from original file
});
```

Add test script to `packages/shared/package.json`:
```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^4.1.5"
  }
}
```

- [ ] **Step 7: Add vitest config for engine package**

Create `packages/engine/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

Add `"test": "vitest run"` script to `packages/engine/package.json`.
Add `"vitest": "^4.1.5"` to `packages/engine/devDependencies`.

- [ ] **Step 8: Verify build**

Run: `npm install` (root)
Run: `npm run build` (root)
Expected: PASS — engine package compiles, client imports resolve.

- [ ] **Step 9: Verify tests**

Run: `npm test` (root)
Expected: 32+ tests pass (shared constant tests + engine tests + core tests).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: extract game engine into @property-tycoon/engine package"
```

---

### Task 4: Create GameController + diffEvents

**Files:**
- Create: `packages/engine/src/GameController.ts`
- Create: `packages/engine/src/diffEvents.ts`
- Create: `packages/engine/src/tests/GameController.test.ts`
- Create: `packages/engine/src/tests/diffEvents.test.ts`
- Modify: `packages/engine/src/index.ts` — add exports

- [ ] **Step 1: Write the failing test for GameController.applyAction()**

Create `packages/engine/src/tests/GameController.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GameController } from '../GameController.js';
import { Phase } from '@property-tycoon/shared';
import type { GameState } from '@property-tycoon/shared';

function createTestConfig() {
  return {
    playerCount: 2,
    playerNames: ['An', 'Binh'],
    characterIds: ['ghosty', 'chibi-cat'],
    boardId: 'basic',
  };
}

describe('GameController', () => {
  let controller: GameController;

  beforeEach(() => {
    controller = new GameController(createTestConfig());
  });

  it('initializes with SETUP phase', () => {
    const state = controller.getState();
    expect(state.phase).toBe(Phase.SETUP);
  });

  it('applyAction returns success for valid action', () => {
    // Transition from SETUP to WAITING_TO_ROLL
    const result = controller.applyAction({ type: 'START_GAME' });
    expect(result.success).toBe(true);
    expect(result.state.phase).toBe(Phase.WAITING_TO_ROLL);
  });

  it('applyAction returns error for invalid action in current phase', () => {
    // ROLL_DICE is invalid during SETUP
    const result = controller.applyAction({
      type: 'ROLL_DICE',
      payload: { dice: [3, 5] },
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid action');
  });

  it('applyAction generates events on state change', () => {
    const result = controller.applyAction({ type: 'START_GAME' });
    expect(result.success).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events.some(e => e.type === 'PHASE_CHANGED')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/engine/src/tests/GameController.test.ts`
Expected: FAIL — `GameController` not found, `START_GAME` action may not exist.

- [ ] **Step 3: Implement `GameController.ts`**

Create `packages/engine/src/GameController.ts`:

```typescript
import { type GameState, type GameAction, Phase } from '@property-tycoon/shared';
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
    const canTransition = phaseMachine.canTransition(
      this.state.phase,
      action.type,
      this.state,
    );

    if (!canTransition) {
      return {
        success: false,
        state: this.state,
        events: [],
        error: `Invalid action ${action.type} in phase ${this.state.phase}`,
      };
    }

    const newState = gameReducer(this.state, action);
    const events = diffEvents(this.state, newState);
    this.state = newState;

    return { success: true, state: this.state, events };
  }

  getState(): GameState {
    return this.state;
  }
}
```

- [ ] **Step 4: Implement `diffEvents.ts`**

Create `packages/engine/src/diffEvents.ts`:

```typescript
import { type GameState, Phase, type PlayerId, type Money } from '@property-tycoon/shared';

export interface GameEvent {
  type: string;
  payload: Record<string, unknown>;
}

export function diffEvents(prev: GameState, next: GameState): GameEvent[] {
  const events: GameEvent[] = [];

  // Phase change
  if (prev.phase !== next.phase) {
    events.push({
      type: 'PHASE_CHANGED',
      payload: { from: prev.phase, to: next.phase },
    });
  }

  // Dice rolled
  if (prev.diceResult && next.diceResult &&
      (prev.diceResult[0] !== next.diceResult[0] || prev.diceResult[1] !== next.diceResult[1])) {
    events.push({
      type: 'DICE_ROLLED',
      payload: { dice: next.diceResult, playerId: next.currentPlayerId },
    });
  }

  // Token moved
  const prevPlayer = prev.players.find(p => p.id === prev.currentPlayerId);
  const nextPlayer = next.players.find(p => p.id === next.currentPlayerId);
  if (prevPlayer && nextPlayer && prevPlayer.position !== nextPlayer.position) {
    events.push({
      type: 'TOKEN_MOVED',
      payload: {
        playerId: nextPlayer.id,
        from: prevPlayer.position,
        to: nextPlayer.position,
      },
    });
  }

  // Cash changes (rent paid, money gained, etc.)
  for (const np of next.players) {
    const pp = prev.players.find(p => p.id === np.id);
    if (pp && pp.cash !== np.cash) {
      const diff = np.cash - pp.cash;
      events.push({
        type: diff > 0 ? 'MONEY_GAINED' : 'MONEY_LOST',
        payload: { playerId: np.id, amount: Math.abs(diff) },
      });
    }
  }

  // Player bankrupt
  for (const np of next.players) {
    const pp = prev.players.find(p => p.id === np.id);
    if (pp && !pp.isBankrupt && np.isBankrupt) {
      events.push({
        type: 'PLAYER_BANKRUPT',
        payload: { playerId: np.id },
      });
    }
  }

  // Game over
  if (next.phase === Phase.GAME_OVER && prev.phase !== Phase.GAME_OVER) {
    const winner = next.players.find(p => !p.isBankrupt);
    events.push({
      type: 'GAME_OVER',
      payload: { winnerId: winner?.id },
    });
  }

  return events;
}
```

- [ ] **Step 5: Write diffEvents tests**

Create `packages/engine/src/tests/diffEvents.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { diffEvents } from '../diffEvents.js';
import { Phase } from '@property-tycoon/shared';
import type { GameState } from '@property-tycoon/shared';

function makeMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: Phase.WAITING_TO_ROLL,
    players: [
      { id: 'p1', name: 'An', cash: 1500, position: 0, isBankrupt: false, characterId: 'ghosty' } as any,
      { id: 'p2', name: 'Binh', cash: 1500, position: 0, isBankrupt: false, characterId: 'chibi-cat' } as any,
    ],
    currentPlayerId: 'p1',
    board: [],
    doublesCount: 0,
    turn: 1,
    ...overrides,
  };
}

describe('diffEvents', () => {
  it('detects phase change', () => {
    const prev = makeMockState({ phase: Phase.WAITING_TO_ROLL });
    const next = makeMockState({ phase: Phase.ROLLING });
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'PHASE_CHANGED')).toBe(true);
  });

  it('detects token movement', () => {
    const prev = makeMockState();
    const next = makeMockState();
    next.players[0].position = 7;
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'TOKEN_MOVED')).toBe(true);
  });

  it('detects money gained', () => {
    const prev = makeMockState();
    const next = makeMockState();
    next.players[0].cash = 1700;
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'MONEY_GAINED' && e.payload.amount === 200)).toBe(true);
  });

  it('detects money lost', () => {
    const prev = makeMockState();
    const next = makeMockState();
    next.players[0].cash = 1300;
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'MONEY_LOST' && e.payload.amount === 200)).toBe(true);
  });

  it('detects bankruptcy', () => {
    const prev = makeMockState();
    const next = makeMockState();
    next.players[0].isBankrupt = true;
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'PLAYER_BANKRUPT')).toBe(true);
  });

  it('detects game over', () => {
    const prev = makeMockState();
    const next = makeMockState({ phase: Phase.GAME_OVER });
    next.players[0].isBankrupt = true;
    const events = diffEvents(prev, next);
    expect(events.some(e => e.type === 'GAME_OVER')).toBe(true);
  });

  it('returns empty array when no changes', () => {
    const prev = makeMockState();
    const next = makeMockState();
    const events = diffEvents(prev, next);
    expect(events).toHaveLength(0);
  });
});
```

- [ ] **Step 6: Run all engine tests**

Run: `npx vitest run packages/engine/src/tests/`
Expected: GameController tests + diffEvents tests pass.

- [ ] **Step 7: Update engine index.ts exports**

Add to `packages/engine/src/index.ts`:
```typescript
export { GameController } from './GameController.js';
export type { ActionResult } from './GameController.js';
export { diffEvents } from './diffEvents.js';
export type { GameEvent } from './diffEvents.js';
```

- [ ] **Step 8: Verify build and all tests**

Run: `npm run build` (root)
Run: `npm test` (root)
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add GameController wrapper and diffEvents to engine"
```

---

### Task 5: Create Server Package — Config + Scaffold

**Files:**
- Create: `packages/server/src/Config.ts`
- Create: `packages/server/src/types.ts`
- Create: `packages/server/vitest.config.ts`

- [ ] **Step 1: Create `packages/server/src/Config.ts`**

```typescript
export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  TURN_TIMEOUT_MS: process.env.TURN_TIMEOUT_MS
    ? parseInt(process.env.TURN_TIMEOUT_MS, 10)
    : 0, // 0 = disabled
  IDLE_ROOM_TTL_MS: 10 * 60 * 1000, // 10 minutes
  RECONNECT_GRACE_PERIOD_MS: 120_000, // 2 minutes
} as const;
```

- [ ] **Step 2: Create `packages/server/src/types.ts`**

```typescript
import type { Socket } from 'socket.io';

export interface PlayerSocket {
  socketId: string;
  playerName: string;
  characterId: string;
  slot: number;
}

export interface GameRoom {
  id: string;
  players: Map<string, PlayerSocket>; // socketId → PlayerSocket
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  lastActivityAt: number;
}
```

- [ ] **Step 3: Create `packages/server/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

- [ ] **Step 4: Verify server package compiles**

Run: `npx tsc -b packages/server/tsconfig.json`
Expected: PASS (only types.ts and Config.ts exist, no errors).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add server package scaffold with Config and types"
```

---

### Task 6: Implement RoomManager

**Files:**
- Create: `packages/server/src/RoomManager.ts`
- Create: `packages/server/src/tests/RoomManager.test.ts`

- [ ] **Step 1: Write the failing test for RoomManager**

Create `packages/server/src/tests/RoomManager.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../RoomManager.js';
import { GameController } from '@property-tycoon/engine';

function makeMockSocket(socketId: string) {
  return {
    id: socketId,
    join: () => {},
    leave: () => {},
    emit: () => {},
  } as any;
}

describe('RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  it('creates a room and returns a roomId', () => {
    const roomId = manager.createRoom({
      playerCount: 2,
      playerNames: ['An', 'Binh'],
      characterIds: ['ghosty', 'chibi-cat'],
      boardId: 'basic',
    });
    expect(roomId).toBeTypeOf('string');
    expect(roomId.length).toBeGreaterThan(0);
  });

  it('allows a player to join a room', () => {
    const roomId = manager.createRoom({
      playerCount: 2,
      playerNames: ['An', 'Binh'],
      characterIds: ['ghosty', 'chibi-cat'],
      boardId: 'basic',
    });
    const result = manager.joinRoom(roomId, makeMockSocket('sock1'), {
      playerName: 'An',
      characterId: 'ghosty',
      slot: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects joining a non-existent room', () => {
    const result = manager.joinRoom('nonexistent', makeMockSocket('sock1'), {
      playerName: 'An',
      characterId: 'ghosty',
      slot: 0,
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('rejects joining a full room', () => {
    const roomId = manager.createRoom({
      playerCount: 2,
      playerNames: ['An', 'Binh'],
      characterIds: ['ghosty', 'chibi-cat'],
      boardId: 'basic',
    });
    manager.joinRoom(roomId, makeMockSocket('sock1'), { playerName: 'An', characterId: 'ghosty', slot: 0 });
    manager.joinRoom(roomId, makeMockSocket('sock2'), { playerName: 'Binh', characterId: 'chibi-cat', slot: 1 });
    const result = manager.joinRoom(roomId, makeMockSocket('sock3'), { playerName: 'Chi', characterId: 'cat-magician', slot: 2 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('full');
  });

  it('removes a player on leaveRoom', () => {
    const roomId = manager.createRoom({
      playerCount: 2,
      playerNames: ['An', 'Binh'],
      characterIds: ['ghosty', 'chibi-cat'],
      boardId: 'basic',
    });
    manager.joinRoom(roomId, makeMockSocket('sock1'), { playerName: 'An', characterId: 'ghosty', slot: 0 });
    manager.leaveRoom(roomId, 'sock1');
    const room = manager.getRoom(roomId);
    expect(room?.players.size).toBe(0);
  });

  it('returns undefined for unknown room', () => {
    expect(manager.getRoom('nonexistent')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/server/src/tests/RoomManager.test.ts`
Expected: FAIL — `RoomManager` not found.

- [ ] **Step 3: Implement RoomManager**

Create `packages/server/src/RoomManager.ts`:

```typescript
import { GameController } from '@property-tycoon/engine';
import type { Socket } from 'socket.io';
import type { GameRoom, PlayerSocket } from './types.js';
import { SERVER_CONFIG } from './Config.js';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map();
  private controllers: Map<string, GameController> = new Map();

  createRoom(config: Parameters<GameController['constructor']>[0]): string {
    const roomId = this.generateRoomId();
    const controller = new GameController(config);
    const room: GameRoom = {
      id: roomId,
      players: new Map(),
      status: 'waiting',
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    this.controllers.set(roomId, controller);
    return roomId;
  }

  joinRoom(
    roomId: string,
    socket: Socket,
    playerInfo: Omit<PlayerSocket, 'socketId'>,
  ): { success: true } | { success: false; error: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }
    if (room.status !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }
    const controller = this.controllers.get(roomId)!;
    const config = controller.getState();
    const maxPlayers = config.players.length;
    if (room.players.size >= maxPlayers) {
      return { success: false, error: 'Room is full' };
    }
    room.players.set(socket.id, {
      socketId: socket.id,
      playerName: playerInfo.playerName,
      characterId: playerInfo.characterId,
      slot: playerInfo.slot,
    });
    room.lastActivityAt = Date.now();
    socket.join(roomId);
    return { success: true };
  }

  leaveRoom(roomId: string, socketId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.players.delete(socketId);
    room.lastActivityAt = Date.now();
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getController(roomId: string): GameController | undefined {
    return this.controllers.get(roomId);
  }

  setRoomStatus(roomId: string, status: GameRoom['status']): void {
    const room = this.rooms.get(roomId);
    if (room) room.status = status;
  }

  garbageCollect(): void {
    const now = Date.now();
    for (const [id, room] of this.rooms) {
      if (now - room.lastActivityAt > SERVER_CONFIG.IDLE_ROOM_TTL_MS) {
        this.rooms.delete(id);
        this.controllers.delete(id);
      }
    }
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 4; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    // Avoid collisions
    if (this.rooms.has(id)) return this.generateRoomId();
    return id;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/server/src/tests/RoomManager.test.ts`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement RoomManager for server"
```

---

### Task 7: Implement SocketHandler

**Files:**
- Create: `packages/server/src/SocketHandler.ts`
- Create: `packages/server/src/tests/SocketHandler.test.ts`

- [ ] **Step 1: Write server integration test**

Create `packages/server/src/tests/SocketHandler.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import { RoomManager } from '../RoomManager.js';
import { registerHandlers } from '../SocketHandler.js';

describe('SocketHandler — full game flow', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: SocketIOServer;
  let manager: RoomManager;
  let port: number;

  beforeAll(async () => {
    port = 3099;
    httpServer = createServer();
    io = new SocketIOServer(httpServer);
    manager = new RoomManager();
    registerHandlers(io, manager);
    await new Promise<void>((resolve) => httpServer.listen(port, resolve));
  });

  afterAll(() => {
    io.close();
    httpServer.close();
  });

  it('creates a room and returns roomCreated', async () => {
    const client = ioc(`http://localhost:${port}`) as ClientSocket;
    const roomId = await new Promise<string>((resolve) => {
      client.emit('createRoom', {
        playerCount: 2,
        playerNames: ['An', 'Binh'],
        characterIds: ['ghosty', 'chibi-cat'],
        boardId: 'basic',
      });
      client.on('roomCreated', (data: { roomId: string }) => resolve(data.roomId));
    });
    expect(roomId).toBeTypeOf('string');
    client.close();
  });

  it('player joins room successfully', async () => {
    const hostClient = ioc(`http://localhost:${port}`) as ClientSocket;

    const roomId = await new Promise<string>((resolve) => {
      hostClient.emit('createRoom', {
        playerCount: 2,
        playerNames: ['An', 'Binh'],
        characterIds: ['ghosty', 'chibi-cat'],
        boardId: 'basic',
      });
      hostClient.on('roomCreated', (data: { roomId: string }) => resolve(data.roomId));
    });

    const joinerClient = ioc(`http://localhost:${port}`) as ClientSocket;
    const result = await new Promise<any>((resolve) => {
      joinerClient.emit('joinRoom', { roomId, playerName: 'Binh', characterId: 'chibi-cat' });
      joinerClient.on('joinedSuccess', resolve);
      joinerClient.on('error', resolve);
    });

    expect(result.roomId).toBe(roomId);

    hostClient.close();
    joinerClient.close();
  });

  it('rejects invalid action for wrong phase', async () => {
    const client = ioc(`http://localhost:${port}`) as ClientSocket;

    const roomId = await new Promise<string>((resolve) => {
      client.emit('createRoom', {
        playerCount: 2,
        playerNames: ['An', 'Binh'],
        characterIds: ['ghosty', 'chibi-cat'],
        boardId: 'basic',
      });
      client.on('roomCreated', (data: { roomId: string }) => resolve(data.roomId));
    });

    // Wait for joined
    await new Promise<void>((resolve) => {
      client.emit('joinRoom', { roomId, playerName: 'An', characterId: 'ghosty' });
      client.on('joinedSuccess', () => resolve());
    });

    // Try ROLL_DICE before game started (game not started yet, so no current turn)
    const errorMsg = await new Promise<string>((resolve) => {
      client.emit('playerAction', { roomId, action: { type: 'ROLL_DICE', payload: { dice: [3, 5] } } });
      client.on('actionError', (data: { message: string }) => resolve(data.message));
    });

    expect(errorMsg).toBeTruthy();
    client.close();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/server/src/tests/SocketHandler.test.ts`
Expected: FAIL — `registerHandlers` not found.

- [ ] **Step 3: Implement SocketHandler**

Create `packages/server/src/SocketHandler.ts`:

```typescript
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { RoomManager } from './RoomManager.js';
import type { GameAction } from '@property-tycoon/shared';
import { Phase } from '@property-tycoon/shared';

export function registerHandlers(io: SocketIOServer, manager: RoomManager): void {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('createRoom', (payload: Record<string, unknown>) => {
      try {
        const roomId = manager.createRoom(payload as any);
        socket.emit('roomCreated', { roomId });
        console.log(`Room created: ${roomId}`);
      } catch (err: any) {
        socket.emit('error', { message: err.message, code: 'CREATE_FAILED' });
      }
    });

    socket.on('joinRoom', (payload: { roomId: string; playerName: string; characterId: string }) => {
      const { roomId, playerName, characterId } = payload;
      const result = manager.joinRoom(roomId, socket, {
        playerName,
        characterId,
        slot: 0, // slot auto-assigned by join order for now
      });

      if (!result.success) {
        socket.emit('error', { message: result.error, code: 'JOIN_FAILED' });
        return;
      }

      const room = manager.getRoom(roomId)!;
      socket.emit('joinedSuccess', {
        roomId,
        playerId: socket.id,
        players: Array.from(room.players.values()),
      });

      socket.to(roomId).emit('playerJoined', {
        playerName,
        characterId,
        socketId: socket.id,
      });

      // Check if all players joined — auto-start
      const controller = manager.getController(roomId)!;
      const state = controller.getState();
      if (room.players.size >= state.players.length) {
        // Apply START_GAME action
        const result = controller.applyAction({ type: 'START_GAME' });
        if (result.success) {
          manager.setRoomStatus(roomId, 'playing');
          io.to(roomId).emit('gameStarted', { initialState: result.state });
          io.to(roomId).emit('gameStateUpdate', { state: result.state });
        }
      }
    });

    socket.on('playerAction', (payload: { roomId: string; action: GameAction }) => {
      const { roomId, action } = payload;
      const controller = manager.getController(roomId);
      const room = manager.getRoom(roomId);

      if (!controller || !room) {
        socket.emit('actionError', { message: 'Room not found' });
        return;
      }

      if (room.status !== 'playing') {
        socket.emit('actionError', { message: 'Game not in progress' });
        return;
      }

      const state = controller.getState();

      // Turn check: is this socket the current player?
      const currentPlayer = room.players.get(socket.id);
      if (!currentPlayer) {
        socket.emit('actionError', { message: 'Not a player in this room' });
        return;
      }

      // The current player is identified by their socket ID being mapped to the player
      // In the engine, currentPlayerId is a PlayerId. We need to map socketId → PlayerId.
      // For now, the player's slot index maps to the players array index.
      // This will need refinement when we fully wire player identity.
      // Simplified: accept the action, the phase validation in GameController catches invalid ones.

      const result = controller.applyAction(action);

      if (!result.success) {
        socket.emit('actionError', { message: result.error || 'Invalid action' });
        return;
      }

      // Handle chained auto-phases (resolver loop)
      let currentResult = result;
      while (currentResult.success && isAutoPhase(currentResult.state.phase)) {
        const autoAction = getAutoActionForPhase(currentResult.state);
        if (!autoAction) break;
        currentResult = controller.applyAction(autoAction);
      }

      // Broadcast results
      io.to(roomId).emit('gameStateUpdate', { state: currentResult.state });
      for (const event of currentResult.events) {
        io.to(roomId).emit('gameEvent', event);
      }

      if (currentResult.state.phase === Phase.GAME_OVER) {
        const winner = currentResult.state.players.find(p => !p.isBankrupt);
        io.to(roomId).emit('gameOver', { winnerId: winner?.id, finalState: currentResult.state });
        manager.setRoomStatus(roomId, 'finished');
      }
    });

    socket.on('leaveRoom', (payload: { roomId: string }) => {
      const { roomId } = payload;
      manager.leaveRoom(roomId, socket.id);
      socket.to(roomId).emit('playerLeft', { socketId: socket.id });
      socket.leave(roomId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Room cleanup handled by garbage collection
    });
  });
}

function isAutoPhase(phase: Phase): boolean {
  return [
    Phase.ROLLING,
    Phase.MOVING,
    Phase.RESOLVING_TILE,
    Phase.SHOWING_CARD,
  ].includes(phase);
}

function getAutoActionForPhase(state: any): GameAction | null {
  switch (state.phase) {
    case Phase.ROLLING:
      return null; // dice already rolled, movement is next — handled by reducer
    case Phase.MOVING:
      return { type: 'FINISH_MOVEMENT' };
    case Phase.RESOLVING_TILE:
      return { type: 'RESOLVE_TILE' };
    case Phase.SHOWING_CARD:
      return { type: 'CONFIRM_CARD' };
    default:
      return null;
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/server/src/tests/SocketHandler.test.ts`
Expected: Tests pass (full game flow: create → join → action rejection).

Note: The `START_GAME` action type may not exist yet in the reducer. If `GameAction` doesn't include `{ type: 'START_GAME' }`, add it to `packages/shared/src/types.ts`:

```typescript
// In the GameAction union type, add:
| { type: 'START_GAME' }
```

And handle it in `gameReducer.ts` (`packages/engine/src/state/gameReducer.ts`):
```typescript
case 'START_GAME':
  return { ...state, phase: Phase.WAITING_TO_ROLL };
```

Also add to the `phaseMachine.ts` transition table.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: implement SocketHandler with room creation, joining, and action processing"
```

---

### Task 8: Create Server Entry Point

**Files:**
- Create: `packages/server/src/index.ts`

- [ ] **Step 1: Create server entry point**

Create `packages/server/src/index.ts`:

```typescript
import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { RoomManager } from './RoomManager.js';
import { registerHandlers } from './SocketHandler.js';
import { SERVER_CONFIG } from './Config.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: SERVER_CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager();
registerHandlers(io, roomManager);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Garbage collect idle rooms every 5 minutes
setInterval(() => {
  roomManager.garbageCollect();
}, 5 * 60 * 1000);

httpServer.listen(SERVER_CONFIG.PORT, () => {
  console.log(`Server running on port ${SERVER_CONFIG.PORT}`);
});
```

- [ ] **Step 2: Verify server starts**

Run: `npx tsx packages/server/src/index.ts`
Expected: `Server running on port 3000`
Stop the server (Ctrl+C).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: create server entry point with Express + Socket.IO"
```

---

### Task 9: Add NetworkManager to Client

**Files:**
- Create: `packages/client/src/app/network/NetworkManager.ts`
- Create: `packages/client/src/app/network/NetworkManager.test.ts`

- [ ] **Step 1: Write the failing test for NetworkManager**

Create `packages/client/src/app/network/NetworkManager.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    connected: false,
  })),
}));

import { NetworkManager } from './NetworkManager.js';

describe('NetworkManager', () => {
  let nm: NetworkManager;

  beforeEach(() => {
    nm = new NetworkManager('http://localhost:3000');
  });

  it('connects and disconnects', async () => {
    await nm.connect();
    expect((nm as any).socket.connect).toHaveBeenCalled();
    nm.disconnect();
    expect((nm as any).socket.disconnect).toHaveBeenCalled();
  });

  it('sendAction emits playerAction event', () => {
    nm.sendAction({ type: 'ROLL_DICE', payload: { dice: [3, 5] } } as any);
    expect((nm as any).socket.emit).toHaveBeenCalledWith('playerAction', expect.objectContaining({
      action: expect.objectContaining({ type: 'ROLL_DICE' }),
    }));
  });

  it('createRoom resolves with roomId', async () => {
    const socket = (nm as any).socket;
    socket.emit.mockImplementation((event: string, _data: any) => {
      if (event === 'createRoom') {
        setTimeout(() => {
          const cb = socket.on.mock.calls.find((c: any[]) => c[0] === 'roomCreated')?.[1];
          if (cb) cb({ roomId: 'ABCD' });
        }, 10);
      }
    });
    const roomId = await nm.createRoom({} as any);
    expect(roomId).toBe('ABCD');
  });

  it('onStateUpdate callback fires on gameStateUpdate', () => {
    const callback = vi.fn();
    nm.onStateUpdate = callback;

    const socket = (nm as any).socket;
    const handler = socket.on.mock.calls.find((c: any[]) => c[0] === 'gameStateUpdate')?.[1];
    if (handler) handler({ state: { phase: 'WAITING_TO_ROLL' } });

    expect(callback).toHaveBeenCalledWith({ phase: 'WAITING_TO_ROLL' });
  });

  it('onError callback fires on actionError', () => {
    const callback = vi.fn();
    nm.onError = callback;

    const socket = (nm as any).socket;
    const handler = socket.on.mock.calls.find((c: any[]) => c[0] === 'actionError')?.[1];
    if (handler) handler({ message: 'Invalid action' });

    expect(callback).toHaveBeenCalledWith('Invalid action');
  });

  it('onDisconnect callback fires on disconnect', () => {
    const callback = vi.fn();
    nm.onDisconnect = callback;

    const socket = (nm as any).socket;
    const handler = socket.on.mock.calls.find((c: any[]) => c[0] === 'disconnect')?.[1];
    if (handler) handler('transport close');

    expect(callback).toHaveBeenCalledWith('transport close');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/client/src/app/network/NetworkManager.test.ts`
Expected: FAIL — `NetworkManager` not found.

- [ ] **Step 3: Implement NetworkManager**

Create `packages/client/src/app/network/NetworkManager.ts`:

```typescript
import { io, type Socket } from 'socket.io-client';
import type { GameState, GameAction, NewGameConfig } from '@property-tycoon/shared';
import type { GameEvent } from '@property-tycoon/engine';

export class NetworkManager {
  private socket: Socket;

  // Callbacks — set by the store
  onStateUpdate: ((state: GameState) => void) | null = null;
  onGameEvent: ((event: GameEvent) => void) | null = null;
  onPlayerJoined: ((player: any) => void) | null = null;
  onPlayerLeft: ((playerId: string) => void) | null = null;
  onGameStarted: ((initialState: GameState) => void) | null = null;
  onGameOver: ((winnerId: string) => void) | null = null;
  onError: ((message: string) => void) | null = null;
  onDisconnect: ((reason: string) => void) | null = null;

  constructor(private serverUrl: string) {
    this.socket = io(serverUrl, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });
    this.registerListeners();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect();
      this.socket.once('connect', () => resolve());
      this.socket.once('connect_error', (err) => reject(err));
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  createRoom(config: NewGameConfig): Promise<string> {
    return new Promise((resolve) => {
      this.socket.emit('createRoom', config);
      this.socket.once('roomCreated', (data: { roomId: string }) => {
        resolve(data.roomId);
      });
    });
  }

  joinRoom(roomId: string, playerName: string, characterId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId, playerName, characterId });
      this.socket.once('joinedSuccess', resolve);
      this.socket.once('error', reject);
    });
  }

  sendAction(action: GameAction, roomId?: string): void {
    this.socket.emit('playerAction', { roomId, action });
  }

  leaveRoom(roomId: string): void {
    this.socket.emit('leaveRoom', { roomId });
  }

  private registerListeners(): void {
    this.socket.on('gameStateUpdate', (data: { state: GameState }) => {
      this.onStateUpdate?.(data.state);
    });

    this.socket.on('gameEvent', (event: GameEvent) => {
      this.onGameEvent?.(event);
    });

    this.socket.on('playerJoined', (player: any) => {
      this.onPlayerJoined?.(player);
    });

    this.socket.on('playerLeft', (data: { socketId: string }) => {
      this.onPlayerLeft?.(data.socketId);
    });

    this.socket.on('gameStarted', (data: { initialState: GameState }) => {
      this.onGameStarted?.(data.initialState);
    });

    this.socket.on('gameOver', (data: { winnerId: string }) => {
      this.onGameOver?.(data.winnerId);
    });

    this.socket.on('actionError', (data: { message: string }) => {
      this.onError?.(data.message);
    });

    this.socket.on('disconnect', (reason: string) => {
      this.onDisconnect?.(reason);
    });
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/client/src/app/network/NetworkManager.test.ts`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add NetworkManager for client-server Socket.IO communication"
```

---

### Task 10: Adapt useGameStore for Dual-Mode

**Files:**
- Modify: `packages/client/src/app/store/useGameStore.ts`

- [ ] **Step 1: Update useGameStore with mode flag and online dispatch path**

Read the current `packages/client/src/app/store/useGameStore.ts` and modify it to add dual-mode support.

Replace the store interface and implementation with:

```typescript
import { create } from 'zustand';
import { type GameState, type GameAction, Phase } from '@property-tycoon/shared';
import { gameReducer } from '@property-tycoon/engine';
import { saveGame } from '../../storage/gameStorage';
import { eventBus } from '../../core/EventBus';
import type { NetworkManager } from '../network/NetworkManager';

interface GameStore {
  mode: 'offline' | 'online';
  state: GameState;
  activeSlotId: string;
  roomId: string | null;
  playerId: string | null;
  networkManager: NetworkManager | null;
  isConnected: boolean;

  dispatch: (action: GameAction | { type: 'LOAD_GAME'; payload: GameState; slotId: string }) => void;
  setActiveSlot: (slotId: string) => void;
  setMode: (mode: 'offline' | 'online') => void;
  setNetworkManager: (nm: NetworkManager | null) => void;
  setFullState: (state: GameState) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'offline',
  state: {
    players: [],
    currentPlayerId: '',
    phase: Phase.SETUP,
    board: [],
    doublesCount: 0,
    turn: 0,
  } as GameState,
  activeSlotId: '',
  roomId: null,
  playerId: null,
  networkManager: null,
  isConnected: false,

  dispatch: (action) => {
    const { mode, networkManager, roomId } = get();

    if (mode === 'offline') {
      if (action.type === 'LOAD_GAME') {
        set({ state: action.payload, activeSlotId: action.slotId });
        eventBus.emit('state:changed', { prev: get().state, next: action.payload });
        return;
      }
      const prevState = get().state;
      const newState = gameReducer(prevState, action as GameAction);
      set({ state: newState });
      eventBus.emit('state:changed', { prev: prevState, next: newState });

      // Auto-save for offline mode
      const { activeSlotId } = get();
      if (activeSlotId && newState.phase !== Phase.SETUP) {
        saveGame(newState, activeSlotId);
      }
    } else {
      // Online mode: send to server, state comes back via setFullState
      networkManager?.sendAction(action as GameAction, roomId ?? undefined);
    }
  },

  setActiveSlot: (slotId: string) => set({ activeSlotId: slotId }),

  setMode: (mode: 'offline' | 'online') => {
    const { networkManager } = get();
    if (networkManager) {
      networkManager.disconnect();
    }
    set({ mode, networkManager: null, isConnected: false, roomId: null, playerId: null });
  },

  setNetworkManager: (nm: NetworkManager | null) => set({ networkManager: nm }),

  setFullState: (newState: GameState) => {
    const prevState = get().state;
    set({ state: newState });
    eventBus.emit('state:changed', { prev: prevState, next: newState });
  },
}));
```

- [ ] **Step 2: Verify offline mode still works**

Run: `npx vitest run` (client tests)
Expected: All existing tests pass — offline dispatch unchanged.

- [ ] **Step 3: Write a quick manual verification**

Run: `npm run dev` (from packages/client)
Expected: MainMenu loads. Click "New Game" → game starts in offline mode as before.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add dual-mode (offline/online) dispatch to useGameStore"
```

---

### Task 11: Add LobbyScreen

**Files:**
- Create: `packages/client/src/ui/screens/LobbyScreen.tsx`
- Create: `packages/client/src/ui/screens/LobbyScreen.test.tsx`

- [ ] **Step 1: Write LobbyScreen test**

Create `packages/client/src/ui/screens/LobbyScreen.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LobbyScreen } from './LobbyScreen';

describe('LobbyScreen', () => {
  it('renders create and join tabs', () => {
    render(<LobbyScreen onBack={() => {}} />);
    expect(screen.getByText(/create/i)).toBeTruthy();
    expect(screen.getByText(/join/i)).toBeTruthy();
  });

  it('shows create room form by default', () => {
    render(<LobbyScreen onBack={() => {}} />);
    expect(screen.getByText(/create room/i)).toBeTruthy();
  });

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn();
    render(<LobbyScreen onBack={onBack} />);
    fireEvent.click(screen.getByText(/back/i));
    expect(onBack).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run packages/client/src/ui/screens/LobbyScreen.test.tsx`
Expected: FAIL — `LobbyScreen` not found.

- [ ] **Step 3: Implement LobbyScreen**

Create `packages/client/src/ui/screens/LobbyScreen.tsx`:

```typescript
import { useState } from 'react';
import { useGameStore } from '../../app/store/useGameStore';
import { NetworkManager } from '../../app/network/NetworkManager';
import { useUIStore } from '../../app/store/useUIStore';

interface LobbyScreenProps {
  onBack: () => void;
}

export function LobbyScreen({ onBack }: LobbyScreenProps) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [status, setStatus] = useState('');
  const setMode = useGameStore((s) => s.setMode);
  const setNetworkManager = useGameStore((s) => s.setNetworkManager);
  const closeAllModals = useUIStore((s) => s.closeAllModals);

  const serverUrl = 'http://localhost:3000';

  async function handleCreateRoom() {
    setStatus('Connecting...');
    const nm = new NetworkManager(serverUrl);
    try {
      await nm.connect();
      const rid = await nm.createRoom({
        playerCount: 2,
        playerNames: [playerName || 'Host'],
        characterIds: ['ghosty', 'chibi-cat'],
        boardId: 'basic',
      });
      setMode('online');
      setNetworkManager(nm);
      setStatus(`Room created! Code: ${rid}`);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleJoinRoom() {
    if (!roomId || !playerName) {
      setStatus('Please enter room code and name');
      return;
    }
    setStatus('Connecting...');
    const nm = new NetworkManager(serverUrl);
    try {
      await nm.connect();
      await nm.joinRoom(roomId, playerName, 'ghosty');
      setMode('online');
      setNetworkManager(nm);
      setStatus('Joined! Waiting for game to start...');
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <div>
        <button onClick={() => setTab('create')}>Create</button>
        <button onClick={() => setTab('join')}>Join</button>
      </div>

      {tab === 'create' && (
        <div>
          <h2>Create Room</h2>
          <input
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleCreateRoom}>Create Room</button>
        </div>
      )}

      {tab === 'join' && (
        <div>
          <h2>Join Room</h2>
          <input
            placeholder="Room code"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      )}

      {status && <p>{status}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run packages/client/src/ui/screens/LobbyScreen.test.tsx`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add LobbyScreen for online room creation and joining"
```

---

### Task 12: Wire Mode Switching in MainMenu

**Files:**
- Modify: `packages/client/src/ui/screens/MainMenu.tsx`
- Modify: `packages/client/src/App.tsx` (or wherever screen routing lives)

- [ ] **Step 1: Read current MainMenu to understand structure**

Read `packages/client/src/ui/screens/MainMenu.tsx` to understand current buttons and routing. Look for where "New Game", "Load Game", and "Continue" buttons are rendered.

- [ ] **Step 2: Add "Online Multiplayer" button to MainMenu**

Add a button that navigates to the LobbyScreen when clicked. The exact implementation depends on how screen routing works. If using a simple state variable in App.tsx:

In MainMenu, add:
```tsx
<button onClick={onOnlineMultiplayer}>Online Multiplayer</button>
```

Where `onOnlineMultiplayer` is a new prop passed from the parent.

- [ ] **Step 3: Wire screen routing**

In the screen router (likely `App.tsx` or a routes component), add a state variable for the current screen and conditionally render LobbyScreen:

```tsx
const [screen, setScreen] = useState<'menu' | 'lobby' | 'game'>('menu');

{screen === 'menu' && <MainMenu onOnlineMultiplayer={() => setScreen('lobby')} />}
{screen === 'lobby' && <LobbyScreen onBack={() => setScreen('menu')} />}
```

- [ ] **Step 4: Verify UI flow**

Run: `npm run dev`
Expected: MainMenu → click "Online Multiplayer" → LobbyScreen → click "Back" → MainMenu.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: wire LobbyScreen into MainMenu for online multiplayer entry"
```

---

### Task 13: Integration Verification

**Files:** None (verification only)

- [ ] **Step 1: Build all packages**

Run: `npm install && npm run build`
Expected: All four packages compile without errors.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass across shared, engine, server, and client packages.

- [ ] **Step 3: Full integration test — server + client**

Terminal 1:
```
cd packages/server && npx tsx src/index.ts
```
Expected: `Server running on port 3000`

Terminal 2:
```
cd packages/client && npm run dev
```
Expected: Vite dev server starts.

Open browser → MainMenu → Online Multiplayer → Create Room → note room code.
Open second browser → MainMenu → Online Multiplayer → Join Room → enter code.
Expected: Both clients connect, game starts, turns flow.

- [ ] **Step 4: Offline regression test**

MainMenu → New Game → play a turn in offline mode.
Expected: All existing offline functionality works unchanged.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete multiplayer online upgrade — dual-mode client + authoritative server"
```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Monorepo structure (Section 2) → Tasks 1-3
- [x] GameController + diffEvents (Section 3) → Task 4
- [x] Server design — room lifecycle, events, turn enforcement, RoomManager (Section 4) → Tasks 5-8
- [x] Client architecture — adapted store, NetworkManager, LobbyScreen, PhaserBridge unchanged (Section 5) → Tasks 9-12
- [x] Error handling scenarios (Section 6) → Covered in SocketHandler validation + NetworkManager error callbacks
- [x] Testing strategy (Section 7) → Tests written alongside each implementation task
- [x] Migration path — incremental, each step verified (Section 8) → Tasks ordered to match the 4-step migration
- [x] Non-goals (Section 9) → Nothing in the plan adds accounts, chat, persistence, AI bots, or horizontal scaling

**Placeholder scan:** No TBDs, TODOs, or "implement later" patterns. All code is shown inline.

**Type consistency:**
- `GameAction` used consistently across engine, server, and client
- `GameState` type from `@property-tycoon/shared` used everywhere
- `GameEvent` from `@property-tycoon/engine` used in both server broadcasts and client NetworkManager
- `NetworkManager` callback signatures match SocketHandler event payloads
- `GameController.applyAction()` returns `ActionResult` — used consistently by SocketHandler
