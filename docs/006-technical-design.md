# Property Tycoon Web — Technical Design

**Document:** `06-technical-design.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa thiết kế kỹ thuật cho **Property Tycoon Web MVP**.

File này dành cho developer và tập trung vào:

```txt
Recommended tech stack
Architecture principle
Folder structure
Game engine separation
Turn state machine
Data models
Save/load format
Storage decision
Future 3D compatibility
````

Mục tiêu chính:

```txt
1. Game logic phải rõ ràng, test được và không phụ thuộc UI.
2. UI chỉ gửi action và render state.
3. Turn flow phải dùng state machine để tránh kẹt lượt.
4. Save/load phải khôi phục chính xác game state.
5. Data model phải đủ tốt cho mortgage, debt, bankruptcy và future 3D.
```

File này không định nghĩa chi tiết:

```txt
Board layout đầy đủ
Card text cụ thể
Economy balance cụ thể
UI visual design
Animation spec chi tiết
```

Các phần đó nằm ở:

```txt
02-gameplay-rules.md
03-board-design.md
04-economy-and-debt.md
05-ui-ux-scope.md
07-testing-and-acceptance.md
08-roadmap-and-backlog.md
```

---

## 2. Recommended Tech Stack

## 2.1 MVP Stack

Stack đề xuất cho MVP:

```txt
Language: TypeScript
Frontend framework: React
Build tool: Vite
State management: Zustand hoặc Redux Toolkit
Game rendering engine: Phaser (WebGL/Canvas) — Board, Token, Dice
UI animation (React DOM only): Framer Motion hoặc CSS transition — Modal, Panel
Styling: Tailwind CSS hoặc CSS Modules
Unit testing: Vitest
E2E testing: Playwright
Storage MVP: localStorage
Storage later: IndexedDB
Backend: none
Database server: none
```

Kiến trúc là **Hybrid**:

```txt
Game World (Board, Token, Dice):
- Render bởi Phaser (WebGL/Canvas)
- Animation: Phaser Tweens, Timelines, Particles, SpriteSheet

UI Layer (Modal, Panel, Menu):
- Render bởi React DOM
- Animation: Framer Motion hoặc CSS transition (giới hạn trong DOM)
```

## 2.2 Recommended Default Choice

Khuyến nghị cụ thể:

```txt
Vite + React + TypeScript
Phaser cho game world rendering
Zustand for UI/game store bridge — đồng bộ GameState xuống Phaser instance
Pure TypeScript game engine
Vitest for engine tests
Playwright for critical UI flows
localStorage for one-slot MVP save
```

Lý do:

```txt
Vite nhanh và đơn giản cho frontend app.
React phù hợp với UI nhiều panel/modal.
TypeScript giúp giảm bug state/action.
Phaser cung cấp Tweens, Particles, SpriteSheet animation chuyên biệt cho game 2D.
Pure game engine dễ unit test.
Zustand nhẹ, ít boilerplate, phù hợp làm bridge giữa React và Phaser.
Vitest tích hợp tốt với TypeScript/Vite ecosystem.
Playwright phù hợp test flow end-to-end.
localStorage đủ cho save JSON nhỏ ở MVP.
```

## 2.3 Alternative Stack

Có thể dùng:

```txt
Redux Toolkit thay Zustand nếu muốn action/reducer pattern nghiêm ngặt hơn.
XState nếu muốn state machine formal hơn.
IndexedDB nếu save data lớn hoặc có nhiều save slot.
PixiJS thay Phaser nếu cần canvas rendering nhẹ hơn (ít tính năng built-in hơn).
Three.js ở phase 3D (permanent non-goal của project này).
```

MVP không cần:

```txt
Backend framework
Database server
WebSocket
Auth provider
Cloud save
Server-authoritative state
```

---

## 3. Architecture Principles

## 3.1 Core Principle

Nguyên tắc quan trọng nhất:

```txt
Game logic must be independent from UI rendering.
```

Điều này nghĩa là:

```txt
Game engine không import React.
Game engine không import Phaser.
Game engine không đọc DOM.
Game engine không phụ thuộc animation.
Game engine không biết modal nào đang mở.
Game engine chỉ nhận GameAction và trả về GameState mới.
```

Đồng bộ GameState xuống Phaser:

```txt
Zustand store giữ GameState (source of truth).
Phaser scene subscribe vào store (hoặc nhận update qua EventEmitter).
Khi GameState thay đổi, Phaser scene cập nhật sprites/tiles tương ứng.
Phaser KHÔNG tự giữ game logic — chỉ là display layer.

Ví dụ flow:
dispatch(ROLL_DICE)
→ GameState.players[0].position = 9
→ Zustand notifies Phaser scene
→ PhaserScene.tokenSprite.moveTo(tile[9])  ← animation
→ React DOM re-renders Player Panel
```

UI có nhiệm vụ:

```txt
Render board.
Render player list.
Render dice.
Render modals.
Gửi action vào engine.
Hiển thị game log.
Hiển thị animation dựa trên state/event.
```

## 3.2 Why Separate Game Engine and UI

Lý do:

```txt
1. Dễ test rule bằng unit test.
2. Dễ debug vì state transition rõ.
3. Dễ save/load vì state thuần JSON.
4. Dễ thay UI 2D sang 3D sau này.
5. Dễ thêm online multiplayer sau này.
6. Dễ chạy simulation/balance test.
7. Dễ replay action log trong future phase.
```

## 3.3 Source of Truth

Trong runtime, source of truth là:

```txt
GameState
```

Không nên để nhiều source of truth song song như:

```txt
React local state giữ position riêng.
DOM animation state giữ owner riêng.
Modal tự giữ payment state riêng.
```

UI có thể có state tạm thời, nhưng không được thay thế GameState.

Ví dụ UI local state hợp lệ:

```txt
Modal tab đang mở
Hover tile
Selected property trong asset panel
Animation progress
Tooltip visibility
```

Ví dụ UI local state không nên giữ riêng:

```txt
player.cash
player.position
property.ownerId
property.isMortgaged
currentPlayerId
activeDebtState
```

---

## 4. High-Level Architecture

## 4.1 Runtime Flow

```txt
User clicks button
↓
UI creates GameAction
↓
Game store dispatches action
↓
Game engine validates action
↓
Game engine applies rule
↓
New GameState returned
↓
UI re-renders from GameState
↓
Optional animation/event log plays
↓
Auto-save if needed
```

## 4.2 Engine Should Be Deterministic

Game engine nên deterministic nếu nhận cùng:

```txt
Previous GameState
GameAction
Random seed / random result
```

thì trả về cùng:

```txt
Next GameState
GameEvent[]
```

Để dễ test, dice roll có thể được inject:

```ts
rollDice({ die1: 3, die2: 5 })
```

thay vì engine tự gọi `Math.random()` ở mọi nơi.

---

## 5. Folder Structure

## 5.1 Recommended Structure

```txt
src/
  app/
    App.tsx
    routes/
    providers/
    store/

  game-engine/
    actions/
      actionTypes.ts
      actionCreators.ts

    config/
      defaultRules.ts
      rulePresets.ts

    data/
      boards/
        classicCity40.ts
      cards/
        chanceCards.ts
        fortuneCards.ts
      economy/
        propertyEconomy.ts

    rules/
      diceRules.ts
      movementRules.ts
      tileResolutionRules.ts
      propertyRules.ts
      rentRules.ts
      buildingRules.ts
      cardRules.ts
      jailRules.ts
      economyRules.ts
      debtRules.ts
      bankruptcyRules.ts
      turnRules.ts
      winConditionRules.ts

    state/
      initialState.ts
      gameReducer.ts
      stateMachine.ts
      validators.ts
      invariants.ts

    selectors/
      playerSelectors.ts
      propertySelectors.ts
      boardSelectors.ts
      economySelectors.ts
      actionSelectors.ts

    services/
      saveService.ts
      loadService.ts
      migrationService.ts
      randomService.ts

    types/
      ids.ts
      game.ts
      player.ts
      board.ts
      property.ts
      cards.ts
      economy.ts
      actions.ts
      events.ts
      save.ts

    tests/
      diceRules.test.ts
      movementRules.test.ts
      rentRules.test.ts
      debtRules.test.ts
      bankruptcyRules.test.ts
      saveLoad.test.ts

  ui/
    board/
      Board.tsx
      BoardTile.tsx
      TokenLayer.tsx
      BuildingIndicators.tsx

    panels/
      PlayerListPanel.tsx
      CurrentTurnPanel.tsx
      DicePanel.tsx
      ActionPanel.tsx
      AssetPanel.tsx
      GameLogPanel.tsx

    modals/
      BuyPropertyModal.tsx
      PropertyInfoModal.tsx
      CardModal.tsx
      PaymentModal.tsx
      JailModal.tsx
      BuildModal.tsx
      MortgageModal.tsx
      DebtResolutionModal.tsx
      BankruptcyModal.tsx
      EndGameModal.tsx

    components/
      Button.tsx
      MoneyText.tsx
      PlayerBadge.tsx
      PropertyCard.tsx
      ModalShell.tsx

    hooks/
      useGameActions.ts
      useGameSelectors.ts
      useAutoSave.ts

    animation/
      tokenAnimation.ts
      diceAnimation.ts
      moneyAnimation.ts

  phaser/
    scenes/
      BoardScene.ts          ← main game world scene
      DiceScene.ts           ← dice sprite animation
      UIScene.ts             ← optional overlay scene
    sprites/
      TokenSprite.ts
      TileSprite.ts
      BuildingSprite.ts
    effects/
      ParticleEffects.ts
      GlowEffect.ts
      TrailEffect.ts
    camera/
      BoardCamera.ts
    bridge/
      PhaserBridge.ts        ← sync GameState → Phaser scene

  storage/
    localStorageAdapter.ts
    indexedDbAdapter.ts

  tests/
    e2e/
      basicGameFlow.spec.ts
      debtResolution.spec.ts
```

---

## 5.2 Folder Responsibility

| Folder                   | Responsibility                                |
| ------------------------ | --------------------------------------------- |
| Folder                   | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `game-engine/`           | Pure rule logic, state transition, validators             |
| `game-engine/data/`      | Board/card/property config                                |
| `game-engine/rules/`     | Individual rule modules                                   |
| `game-engine/selectors/` | Derived state helpers                                     |
| `game-engine/services/`  | Save/load, migration, random helpers                      |
| `ui/`                    | React components only (DOM layer)                         |
| `ui/modals/`             | Modal UI (React DOM)                                      |
| `ui/panels/`             | Game screen panels (React DOM)                            |
| `ui/phaser/`             | Phaser scenes, sprites, effects, bridge (Canvas layer)    |
| `ui/phaser/bridge/`      | PhaserBridge — đồng bộ GameState → Phaser instance        |
| `storage/`               | Browser storage adapters                                  |
| `tests/`                 | E2E and integration tests                     |

---

## 6. Game Engine Separation

## 6.1 Engine API

Game engine nên expose API đơn giản:

```ts
export function createInitialGame(config: NewGameConfig): GameState;

export function reduceGameState(
  state: GameState,
  action: GameAction
): GameReducerResult;
```

Result:

```ts
export type GameReducerResult = {
  state: GameState;
  events: GameEvent[];
  errors?: GameError[];
};
```

## 6.2 Action-Based Updates

Mọi thay đổi game state nên đi qua action.

Ví dụ action:

```ts
export type GameAction =
  | { type: "SETUP_GAME"; payload: SetupGamePayload }
  | { type: "ROLL_DICE"; payload?: RollDicePayload }
  | { type: "FINISH_MOVEMENT" }
  | { type: "BUY_PROPERTY"; payload: { propertyId: PropertyId } }
  | { type: "DECLINE_BUY_PROPERTY"; payload: { propertyId: PropertyId } }
  | { type: "PAY_RENT" }
  | { type: "DRAW_CARD"; payload: { deckType: DeckType } }
  | { type: "USE_JAIL_CARD"; payload: { cardId: CardId } }
  | { type: "PAY_JAIL_FINE" }
  | { type: "BUILD_ON_PROPERTY"; payload: { propertyId: PropertyId } }
  | { type: "SELL_BUILDING"; payload: { propertyId: PropertyId } }
  | { type: "MORTGAGE_PROPERTY"; payload: { propertyId: PropertyId } }
  | { type: "UNMORTGAGE_PROPERTY"; payload: { propertyId: PropertyId } }
  | { type: "TAKE_EMERGENCY_LOAN"; payload: { amount: Money } }
  | { type: "REPAY_LOAN"; payload: { loanId: LoanId } }
  | { type: "PAY_DEBT" }
  | { type: "DECLARE_BANKRUPTCY" }
  | { type: "END_TURN" };
```

## 6.3 Engine Must Validate Actions

Engine phải reject action nếu phase không hợp lệ.

Ví dụ:

```txt
ROLL_DICE chỉ hợp lệ ở WAITING_TO_ROLL hoặc jail roll context.
BUY_PROPERTY chỉ hợp lệ ở BUY_DECISION.
SELL_BUILDING hợp lệ ở BUILD_DECISION hoặc DEBT_RESOLUTION.
MORTGAGE_PROPERTY hợp lệ ở BUILD_DECISION hoặc DEBT_RESOLUTION.
PAY_DEBT chỉ hợp lệ ở DEBT_RESOLUTION.
DECLARE_BANKRUPTCY chỉ hợp lệ ở DEBT_RESOLUTION/BANKRUPTCY_RESOLUTION.
END_TURN không hợp lệ nếu còn activeDebtState.
```

---

## 7. Turn State Machine

## 7.1 Required Game Phases

State machine chính:

```txt
SETUP
WAITING_TO_ROLL
ROLLING
MOVING
RESOLVING_TILE
BUY_DECISION
CARD_RESOLUTION
JAIL_DECISION
BUILD_DECISION
DEBT_RESOLUTION
BANKRUPTCY_RESOLUTION
END_TURN
GAME_OVER
```

## 7.2 Phase Definitions

| Phase                   | Meaning                                             |
| ----------------------- | --------------------------------------------------- |
| `SETUP`                 | Game chưa bắt đầu hoặc đang setup players/rules     |
| `WAITING_TO_ROLL`       | Current player có thể tung dice                     |
| `ROLLING`               | Dice vừa được tung, đang xử lý kết quả              |
| `MOVING`                | Token đang di chuyển hoặc movement đang được apply  |
| `RESOLVING_TILE`        | Game đang xử lý tile đích                           |
| `BUY_DECISION`          | Player cần chọn mua hoặc bỏ qua property            |
| `CARD_RESOLUTION`       | Card đang được hiển thị/apply effect                |
| `JAIL_DECISION`         | Player đang ở tù và phải chọn cách xử lý            |
| `BUILD_DECISION`        | Player có thể quản lý asset trước khi kết thúc lượt |
| `DEBT_RESOLUTION`       | Player thiếu tiền và phải raise cash                |
| `BANKRUPTCY_RESOLUTION` | Game đang xử lý phá sản                             |
| `END_TURN`              | Game chuẩn bị chuyển sang player tiếp theo          |
| `GAME_OVER`             | Ván đã kết thúc                                     |

---

## 7.3 State Transition Overview

```txt
SETUP
  → WAITING_TO_ROLL

WAITING_TO_ROLL
  → ROLLING

ROLLING
  → MOVING
  → JAIL_DECISION
  → END_TURN

MOVING
  → RESOLVING_TILE

RESOLVING_TILE
  → BUY_DECISION
  → CARD_RESOLUTION
  → JAIL_DECISION
  → DEBT_RESOLUTION
  → BUILD_DECISION
  → END_TURN

BUY_DECISION
  → DEBT_RESOLUTION
  → BUILD_DECISION
  → END_TURN

CARD_RESOLUTION
  → MOVING
  → DEBT_RESOLUTION
  → JAIL_DECISION
  → BUILD_DECISION
  → END_TURN

JAIL_DECISION
  → ROLLING
  → MOVING
  → DEBT_RESOLUTION
  → END_TURN

BUILD_DECISION
  → DEBT_RESOLUTION
  → END_TURN

DEBT_RESOLUTION
  → RESOLVING_TILE
  → CARD_RESOLUTION
  → BUILD_DECISION
  → BANKRUPTCY_RESOLUTION

BANKRUPTCY_RESOLUTION
  → END_TURN
  → GAME_OVER

END_TURN
  → WAITING_TO_ROLL
  → JAIL_DECISION
  → GAME_OVER
```

---

## 7.4 Phase Transition Rules

## SETUP

Allowed actions:

```txt
SETUP_GAME
```

Transitions:

```txt
SETUP_GAME → WAITING_TO_ROLL
```

---

## WAITING_TO_ROLL

Allowed actions:

```txt
ROLL_DICE
```

Transitions:

```txt
ROLL_DICE → ROLLING
```

Reject:

```txt
BUY_PROPERTY
END_TURN
PAY_DEBT
BUILD_ON_PROPERTY
```

---

## ROLLING

Allowed internal processing:

```txt
Calculate dice total
Check doubles
Check three consecutive doubles
```

Transitions:

```txt
If three consecutive doubles:
  → JAIL_DECISION or END_TURN after send to jail

If normal roll:
  → MOVING
```

---

## MOVING

Allowed internal processing:

```txt
Move player token
Detect passing Start
Apply pass-start bonus if eligible
Set player.position
```

Transitions:

```txt
Movement complete → RESOLVING_TILE
```

---

## RESOLVING_TILE

Allowed internal processing:

```txt
Resolve tile by tile type
```

Transitions:

```txt
Unowned property → BUY_DECISION
Owned property by other player → payment or DEBT_RESOLUTION
Card tile → CARD_RESOLUTION
Tax tile → payment or DEBT_RESOLUTION
Go To Jail → END_TURN
Rest tile → BUILD_DECISION or END_TURN
Own property → BUILD_DECISION or END_TURN
```

---

## BUY_DECISION

Allowed actions:

```txt
BUY_PROPERTY
DECLINE_BUY_PROPERTY
```

Transitions:

```txt
BUY_PROPERTY success → BUILD_DECISION or END_TURN
DECLINE_BUY_PROPERTY → BUILD_DECISION or END_TURN
If payment somehow fails → DEBT_RESOLUTION
```

Note:

```txt
Buying property is optional.
If player does not have enough cash, Buy button should be disabled.
Debt Resolution should not trigger only because player cannot afford optional purchase.
```

---

## CARD_RESOLUTION

Allowed actions/internal processing:

```txt
APPLY_CARD_EFFECT
CONFIRM_CARD
USE_HELD_CARD if context-specific
```

Transitions:

```txt
Card gives money → continue / BUILD_DECISION / END_TURN
Card requires payment → payment or DEBT_RESOLUTION
Card moves player → MOVING or RESOLVING_TILE
Card sends to jail → END_TURN
Card gives held card → BUILD_DECISION or END_TURN
```

---

## JAIL_DECISION

Allowed actions:

```txt
PAY_JAIL_FINE
USE_JAIL_CARD
ROLL_DICE_FOR_JAIL
```

Transitions:

```txt
Pay fine success → WAITING_TO_ROLL or ROLLING
Use jail card → WAITING_TO_ROLL or ROLLING
Roll doubles → MOVING
Fail roll → END_TURN
Fine payment insufficient → DEBT_RESOLUTION
```

---

## BUILD_DECISION

Allowed actions:

```txt
BUILD_ON_PROPERTY
SELL_BUILDING
MORTGAGE_PROPERTY
UNMORTGAGE_PROPERTY
REPAY_LOAN
END_TURN
```

Transitions:

```txt
Valid asset action → BUILD_DECISION
END_TURN → END_TURN
If required payment problem happens → DEBT_RESOLUTION
```

Note:

```txt
BUILD_DECISION is optional.
Player can skip and end turn.
```

---

## DEBT_RESOLUTION

Allowed actions:

```txt
SELL_BUILDING
MORTGAGE_PROPERTY
TAKE_EMERGENCY_LOAN
PAY_DEBT
DECLARE_BANKRUPTCY
```

Forbidden:

```txt
ROLL_DICE
END_TURN
BUY_PROPERTY
BUILD_ON_PROPERTY
UNMORTGAGE_PROPERTY
DRAW_CARD
```

Transitions:

```txt
PAY_DEBT success → return to previous resolution context
DECLARE_BANKRUPTCY → BANKRUPTCY_RESOLUTION
```

Important:

```txt
Game must store returnContext before entering DEBT_RESOLUTION.
```

Example:

```ts
type DebtReturnContext =
  | { type: "TILE_RESOLUTION"; tileId: TileId }
  | { type: "CARD_RESOLUTION"; cardId: CardId }
  | { type: "JAIL_FINE" }
  | { type: "BUILD_DECISION" };
```

---

## BANKRUPTCY_RESOLUTION

Allowed internal processing:

```txt
Transfer or reset assets
Remove bankrupt player from turn order
Clear debt
Check winner
```

Transitions:

```txt
If one active player remains → GAME_OVER
Else → END_TURN
```

---

## END_TURN

Allowed internal processing:

```txt
Clear temporary turn state
Check extra turn from doubles
Choose next player
Auto-save
```

Transitions:

```txt
If game over → GAME_OVER
If same player gets extra turn → WAITING_TO_ROLL
If next player jailed → JAIL_DECISION
Else → WAITING_TO_ROLL
```

---

## GAME_OVER

Allowed actions:

```txt
START_NEW_GAME
LOAD_GAME
RETURN_TO_MAIN_MENU
```

No gameplay mutation allowed.

---

## 7.5 State Machine Invariants

Engine must maintain these invariants:

```txt
No negative cash after action resolution.
No more than one active DebtState.
Cannot END_TURN while activeDebtState exists.
Cannot ROLL_DICE if phase is not WAITING_TO_ROLL/JAIL_DECISION context.
Cannot BUY_PROPERTY outside BUY_DECISION.
Cannot PAY_DEBT outside DEBT_RESOLUTION.
Cannot DECLARE_BANKRUPTCY outside DEBT_RESOLUTION/BANKRUPTCY_RESOLUTION.
Cannot collect rent from mortgaged property.
Cannot collect rent for bankrupt owner.
No property ownerId references bankrupt player after bankruptcy resolution.
GAME_OVER must have exactly one winner or a defined draw rule.
```

---

## 8. Data Models

## 8.1 Branded ID Types

Use branded string types to avoid mixing ids.

```ts
export type Brand<K, T> = K & { __brand: T };

export type PlayerId = Brand<string, "PlayerId">;
export type PropertyId = Brand<string, "PropertyId">;
export type TileId = Brand<string, "TileId">;
export type CardId = Brand<string, "CardId">;
export type LoanId = Brand<string, "LoanId">;
export type DebtId = Brand<string, "DebtId">;
export type GameId = Brand<string, "GameId">;

export type Money = number;
```

---

## 8.2 Game Phase

```ts
export type GamePhase =
  | "SETUP"
  | "WAITING_TO_ROLL"
  | "ROLLING"
  | "MOVING"
  | "RESOLVING_TILE"
  | "BUY_DECISION"
  | "CARD_RESOLUTION"
  | "JAIL_DECISION"
  | "BUILD_DECISION"
  | "DEBT_RESOLUTION"
  | "BANKRUPTCY_RESOLUTION"
  | "END_TURN"
  | "GAME_OVER";
```

---

## 8.3 Game State

```ts
export type GameState = {
  id: GameId;
  version: number;

  phase: GamePhase;
  previousPhase?: GamePhase;
  returnContext?: ResolutionReturnContext;

  config: GameConfig;

  players: Record<PlayerId, Player>;
  playerOrder: PlayerId[];
  currentPlayerId: PlayerId | null;
  winnerId: PlayerId | null;

  board: BoardState;
  properties: Record<PropertyId, Property>;

  decks: {
    chance: DeckState;
    fortune: DeckState;
  };

  dice: DiceState;
  turn: TurnState;

  activeDebtState: DebtState | null;
  activePaymentRequest: PaymentRequest | null;

  log: GameLogEntry[];

  createdAt: string;
  updatedAt: string;
};
```

---

## 8.4 Game Config

```ts
export type GameConfig = {
  boardId: string;
  rulePresetId: RulePresetId;

  playerCount: number;

  startingCash: Money;
  passStartBonus: Money;

  jailFine: Money;
  maxJailTurns: number;

  allowEmergencyLoan: boolean;
  maxOpenLoansPerPlayer: number;
  blockBuildWhileLoanOpen: boolean;
  blockBuyWhileLoanOpen: boolean;

  unmortgageInterestRate: number;
  sellBuildingRate: number;

  autoSaveEnabled: boolean;
};
```

---

## 8.5 Player

```ts
export type PlayerStatus = "active" | "jailed" | "bankrupt";

export type Player = {
  id: PlayerId;
  name: string;
  token: PlayerToken;

  cash: Money;
  position: number;

  status: PlayerStatus;

  propertyIds: PropertyId[];
  heldCardIds: CardId[];
  loanIds: LoanId[];

  jail: JailState;

  stats: PlayerStats;
};

export type PlayerToken = {
  color: string;
  iconId?: string;
};

export type JailState = {
  isJailed: boolean;
  jailTurns: number;
};

export type PlayerStats = {
  turnsTaken: number;
  timesPassedStart: number;
  propertiesBought: number;
  rentPaid: Money;
  rentCollected: Money;
  buildingsBuilt: number;
  buildingsSold: number;
  mortgagesTaken: number;
  bankruptTurn?: number;
};
```

---

## 8.6 Board State

```ts
export type BoardState = {
  id: string;
  name: string;
  version: number;
  tileCount: number;
  jailIndex: number;
  startIndex: number;
  tiles: BoardTile[];
};

export type TileType =
  | "start"
  | "land"
  | "station"
  | "utility"
  | "chance"
  | "fortune"
  | "tax"
  | "jail"
  | "go_to_jail"
  | "rest";

export type BoardTile = {
  id: TileId;
  index: number;
  type: TileType;
  name: string;

  propertyId?: PropertyId;
  groupId?: PropertyGroupId;

  deckType?: DeckType;
  amount?: Money;
};
```

---

## 8.7 Property

```ts
export type PropertyType = "land" | "station" | "utility";

export type Property = {
  id: PropertyId;
  tileId: TileId;

  name: string;
  type: PropertyType;
  groupId?: PropertyGroupId;

  ownerId: PlayerId | null;

  price: Money;
  mortgageValue: Money;
  isMortgaged: boolean;

  buildingLevel: number;
  maxBuildingLevel: number;
  buildCost?: Money;

  rentByLevel?: Money[];
  stationRentByCount?: Money[];
  utilityMultiplierByCount?: number[];

  tags?: string[];
};
```

---

## 8.8 Property Group

```ts
export type PropertyGroupId = Brand<string, "PropertyGroupId">;

export type PropertyGroup = {
  id: PropertyGroupId;
  name: string;
  color: string;
  propertyIds: PropertyId[];
  buildCost: Money;
};
```

---

## 8.9 Dice State

```ts
export type DiceState = {
  die1: number | null;
  die2: number | null;
  total: number | null;
  isDouble: boolean;
  doublesRolledThisTurn: number;
  lastRollId?: string;
};
```

---

## 8.10 Turn State

```ts
export type TurnState = {
  turnNumber: number;
  roundNumber: number;
  startedAt: string | null;

  hasRolled: boolean;
  extraTurnPending: boolean;

  pendingTileId: TileId | null;
  pendingCardId: CardId | null;
};
```

---

## 8.11 Card and Deck

```ts
export type DeckType = "chance" | "fortune";

export type DeckState = {
  deckType: DeckType;
  drawPile: CardId[];
  discardPile: CardId[];
};

export type Card = {
  id: CardId;
  deckType: DeckType;

  title: string;
  description: string;

  effect: CardEffect;

  canBeHeld: boolean;
  returnToDeckAfterUse: boolean;
};

export type CardEffect =
  | { type: "RECEIVE_MONEY"; amount: Money; from: "bank" }
  | { type: "PAY_MONEY"; amount: Money; to: "bank" }
  | { type: "PAY_EACH_PLAYER"; amount: Money }
  | { type: "RECEIVE_FROM_EACH_PLAYER"; amount: Money }
  | { type: "MOVE_TO_TILE"; tileIndex: number; collectStartBonus: boolean; resolveDestination: boolean }
  | { type: "MOVE_STEPS"; steps: number; resolveDestination: boolean }
  | { type: "MOVE_TO_NEAREST"; target: "station" | "utility"; resolveDestination: boolean }
  | { type: "GO_TO_JAIL" }
  | { type: "GET_OUT_OF_JAIL_CARD" }
  | { type: "PAY_REPAIR_COST"; perBuilding: Money; perMaxBuilding: Money };
```

---

## 8.12 Loan

```ts
export type LoanStatus = "open" | "paid" | "cancelled";

export type Loan = {
  id: LoanId;
  playerId: PlayerId;

  principal: Money;
  interestRate: number;
  interestAmount: Money;
  amountDue: Money;

  createdTurn: number;
  status: LoanStatus;
};
```

---

## 8.13 DebtState

```ts
export type DebtSource =
  | "rent"
  | "tax"
  | "card"
  | "jail_fine"
  | "loan"
  | "other";

export type Creditor =
  | { type: "bank" }
  | { type: "player"; playerId: PlayerId };

export type DebtState = {
  id: DebtId;

  debtorId: PlayerId;
  creditor: Creditor;

  amountDue: Money;
  reason: string;
  source: DebtSource;

  createdTurn: number;

  canUseEmergencyLoan: boolean;

  returnContext: ResolutionReturnContext;
};
```

---

## 8.14 Payment Request

```ts
export type PaymentRequest = {
  id: string;

  debtorId: PlayerId;
  creditor: Creditor;

  amount: Money;
  reason: string;
  source: DebtSource;

  allowDebtResolution: boolean;
};
```

---

## 8.15 Resolution Return Context

```ts
export type ResolutionReturnContext =
  | { type: "NONE" }
  | { type: "TILE_RESOLUTION"; tileId: TileId }
  | { type: "CARD_RESOLUTION"; cardId: CardId }
  | { type: "JAIL_DECISION" }
  | { type: "BUILD_DECISION" }
  | { type: "END_TURN" };
```

---

## 8.16 Game Event

Game events are useful for UI animation and log.

```ts
export type GameEvent =
  | { type: "DICE_ROLLED"; playerId: PlayerId; die1: number; die2: number }
  | { type: "PLAYER_MOVED"; playerId: PlayerId; from: number; to: number; passedStart: boolean }
  | { type: "MONEY_CHANGED"; playerId: PlayerId; delta: Money; reason: string }
  | { type: "PROPERTY_BOUGHT"; playerId: PlayerId; propertyId: PropertyId; price: Money }
  | { type: "RENT_PAID"; fromPlayerId: PlayerId; toPlayerId: PlayerId; amount: Money; propertyId: PropertyId }
  | { type: "CARD_DRAWN"; playerId: PlayerId; cardId: CardId; deckType: DeckType }
  | { type: "PLAYER_JAILED"; playerId: PlayerId }
  | { type: "BUILDING_BUILT"; playerId: PlayerId; propertyId: PropertyId; newLevel: number }
  | { type: "BUILDING_SOLD"; playerId: PlayerId; propertyId: PropertyId; newLevel: number; amount: Money }
  | { type: "PROPERTY_MORTGAGED"; playerId: PlayerId; propertyId: PropertyId; amount: Money }
  | { type: "PROPERTY_UNMORTGAGED"; playerId: PlayerId; propertyId: PropertyId; cost: Money }
  | { type: "DEBT_CREATED"; debtId: DebtId; debtorId: PlayerId; amountDue: Money }
  | { type: "DEBT_PAID"; debtId: DebtId; debtorId: PlayerId; amountPaid: Money }
  | { type: "PLAYER_BANKRUPT"; playerId: PlayerId; creditor: Creditor }
  | { type: "GAME_OVER"; winnerId: PlayerId };
```

---

## 9. Selectors

Selectors compute derived data from GameState.

## 9.1 Player Selectors

```ts
export function getCurrentPlayer(state: GameState): Player | null;

export function getActivePlayers(state: GameState): Player[];

export function getPlayerProperties(
  state: GameState,
  playerId: PlayerId
): Property[];

export function getPlayerNetWorth(
  state: GameState,
  playerId: PlayerId
): Money;
```

## 9.2 Property Selectors

```ts
export function isPropertyOwned(property: Property): boolean;

export function isPropertyOwnedBy(
  property: Property,
  playerId: PlayerId
): boolean;

export function canCollectRent(
  state: GameState,
  propertyId: PropertyId
): boolean;

export function calculateRent(
  state: GameState,
  propertyId: PropertyId,
  context: RentContext
): Money;
```

## 9.3 Economy Selectors

```ts
export function getSellableBuildings(
  state: GameState,
  playerId: PlayerId
): Property[];

export function getMortgageableProperties(
  state: GameState,
  playerId: PlayerId
): Property[];

export function getUnmortgageCost(
  state: GameState,
  propertyId: PropertyId
): Money;

export function canPayDebt(state: GameState): boolean;

export function getDebtShortfall(state: GameState): Money;
```

## 9.4 Action Selectors

UI should use selectors to enable/disable actions.

```ts
export function getAvailableActions(state: GameState): AvailableAction[];

export function canRollDice(state: GameState): boolean;
export function canBuyProperty(state: GameState, propertyId: PropertyId): boolean;
export function canBuildOnProperty(state: GameState, propertyId: PropertyId): boolean;
export function canSellBuilding(state: GameState, propertyId: PropertyId): boolean;
export function canMortgageProperty(state: GameState, propertyId: PropertyId): boolean;
export function canPayDebt(state: GameState): boolean;
export function canDeclareBankruptcy(state: GameState): boolean;
```

---

## 10. Save / Load Format

## 10.1 Save Requirements

Save/load must restore the game exactly.

Save data must include:

```txt
Game version
Save schema version
Rule preset
Board id
Players
Current player
Turn number
Phase
Return context
Dice state
Board state
Property ownership
Building levels
Mortgage states
Loan states
Jail states
Card deck order
Held cards
Game log
Active debt state if any
Active payment request if any
```

---

## 10.2 Save File Type

```ts
export type SaveFile = {
  schemaVersion: number;
  appVersion: string;

  savedAt: string;

  gameState: GameState;
};
```

---

## 10.3 Save Key

MVP uses one save slot.

```ts
export const SAVE_KEY = "property-tycoon-web:save:v1";
```

Possible future slots:

```ts
export function getSaveSlotKey(slotId: string): string {
  return `property-tycoon-web:save-slot:${slotId}`;
}
```

---

## 10.4 Save Service

```ts
export interface SaveService {
  save(state: GameState): Promise<void>;
  load(): Promise<GameState | null>;
  clear(): Promise<void>;
  hasSave(): Promise<boolean>;
}
```

MVP localStorage implementation:

```ts
export class LocalStorageSaveService implements SaveService {
  constructor(private readonly key: string) {}

  async save(state: GameState): Promise<void> {
    const saveFile: SaveFile = {
      schemaVersion: 1,
      appVersion: state.config.appVersion ?? "0.1.0",
      savedAt: new Date().toISOString(),
      gameState: state,
    };

    localStorage.setItem(this.key, JSON.stringify(saveFile));
  }

  async load(): Promise<GameState | null> {
    const raw = localStorage.getItem(this.key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SaveFile;
    return migrateSaveFile(parsed).gameState;
  }

  async clear(): Promise<void> {
    localStorage.removeItem(this.key);
  }

  async hasSave(): Promise<boolean> {
    return localStorage.getItem(this.key) !== null;
  }
}
```

---

## 10.5 Save Validation

Before loading a save:

```txt
Check schemaVersion.
Check gameState exists.
Check required fields.
Check board tile count matches board config.
Check player ids are valid.
Check currentPlayerId exists or game is over.
Check property owner ids are valid.
Check no bankrupt player owns property.
Check phase is valid.
Check activeDebtState exists if phase is DEBT_RESOLUTION.
```

If save is invalid:

```txt
Show error.
Do not crash app.
Offer reset save.
```

---

## 10.6 Save Migration

Save file must include `schemaVersion`.

```ts
export function migrateSaveFile(saveFile: SaveFile): SaveFile {
  switch (saveFile.schemaVersion) {
    case 1:
      return saveFile;

    default:
      throw new Error(`Unsupported save schema: ${saveFile.schemaVersion}`);
  }
}
```

Future migration example:

```ts
function migrateV1ToV2(saveFile: SaveFileV1): SaveFileV2 {
  return {
    ...saveFile,
    schemaVersion: 2,
    gameState: {
      ...saveFile.gameState,
      newField: defaultValue,
    },
  };
}
```

---

## 10.7 Auto-Save Policy

MVP auto-save triggers:

```txt
After END_TURN
After successful Debt Resolution action
After bankruptcy resolution
After game over
After manual save
```

Avoid saving mid-action before state is valid.

Good:

```txt
Save after reducer completes and invariants pass.
```

Bad:

```txt
Save halfway through payment resolution.
Save while cash has been reduced but debt not cleared.
```

---

## 11. Storage Decision

## 11.1 MVP Storage

MVP uses:

```txt
localStorage
```

Reason:

```txt
One save slot.
GameState is small JSON.
No files/blobs.
No high-performance queries.
No backend.
Simple implementation.
```

## 11.2 When to Move to IndexedDB

Move to IndexedDB if future scope includes:

```txt
Multiple save slots
Replay logs
Large event history
Custom boards
Custom card decks
Images/assets
Offline-first app
Large structured data
Searchable saved games
```

## 11.3 Storage Adapter Boundary

Do not call `localStorage` directly from UI components.

Use adapter:

```ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

localStorage adapter:

```ts
export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}
```

This makes it easier to swap IndexedDB later.

---

## 12. Rule Engine Modules

## 12.1 Dice Rules

Responsibilities:

```txt
Roll dice
Calculate total
Detect doubles
Track doubles count
Detect 3 consecutive doubles
```

```ts
export function applyRollDice(
  state: GameState,
  payload?: RollDicePayload
): GameReducerResult;
```

---

## 12.2 Movement Rules

Responsibilities:

```txt
Move token
Handle board wrap
Detect passing Start
Apply pass-start bonus
Handle forced movement
```

```ts
export function movePlayer(
  state: GameState,
  playerId: PlayerId,
  steps: number,
  options: MovementOptions
): GameReducerResult;
```

---

## 12.3 Tile Resolution Rules

Responsibilities:

```txt
Resolve current tile
Route to correct phase
Create payment request if needed
Create buy decision if needed
Draw card if needed
Send to jail if needed
```

```ts
export function resolveCurrentTile(state: GameState): GameReducerResult;
```

---

## 12.4 Payment Rules

Responsibilities:

```txt
Pay bank
Pay player
Prevent negative cash
Create debt if cash insufficient
```

```ts
export function resolvePayment(
  state: GameState,
  request: PaymentRequest
): GameReducerResult;
```

---

## 12.5 Debt Rules

Responsibilities:

```txt
Create DebtState
Allow sell/mortgage/loan actions
Check if debt can be paid
Pay debt
Declare bankruptcy
```

```ts
export function createDebtState(
  state: GameState,
  request: PaymentRequest,
  returnContext: ResolutionReturnContext
): GameReducerResult;
```

---

## 12.6 Bankruptcy Rules

Responsibilities:

```txt
Resolve bankruptcy owing bank
Resolve bankruptcy owing player
Remove player from turn order
Clear invalid ownership
Check win condition
```

```ts
export function resolveBankruptcy(
  state: GameState,
  debtorId: PlayerId
): GameReducerResult;
```

---

## 13. Validation and Invariants

## 13.1 Runtime Validation

Every reducer should validate:

```txt
Action is allowed in current phase.
Current player exists.
Current player is not bankrupt.
Target property exists.
Target property ownership is valid.
Payment amount is non-negative.
Cash does not become negative.
DebtState uniqueness is preserved.
```

## 13.2 Invariant Function

```ts
export function assertGameInvariants(state: GameState): void {
  assertNoNegativeCash(state);
  assertNoBankruptOwner(state);
  assertDebtStateMatchesPhase(state);
  assertCurrentPlayerValid(state);
  assertBoardPositionsValid(state);
}
```

## 13.3 Important Invariants

```txt
Every player cash >= 0.
Every player position is between 0 and board.tileCount - 1.
No bankrupt player owns property.
No bankrupt player is currentPlayerId.
If phase is DEBT_RESOLUTION, activeDebtState must not be null.
If activeDebtState is not null, phase must be DEBT_RESOLUTION.
If phase is GAME_OVER, winnerId must be set.
No property can be both unowned and mortgaged.
No land property with buildingLevel > 0 can be mortgaged.
```

---

## 14. UI Integration

## 14.1 Store Shape

The React store can wrap engine state:

```ts
type GameStore = {
  gameState: GameState | null;
  events: GameEvent[];

  dispatch: (action: GameAction) => void;

  newGame: (config: NewGameConfig) => void;
  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
  resetSave: () => Promise<void>;
};
```

## 14.2 UI Dispatch Example

```ts
function RollDiceButton() {
  const canRoll = useGameSelector(canRollDice);
  const dispatch = useGameDispatch();

  return (
    <button
      disabled={!canRoll}
      onClick={() => dispatch({ type: "ROLL_DICE" })}
    >
      Roll Dice
    </button>
  );
}
```

## 14.3 UI Should Not Implement Rules

Bad:

```ts
if (player.cash < rent) {
  openDebtModal();
}
```

Good:

```ts
dispatch({ type: "RESOLVE_TILE" });
```

Then engine decides:

```txt
cash enough → pay
cash insufficient → phase = DEBT_RESOLUTION
```

UI only observes:

```txt
state.phase === "DEBT_RESOLUTION"
```

and renders Debt Resolution Modal.

---

## 15. Animation and Events

## 15.1 Events Drive Animation

Reducer returns events:

```ts
const result = reduceGameState(state, action);

setState(result.state);
playAnimations(result.events);
```

Examples:

```txt
PLAYER_MOVED → token animation
DICE_ROLLED → dice animation
MONEY_CHANGED → money floating text
CARD_DRAWN → card reveal
PLAYER_BANKRUPT → bankruptcy modal/effect
```

## 15.2 Animation Must Not Own Game Logic

Animation can be delayed visually, but GameState should be consistent.

If token animation takes 700ms:

```txt
GameState can already have final position.
UI animation interpolates from previous to new position.
No rule should wait on CSS animation to become true.
```

## 15.3 Animation Queue System (Phaser Layer)

MVP phải có Animation Queue để quản lý sequential animations từ game events. Queue System gọi trực tiếp các method của Phaser instance để play animation tuần tự — không dispatch event để React component render animation.

**Why Animation Queue:**
- Nếu engine dispatch nhiều events cùng lúc, animations không chạy đồng thời lộn xộn
- Queue các events và chơi animations từ từ, từ event này sang event khác
- Tạo cảm giác storytelling từng bước thay vì cập nhật state đột ngột

**Example Flow:**
```txt
DICE_ROLLED   → diceScene.roll()        → Phaser Tween/SpriteSheet → await
PLAYER_MOVED  → tokenSprite.moveTo(9)   → Phaser Timeline hop      → await
RENT_CHARGED  → moneyFloat.play(−200)   → React DOM float text     → await
[check phase] → state.phase === DEBT_RESOLUTION → React opens modal
```

**Architecture:**
```txt
game-engine/
  reducer → returns { state, events[] }

ui/phaser/bridge/
  PhaserBridge
    .handleEvent(event) → calls Phaser methods directly

ui/
  AnimationQueue
    .enqueue(event)
    .playSequential(events[]) → Promise<void>
      - GameEvent.DICE_ROLLED   → PhaserBridge.diceScene.roll()
      - GameEvent.PLAYER_MOVED  → PhaserBridge.tokenSprite.moveTo(tileIndex)
      - GameEvent.MONEY_CHANGED → React DOM floating text (outside Phaser)
      - GameEvent.CARD_DRAWN    → PhaserBridge.cardScene.reveal()
```

**Không dùng CSS animation hay Framer Motion cho game world events.** Toàn bộ board/token/dice animation chạy qua Phaser API.

Điều này giúp tạo momentum và cảm giác "juicy" cho game với easing và timing chính xác.

---

## 16. Randomness

## 16.1 Random Service

Randomness should be isolated.

```ts
export interface RandomService {
  int(min: number, max: number): number;
  shuffle<T>(items: T[]): T[];
}
```

Production:

```ts
export class MathRandomService implements RandomService {
  int(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  shuffle<T>(items: T[]): T[] {
    return [...items].sort(() => Math.random() - 0.5);
  }
}
```

Testing:

```ts
export class FixedRandomService implements RandomService {
  constructor(private values: number[]) {}

  int(): number {
    const value = this.values.shift();
    if (value == null) throw new Error("No fixed random value left");
    return value;
  }

  shuffle<T>(items: T[]): T[] {
    return items;
  }
}
```

## 16.2 Testable Dice

For tests, allow direct payload:

```ts
dispatch({
  type: "ROLL_DICE",
  payload: { die1: 6, die2: 6 }
});
```

---

## 18. Future Online Multiplayer Compatibility

Online is out of MVP, but architecture should not block it.

## 18.1 Server-Authoritative Future

Future online version may use:

```txt
Client sends GameAction.
Server validates action.
Server runs same game engine.
Server broadcasts new GameState or GameEvent.
Clients render state.
```

## 18.2 Why Pure Engine Helps

Pure engine allows reuse:

```txt
Browser local MVP
Server-authoritative multiplayer
AI simulation
Replay system
Balance simulation
```

## 18.3 Avoid Blocking Future Online

Avoid:

```txt
Rules depending on DOM
Rules depending on localStorage
Rules depending on React component state
Rules using non-deterministic random everywhere
Rules hidden inside UI components
```

---

## 19. Testing Strategy

## 19.1 Unit Tests

Unit test game engine heavily.

Priority tests:

```txt
Dice roll
Doubles
Three doubles to jail
Movement
Pass Start
Buy property
Rent
Mortgaged property no rent
Card movement
Jail
Build eligibility
Sell building
Mortgage
Unmortgage
Debt Resolution
Bankruptcy
Winner detection
Save/load
```

## 19.2 Integration Tests

Test combined flows:

```txt
Roll → move → buy
Roll → move → pay rent
Roll → move → insufficient rent → Debt Resolution
Card → move to property → pay rent
Go To Jail → jail turn → pay fine
Bankruptcy owing bank
Bankruptcy owing player
```

## 19.3 E2E Tests

Playwright tests should cover:

```txt
Create new game
Roll dice
Buy property
End turn
Trigger rent
Trigger Debt Resolution
Save game
Load game
Finish game with winner
```

---

## 20. Error Handling

## 20.1 User-Facing Errors

UI should show friendly messages:

```txt
Không thể thực hiện hành động này ở phase hiện tại.
Bạn không đủ tiền.
Tài sản này đang thế chấp.
Bạn cần bán công trình trước khi thế chấp.
Không thể load save file.
Save file không tương thích.
```

## 20.2 Developer Errors

Engine can throw/assert in development for impossible states:

```txt
activeDebtState exists outside DEBT_RESOLUTION
bankrupt player is current player
property owner does not exist
tile index out of range
unknown card effect
```

In production:

```txt
Catch error.
Show fallback error modal.
Offer return to main menu or reset save.
```

---

## 21. Performance Considerations

MVP performance should be easy because:

```txt
Board has only 40 tiles.
Players max 6.
Game state is small.
No backend sync.
No real-time simulation.
```

Still, follow simple rules:

```txt
Use selectors to avoid repeated heavy calculations.
Keep GameState serializable.
Avoid storing large UI objects in GameState.
Avoid expensive recalculation in render loops.
Memoize derived board/player data where needed.
```

---

## 22. Security and Data Considerations

MVP is local and personal-use oriented.

Assumptions:

```txt
No account data.
No payment data.
No online multiplayer.
No server.
No anti-cheat needed.
```

Still avoid:

```txt
Storing sensitive personal data.
Executing imported save data as code.
Trusting malformed save files.
```

Save import/export is out of MVP.

---

## 23. Technical Acceptance Criteria

Technical design is considered satisfied when:

```txt
1. Game engine can run without React.
2. Game rules can be unit tested.
3. UI dispatches actions instead of mutating state directly.
4. Phase machine prevents invalid actions.
5. GameState is serializable to JSON.
6. localStorage save/load works.
7. Save schema has version.
8. Save migration path exists.
9. Debt Resolution state can be saved and loaded.
10. No bankrupt player remains in turn order.
11. No property owner points to bankrupt player.
12. Renderer can derive board positions from tile index.
13. Future 3D renderer can reuse GameState and BoardConfig.
```

---

## 24. Implementation Order

Recommended technical implementation order:

```txt
1. Define TypeScript types.
2. Create board config.
3. Create initial game state.
4. Implement reducer/action architecture.
5. Implement state machine phase validation.
6. Implement dice and movement.
7. Implement tile resolution.
8. Implement property buying.
9. Implement rent and payment.
10. Implement DebtState.
11. Implement sell building/mortgage/unmortgage.
12. Implement bankruptcy.
13. Implement save/load.
14. Connect React UI.
15. Add animation events.
16. Add tests.
```

---

## 25. Open Technical Questions

```txt
1. Use Zustand or Redux Toolkit for app store?
2. Use hand-written state machine or XState?
3. Should dice random be seedable in production?
4. Should GameEvent log be stored forever or capped?
5. Should save include full GameEvent history or only game log?
6. Should board config be embedded in save or referenced by boardId?
7. How strict should save validation be?
8. Should animation wait for engine events or only observe state?
9. Should Debt Resolution returnContext be explicit or inferred?
10. Should localStorage save be compressed if state grows?
11. Should future 3D use React Three Fiber or raw Three.js?
12. Should tests use fixed dice actions or mocked RandomService?
```

---

## 26. Summary

`06-technical-design.md` defines the technical foundation for Property Tycoon Web MVP.

Key decisions:

```txt
Vite + React + TypeScript
Pure TypeScript game engine
UI sends actions, engine owns rules
State machine controls turn flow
GameState is source of truth
GameState is serializable
localStorage for MVP save
IndexedDB later if data grows
Renderer-agnostic board state
Future 3D should reuse the same game engine
```

Most important technical rule:

```txt
Never hide gameplay rules inside UI components.
```

The engine must own:

```txt
Turn phase
Dice
Movement
Tile resolution
Payments
Debt Resolution
Bankruptcy
Win condition
Save-safe state
```

The UI must only:

```txt
Render state
Show available actions
Dispatch actions
Play animations from events
Display logs and modals
```

```
::contentReference[oaicite:3]{index=3}
```

[1]: https://vite.dev/guide/?utm_source=chatgpt.com "Getting Started"
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API?utm_source=chatgpt.com "Web Storage API - MDN Web Docs - Mozilla"
