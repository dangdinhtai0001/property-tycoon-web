---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-05-17'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/project-context.md
  - docs/000-overview.md
  - docs/001-product-scope.md
  - docs/002-gameplay-rules.md
  - docs/003-board-design.md
  - docs/004-economy-and-debt.md
  - docs/005-ui-ux-scope.md
  - docs/006-technical-design.md
  - docs/007-testing-and-acceptance.md
  - docs/008-roadmap-and-backlog.md
  - docs/superpowers/plans/2026-05-14-multiplayer-upgrade-plan.md
  - docs/superpowers/specs/2026-05-14-multiplayer-upgrade-design.md
workflowType: 'architecture'
project_name: 'property-tycoon-web'
user_name: 'Dangd'
date: '2026-05-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Domain:** A real-time multiplayer web board game — Vietnamese Monopoly with 48 tiles, 5 building tiers (Nhà phố → Shophouse → Chung cư mini → Cao ốc → Landmark), phase-based turns, full economy system (buy/build/mortgage/auction/debt), and dual offline/online modes. Server is authoritative; clients send intentions, server computes and broadcasts results.

**Non-Functional Requirements:**

| NFR | Requirement | Impact |
|-----|------------|--------|
| Real-time | Socket.IO room-based, sub-second state broadcast | Server must serialize actions per-room, prevent mid-transition mutations |
| Mobile-first UX | Touch targets ≥44px, bottom-sheet navigation, 3 breakpoints | All UI components must be thumb-friendly; desktop is enhancement only |
| Accessibility | WCAG 2.1 AA, screen reader, keyboard nav, prefers-reduced-motion | Component architecture must support aria-live regions, focus management |
| Animation | All skippable, max 300ms functional, animation queue drain | Framer Motion with `useReducedMotion()`, no animation loops |
| Reliability | Token-based reconnection, 30s disconnect timeout, abandoned room GC | Server must track player roster, handle socket ID rotation on reconnect |
| No persistence | Server state in-memory only; client handles save/load via versioned storage | No database needed server-side; save/load is pure client concern |
| Security | Zod-validated payloads, socket auth middleware, room join authorization | Every incoming event validated; clients never push state snapshots |

**Scale & Complexity:**

- Primary domain: Full-stack web game (React + Phaser + Express + Socket.IO)
- Complexity: Medium-high — real-time multiplayer + game engine + custom component system
- 4 npm workspaces: `shared`, `engine`, `server`, `client`
- 12 new UX components planned (6 MVP, 6 post-MVP) across 3 implementation phases

### Current Architecture (Brownfield Baseline)

```
shared/          engine/           client/            server/
├── types.ts     ├── state/        ├── app/           ├── index.ts
├── constants.ts ├── rules/        ├── ui/            ├── SocketHandler.ts
├── enums.ts     ├── data/         ├── phaser/        ├── RoomManager.ts
├── StateMachine ├── utils/        ├── core/          ├── Config.ts
├── index.ts     └── tests/        ├── storage/       └── types.ts
                                   └── tests/
```

**Key established patterns:**
- Zustand dual-mode dispatch (`mode: 'offline' | 'connecting' | 'online'`)
- EventBus colon-namespaced events with try/catch per handler
- PhaserBridge singleton with React overlays (not React-in-Phaser)
- Animation queue drain via `useUIStore.animationQueue`
- `verbatimModuleSyntax` + `.js` extension imports (ESM)
- Server auto-phases via `while` loop; client relies on server-pushed state in online mode
- `assertGameInvariants()` at end of every reducer call

### Technical Constraints & Dependencies

- **Vite chunk limit raised to 1000 KB** for Phaser — heavy deps must be added to pre-bundle list
- **React Compiler must NOT run on Zustand-selector components** — over-optimization skips re-renders
- **No barrel files in `client/` or `server/`** — only `shared/` and `engine/` may have them
- **Server state is fully ephemeral** — no database, no file persistence. Restart = total game loss
- **Dual CORS config** — Express and Socket.IO maintain independent CORS, both must match `CORS_ORIGIN`
- **No `.env` files committed** — server uses env vars with defaults (`PORT`, `CORS_ORIGIN`, `TURN_TIMEOUT_MS`)

### Cross-Cutting Concerns

1. **State synchronization** — Offline/online mode transitions must be atomic; dispatch must never silently drop
2. **Animation coordination** — Rapid server updates must queue, not overwrite in-progress animation state
3. **Reconnection robustness** — Socket ID rotation on reconnect requires player-scoped token, not socket-ID-based tracking
4. **Schema validation** — Every incoming payload from every event must pass Zod validation before touching game state
5. **Component architecture** — 12 new custom components must integrate with Zustand selectors, EventBus, and Phaser canvas overlay model
6. **Action serialization** — Per-room mutex/queue prevents action handlers from running mid phase-transition

## Starter Template Evaluation

### Assessment: Brownfield — No Starter Change Needed

This is an established brownfield project with a modern, well-configured stack. No starter template change is warranted.

**Current Foundation:**

| Layer | Choice | Version | Assessment |
|-------|--------|---------|------------|
| Build | Vite | 8.0.10 | Pre-configured for Phaser, chunk limit 1000 KB |
| Frontend | React | 19.2.5 | Latest, no issues |
| Styling | Tailwind CSS | 4.2.4 | `@tailwindcss/vite` plugin, aligns with UX spec custom component strategy |
| Animation | Framer Motion | 12.38.0 | UX-spec-aligned (animation queue, useReducedMotion, spring physics) |
| Icons | Lucide React | 1.14.0 | Lightweight, sufficient for game iconography |
| Game Engine | Phaser | 4.1.0 | Pre-bundled in Vite, board rendering |
| State | Zustand | 5.0.12 | Dual-mode dispatch, no middleware — matches UX spec state management needs |
| Realtime | Socket.IO | 4.8.1 | Room-based, reconnect via player token — matches journey flows |
| Server | Express | 5.1.0 | Minimal Socket.IO attachment — sufficient for current needs |
| Dev Runner | tsx | 4.19.0 | `tsx watch` for server development |
| Test | Vitest | 4.1.5 | `globals: true`, jsdom for client, testing-library |
| Monorepo | npm workspaces | — | 4 packages: shared, engine, server, client |

**Potential tactical addition:** Radix UI or React Aria for accessible primitives (modals, dialogs, popovers) if custom implementations prove insufficient for WCAG 2.1 AA compliance — evaluated as part of component architecture decisions below, not as a starter change.

**Architectural Decisions Provided by Current Stack:**

- TypeScript strict + `verbatimModuleSyntax` + ESM `.js` imports
- Tailwind utility-first styling with game-specific theme extension
- Zustand minimal-leaf selectors with `useShallow` for objects
- EventBus colon-namespaced events with try/catch isolation
- PhaserBridge singleton with React overlay model (not React-in-Phaser)
- Server-authoritative game state with Zod-validated client intentions
- Vitest with inline mock game states and `as Property` type assertions

## Core Architectural Decisions

### Decision Priority Analysis

**Already Decided (Brownfield Baseline):**
- Language: TypeScript strict + `verbatimModuleSyntax` + ESM
- Build: Vite 8 with Phaser pre-bundling (1000 KB chunk limit)
- Frontend: React 19 + Tailwind CSS 4 + Framer Motion 12 + Lucide React
- State: Zustand 5 dual-mode dispatch, no middleware
- Game: Phaser 4 board rendering, React overlays
- Realtime: Socket.IO 4.8.1 room-based, server-authoritative
- Server: Express 5 minimal attachment, ephemeral state
- Test: Vitest 4 + jsdom + testing-library
- Monorepo: npm workspaces (4 packages)
- Validation: Zod for all incoming payloads
- No database: server state is in-memory only

**New Decisions Required (UX Spec Driven):**

| # | Decision | Priority | Driven By |
|---|----------|----------|------------|
| 1 | Component file organization | Critical | 12 new UX components across 3 phases |
| 2 | Voice/emoji reaction data flow | Important | Social layer (Journeys 2+3) |
| 3 | Save/load + async play architecture | Critical | Game interruption UX (Journey 4) |
| 4 | House rules system architecture | Important | Rule customization UX (Journey 1) |
| 5 | PWA implementation approach | Important | Mobile-first, push notification aspirations |
| 6 | Deal negotiation state protocol | Important | Multi-party trade UX (Journey 3) |

---

### Decision 1: Component File Organization

**Decision:** Domain-based folder structure under `client/src/ui/`.

```
client/src/ui/
├── game/           # Core gameplay components
│   ├── DiceTray.tsx
│   ├── ActionCardBar.tsx
│   ├── TurnIndicator.tsx
│   └── PropertyCard.tsx
├── social/         # Social interaction components
│   ├── EmojiReactionBar.tsx
│   └── DealTable.tsx
├── lobby/          # Pre-game components
│   ├── WaitingRoom.tsx
│   └── HouseRulesPicker.tsx
├── spectacle/      # Post-MVP celebration components
│   ├── BankruptcyOverlay.tsx
│   ├── WinnerReveal.tsx
│   ├── PostGameScreen.tsx
│   └── HighlightReel.tsx
└── shared/         # Shared UI primitives
    ├── Modal.tsx
    ├── Button.tsx
    ├── PlayerChip.tsx
    └── Sheet.tsx
```

**Rationale:** 12 components across 4 distinct domains (game, social, lobby, spectacle). Domain grouping makes component ownership clear and matches the UX spec's Phase 1-3 implementation roadmap. Shared primitives (Modal, Button, PlayerChip, Sheet) are extracted to avoid duplication.

**Affects:** `client/src/ui/` directory. No changes to `shared/`, `engine/`, or `server/`.

---

### Decision 2: Voice/Emoji Reaction Data Flow

**Decision:** Separate `'playerReaction'` Socket.IO event. Reactions stored in server-side game timeline.

```
Client emit: socket.emit('playerReaction', {
  roomId: string,
  type: 'emoji' | 'voice',
  payload: string,        // emoji character or base64 voice blob URL
  context?: {             // optional: what triggered the reaction
    event: 'rent' | 'deal' | 'chance' | 'bankruptcy',
    targetPlayerId?: string
  }
})

Server broadcast: io.to(roomId).emit('playerReaction', {
  playerId: string,
  type: 'emoji' | 'voice',
  payload: string,
  context?: {...},
  timestamp: number
})
```

**Rationale:** Separate event keeps social layer decoupled from game logic. Server-side timeline storage enables HighlightReel post-game without additional data structures. Context field allows reactions to be linked to game events for the post-game timeline. Voice snippets are base64-encoded short audio clips (<10s), not streamed — transmitted as discrete messages.

**Affects:** `server/SocketHandler.ts` (new event handler), `server/RoomManager.ts` (timeline array per room), `client/src/ui/social/EmojiReactionBar.tsx` (emit logic), `useUIStore` (incoming reaction display)

---

### Decision 3: Save/Load + Async Play Architecture

**Decision:** Hybrid approach — local `gameStorage.ts` for offline + optional server-side JSON snapshot for async.

```
Offline/Quick Save:
  Client: gameStorage.save(state) → localStorage (versioned schema, existing)
  Client: gameStorage.load() → GameState (existing)

Async Play Save (server):
  Client: socket.emit('requestSave')
  Server: serializes GameState to JSON → stores in RoomData.savedState
  Server: emits 'saveComplete' with saveId
  All clients disconnected → room enters 'paused' state

Async Play Resume:
  Any player: socket.emit('resumeGame', { roomId, saveId })
  Server: validates player was in room → restores from savedState
  Server: broadcasts 'gameStateUpdate' with full state
  Turn notification (future): PWA push to next player
```

**Rationale:** Fits the "no database" constraint — server JSON snapshots are ephemeral but survive individual disconnects. Local saves for offline mode stay unchanged. Async play introduces the first server-side state persistence, but as in-memory JSON, not a database. If server restarts during async play, state is lost — acceptable for MVP; persistent DB can be added later if async play becomes a primary use case.

**Affects:** `server/RoomManager.ts` (savedState, paused room state), `client/src/storage/gameStorage.ts` (no changes), new socket event pair: `'requestSave'` / `'resumeGame'`

---

### Decision 4: House Rules System Architecture

**Decision:** Config object in `GameState`, Zod-validated at room creation, toggled via visual picker.

```typescript
// shared/types.ts — new type
interface HouseRules {
  freeParkingJackpot: boolean;      // default: false
  auctionTimerSeconds: number;      // default: 30, range: 10-60
  doubleRentOnTriples: boolean;    // default: false
  collectRentInJail: boolean;       // default: true
  speedRoundMultiplier: number;     // default: 1, range: 1-3 (1=off, 2=double, 3=triple)
  startingCash: number;             // default: 1500, range: 500-3000
  goSalary: number;                 // default: 200, range: 100-400
}

// GameState gains:
interface GameState {
  // ... existing fields
  houseRules: HouseRules;
}
```

**Rationale:** House rules are game state, not UI state — they affect rule engine computations (rent, starting conditions). Zod validation at room creation ensures invalid combinations are caught before game start. The visual picker (HouseRulesPicker component) maps toggle states to this config shape. No server-side rule engine changes needed if all rule functions already read from state — they simply read `state.houseRules.auctionTimerSeconds` instead of a constant.

**Affects:** `shared/types.ts` (new `HouseRules` interface), `engine/rules/` (constant references replaced with `state.houseRules.*` reads), `shared/constants.ts` (default values for house rules), `client/src/ui/lobby/HouseRulesPicker.tsx` (new component), `server/RoomManager.ts` (Zod schema for room creation includes houseRules)

---

### Decision 5: PWA Implementation Approach

**Decision:** Vite PWA plugin (`vite-plugin-pwa`) for service worker + web manifest. Phased rollout matching UX component phases.

**Phase 1 (MVP):** Installable web app — manifest.json, basic service worker for offline shell (static assets cached). No push notifications yet.

**Phase 2 (Social Layer):** Push notification subscription via service worker. Used for async turn alerts ("It's your turn!") and game invitations. Notifications require user opt-in.

**Phase 3 (Spectacle):** Background sync for save states, offline-to-online state reconciliation.

```bash
# Phase 1 addition
npm install -D vite-plugin-pwa
```

**Rationale:** Vite PWA plugin is the standard approach for Vite-based PWAs. Phased rollout reduces risk — MVP only needs installability (Add to Home Screen). Push notifications are gated behind Phase 2 when async play has meaningful UX. Background sync in Phase 3 is aspirational.

**Affects:** `client/vite.config.ts` (plugin config), `client/public/manifest.json` (new), `client/src/sw.ts` or auto-generated service worker, `client/index.html` (manifest link)

---

### Decision 6: Deal Negotiation State Protocol

**Decision:** Dedicated Socket.IO events for proposal/counter/accept/decline with timeout. Server holds deal state, not client.

```
Events:
  'tradePropose'    → { roomId, fromPlayerId, toPlayerId, offer: TradeOffer, request: TradeOffer }
  'tradeCounter'    → { roomId, dealId, offer: TradeOffer, request: TradeOffer }
  'tradeAccept'     → { roomId, dealId }
  'tradeDecline'    → { roomId, dealId }
  'tradeUpdate'     → (server→clients) { dealId, status, offer, request, fromPlayerId, toPlayerId }

Server state per room:
  activeDeals: Map<dealId, {
    fromPlayerId, toPlayerId,
    offer: TradeOffer,      // what player A gives
    request: TradeOffer,    // what player A wants
    status: 'pending' | 'countered' | 'accepted' | 'declined' | 'expired',
    createdAt, expiresAt    // timeout: 120s per deal round
  }>

TradeOffer:
  properties: PropertyId[],
  cash: number
```

**Rationale:** Server holds deal state so it survives client disconnects during negotiation. Dedicated events keep trade logic cleanly separated from game actions. Timeout prevents stalled deals from blocking game progress. Multi-party trades (3+ players) extend the protocol by adding `participants: PlayerId[]` to the deal — MVP starts with 2-party only.

**Affects:** `server/SocketHandler.ts` (5 new event handlers), `server/RoomManager.ts` (activeDeals map per room), `client/src/ui/social/DealTable.tsx` (emit/listen logic), `useUIStore` (deal state for UI rendering)

## Implementation Patterns & Consistency Rules

### Pattern Categories

**Already Established (60 rules in project-context.md):**
Naming (PascalCase files, camelCase functions, colon-namespaced events), structure (4 workspaces, no barrel files in client/server, flat shared), format (`verbatimModuleSyntax`, `.js` imports, `enum` as value imports), state (immutable spread, `useShallow`, minimal leaf selectors, `animationQueue` drain), testing (`*.test.ts`, globals, inline mocks).

**New Patterns (Architectural Decision Driven):**

| Pattern | Decision | Risk Without It |
|---------|----------|-----------------|
| Component domain imports | D1 | Agents import across domains instead of through shared primitives |
| Reaction event format | D2 | Voice payload encoding inconsistency, missing context fields |
| Trade protocol flow | D6 | Deal lifecycle states diverge, timeout not enforced |
| House rules state access | D4 | Agents use hardcoded constants instead of `state.houseRules.*` |
| Save/resume protocol | D3 | Serialization format differs, paused room handling inconsistent |
| PWA service worker | D5 | Cache strategies conflict, notification payloads diverge |

### New Implementation Patterns

#### Pattern 1: Component Domain Imports

```
Rule: Components in domain folders import from shared primitives or same domain only.
      Cross-domain imports require an explicit re-export through shared.

✅ import { Modal } from '../shared/Modal.js';          // shared primitive
✅ import { TurnIndicator } from './TurnIndicator.js';   // same domain
❌ import { DealTable } from '../social/DealTable.js';   // cross-domain — re-export via shared
```

#### Pattern 2: Reaction Event Format

```
Rule: Voice payloads are base64-encoded strings representing <10s audio clips.
      Context field uses const enum values, not arbitrary strings.
      Server adds timestamp on receipt (server-authoritative time).

✅
socket.emit('playerReaction', {
  roomId: 'abc123',
  type: 'emoji',
  payload: '😂',
  context: { event: 'rent', targetPlayerId: 'p2' }
});

❌ socket.emit('playerReaction', { emoji: '😂' });  // missing fields, wrong shape
```

#### Pattern 3: Trade Protocol Lifecycle

```
Deal lifecycle: pending → countered → ( accepted | declined | expired )

Rules:
- Only 'pending' or 'countered' deals can transition to 'accepted'/'declined'
- 'accepted' and 'declined' are terminal states — no further transitions
- 'expired' auto-set by server after 120s inactivity per round
- Server validates deal ownership: only fromPlayerId/toPlayerId can modify their deal
- On player disconnect: their active deals → 'declined'
- Assets lock during active deal (can't be sold/mortgaged while in negotiation)
```

#### Pattern 4: House Rules State Access

```
Rule: All rule engine functions read house rules from state, never from constants.

✅
function calculateRent(state: GameState, tileIndex: number): number {
  // ...
  if (state.houseRules.speedRoundMultiplier > 1) {
    rent *= state.houseRules.speedRoundMultiplier;
  }
}

❌
import { SPEED_ROUND_MULTIPLIER } from './constants.js';
// constants may not reflect active house rules
```

#### Pattern 5: Save/Resume Protocol

```
Rule: Server serializes full GameState as JSON via structuredClone-compatible serialization.
      Paused rooms removed from active room list, kept in pausedRooms map.
      Resume requires: roomId + saveId + player token matching room roster.

Server state structure:
  activeRooms: Map<roomId, RoomData>      // games in progress
  pausedRooms: Map<roomId, PausedRoom>    // games saved for later

PausedRoom { gameState: GameState, saveId: string, savedAt: number, playerRoster: PlayerId[] }
```

#### Pattern 6: PWA Service Worker

```
Rule: Phase 1 service worker uses stale-while-revalidate for static assets,
      network-first for Socket.IO, cache-first for game assets (fonts, sounds).
      Push notification payload: { title: string, body: string, data: { roomId, type: 'turn' | 'invite' } }
      Notification click routes to game URL with roomId parameter.
```

### Enforcement

All AI agents implementing this project MUST adhere to the 60 rules in project-context.md plus the 6 patterns above. ESLint (client) and TypeScript strict mode enforce structural rules. Pattern 4 (house rules state access) should be enforced via code review — no lint rule can detect this antipattern. Trade protocol lifecycle is enforced server-side via Zod schema validation of deal state transitions.

## Project Structure & Boundaries

### Complete Project Directory Structure (Evolved)

```
property-tycoon-web/
├── packages/
│   ├── shared/                       # (unchanged core)
│   │   ├── types.ts                  # + HouseRules, TradeOffer, ReactionContext
│   │   ├── constants.ts              # + HouseRules defaults
│   │   ├── enums.ts                  # + ReactionContext enum
│   │   ├── StateMachine.ts
│   │   └── index.ts
│   │
│   ├── engine/                       # (minor changes: houseRules reads)
│   │   ├── state/
│   │   │   └── gameReducer.ts        # + houseRules field in GameState init
│   │   ├── rules/                    # Read state.houseRules.* not constants
│   │   ├── data/
│   │   ├── utils/
│   │   └── tests/
│   │
│   ├── server/                       # (significant additions)
│   │   ├── index.ts
│   │   ├── SocketHandler.ts          # + playerReaction, tradePropose/Counter/Accept/Decline, requestSave, resumeGame
│   │   ├── RoomManager.ts            # + activeDeals: Map, pausedRooms: Map, timeline: TimelineEntry[], savedState
│   │   ├── Config.ts
│   │   └── types.ts                  # + DealState, PausedRoom, TimelineEntry, TradeOffer
│   │
│   └── client/                       # (largest changes)
│       ├── vite.config.ts            # + vite-plugin-pwa
│       ├── public/
│       │   └── manifest.json         # NEW — PWA web manifest
│       └── src/
│           ├── app/
│           ├── core/
│           │   └── NetworkManager.ts  # + reaction/trade/save socket event wiring
│           ├── config/
│           ├── phaser/
│           ├── storage/
│           │   └── gameStorage.ts     # (unchanged — local save/load)
│           ├── ui/
│           │   ├── game/             # NEW — Phase 1 MVP
│           │   │   ├── DiceTray.tsx
│           │   │   ├── ActionCardBar.tsx
│           │   │   ├── TurnIndicator.tsx
│           │   │   └── PropertyCard.tsx
│           │   ├── social/           # NEW — Phase 2 social
│           │   │   ├── EmojiReactionBar.tsx
│           │   │   └── DealTable.tsx
│           │   ├── lobby/            # NEW — Phase 1 pre-game
│           │   │   ├── WaitingRoom.tsx
│           │   │   └── HouseRulesPicker.tsx
│           │   ├── spectacle/        # NEW — Phase 3 post-MVP
│           │   │   ├── BankruptcyOverlay.tsx
│           │   │   ├── WinnerReveal.tsx
│           │   │   ├── PostGameScreen.tsx
│           │   │   └── HighlightReel.tsx
│           │   └── shared/           # NEW — shared UI primitives
│           │       ├── Modal.tsx
│           │       ├── Button.tsx
│           │       ├── PlayerChip.tsx
│           │       └── Sheet.tsx
│           └── tests/
└── _bmad-output/
    ├── planning-artifacts/
    │   ├── prd.md
    │   ├── ux-design-specification.md
    │   └── architecture.md
    └── project-context.md
```

### Architectural Boundaries

**Package boundaries:**
- `shared/` — types, constants, enums, phase machine. No logic, no runtime dependencies.
- `engine/` — imports from `shared/` only. Never from `client/` or `server/`.
- `server/` — imports from `shared/` and `engine/`. Zod-validates all client input before touching engine.
- `client/` — imports from `shared/`. Never directly from `engine/` or `server/`.

**UI domain boundaries:**
- Components in `ui/game/`, `ui/social/`, `ui/lobby/`, `ui/spectacle/` import from `ui/shared/` primitives or same domain only.
- Cross-domain imports are forbidden — re-export through `ui/shared/` if shared behavior is needed.

**Data flow:**
- Offline: `useGameStore` → `gameReducer` → new state → Zustand subscribers
- Online: `useGameStore` → `NetworkManager.sendAction()` → Socket.IO → server validates → broadcasts → `NetworkManager` → `useGameStore.setState()`
- Social: `EmojiReactionBar` → `socket.emit('playerReaction')` → server appends to timeline + broadcasts → all clients display
- Trade: `DealTable` → socket events → `RoomManager.activeDeals` → `tradeUpdate` broadcasts → all clients

### Requirements to Structure Mapping

| Feature | Primary Location | Cross-Cutting |
|---------|-----------------|---------------|
| Dice roll + turn flow | `client/ui/game/` | `engine/rules/`, `useGameStore` |
| Social reactions | `client/ui/social/EmojiReactionBar.tsx` | `server/SocketHandler.ts`, `server/RoomManager.ts` (timeline) |
| Deal negotiation | `client/ui/social/DealTable.tsx` | `server/SocketHandler.ts` (5 events), `server/RoomManager.ts` (activeDeals) |
| House rules | `client/ui/lobby/HouseRulesPicker.tsx` | `shared/types.ts` (HouseRules), `engine/rules/` (reads) |
| Save/resume | `server/RoomManager.ts` (pausedRooms) | `client/storage/gameStorage.ts`, new socket events |
| PWA | `client/vite.config.ts`, `public/manifest.json` | Service worker in `client/src/` |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All 6 new decisions are compatible with the existing stack. No version conflicts. Tailwind 4 + Framer Motion 12 for custom components, Socket.IO 4 for trade/reaction events, Vite PWA plugin for service worker — all within the established brownfield foundation. Zustand selectors remain the state bridge; EventBus remains for cross-component communication; Phaser remains the board renderer.

**Pattern Consistency:** New implementation patterns extend existing conventions without breaking them. Component domain imports follow the existing "no barrel files in client" rule. Trade protocol states mirror the existing phase machine state pattern. House rules access follows existing "rule functions return new state via spread" pattern.

**Structure Alignment:** The evolved project tree adds 5 new directories under `client/src/ui/` and expands `server/` with new fields in existing files. No existing files are removed or renamed. Boundaries are preserved — `engine/` still doesn't know about `server/` or `client/`.

### Requirements Coverage Validation ✅

| UX Journey | Architectural Support |
|------------|----------------------|
| J1: Create & Join Game | WaitingRoom component + HouseRulesPicker + existing Socket.IO room system |
| J2: Take a Turn | DiceTray + ActionCardBar + TurnIndicator + PropertyCard + existing phase machine |
| J3: Negotiate a Deal | DealTable + 5 trade Socket.IO events + activeDeals server state + asset locking |
| J4: Bankruptcy & End Game | BankruptcyOverlay + WinnerReveal + PostGameScreen + HighlightReel (post-MVP) |

**NFR Coverage:** Real-time (Socket.IO), mobile-first (Tailwind responsive + bottom sheets), accessibility (WCAG 2.1 AA patterns), animation (Framer Motion with queue drain + useReducedMotion), reliability (token-based reconnect + paused rooms), security (Zod validation on all new events), no persistence (server state remains in-memory).

### Implementation Readiness Validation ✅

All 6 architectural decisions have: version-verified technology choice, documented rationale, affected file list, and implementation patterns with ✅/❌ examples. The project structure maps every UX component to a file path and every feature to cross-cutting concerns.

### Gap Analysis

**No critical gaps.** Architecture is ready for implementation.

**Minor gaps (non-blocking):**
- Voice snippet recording library not selected (MediaRecorder API sufficient for MVP; evaluate libraries at Phase 2)
- PWA Phase 2-3 details deferred (acceptable — phased rollout)
- Multi-party trade protocol extension deferred (acceptable — MVP is 2-party)
- DealTable fallback UI (simple modal) not fully specified (acceptable — iterative refinement)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Key Strengths:**
- Brownfield-aware — extends rather than rewrites, preserving 60 existing rules
- UX-spec-driven — every decision traces to a specific UX journey and component
- Phased — MVP, Social Layer, Spectacle phases give clear build order
- Agent-ready — implementation patterns with ✅/❌ examples prevent agent divergence

**Areas for Future Enhancement:**
- Database for persistent server state (if async play becomes primary use case)
- Voice streaming for real-time voice chat (currently discrete snippets)
- Multi-party trade protocol (3+ players)
- Full PWA background sync (Phase 3)

