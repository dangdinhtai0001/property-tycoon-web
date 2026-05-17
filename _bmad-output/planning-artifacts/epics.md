---
stepsCompleted: [1, 'step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - docs/000-overview.md
  - docs/001-product-scope.md
  - docs/005-ui-ux-scope.md
---

# property-tycoon-web - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for property-tycoon-web, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Room creation with visual house-rules picker and shareable one-link invite (no accounts)
FR2: Join room via invite link with display name entry, no authentication required
FR3: Waiting room with live player list, token/color preview, and host-only Start Game control
FR4: Host disconnect promotion — reassign host role to next active player
FR5: 48-tile board rendering via Phaser canvas with tile types, ownership markers, building indicators, and mortgage state
FR6: 2-6 players with unique name, color/token, cash, position, and status (active/jailed/bankrupt)
FR7: Turn-based gameplay with phase machine — roll, move, resolve tile, post-move actions, end turn
FR8: Dice roll — one-tap anywhere on DiceTray, animated result (Framer Motion), skippable token movement on board
FR9: Two dice with doubles detection — doubles grant extra turn; three consecutive doubles send player to jail
FR10: Pass Go salary collection when crossing or landing on Go tile
FR11: Property purchase — buy unowned land when landing on it; skip triggers no auction in MVP
FR12: Rent payment — auto-calculate rent based on ownership, group completion, building level, and mortgage state; auto-deduct from player cash
FR13: Tax/fee tiles — flat or percentage-based payments to bank
FR14: Two card decks — Cơ Hội (Chance) and Khí Vận (Karma) — with shuffle, draw, apply effect, and return-to-bottom mechanics
FR15: Card effects — receive/pay money, move to specific tile, go to jail, get out-of-jail card, pay building repair costs, collect from other players
FR16: Jail system — entry via Go To Jail tile, jail card, or triple doubles; exit via pay fine, use card, or roll doubles within time limit
FR17: Building system — 5 tiers (Đất trống → Nhà phố → Shophouse → Chung cư mini → Cao ốc → Landmark); build when owning full color group; even-build constraint
FR18: Sell buildings back to bank at reduced rate
FR19: Mortgage property — receive cash from bank, property stops collecting rent, visual mortgage indicator on tile
FR20: Unmortgage property — repay mortgage value plus fixed interest (10%) to restore rent collection
FR21: Debt Resolution phase — triggered when player cannot pay debt; auto-calculate liquidation order (sell buildings → mortgage → emergency loan if enabled); bankruptcy if still insufficient
FR22: Emergency Loan — optional house rule; limited by net worth or fixed cap with fixed interest
FR23: Bankruptcy — dramatic exit animation, assets liquidated/returned to bank, player removed from turn order
FR24: Winner determination — last player not bankrupt wins; dramatic winner reveal with property empire montage
FR25: Post-game screen — final standings, game stats, auto-generated highlight reel from timeline, rematch/new game options
FR26: Save game — local localStorage save (offline mode) and server-side JSON snapshot (online/async mode); auto-save each turn
FR27: Load game — restore full game state from save; versioned schema validation
FR28: Context-aware ActionCardBar — horizontal scroll of valid actions only (hidden, not grayed-out); actions filtered by current phase and player state
FR29: TurnIndicator with animated spotlight transition between players; countdown timer in online mode
FR30: PropertyCard detail view — name, building tier, mortgage status, rent table, owner color, group status
FR31: EmojiReactionBar — always-visible strip of 5 frequent emoji reactions; usable during any phase of any player's turn
FR32: Voice snippet reaction — hold-to-record (<10s), base64-encoded blob sent as discrete message, tap-to-play on other clients
FR33: Deal negotiation — propose/counter/accept/decline lifecycle with 120s timeout; split-screen asset selection; live preview of terms
FR34: Proactive deal detection — game analyzes state and surfaces "Good time to negotiate?" prompt when favorable conditions exist
FR35: Deal celebration — coral/mint burst animation on acceptance; deal recorded to game timeline; reaction zone available
FR36: Asset locking during active deals — properties in negotiation cannot be sold/mortgaged
FR37: Deal auto-cancel on player disconnect or timeout expiry
FR38: House rules customization — visual slot-machine-style toggle picker for: Free Parking jackpot, auction timer, double rent on triples, collect rent in jail, Speed Round multiplier, starting cash, Go salary
FR39: Speed Round voting — community-controlled pacing intervention; game detects stagnation and surfaces vote
FR40: Quick Mode — accelerated endgame with modified economy for 30-45 minute sessions
FR41: Turn timeout enforcement (online mode) — auto-skip with 10s warning countdown
FR42: Player reconnection — token-based (player-scoped, not socket-ID-based); 30s disconnect timeout; restore state if within window
FR43: Abandoned room garbage collection — rooms with all players disconnected past timeout are deleted
FR44: Server-authoritative game state — clients send intentions, server computes and broadcasts results; Zod-validated all incoming payloads
FR45: Per-room action serialization — mutex/queue prevents action handlers from running mid phase-transition
FR46: Offline mode — single-device local multiplayer with dual-mode Zustand dispatch (offline/connecting/online)
FR47: All animations skippable — single tap advances past any animation; respect prefers-reduced-motion
FR48: All interactive elements have minimum 44×44px touch targets (WCAG 2.5.5)
FR49: Accessibility — aria-live regions for turn announcements and critical game events; keyboard navigation on action cards; semantic color coding (never color-alone)
FR50: Responsive layout — mobile-first portrait (bottom sheets), tablet (2-column), desktop (side panels + centered board + modals)

### Non-Functional Requirements

NFR1: Real-time — Socket.IO room-based sub-second state broadcast; server must serialize actions per-room
NFR2: Mobile-first UX — touch targets ≥44px, bottom-sheet navigation, 3 breakpoints (mobile <768px, tablet 768-1023px, desktop ≥1024px)
NFR3: Accessibility — WCAG 2.1 AA compliance; screen reader support; keyboard navigation; focus management
NFR4: Animation — all skippable; max 300ms functional transitions; max 3s celebrations; animation queue drain prevents overwrites; no animation loops; respect prefers-reduced-motion
NFR5: Reliability — token-based reconnection; 30s disconnect timeout; abandoned room GC; server state ephemeral (no database)
NFR6: Security — Zod-validated all incoming payloads; socket auth middleware; room join authorization; clients never push state snapshots
NFR7: No persistence server-side — in-memory only; save/load is client concern (localStorage + optional server JSON snapshot for async)
NFR8: Performance — Phaser chunk pre-bundled in Vite (1000 KB limit); Zustand minimal leaf selectors; no full-state subscriptions in React components
NFR9: Type safety — TypeScript strict mode; verbatimModuleSyntax; import type for type-only imports; ESM .js extension imports
NFR10: Test coverage — Vitest unit tests for all game rules; inline mock game states; jsdom for client tests; testing-library for React components
NFR11: Code quality — PascalCase source files; camelCase functions; colon-namespaced EventBus keys; no barrel files in client/server
NFR12: Vietnamese localization — all game log text in Vietnamese; diacritic-friendly typography (Be Vietnam Pro with proper rendering of ă, â, ê, ô, ơ, ư, tone marks)
NFR13: Build — Vite 8 with Phaser pre-bundling; npm workspaces (4 packages); tsx watch for server dev
NFR14: CORS — dual Express + Socket.IO CORS configuration, both matching CORS_ORIGIN
NFR15: No .env files committed — server uses env vars with defaults (PORT, CORS_ORIGIN, TURN_TIMEOUT_MS)

### Additional Requirements (from Architecture)

- **Starter template:** Brownfield — no starter change needed. Established React + Vite + Phaser + Zustand + Socket.IO stack with 60 documented rules in project-context.md
- **Component file organization:** Domain-based folders under client/src/ui/ (game/, social/, lobby/, spectacle/, shared/)
- **Voice/emoji reaction data flow:** Separate `playerReaction` Socket.IO event; reactions stored in server-side game timeline; context field links reactions to game events
- **Save/load + async play:** Hybrid — local gameStorage.ts for offline + optional server-side JSON snapshot for async; paused rooms stored in pausedRooms map
- **House rules system:** Config object in GameState; Zod-validated at room creation; rule engine reads from state.houseRules.*, never from constants
- **PWA implementation:** Vite PWA plugin — Phase 1 installable, Phase 2 push notifications, Phase 3 background sync
- **Deal negotiation protocol:** Dedicated Socket.IO events (tradePropose/Counter/Accept/Decline); server holds deal state with 120s timeout; asset locking during active deals
- **UI domain boundary enforcement:** Components in domain folders import from shared primitives or same domain only; cross-domain imports must re-export through shared
- **Trade protocol lifecycle:** pending → countered → (accepted | declined | expired); server validates deal ownership and state transitions
- **Save/resume protocol:** Server serializes full GameState as JSON; paused rooms use pausedRooms map; resume requires roomId + saveId + player token
- **PWA service worker:** Phase 1 stale-while-revalidate for static assets, network-first for Socket.IO, cache-first for game assets
- **Design system:** Custom on Tailwind CSS 4; no third-party component library; Framer Motion for animations; Lucide React for icons; "Golden Hội An Night" color palette
- **Design direction:** "Card Table" baseline with "Game Night" celebration overlays

### UX Design Requirements

UX-DR1: Implement "Golden Hội An Night" color system — brand palette (Primary Gold #F5A623, Secondary Terracotta #C97D60, Accent Jade #2D8B7A, Deep Indigo #1A1A3E), celebration accents (Coral Pop #FF6B6B, Electric Mint #00D2A0), semantic coding (warm red danger, warm green income, warm yellow chance, cool blue auction), tile category tints
UX-DR2: Implement typography system with Be Vietnam Pro primary typeface, defined type scale (property card headings 1.25rem bold, body/buttons 1rem, money numbers tabular figures, micro text 0.75rem), Vietnamese diacritic support, no serif, minimum 14px text
UX-DR3: Implement spacing/layout foundation — mobile-first portrait, bottom-anchored action area, top-anchored player status bar, Phaser board canvas center ~60%, overlays slide up as card-like sheets, 8px base spacing unit, 4-column flexible grid
UX-DR4: Build shared UI primitives — Modal (overlays, confirmations, card reveals), Button (3 variants: Primary Gold, Secondary Terracotta, Danger warm red), PlayerChip (avatar color, cash display, turn highlight), Sheet (bottom sheet with drag handle)
UX-DR5: Build DiceTray component — one-tap anywhere roll; Framer Motion animated dice with physics; skippable token movement; full-width lower third during roll phase, collapses into ActionCardBar after
UX-DR6: Build ActionCardBar component — horizontal scrollable cards; contextually filtered (hidden, not grayed-out); cards fan from bottom; primary End Turn always rightmost and prominent Gold; action cards Terracotta with icon+label; danger cards warm red for distressed actions
UX-DR7: Build TurnIndicator component — animated spotlight transition between players; active player name/color; countdown timer with red pulse at 10s warning (online mode); aria-live="polite" region
UX-DR8: Build PropertyCard component — property deed display with name, building level indicator (1-5), mortgage status, rent table, owner color, group completion status; full-width sheet on mobile, centered modal on desktop; accessible via tile tap or property list
UX-DR9: Build WaitingRoom component — live player list with token color previews; host-only Start Game button; invite link display + QR code; player disconnect handling; host promotion on host leave
UX-DR10: Build EmojiReactionBar component — always-visible thin strip above action drawer; 5 frequent emoji reactions; tap-to-send; floating bubble animation near triggering event; hold-to-record voice snippet button
UX-DR11: Build DealTable component — split-screen trade negotiation; tap-to-toggle asset selection on mobile, drag-to-add on desktop; live preview "You give X, you receive Y"; propose/counter/accept/decline lifecycle; 120s timeout; deal celebration animation on accept
UX-DR12: Build HouseRulesPicker component — visual slot-machine toggle animation for rule customization; live previews of rule effects; maps toggle states to HouseRules config shape; Zod-validated before game start
UX-DR13: Build BankruptcyOverlay component — full-bleed Game Night transition (Card Table → indigo backdrop); dramatic but respectful exit animation; stats summary for bankrupt player; reaction zone for remaining players
UX-DR14: Build WinnerReveal component — full indigo + gold particle burst; winner name + net worth prominently displayed; property empire montage (all owned properties highlighted on board)
UX-DR15: Build PostGameScreen component — final standings ranked by net worth; game stats (total turns, biggest deal, luckiest roll); auto-generated highlight reel from game timeline; prominent Rematch button; New Game / Share / Exit options
UX-DR16: Build HighlightReel component — auto-generated from server game timeline (deals, reactions, key moments); embedded emoji/voice reactions; chronological scroll; inside joke preservation (most-used emoji, funniest deal)
UX-DR17: Implement overlay/sheet pattern — all non-board UI slides up from bottom as card-like sheets; only one sheet at a time; all sheets have drag handle for swipe-to-dismiss; sheets max 50% viewport height; desktop: centered modals instead of bottom sheets
UX-DR18: Implement feedback/celebration pattern — every game event has feedback signature scaled to emotional weight: dice (1s physics), rent (2s toast), property bought (1.5s green pulse), chance card (2s card flip), deal accepted (3s coral/mint burst), bankruptcy (4s Game Night), winner reveal (5s gold burst); all skippable with single tap
UX-DR19: Implement loading/connection states — never blank white screen; indigo branded backdrop always; Vietnamese loading text; reconnection overlay with auto-retry 3x; turn timeout countdown pulsing red at 10s
UX-DR20: Implement animation rules — all skippable; max 300ms functional UI; max 3s celebrations; respect prefers-reduced-motion; animation queue drain via useUIStore.animationQueue; no animation loops; physics only for dice
UX-DR21: Implement accessibility — WCAG 2.1 AA minimum; 44×44px touch targets; 4.5:1 contrast normal text / 3:1 large text; color never sole indicator (icons+labels always accompany); aria-live="polite" turn indicator; aria-live="assertive" critical events; keyboard navigation (Tab/Enter/Escape); focus management for sheets/modals; screen reader property card and deal table summaries
UX-DR22: Implement responsive design — mobile-first portrait (bottom sheets, full-width board, single-column actions), tablet (wider board, 2-column action grid), desktop (side panels + centered board + modals); Tailwind sm/md/lg breakpoints; test at 375/390/430/768/1024/1440px
UX-DR23: Implement visual texture/motif — Đông Hồ folk art inspired geometric patterns at 5% opacity on card backs/loading screens; soft lantern-light diffused shadows; frosted glass panel effects; hand-drawn warmth ink brush iconography via Lucide React where possible
UX-DR24: Formalize game-specific Tailwind theme extension — brand colors, building tier colors (5 levels), player identity colors (6 players), tile category colors, phase indicator colors, semantic state colors
UX-DR25: Implement one-link join flow — room created → shareable URL + QR code displayed; joining player enters display name only; invalid/expired link shows clear error with retry; 60-second cold start target from landing to dice rolling

### FR Coverage Map

FR1: Epic 1 — Room creation with house-rules picker and shareable invite link
FR2: Epic 1 — Join room via invite link with display name
FR3: Epic 1 — Waiting room with live player list and host controls
FR4: Epic 1 — Host disconnect promotion
FR5: Epic 2 — 48-tile board rendering via Phaser
FR6: Epic 2 — 2-6 players with unique identity and status
FR7: Epic 2 — Turn-based phase machine
FR8: Epic 2 — Dice roll with animation and skippable movement
FR9: Epic 2 — Doubles detection and triple-doubles jail
FR10: Epic 2 — Pass Go salary
FR11: Epic 2 — Property purchase
FR12: Epic 2 — Rent payment auto-calculation and collection
FR13: Epic 2 — Tax/fee tile payments
FR14: Epic 2 — Card deck system (Cơ Hội + Khí Vận)
FR15: Epic 2 — Card effects
FR16: Epic 2 — Jail system
FR17: Epic 2 — Building system (5 Vietnamese-named tiers)
FR18: Epic 2 — Sell buildings to bank
FR19: Epic 2 — Mortgage property
FR20: Epic 2 — Unmortgage with fixed interest
FR21: Epic 2 — Debt Resolution phase
FR22: Epic 2 — Emergency Loan (optional house rule)
FR23: Epic 2 — Bankruptcy handling
FR24: Epic 2 — Winner determination
FR25: Epic 2 — Post-game screen with standings
FR26: Epic 3 — Emoji reaction sending and broadcast
FR27: Epic 3 — Voice snippet recording and playback
FR28: Epic 2 — Context-aware ActionCardBar
FR29: Epic 2 — TurnIndicator with animated transitions
FR30: Epic 2 — PropertyCard detail view
FR31: Epic 3 — EmojiReactionBar always-visible strip
FR32: Epic 3 — Voice snippet hold-to-record interaction
FR33: Epic 3 — Deal negotiation lifecycle (propose/counter/accept/decline)
FR34: Epic 3 — Proactive deal detection
FR35: Epic 3 — Deal celebration and timeline recording
FR36: Epic 3 — Asset locking during active deals
FR37: Epic 3 — Deal auto-cancel on disconnect/timeout
FR38: Epic 1 — House rules customization with visual picker
FR39: Epic 4 — Speed Round voting
FR40: Epic 4 — Quick Mode
FR41: Epic 2 — Turn timeout enforcement (online)
FR42: Epic 2 — Player reconnection (token-based)
FR43: Epic 2 — Abandoned room GC
FR44: Epic 2 — Server-authoritative game state
FR45: Epic 2 — Per-room action serialization
FR46: Epic 2 — Offline mode dual-mode dispatch
FR47: Epic 2 — Skippable animations
FR48: Epic 2 — 44×44px touch targets
FR49: Epic 2 — Accessibility (aria-live, keyboard nav, semantic color)
FR50: Epic 2 — Responsive layout (3 breakpoints)

## Epic List

### Epic 1: Game Lobby & Setup
**"60 seconds from landing to 'Let's Play!'"** — Players create rooms, share one-link invites, configure house rules with a visual picker, and gather in a waiting room. No accounts, no installs, no confusion.

**FRs covered:** FR1, FR2, FR3, FR4, FR38

#### Story 1.1: Create Room with House Rules

As a host player,
I want to create a game room and customize house rules with a visual picker,
So that I can set up the game my group wants and share an invite link in under 60 seconds.

**Acceptance Criteria:**

**Given** the player is on the landing screen
**When** they tap "Create Game"
**Then** the house rules picker displays with all configurable rules (Free Parking jackpot, auction timer, double rent on triples, collect rent in jail, Speed Round multiplier, starting cash, Go salary) with defaults set

**Given** the house rules picker is open
**When** the player toggles rules using the slot-machine-style animation
**Then** each toggle shows a live preview of the rule's effect and the config is Zod-validated before proceeding

**Given** house rules are configured
**When** the player confirms
**Then** the server creates a room, generates a unique room ID, stores the HouseRules config, and returns a shareable invite URL + QR code

**Given** room creation fails (server error)
**When** an error occurs
**Then** the player sees a branded indigo error screen with Vietnamese error message and retry button

#### Story 1.2: Join Room via Invite Link

As a joining player,
I want to join a game room via a shared link with just a display name,
So that I can get into the game instantly without creating an account or installing anything.

**Acceptance Criteria:**

**Given** a player opens a valid invite link
**When** they arrive at the join screen
**Then** they see a display name input field and a "Join Game" button

**Given** the player enters a valid display name
**When** they tap "Join Game"
**Then** they are connected via Socket.IO, validated against the room's player roster, and placed in the waiting room

**Given** a player opens an invalid or expired link
**When** the link cannot be resolved
**Then** they see a clear error message with an option to create a new game instead

**Given** the room is full (6 players already joined)
**When** a player attempts to join
**Then** they receive a clear rejection message "Room is full" and are offered to create their own game

#### Story 1.3: Waiting Room with Host Controls

As a host player,
I want to see all players who have joined and control when the game starts,
So that I can ensure everyone is ready before we begin.

**Acceptance Criteria:**

**Given** the host has created a room
**When** players join via the invite link
**Then** the waiting room displays a live player list with each player's display name and assigned token color, updating in real-time

**Given** the waiting room has at least 2 players
**When** the host taps "Start Game"
**Then** all clients transition from waiting room to game screen with a "Let's Play!" celebration animation

**Given** the host is the only player in the waiting room
**When** they view the screen
**Then** the "Start Game" button is disabled with a message "Waiting for at least 1 more player"

**Given** a player disconnects from the waiting room
**When** 30 seconds pass without reconnection
**Then** the player is removed from the player list on all remaining clients

**Given** the host disconnects before starting the game
**When** the host socket drops
**Then** host role is atomically reassigned to the next player in the waiting room, and the new host gains Start Game control

#### Story 1.4: Token Color & Display Name Selection

As a player in the waiting room,
I want to choose my token color and set my display name,
So that I have a recognizable identity during the game.

**Acceptance Criteria:**

**Given** a player is in the waiting room
**When** they tap their token color preview
**Then** a color picker shows 6 available colors; already-taken colors are marked and unselectable

**Given** a player changes their display name
**When** they submit a new name
**Then** the name is validated (non-empty, not duplicate, max 20 characters) and updated across all clients in real-time

**Given** a player has not set a display name
**When** they first join
**Then** a default name is auto-generated (e.g., "Player 3") and they can customize it immediately

### Epic 2: Core Game Loop
**"A complete property-trading game, from first roll to winner."** — Players take turns rolling dice, moving around the 48-tile board, buying properties, collecting rent, drawing cards, going to jail, building 5 tiers of Vietnamese-named buildings, managing mortgage/debt, and going bankrupt. Dual offline/online modes with server authority.

**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR28, FR29, FR30, FR41, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR49, FR50

#### Story 2.1: Shared UI Primitives & Design Tokens

As a developer,
I want shared UI primitives (Modal, Button, PlayerChip, Sheet) and a Tailwind theme extension with the Golden Hội An Night color system,
So that all future components have a consistent design foundation and don't duplicate basic UI patterns.

**Acceptance Criteria:**

**Given** the project has Tailwind CSS configured
**When** the theme extension is applied
**Then** the Golden Hội An Night palette is available as Tailwind tokens: primary gold (`#F5A623` → `#D48C0A`), secondary terracotta (`#C97D60`), accent jade (`#2D8B7A`), deep indigo (`#1A1A3E`), celebration coral (`#FF6B6B`), electric mint (`#00D2A0`), and semantic colors (warm red danger, warm green income, warm yellow chance, cool blue auction)

**Given** the Tailwind theme is configured
**When** a component uses a theme token (e.g., `bg-primary`, `text-accent`)
**Then** the correct color is applied with proper contrast ratios for WCAG AA compliance

**Given** the shared primitives are implemented
**When** the Modal component renders
**Then** it supports overlay backdrop, card-like visual with soft lantern-light shadow, close button, and Framer Motion slide-up entrance animation

**Given** the Button component renders
**When** each variant is used
**Then** Primary (gold `#F5A623`) for CTAs, Secondary (terracotta `#C97D60`) for actions, and Danger (warm red) for destructive actions all render with 44×44px minimum touch targets and `focus-visible:` ring styles

**Given** the PlayerChip component renders
**When** it receives player data
**Then** it displays the player's token color swatch, display name, cash amount (tabular figures), and a turn-highlight animation state; compact variant below 480px

**Given** the Sheet component renders
**When** it is triggered
**Then** it slides up from the bottom as a card-like sheet with drag handle visual affordance, max 50% viewport height, and swipe-to-dismiss on mobile; renders as centered modal on desktop (≥1024px)

#### Story 2.2: Board Rendering & Player Setup

As a player,
I want to see the 48-tile board with player tokens positioned at Start and all player identities visible,
So that I can orient myself in the game world as soon as play begins.

**Acceptance Criteria:**

**Given** a game has started
**When** the game screen loads
**Then** the Phaser canvas renders all 48 tiles with correct composition (1 Go, 22 land, 4 stations, 2 utilities, 3 Chance, 3 Karma, 2 Tax, 1 Jail/Visit, 1 Go To Jail, 1 Parking), each tile showing its name in Vietnamese, type icon, and group color strip for land tiles

**Given** the board is rendered
**When** the game initializes
**Then** all 2-6 player tokens are placed on tile 0 (Go) with their assigned colors; active player token is visually highlighted

**Given** the game screen is visible
**When** a player looks at the top bar
**Then** all player chips display name, color swatch, and initial cash; the current player chip is highlighted with turn-indicator animation

**Given** the board renders on different viewport sizes
**When** the window is resized or viewed on mobile/tablet/desktop
**Then** the Phaser canvas scales proportionally to fill available center space without distortion

#### Story 2.3: Dice Roll & Token Movement

As a player,
I want to roll dice with a satisfying one-tap gesture and see my token animate across the board,
So that taking my turn feels tactile and exciting.

**Acceptance Criteria:**

**Given** it is the player's turn
**When** the turn begins
**Then** the DiceTray slides up from the bottom with a "Your turn!" micro-animation; one tap anywhere on the tray triggers the roll

**Given** the player taps the dice tray
**When** the roll animates
**Then** two dice animate with Framer Motion physics (spring/gravity), revealing the result (die1 + die2 = total); the animation is skippable with a single tap

**Given** the dice result is revealed
**When** doubles are rolled
**Then** a "Tung đôi" indicator appears showing the doubles count; on the third consecutive doubles, "Tung đôi lần 3 — vào tù" is displayed and the player moves to the Jail tile

**Given** the dice result is determined
**When** token movement begins
**Then** the token hops tile-by-tile with easing and bounce effect; trail effect at high speeds (dice total ≥ 8); token rotates slightly at corners; entire movement is skippable with a tap

**Given** the token passes or lands on Go
**When** movement completes
**Then** the player receives the Go salary (configurable via house rules); a brief "+$200" toast is shown

#### Story 2.4: Property Purchase & Rent Collection

As a player,
I want to buy unowned properties I land on and automatically pay rent on owned properties,
So that property acquisition and rent flow without manual banking.

**Acceptance Criteria:**

**Given** a player lands on an unowned property
**When** the tile resolves
**Then** a Buy Property sheet slides up showing: property name, type, price, group, rent table preview, player's current cash, and cash after purchase; Buy (Gold) and Skip (Terracotta) buttons are displayed

**Given** the player has enough cash
**When** they tap "Buy"
**Then** the purchase completes with a green pulse on the tile, deed added to player's assets, cash deducted; a celebration burst plays (skippable)

**Given** the player does not have enough cash
**When** the Buy Property sheet is shown
**Then** the Buy button is hidden entirely; only Skip is available with the reason displayed: "Không đủ tiền để mua"

**Given** a player lands on a property owned by another player
**When** the tile resolves
**Then** rent is auto-calculated (considering ownership, group completion, building level, mortgage state) and auto-deducted from the player's cash; a brief toast shows the amount and recipient

**Given** a player lands on a mortgaged property owned by another player
**When** the tile resolves
**Then** no rent is collected; a toast shows "Tài sản đang thế chấp — không thu rent"

**Given** the player cannot afford rent
**When** auto-payment fails
**Then** the Debt Resolution phase begins (see Story 2.7)

#### Story 2.5: Cards, Tax & Jail

As a player,
I want Chance/Karma cards, tax tiles, and jail to resolve automatically with clear visual feedback,
So that game events feel dramatic without requiring rulebook knowledge.

**Acceptance Criteria:**

**Given** a player lands on a Cơ Hội (Chance) or Khí Vận (Karma) tile
**When** the tile resolves
**Then** a card flip animation plays (Framer Motion, skippable); the card text is displayed in Vietnamese with the effect clearly stated; a Confirm button applies the effect

**Given** a card effect involves movement
**When** the player confirms
**Then** the token animates to the target tile; if passing Go during the movement, the salary is collected

**Given** a card effect involves money
**When** the player confirms
**Then** the amount is auto-credited/debited with a brief toast

**Given** a player lands on a Tax tile
**When** the tile resolves
**Then** the tax amount is calculated (flat or percentage based on tile type) and auto-deducted with a brief tax payment toast

**Given** a player lands on the "Go To Jail" tile or draws a jail card
**When** the event triggers
**Then** the token moves directly to the Jail tile (index 10); the player's status changes to "jailed"

**Given** a player is in jail at the start of their turn
**When** the Jail Decision sheet appears
**Then** three options are presented: Pay Fine (shows cost), Use "Get Out of Jail Free" Card (if held), Roll for Doubles; after 3 failed double attempts the player must pay the fine

**Given** a player is just visiting jail (did not land via penalty)
**When** they land on the Jail tile
**Then** no action is taken; a "Thăm tù" indicator is shown briefly

#### Story 2.6: Building System

As a player,
I want to build 5 tiers of Vietnamese-named buildings on my complete color groups,
So that I can increase rent values and progress my property empire.

**Acceptance Criteria:**

**Given** a player owns all properties in a color group with no mortgages on any property in the group
**When** they view the Build action
**Then** the Building Management sheet shows each property in the group, current building level (0-5), tier name (Đất trống → Nhà phố → Shophouse → Chung cư mini → Cao ốc → Landmark), and build cost

**Given** the player selects a property to build on
**When** they confirm the build
**Then** cash is deducted, the building level increments by 1, and the tile's visual building indicator updates on the Phaser board; building must comply with even-build constraint (levels must not differ by more than 1 within the group)

**Given** a player has buildings on a property
**When** they choose to sell a building
**Then** the sell price (reduced rate from build cost) is shown; upon confirmation, cash is credited and the building level decrements; confirmation dialog explains the financial consequence

**Given** a player does not own a complete color group
**When** they view available actions
**Then** the Build action is hidden entirely (not grayed out)

#### Story 2.7: Mortgage & Debt Resolution

As a player,
I want to mortgage properties for emergency cash and resolve debt through liquidation before bankruptcy,
So that I have strategic options when cash runs low.

**Acceptance Criteria:**

**Given** a player needs to raise cash
**When** they select the Mortgage action
**Then** the Mortgage Management sheet lists all unmortgaged properties with their mortgage values; tapping a property shows a confirmation card with the consequence clearly stated: "Tài sản sẽ không thu rent và có lãi suất 10% khi gỡ thế chấp"

**Given** a property has buildings
**When** the player attempts to mortgage it
**Then** the action is blocked with the message: "Bạn phải bán hết công trình trước khi thế chấp"

**Given** a mortgaged property is selected
**When** the player chooses to unmortgage
**Then** the unmortgage cost (mortgage value + 10% fixed interest) is shown and deducted; the mortgage indicator is removed from the tile

**Given** a player cannot pay a debt (rent, tax, card penalty)
**When** cash is insufficient
**Then** the Debt Resolution modal opens showing: total debt owed, current cash, and a prioritized liquidation plan (sell buildings → mortgage properties); the player selects assets to liquidate until debt is covered

**Given** the player has Emergency Loan enabled (house rule)
**When** liquidation of buildings and mortgages is still insufficient
**Then** an Emergency Loan option appears showing: loan amount (capped by net worth or fixed limit), fixed interest rate, and repayment terms

**Given** the player cannot raise enough cash after all liquidation options
**When** all options are exhausted
**Then** the "Declare Bankruptcy" button becomes the only available action with a danger-style confirmation

#### Story 2.8: Bankruptcy & End Game

As a player,
I want bankruptcy to be dramatic but respectful and the game to end with a satisfying winner celebration,
So that every game feels like a complete story.

**Acceptance Criteria:**

**Given** a player declares bankruptcy
**When** bankruptcy is confirmed
**Then** the bankrupt player's assets are liquidated (buildings sold, properties returned to bank/unmortgaged); a bankruptcy toast announces "X đã phá sản!" to all players; the bankrupt player's chip is dimmed in the player list

**Given** all bankrupt players are removed
**When** only one player remains
**Then** the game transitions to the End Game sequence: Winner Reveal animation plays (indigo backdrop + gold particle burst), winner name + net worth displayed prominently, property empire montage shows all owned properties highlighted on board

**Given** the winner reveal completes
**When** the post-game screen loads
**Then** final standings show all players ranked by net worth; game stats display (total turns, biggest deal, luckiest roll); a basic highlight reel lists key moments from the game log

**Given** the post-game screen is visible
**When** the winner or any remaining player views options
**Then** "Rematch" is the most prominent button (preserves player group, offers "Same rules as last game?" default); "New Game" returns to lobby; "Exit" returns to landing screen

#### Story 2.9: Action UI Components

As a player,
I want a context-aware action bar that only shows what I can do, a clear turn indicator, and detailed property cards,
So that I never wonder what actions are available or whose turn it is.

**Acceptance Criteria:**

**Given** it is the player's turn and they are in the post-move phase
**When** the ActionCardBar appears
**Then** it slides up from the bottom with horizontally scrollable cards; only valid actions are shown (hidden entirely, not grayed out); the most-likely action is first; End Turn is always the rightmost card in Gold

**Given** the player's phase changes
**When** new actions become available or invalid
**Then** the ActionCardBar updates to show only currently valid cards with a smooth transition; cards are Terracotta with icon + label for actions, warm red for distressed actions (sell, mortgage during debt)

**Given** it is any player's turn
**When** the TurnIndicator is visible
**Then** it shows an animated spotlight transition when the turn changes; the active player's name and color are displayed; in online mode, a countdown timer pulses red at the 10-second warning

**Given** a player taps a property tile or selects a property from their asset list
**When** the PropertyCard opens
**Then** it displays as a bottom sheet on mobile / centered modal on desktop, showing: property name in Vietnamese, building tier with level indicator (1-5 dots/icons), mortgage status badge, complete rent table, owner color strip, group completion status, and contextual actions (build/mortgage/sell) if owned by the current player

#### Story 2.10: Offline Mode

As a player,
I want to play a complete game locally on a single device without internet,
So that I can play with friends sharing one screen without any server setup.

**Acceptance Criteria:**

**Given** the game is started in offline mode
**When** the mode is set to 'offline'
**Then** Zustand dual-mode dispatch routes all actions through gameReducer locally; no Socket.IO connection is attempted; all game rules execute client-side

**Given** offline mode is active
**When** a player takes an action
**Then** the state updates are reflected on all player views (since all share the same device); the game plays identically to online mode in terms of rules, phases, and UI components

**Given** the game transitions from offline to online mode
**When** mode changes to 'connecting' then 'online'
**Then** the 3-state guard prevents dispatch drops; if mode === 'online' but networkManager is null, an error is thrown rather than silently dropped

#### Story 2.11: Online Multiplayer Infrastructure

As a player,
I want the game to run server-authoritatively with reliable turn management, reconnection, and room cleanup,
So that online play feels robust and fair.

**Acceptance Criteria:**

**Given** an online game is in progress
**When** a player sends an action via Socket.IO
**Then** the action is Zod-validated on the server before touching game state; invalid payloads return `{ message: string, code?: string }`; the server computes the result and broadcasts `gameStateUpdate` to all clients in the room

**Given** a room has multiple players
**When** incoming `playerAction` events arrive
**Then** a per-room mutex/queue serializes actions so no handler runs mid phase-transition; wrong-turn actions (socket.playerId !== state.currentPlayerId) are explicitly rejected with an error response, not silently ignored

**Given** it is a player's turn in online mode
**When** the turn begins
**Then** a server-side timer starts using `TURN_TIMEOUT_MS`; the TurnIndicator shows a countdown; at 10 seconds remaining the countdown pulses red; when the timer fires, the player is auto-skipped and the skip is broadcast to all clients

**Given** a player disconnects during an online game
**When** the socket drops
**Then** a 30-second reconnect window begins; the player can reconnect using a player-scoped token (not socket ID); if they reconnect within the window, state is restored; if the window expires, the player is removed and their assets handled per game mode

**Given** all players in a room have been disconnected beyond the timeout
**When** the garbage collection sweep runs
**Then** the abandoned room is deleted from server memory

**Given** the server starts an online game
**When** the game state is initialized
**Then** the `HouseRules` from room creation are applied; all rule engine functions read from `state.houseRules.*`, never from hard-coded constants

#### Story 2.12: UX Polish & Accessibility

As a player,
I want smooth, skippable animations, responsive layout across devices, and accessible interaction patterns,
So that the game feels polished and is usable by everyone regardless of device or ability.

**Acceptance Criteria:**

**Given** any animation is playing (dice, card flip, celebration, token movement)
**When** the player taps anywhere
**Then** the animation advances to its completed state immediately

**Given** the user has `prefers-reduced-motion` enabled
**When** any animation would play
**Then** Framer Motion's `useReducedMotion()` replaces physics/burst animations with simple opacity transitions

**Given** the animation system is processing events
**When** rapid server `gameStateUpdate` events arrive
**Then** the `useUIStore.animationQueue` drain mechanism prevents in-progress animation state from being overwritten; no animation loops indefinitely

**Given** the game is running on mobile (<768px)
**When** the layout renders
**Then** bottom sheets are used for overlays; board fills center; action cards stack vertically; player chips collapse to compact variant below 480px

**Given** the game is running on tablet (768-1023px)
**When** the layout renders
**Then** wider board, 2-column action grid possible; bottom sheets still primary overlay pattern

**Given** the game is running on desktop (≥1024px)
**When** the layout renders
**Then** side panels for player stats; centered board; overlays render as modals instead of bottom sheets; DealTable is side-by-side

**Given** any interactive element exists
**When** measured
**Then** touch targets are minimum 44×44px; color is never the sole indicator (icons and labels always accompany semantic colors); all interactive elements have `focus-visible:` ring styles

**Given** a critical game event occurs (turn change, bankruptcy, auction start)
**When** the event fires
**Then** the TurnIndicator has `aria-live="polite"` announcing "Your turn" / "X's turn"; critical events use `aria-live="assertive"`; all icon-only buttons have `aria-label`

**Given** a player navigates by keyboard
**When** they use Tab/Enter/Escape
**Then** Tab cycles through action cards; Enter selects the focused card; Escape dismisses the current sheet/modal; focus moves to the new sheet when opened and returns to the trigger when dismissed

### Epic 3: Social Layer
**"A board game that feels like game night with friends."** — Players react with emoji and voice snippets, negotiate deals with full proposal flow, receive proactive trade nudges, and build a shared social timeline. Every deal celebrated, every reaction recorded.

**FRs covered:** FR26, FR27, FR31, FR32, FR33, FR34, FR35, FR36, FR37

#### Story 3.1: Emoji Reactions

As a player,
I want to send emoji reactions during any player's turn and see them float near the triggering game event,
So that I can express reactions in real-time without interrupting gameplay.

**Acceptance Criteria:**

**Given** the game is in progress (any phase, any player's turn)
**When** the EmojiReactionBar is visible
**Then** it renders as an always-visible thin strip above the action drawer with 5 frequent emoji reactions (😂, 😱, 🔥, 👏, 💀); each emoji is a single-tap to send

**Given** a player taps an emoji
**When** the reaction is sent
**Then** the client emits `socket.emit('playerReaction', { roomId, type: 'emoji', payload: '😂', context: { event: 'rent', targetPlayerId } })`; the server appends it to the room's game timeline and broadcasts to all clients

**Given** a reaction is broadcast
**When** other clients receive it
**Then** the emoji appears as a floating bubble near the triggering event's location on screen (e.g., 😱 on the rent payment, 😂 on a Chance card); bubble animates up and fades out over 2 seconds

**Given** a reaction is sent in offline mode
**When** no Socket.IO connection exists
**Then** the emoji still appears as a local floating bubble animation using the same UI component

**Given** a reaction context is missing or unknown
**When** the event fires without context
**Then** the emoji floats from a default position (center-bottom of the screen) instead of near a specific event

#### Story 3.2: Voice Snippet Reactions

As a player,
I want to record short voice snippets and have other players play them back with a tap,
So that we can share the banter and trash-talk of physical game night.

**Acceptance Criteria:**

**Given** the EmojiReactionBar is visible
**When** a player presses and holds the microphone button
**Then** recording begins with a visual indicator (pulsing red ring); recording auto-stops at 10 seconds maximum; releasing early sends the current snippet

**Given** a voice snippet is recorded
**When** it is sent
**Then** the client emits `socket.emit('playerReaction', { roomId, type: 'voice', payload: '<base64-audio>', context })`; payload is base64-encoded string, not a stream

**Given** a voice reaction is broadcast
**When** other clients receive it
**Then** a speaker icon bubble appears near the triggering event; tapping the bubble plays the audio snippet once; the bubble auto-dismisses after playback

**Given** the browser does not support MediaRecorder API
**When** the EmojiReactionBar renders
**Then** the microphone button is hidden; only emoji reactions are available

**Given** a voice snippet is sent in offline mode
**When** no server exists
**Then** the snippet plays locally for all players on the shared device

#### Story 3.3: Deal Negotiation

As a player,
I want to propose, counter, accept, or decline property trades with another player,
So that I can negotiate strategically to complete color groups and strengthen my position.

**Acceptance Criteria:**

**Given** a player selects Trade from the ActionCardBar
**When** they choose a trade partner
**Then** the DealTable opens as a split-screen sheet: left side shows "Your Assets" (properties + cash), right side shows "Their Assets"; tap-to-toggle on mobile, drag-to-add on desktop

**Given** the player assembles an offer
**When** they add properties and/or cash to "You give" and "You receive" sections
**Then** a live preview updates continuously: "You give: [properties + cash] — You receive: [properties + cash]"; the preview highlights when the deal is balanced or imbalanced

**Given** the player is satisfied with the proposal
**When** they tap "Send Proposal"
**Then** the client emits `socket.emit('tradePropose', { roomId, toPlayerId, offer: TradeOffer, request: TradeOffer })`; the server creates a deal with status 'pending' and a 120-second expiry; both players see the pending deal notification

**Given** the receiving player reviews the proposal
**When** they view the DealTable
**Then** three options are available: Accept (coral celebration burst + handshake animation), Counter (modify terms and send back, status → 'countered'), Decline (deal closes, optional emoji reaction available)

**Given** a counter-offer is sent
**When** the original proposer reviews it
**Then** the same Accept/Counter/Decline options are available; the 120-second timer resets on each counter

**Given** a deal is accepted
**When** both parties confirm
**Then** assets transfer automatically (properties change ownership, cash moves); a coral/mint celebration burst plays; the deal is recorded to the game timeline; the reaction zone is available for celebration emoji/voice

**Given** a deal is in negotiation
**When** either player attempts to sell or mortgage a property involved in the deal
**Then** the action is blocked with the message: "Tài sản đang trong giao dịch"

**Given** a player disconnects during deal negotiation
**When** the socket drops
**Then** all active deals involving that player are auto-declined; locked assets are released

**Given** the 120-second timer expires on a deal
**When** no action is taken
**Then** the deal is auto-set to 'expired'; both players are notified; locked assets are released

#### Story 3.4: Proactive Deal Detection & Timeline

As a player,
I want the game to suggest deals when conditions are favorable and to see a growing timeline of social moments,
So that I don't miss trade opportunities and our session's story is preserved.

**Acceptance Criteria:**

**Given** a player's turn has ended
**When** the game analyzes the state
**Then** if two players each own properties in the same color group, the system surfaces a "Good time to negotiate?" prompt card to the current player; the prompt is dismissible

**Given** a proactive deal prompt appears
**When** the player taps it
**Then** the DealTable opens pre-populated with the suggested trade (the complementary properties from each player); the player can modify before sending

**Given** the player dismisses the prompt
**When** they tap "Not now"
**Then** the prompt dismisses and does not reappear for the same player pair until at least 2 full turn cycles have passed

**Given** game events occur (deals accepted, reactions sent, bankruptcies declared)
**When** each event fires
**Then** the server appends a TimelineEntry to the room's timeline array: `{ event, playerId, timestamp, data }`; the game timeline is available for post-game HighlightReel

**Given** a deal is accepted
**When** the celebration plays
**Then** the timeline records the deal with offer/request details, participants, and any reactions associated with the deal moment

### Epic 4: Persistence & Spectacle
**"Respect real life. Remember the stories."** — Players save/resume games, install as PWA, experience dramatic bankruptcy and winner reveals, relive moments via auto-generated highlight reels. Speed Round voting and Quick Mode for pacing control.

**FRs covered:** FR39, FR40

#### Story 4.1: Save & Resume Game

As a player,
I want to save a game mid-session and resume it later with the same group,
So that real-life interruptions don't ruin our game night.

**Acceptance Criteria:**

**Given** a game is in progress (offline mode)
**When** the player saves
**Then** gameStorage.save() serializes the full GameState to localStorage with a versioned schema; auto-save triggers after each turn completes

**Given** a saved game exists
**When** a player selects "Load Game" from the landing screen
**Then** the save is validated against the versioned schema; if valid, the full game state is restored including all player data, board state, phase, turn order, card decks, and game log

**Given** a game is in progress (online mode)
**When** the host or any player saves
**Then** the client emits `socket.emit('requestSave')`; the server serializes GameState as JSON and stores it in RoomData.savedState; the server emits `'saveComplete'` with a saveId

**Given** all players disconnect from an online game with a save
**When** the room enters 'paused' state
**Then** the room is moved from activeRooms to pausedRooms map with `{ gameState, saveId, savedAt, playerRoster }`; no assets are redistributed

**Given** a paused game exists
**When** any original player emits `socket.emit('resumeGame', { roomId, saveId })`
**Then** the server validates the player was in the room roster, restores the full GameState, moves the room back to activeRooms, and broadcasts `'gameStateUpdate'` with the full state to all reconnecting clients

**Given** a player tries to start a new game while a save exists
**When** they tap "New Game"
**Then** a confirmation dialog warns: "Bạn đã có một ván đang lưu. Bắt đầu ván mới sẽ ghi đè save hiện tại." with Start New Game / Cancel options

**Given** the server restarts (crash, deploy)
**When** the process exits
**Then** all paused room saves are lost (server is in-memory only — acceptable for MVP; database for persistent saves deferred)

#### Story 4.2: PWA Installation

As a player,
I want to install Property Tycoon to my device's home screen and receive push notifications for async turns,
So that the game feels native and I don't miss my turn in async mode.

**Acceptance Criteria:**

**Given** the PWA is configured (Phase 1)
**When** a player visits the game in a supporting browser
**Then** the web manifest is served (`manifest.json`) with app name, icons, theme color (Deep Indigo `#1A1A3E`), and display mode "standalone"; the browser's "Add to Home Screen" prompt is available

**Given** the service worker is registered
**When** static assets are requested
**Then** stale-while-revalidate strategy serves cached assets for offline shell (Tailwind, fonts, icons, Phaser); Socket.IO connections use network-first; Phaser game assets use cache-first

**Given** the PWA is installed (Phase 2)
**When** push notification subscription is triggered
**Then** the player is prompted to opt-in for notifications; upon acceptance, the subscription is stored server-side for async turn alerts

**Given** push notifications are enabled
**When** it becomes the player's turn in async play mode
**Then** a push notification is sent: `{ title: "Đến lượt bạn!", body: "Lượt của bạn trong Property Tycoon", data: { roomId, type: 'turn' } }`; tapping the notification opens the game directly to that room

**Given** the player declines push notifications
**When** the subscription prompt is dismissed
**Then** the game functions normally without notifications; the opt-in is offered again on the next session, not spammed

#### Story 4.3: Spectacle Components

As a player,
I want bankruptcy, winner reveals, and the post-game screen to deliver theatrical "Game Night" drama,
So that big moments feel earned and memorable.

**Acceptance Criteria:**

**Given** a player declares bankruptcy
**When** the bankruptcy is confirmed
**Then** the BankruptcyOverlay triggers: the screen transitions from Card Table baseline to full-bleed Game Night (deep indigo backdrop); a dramatic but respectful exit animation plays (max 4 seconds, skippable); the bankrupt player's stats summary is displayed; remaining players see a reaction zone for emoji/voice

**Given** only one player remains
**When** the game ends
**Then** the WinnerReveal triggers: full indigo backdrop + gold particle burst animation; winner name + net worth displayed prominently in large text; property empire montage auto-scrolls through all properties owned by the winner, each highlighted on the board with a gold glow; max 5 seconds, skippable

**Given** the winner reveal completes
**When** the PostGameScreen loads
**Then** it shows: final standings (all players ranked by net worth with token colors), game stats cards (total turns, biggest deal, luckiest roll, most reactions sent), a Rematch button (most prominent, Gold), New Game button, Share button, and Exit button

**Given** players choose "Rematch"
**When** the button is tapped
**Then** the HouseRulesPicker opens with "Same rules as last game?" as the default; player group and token colors are preserved; confirmation starts a new game immediately

**Given** the PostGameScreen renders
**When** Đông Hồ folk art inspired geometric patterns are applied
**Then** subtle repeating motifs appear at 5% opacity on card backs and the post-game screen background; soft lantern-light diffused shadows are used on all panels

#### Story 4.4: Highlight Reel

As a player,
I want an auto-generated highlight reel of our game's best moments after each match,
So that we can relive the funniest reactions, biggest deals, and most dramatic turns.

**Acceptance Criteria:**

**Given** a game has ended
**When** the PostGameScreen loads
**Then** the HighlightReel section is auto-generated from the server's game timeline; it displays key moments in chronological order: deals accepted (with participants and terms), bankruptcies declared, most-used emoji, funniest moment (reaction cluster), and final winner

**Given** the highlight reel is displayed
**When** a player scrolls through it
**Then** each moment shows a card with: event type icon, timestamp (turn number), involved players (with color chips), embedded emoji/voice reactions associated with that moment, and a brief description in Vietnamese

**Given** a game produced no significant social moments (minimal reactions, no deals)
**When** the highlight reel is generated
**Then** it falls back to game stats: "Most valuable property empire," "Most rent collected," "Longest jail stay," and "Richest moment" (peak cash)

**Given** players tap "Share" on the post-game screen
**When** the share action triggers
**Then** a shareable link is generated with a read-only summary of standings and key stats (no full game state); the link can be shared via the platform's native share sheet on mobile or copied to clipboard on desktop

#### Story 4.5: Speed Round & Quick Mode

As a player,
I want the group to vote for Speed Round when the game is dragging and a Quick Mode option for shorter sessions,
So that we always have a path to a satisfying ending.

**Acceptance Criteria:**

**Given** a game has been running for an extended period (configurable threshold)
**When** the game detects potential stalemate
**Then** a Speed Round vote prompt appears for all players: "Game kéo dài — Bật Speed Round?"; players vote yes/no; majority in favor activates Speed Round

**Given** Speed Round is activated
**When** gameplay continues
**Then** the Speed Round multiplier (1-3x, from house rules) is applied: all rents are multiplied, building costs are modified, and Go salary is adjusted; the multiplier effect is visibly indicated on the board and player chips

**Given** a player creates a new game
**When** they select Quick Mode from the HouseRulesPicker
**Then** the game is configured for 30-45 minute sessions: accelerated starting conditions (higher starting cash, modified economy), modified win condition (highest net worth after fixed rounds or time limit instead of last-player-standing), and Speed Round multiplier pre-set to 2x

**Given** Quick Mode is active
**When** the game reaches the time limit or round cap
**Then** the game ends immediately; the player with the highest net worth wins; the Winner Reveal and PostGameScreen trigger with a "Quick Mode Champion" variant
