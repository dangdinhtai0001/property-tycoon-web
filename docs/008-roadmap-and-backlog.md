# Property Tycoon Web — Roadmap & Backlog

**Document:** `08-roadmap-and-backlog.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này biến bộ spec của **Property Tycoon Web** thành kế hoạch triển khai.

File này dùng để trả lời:

```txt
Làm gì trước?
Làm gì sau?
MVP nên chia thành những phase nào?
P0 playable cần có gì?
Backlog nên gom theo epic nào?
Những task nào là must-have?
Những task nào là polish hoặc phase sau?
Khi nào có thể nói một phase đã xong?
````

Tài liệu này không thay thế các spec chi tiết.

Các tài liệu liên quan:

```txt
00-overview.md
01-product-scope.md
02-gameplay-rules.md
03-board-design.md
04-economy-and-debt.md
05-ui-ux-scope.md
06-technical-design.md
07-testing-and-acceptance.md
```

---

## 2. Roadmap Principles

## 2.1 Build Playable First

Nguyên tắc chính:

```txt
Ưu tiên có game chơi được từ đầu tới cuối trước.
Polish, animation, sound và visual đẹp làm sau.
```

Không nên bắt đầu bằng:

```txt
3D
Online multiplayer
AI bot
Trade tự do
Auction
Board editor
```

MVP hiện tại đã tham vọng ở phần finance, nên cần giữ các phần khác thật gọn.

---

## 2.2 Engine Before Visual Polish

Thứ tự ưu tiên:

```txt
Game engine đúng
→ State machine không kẹt
→ Core UI chơi được
→ Debt Resolution rõ
→ Save/load ổn
→ Polish/animation/audio
```

Lý do:

```txt
Nếu rule engine sai, UI đẹp cũng không cứu được game.
Nếu Debt Resolution kẹt, MVP không đạt.
Nếu save/load mất state, người chơi mất niềm tin.
```

---

## 2.3 Avoid Scope Creep

Feature mới chỉ vào MVP nếu thỏa ít nhất một điều kiện:

```txt
1. Cần để chơi được từ đầu tới cuối.
2. Cần để tránh kẹt lượt.
3. Cần cho bản sắc Ambitious MVP: mortgage, sell building, debt resolution.
4. Cần để save/load khôi phục chính xác.
5. Cần để người chơi hiểu game state.
```

Nếu không, đưa sang phase sau.

---

## 2.4 Definition of Done per Task

Mỗi task/story nên có:

```txt
Description
Acceptance criteria
Test requirement
Out-of-scope note nếu cần
```

Một task chỉ được xem là done khi:

```txt
Code chạy được
Không phá state machine
Có test nếu là rule logic
UI có disabled/error state nếu có action
Không tạo stuck turn
```

---

## 3. Phase Plan

Roadmap cấp cao:

```txt
P0 — Playable Prototype
Phase 1 — Core Playable
Phase 2 — Ambitious MVP Finance
Phase 3 — MVP Polish
Phase 4 — Advanced Rules
Phase 5 — Advanced 2D Polish & Juicy Animations
Phase 6 — Online
```

---

## 4. Phase Summary

| Phase                                       | Goal                                                        | Release Type            |
| ------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| P0 — Playable Prototype                     | Chứng minh core loop chạy được                              | Internal prototype      |
| Phase 1 — Core Playable                     | Chơi được ván cơ bản từ đầu tới cuối                        | Internal alpha          |
| Phase 2 — Ambitious MVP Finance             | Thêm finance nâng cao và Debt Resolution                    | MVP core complete       |
| Phase 3 — MVP Polish                        | UI, save/load, animation, audio, test hardening             | MVP release candidate   |
| Phase 4 — Advanced Rules                    | Trade, auction, quick mode, rule presets nâng cao           | Post-MVP                |
| Phase 5 — Advanced 2D Polish & Juicy Anim   | Particle effects, sprite animation, easing, trail, glow     | Post-MVP visual polish  |
| Phase 6 — Online                            | Lobby, room, sync, reconnect                                | Post-MVP multiplayer    |

---

## 5. P0 Playable Target

## 5.1 Goal

P0 là bản cực thô nhưng chơi được một vòng gameplay cơ bản.

Mục tiêu:

```txt
Chứng minh dice → move → buy/rent → end turn hoạt động.
```

P0 không cần đẹp.

P0 không cần đầy đủ finance.

P0 không cần đầy đủ card.

P0 không cần animation.

---

## 5.2 P0 Scope

P0 nên có:

```txt
2 players
Board 40 ô dùng data thật hoặc placeholder
Dice fixed/random đơn giản
Movement quanh board
Pass Start bonus
Buy property
Rent
Basic payment
Basic bankruptcy hoặc simple lose state
End turn
Winner nếu một player bankrupt
Minimal UI
Game log thô
```

P0 không cần:

```txt
Mortgage
Sell building
Debt Resolution đầy đủ
Emergency Loan
Card đầy đủ
Jail đầy đủ
Save/load
Animation
Sound
Polish
```

---

## 5.3 P0 Acceptance Criteria

P0 đạt khi:

```txt
1. Tạo được game 2 người.
2. Roll dice hoạt động.
3. Token di chuyển đúng quanh board.
4. Đi qua Start nhận tiền.
5. Dừng ở property chưa có chủ có thể mua.
6. Dừng ở property người khác trả rent.
7. Có thể end turn.
8. Có thể chơi nhiều lượt liên tiếp.
9. Game không kẹt ở flow cơ bản.
10. Có ít nhất một cách kết thúc game thô.
```

---

## 5.4 P0 Implementation Notes

P0 nên hard-code hoặc đơn giản hóa:

```txt
2 players only
One board config
Simple property prices
Simple rent values
No card effects hoặc card no-op
No jail hoặc jail no-op
No save/load
```

Mục tiêu không phải đúng hết, mà là chứng minh kiến trúc đúng.

---

## 6. Phase 1 — Core Playable

## 6.1 Goal

Phase 1 biến P0 thành một ván property-trading cơ bản chơi được từ đầu tới cuối.

Phase này chưa cần finance nâng cao, nhưng core gameplay phải rõ.

---

## 6.2 Phase 1 Scope

Must-have:

```txt
2–6 players
Setup Game
Board 40 ô đầy đủ tile type
Dice rules
Doubles
Three doubles to jail
Movement
Pass Start
Property buying
Rent
Tax/Fee
Cơ Hội / Khí Vận basic cards
Jail basic
Building basic
Basic bankruptcy
Winner
Game log
Basic UI panels
```

Should-have:

```txt
Property info modal
Buy property modal
Card modal
Jail modal
Basic action panel
Basic asset panel
```

Out of scope:

```txt
Mortgage
Sell building for debt
Emergency Loan
Full Debt Resolution
Save/load
Advanced animation
Sound
3D
Online
Trade
Auction
```

---

## 6.3 Phase 1 Acceptance Criteria

Phase 1 đạt khi:

```txt
1. Hỗ trợ 2–6 người chơi.
2. Board 40 ô đúng composition.
3. Dice/movement hoạt động.
4. Doubles và three doubles hoạt động.
5. Property buying hoạt động.
6. Rent hoạt động theo property type.
7. Tax/Fee hoạt động.
8. Card deck basic hoạt động.
9. Jail basic hoạt động.
10. Building basic hoạt động.
11. Basic bankruptcy hoạt động.
12. Winner được xác định.
13. Game không kẹt trong core flow.
```

---

## 7. Phase 2 — Ambitious MVP Finance

## 7.1 Goal

Phase 2 đưa bản sắc Ambitious MVP vào game: người chơi thiếu tiền có thể xoay sở bằng bán công trình, thế chấp, gỡ thế chấp và Debt Resolution.

Đây là phase quan trọng nhất của MVP.

---

## 7.2 Phase 2 Scope

Must-have:

```txt
Sell building
Mortgage property
Unmortgage + fixed interest
DebtState
Debt Resolution phase
Debt Resolution Modal
Pay Debt
Declare Bankruptcy
Bankruptcy owing bank
Bankruptcy owing player
Mortgaged property no rent
Group blocked if any property mortgaged
No negative cash invariant
```

Should-have:

```txt
Emergency Loan optional
Rule preset Classic Strict / Tycoon Friendly
Loan restrictions
Debt Resolution financial summary
Clear disabled action reasons
```

Out of scope:

```txt
Trade to resolve debt
Auction
Player-to-player loan
Compound interest
Bankruptcy negotiation
Multi-creditor asset splitting
```

---

## 7.3 Phase 2 Acceptance Criteria

Phase 2 đạt khi:

```txt
1. Payment thiếu tiền không làm cash âm.
2. Thiếu tiền tạo DebtState.
3. Phase chuyển sang DEBT_RESOLUTION.
4. Người chơi có thể bán building hợp lệ.
5. Sell value = 50% build cost.
6. Người chơi có thể mortgage property hợp lệ.
7. Mortgaged property không thu rent.
8. Người chơi có thể unmortgage.
9. Unmortgage cost = mortgageValue + 10%.
10. Pay Debt chỉ bật khi cash đủ.
11. Declare Bankruptcy chỉ bật khi không còn cách trả nợ.
12. Bankruptcy owing bank xử lý đúng.
13. Bankruptcy owing player xử lý đúng.
14. Game không kẹt trong Debt Resolution.
15. Save/load requirement cho DebtState đã được xác định nếu chưa implement.
```

---

## 8. Phase 3 — MVP Polish

## 8.1 Goal

Phase 3 biến Core + Finance thành bản MVP có thể release cho chơi cá nhân.

Tập trung vào:

```txt
UI rõ
Save/load
Animation nhẹ
Audio cơ bản
Testing hardening
Balance pass
```

---

## 8.2 Phase 3 Scope

Must-have:

```txt
Main Menu
Setup Game polish
Game Screen layout polish
Pause Menu
End Game Screen
Save/load local
Auto-save
Invalid save handling
Debt Resolution save/load
Action disabled reasons
Game log polish
Core animation
Core sound optional
Testing coverage
Manual playtest pass
```

Should-have:

```txt
Reduced motion setting
Mute SFX
End game stats
Basic settings screen
More card variety
Better placeholder art
```

Out of scope:

```txt
Online
3D
AI
Trade
Auction
Cloud save
Mobile-first UI
Board editor
```

---

## 8.3 Phase 3 Acceptance Criteria

Phase 3 đạt khi:

```txt
1. Có Main Menu.
2. Có Setup Game.
3. Có Game Screen.
4. Có Pause Menu.
5. Có End Game.
6. Save/load hoạt động.
7. Save/load khôi phục Debt Resolution.
8. UI không cần debug console để chơi.
9. Board dễ đọc trên desktop.
10. Current player dễ nhận biết.
11. Action buttons đúng theo phase.
12. Game log giúp hiểu sự kiện.
13. Animation không làm chậm game quá mức.
14. Critical test suite pass.
15. Manual playtest không phát hiện stuck turn.
```

---

## 9. Phase 4 — Advanced Rules

## 9.1 Goal

Phase 4 thêm các rule sâu hơn sau MVP.

Chỉ bắt đầu Phase 4 khi MVP local đã ổn định.

---

## 9.2 Candidate Features

```txt
Player-to-player trade
Auction
Quick Game mode
Advanced rule presets
Multiple save slots
More card effects
Improved bankruptcy rules
Mortgaged property transfer fee
Custom game setup
Optional house rules
```

---

## 9.3 Trade Scope Later

Trade tự do có thể gồm:

```txt
Offer property
Offer money
Offer held card
Request property
Request money
Accept/reject proposal
Trade confirmation
Trade validation
Trade log
```

Trade không nên làm trước khi:

```txt
Debt Resolution ổn định
Property ownership rules ổn định
UI asset management rõ
Save/load ổn định
```

---

## 9.4 Auction Scope Later

Auction có thể trigger khi:

```txt
Player declines to buy unowned property
```

Auction cần:

```txt
Bid UI
Turn within auction
Pass bid
Highest bidder
Payment validation
Debt behavior decision
```

Không đưa vào MVP vì dễ tăng scope và kẹt UI.

---

## 10. Phase 5 — Advanced 2D Polish & Juicy Animations

## 10.1 Goal

Phase 5 nâng cấp visual experience và animation quality để tạo cảm giác "juicy" và thỏa mãn cho game 2D thuần.

---

## 10.2 Candidate Features

```txt
Particle effects:
- Dice landing dust/puff
- Token movement trail
- Property purchase sparkle
- Building completed glow
- Mortgage shimmer

Sprite-based animations:
- Dice sprite-sheet animation
- Token hop/bounce with easing
- Card flip/reveal animation

Glow & shadow effects:
- Tile highlight glow
- Mortgaged property dimmer visual
- Building construction glow
- Token drop shadow during movement

Advanced easing:
- Token movement with ease-out/ease-in
- Bounce curves for hop effect
- Trail fade-out animation

Juice & polish:
- Visual feedback cho mỗi action
- Smooth transitions giữa states
- Cumulative animation queue
- Reduced motion option
```

---

## 10.3 2D Enhancement Constraints

Phase 5 phải giữ:

```txt
Same GameState
Same GameAction
Same BoardConfig
Same rule engine
Same save/load data
Animation layer tách khỏi game logic
```

Animation không được chứa rule hay thay đổi game state.

---

## 10.4 Phase 5 Acceptance Criteria

```txt
1. Dice animation tốn 1-1.5s, có sprite sheet hoặc 2D physics.
2. Token movement có hop/bounce effect.
3. Token trail effect khi di chuyển nhanh.
4. Token xoay nhẹ khi đến góc board.
5. Particle effects phát sáng khi có major action.
6. Glow effects cho tiles, buildings, mortgaged properties.
7. All animations skippable hoặc không block gameplay.
8. Reduced motion mode hoạt động.
9. Animation Queue system quản lý sequential events.
10. Game vẫn chơi được, vẫn save/load được (animation không ảnh hưởng state).
```

---

## 11. Phase 6 — Online

## 11.1 Goal

Phase 6 thêm online multiplayer.

Chỉ bắt đầu sau khi local engine ổn định.

---

## 11.2 Candidate Features

```txt
Online lobby
Room code
Invite link
Turn sync
Server-authoritative actions
Reconnect
Player presence
Spectator optional
Chat optional
Cloud save optional
```

---

## 11.3 Online Architecture Direction

Future online nên dùng:

```txt
Client gửi GameAction
Server validate action
Server chạy game engine
Server broadcast GameState/GameEvent
Clients render state
```

Không nên để mỗi client tự tính game state riêng rồi sync thủ công.

---

## 11.4 Online Acceptance Criteria

```txt
1. Hai browser khác nhau vào cùng room.
2. Chỉ current player gửi được gameplay action.
3. Server reject action sai phase.
4. State sync đúng giữa clients.
5. Reconnect khôi phục state.
6. Debt Resolution không kẹt khi online.
7. Save/restore room state có hướng xử lý.
```

---

## 12. Epic List

Backlog gom theo 13 epic:

```txt
Epic 1: Game engine foundation
Epic 2: Board data & rendering
Epic 3: Player setup & turn system
Epic 4: Dice & movement
Epic 5: Property ownership & rent
Epic 6: Cards
Epic 7: Jail
Epic 8: Building system
Epic 9: Advanced finance
Epic 10: Debt resolution & bankruptcy
Epic 11: Save/load
Epic 12: UI polish & animation
Epic 13: Testing & balancing
```

---

# 13. Backlog by Epic

---

## Epic 1: Game Engine Foundation

## Goal

Tạo nền tảng game engine thuần TypeScript, có thể test được độc lập với UI.

## Stories / Tasks

### E1-S1 — Define Core Types

Description:

```txt
Định nghĩa GameState, Player, Property, BoardTile, Card, Loan, DebtState, GameAction, GameEvent.
```

Acceptance criteria:

```txt
1. Có type GameState.
2. Có type Player.
3. Có type Property.
4. Có type DebtState.
5. Có type Loan.
6. TypeScript compile không lỗi.
```

---

### E1-S2 — Create Initial Game State

Description:

```txt
Tạo function createInitialGame(config) để sinh game state từ setup.
```

Acceptance criteria:

```txt
1. Tạo đúng số player.
2. Player có starting cash.
3. Player bắt đầu ở index 0.
4. Phase sau setup là WAITING_TO_ROLL.
5. Properties ban đầu unowned.
```

---

### E1-S3 — Implement Reducer / Action Dispatch

Description:

```txt
Tạo reduceGameState(state, action) để xử lý mọi game action.
```

Acceptance criteria:

```txt
1. Reducer nhận GameState và GameAction.
2. Reducer trả về GameState mới.
3. Reducer có thể trả GameEvent.
4. Reducer không phụ thuộc React.
```

---

### E1-S4 — Implement Phase Validation

Description:

```txt
Chặn action sai phase.
```

Acceptance criteria:

```txt
1. ROLL_DICE chỉ hợp lệ ở WAITING_TO_ROLL.
2. BUY_PROPERTY chỉ hợp lệ ở BUY_DECISION.
3. PAY_DEBT chỉ hợp lệ ở DEBT_RESOLUTION.
4. END_TURN bị chặn nếu còn activeDebtState.
```

---

### E1-S5 — Implement Invariant Checks

Description:

```txt
Tạo assertGameInvariants để phát hiện state sai.
```

Acceptance criteria:

```txt
1. Không cash âm.
2. Không bankrupt player trong turn order.
3. Không property owner là bankrupt player.
4. activeDebtState khớp phase DEBT_RESOLUTION.
```

---

## Epic 2: Board Data & Rendering

## Goal

Tạo board 40 ô data-driven và render được trên Game Screen.

## Stories / Tasks

### E2-S1 — Create BoardConfig 40 Tiles

Acceptance criteria:

```txt
1. Có đúng 40 tile.
2. Có index 0–39.
3. Có đúng tile composition theo 03-board-design.md.
4. Có jailIndex, startIndex.
```

---

### E2-S2 — Create Property Group Data

Acceptance criteria:

```txt
1. Có 22 land properties.
2. Chia thành 8 group theo 2/3/3/3/3/3/3/2.
3. Có 4 station.
4. Có 2 utility.
```

---

### E2-S3 — Render 2D Board

Acceptance criteria:

```txt
1. Board hiển thị 40 ô.
2. 4 góc đúng vị trí.
3. Tile type dễ phân biệt.
4. Board đọc được trên desktop.
```

---

### E2-S4 — Render Tokens on Board

Acceptance criteria:

```txt
1. Token hiển thị đúng position.
2. Nhiều token trên cùng ô vẫn nhìn được.
3. Current player được highlight.
```

---

### E2-S5 — Render Ownership / Building / Mortgage State

Acceptance criteria:

```txt
1. Owned property có owner marker.
2. Building level hiển thị.
3. Mortgaged property có marker rõ.
```

---

## Epic 3: Player Setup & Turn System

## Goal

Cho phép tạo game 2–6 người chơi và xử lý turn order đúng.

## Stories / Tasks

### E3-S1 — Main Menu

Acceptance criteria:

```txt
1. Có New Game.
2. Có Load Game disabled nếu chưa có save.
3. Có version label.
```

---

### E3-S2 — Setup Game Screen

Acceptance criteria:

```txt
1. Chọn được 2–6 player.
2. Nhập tên player.
3. Chọn màu/token.
4. Start Game chỉ bật khi setup hợp lệ.
```

---

### E3-S3 — Turn Order

Acceptance criteria:

```txt
1. Current player được xác định.
2. End Turn chuyển sang player tiếp theo.
3. Bankrupt player bị skip.
4. Game over nếu chỉ còn 1 active player.
```

---

### E3-S4 — Current Player UI

Acceptance criteria:

```txt
1. Current player nổi bật.
2. Player panel hiển thị cash/status.
3. Bankrupt player bị mờ/disabled.
```

---

## Epic 4: Dice & Movement

## Goal

Tung xúc xắc, di chuyển token, xử lý pass Start và doubles.

## Stories / Tasks

### E4-S1 — Roll Dice Engine

Acceptance criteria:

```txt
1. Roll 2 dice.
2. Tính total.
3. Detect doubles.
4. Test bằng fixed dice.
```

---

### E4-S2 — Movement Engine

Acceptance criteria:

```txt
1. Token move theo dice total.
2. Wrap quanh board đúng.
3. Pass Start bonus hoạt động.
```

---

### E4-S3 — Doubles Rule

Acceptance criteria:

```txt
1. Tung đôi cho extra turn.
2. Tung không đôi reset doubles chain.
3. Tung đôi 3 lần đưa vào tù.
```

---

### E4-S4 — Dice UI

Acceptance criteria:

```txt
1. Roll Dice button đúng phase.
2. Dice result hiển thị rõ.
3. Doubles indicator hiển thị.
```

---

### E4-S5 — Token Movement Animation Basic

Acceptance criteria:

```txt
1. Token move từng ô.
2. Animation không block logic quá lâu.
3. Có reduced/no-animation fallback nếu cần.
```

---

## Epic 5: Property Ownership & Rent

## Goal

Mua tài sản, tính rent và xử lý payment.

## Stories / Tasks

### E5-S1 — Buy Property Engine

Acceptance criteria:

```txt
1. Dừng ở unowned property → BUY_DECISION.
2. Buy trừ cash.
3. ownerId cập nhật.
4. Skip giữ property unowned.
5. Không auction.
```

---

### E5-S2 — Buy Property Modal

Acceptance criteria:

```txt
1. Hiển thị name/price/rent preview.
2. Buy enabled nếu đủ cash.
3. Skip hoạt động.
4. Không đủ cash thì Buy disabled.
```

---

### E5-S3 — Rent Calculation

Acceptance criteria:

```txt
1. Land rent theo building level.
2. Station rent theo station count.
3. Utility rent theo dice/multiplier.
4. Mortgaged property rent = 0.
```

---

### E5-S4 — Payment Engine

Acceptance criteria:

```txt
1. Đủ cash → payment ngay.
2. Thiếu cash → tạo DebtState.
3. Không cash âm.
```

---

### E5-S5 — Property Info Modal

Acceptance criteria:

```txt
1. Hiển thị owner.
2. Hiển thị price.
3. Hiển thị rent.
4. Hiển thị mortgage/building state.
```

---

## Epic 6: Cards

## Goal

Cơ Hội và Khí Vận hoạt động với deck, draw và effect cơ bản.

## Stories / Tasks

### E6-S1 — Card Data

Acceptance criteria:

```txt
1. Có deck Cơ Hội.
2. Có deck Khí Vận.
3. Mỗi card có id/title/description/effect.
```

---

### E6-S2 — Deck Shuffle and Draw

Acceptance criteria:

```txt
1. Deck shuffle khi start.
2. Draw lấy card trên cùng.
3. Card thường quay lại deck theo rule.
4. Save/load giữ deck order.
```

---

### E6-S3 — Basic Card Effects

Acceptance criteria:

```txt
1. Receive money.
2. Pay money.
3. Move to tile.
4. Move steps.
5. Go to jail.
6. Get out of jail card.
```

---

### E6-S4 — Card Modal

Acceptance criteria:

```txt
1. Hiển thị deck type.
2. Hiển thị title/description.
3. Confirm apply effect.
4. Payment thiếu tiền vào Debt Resolution.
```

---

## Epic 7: Jail

## Goal

Vào tù, thăm tù, ra tù bằng fine/card/doubles.

## Stories / Tasks

### E7-S1 — Enter Jail Rules

Acceptance criteria:

```txt
1. Go To Jail tile đưa player vào tù.
2. Card vào tù hoạt động.
3. Three doubles vào tù.
4. Không nhận pass Start khi đi thẳng vào tù.
```

---

### E7-S2 — Visiting Jail

Acceptance criteria:

```txt
1. Dừng ở jail bằng movement thường không bị jailed.
2. UI hiển thị visiting nếu cần.
```

---

### E7-S3 — Jail Decision

Acceptance criteria:

```txt
1. Pay fine.
2. Use held card.
3. Roll doubles.
4. Max jail turns.
5. Không đủ fine → Debt Resolution.
```

---

### E7-S4 — Jail Modal

Acceptance criteria:

```txt
1. Hiển thị jailTurns.
2. Hiển thị fine.
3. Hiển thị actions hợp lệ.
4. Disable action có lý do.
```

---

## Epic 8: Building System

## Goal

Cho phép xây và bán công trình theo rule.

## Stories / Tasks

### E8-S1 — Build Eligibility

Acceptance criteria:

```txt
1. Phải sở hữu đủ group.
2. Group không có mortgage.
3. Đủ cash.
4. Chưa max level.
5. Even-building rule nếu bật.
```

---

### E8-S2 — Build Action

Acceptance criteria:

```txt
1. Build tăng buildingLevel.
2. Trừ cash theo buildCost.
3. Rent cập nhật theo level.
```

---

### E8-S3 — Sell Building Action

Acceptance criteria:

```txt
1. Sell giảm buildingLevel.
2. Nhận 50% buildCost.
3. Even-selling rule nếu bật.
4. Dùng được trong BUILD_DECISION và DEBT_RESOLUTION.
```

---

### E8-S4 — Building Modal

Acceptance criteria:

```txt
1. Hiển thị group levels.
2. Hiển thị build cost.
3. Hiển thị sell value.
4. Hiển thị disabled reasons.
```

---

## Epic 9: Advanced Finance

## Goal

Thêm mortgage, unmortgage, interest và emergency loan optional.

## Stories / Tasks

### E9-S1 — Mortgage Property

Acceptance criteria:

```txt
1. Property hợp lệ có thể mortgage.
2. Player nhận mortgageValue.
3. isMortgaged = true.
4. Property không thu rent.
```

---

### E9-S2 — Mortgage Eligibility

Acceptance criteria:

```txt
1. Không mortgage property không sở hữu.
2. Không mortgage property đã mortgaged.
3. Không mortgage property/group còn building.
4. Disabled reason rõ.
```

---

### E9-S3 — Unmortgage Property

Acceptance criteria:

```txt
1. Cost = mortgageValue + 10%.
2. Player đủ cash mới unmortgage.
3. isMortgaged = false.
4. Rent hoạt động trở lại.
```

---

### E9-S4 — Mortgage Modal

Acceptance criteria:

```txt
1. Hiển thị mortgage value.
2. Hiển thị hậu quả không thu rent.
3. Hiển thị unmortgage cost.
4. Có confirmation cho mortgage.
```

---

### E9-S5 — Emergency Loan Optional

Acceptance criteria:

```txt
1. Rule preset có thể bật/tắt loan.
2. Loan chỉ dùng trong Debt Resolution.
3. Mỗi player tối đa 1 open loan.
4. Loan có principal/interest/amountDue.
5. Có thể block build khi còn loan.
```

---

## Epic 10: Debt Resolution & Bankruptcy

## Goal

Xử lý thiếu tiền, trả nợ và phá sản không kẹt lượt.

## Stories / Tasks

### E10-S1 — Create DebtState

Acceptance criteria:

```txt
1. Payment thiếu cash tạo DebtState.
2. Phase = DEBT_RESOLUTION.
3. Cash không bị trừ âm.
4. DebtState lưu debtor/creditor/amount/reason/source.
```

---

### E10-S2 — Debt Resolution Modal

Acceptance criteria:

```txt
1. Hiển thị amount due.
2. Hiển thị current cash.
3. Hiển thị shortfall.
4. Liệt kê sellable buildings.
5. Liệt kê mortgageable properties.
6. Hiển thị loan option nếu có.
```

---

### E10-S3 — Pay Debt

Acceptance criteria:

```txt
1. Pay Debt enabled khi cash đủ.
2. Trả đúng creditor.
3. Clear DebtState.
4. Return đúng resolution context.
```

---

### E10-S4 — Declare Bankruptcy

Acceptance criteria:

```txt
1. Chỉ enabled khi không còn cách trả nợ.
2. Có confirmation.
3. Chuyển BANKRUPTCY_RESOLUTION.
```

---

### E10-S5 — Bankruptcy Owing Bank

Acceptance criteria:

```txt
1. Player bankrupt.
2. Property về unowned.
3. Building reset.
4. Mortgage reset.
5. Player remove khỏi turn order.
```

---

### E10-S6 — Bankruptcy Owing Player

Acceptance criteria:

```txt
1. Cash còn lại chuyển creditor.
2. Unmortgaged property chuyển creditor.
3. Mortgaged property về bank/unowned.
4. Không ownerId nào trỏ tới bankrupt player.
```

---

### E10-S7 — No-Stuck-Turn Hardening

Acceptance criteria:

```txt
1. Không END_TURN khi còn DebtState.
2. Không ROLL_DICE trong Debt Resolution.
3. Không đóng modal debt khi chưa xử lý.
4. Game luôn có Pay Debt hoặc Declare Bankruptcy hoặc raise-cash action hợp lệ.
```

---

## Epic 11: Save / Load

## Goal

Lưu và khôi phục ván local chính xác.

## Stories / Tasks

### E11-S1 — Save Schema

Acceptance criteria:

```txt
1. Save có schemaVersion.
2. Save có appVersion.
3. Save có savedAt.
4. Save chứa gameState.
```

---

### E11-S2 — localStorage Save Service

Acceptance criteria:

```txt
1. Save vào localStorage.
2. Load từ localStorage.
3. Clear save.
4. Check hasSave.
```

---

### E11-S3 — Auto-Save

Acceptance criteria:

```txt
1. Auto-save sau END_TURN.
2. Auto-save sau Debt Resolution action quan trọng.
3. Auto-save sau bankruptcy.
4. Auto-save sau GAME_OVER.
```

---

### E11-S4 — Load Game

Acceptance criteria:

```txt
1. Load khôi phục current player.
2. Load khôi phục phase.
3. Load khôi phục board/properties.
4. Load khôi phục deck order.
5. Load khôi phục DebtState nếu có.
```

---

### E11-S5 — Save Validation and Migration

Acceptance criteria:

```txt
1. Invalid save không crash app.
2. Unsupported schema có message rõ.
3. Có migrationService placeholder.
```

---

## Epic 12: UI Polish & Animation

## Goal

Làm MVP rõ, mượt và dễ chơi hơn.

## Stories / Tasks

### E12-S1 — Game Screen Layout Polish

Acceptance criteria:

```txt
1. Board/player/action/log layout rõ.
2. Desktop 1366x768 usable.
3. Current player nổi bật.
```

---

### E12-S2 — Game Log Polish

Acceptance criteria:

```txt
1. Log roll/move/buy/rent/card/debt/bankruptcy.
2. Log dễ đọc.
3. Có giới hạn visible log.
```

---

### E12-S3 — Animation Basic

Acceptance criteria:

```txt
1. Dice roll animation.
2. Token move animation.
3. Card reveal.
4. Money change feedback.
5. Animation không gây kẹt action.
```

---

### E12-S4 — Audio Basic

Acceptance criteria:

```txt
1. Button click.
2. Dice.
3. Buy/pay.
4. Card.
5. Bankruptcy/win.
6. Có mute.
```

---

### E12-S5 — End Game Screen Polish

Acceptance criteria:

```txt
1. Winner hiển thị rõ.
2. Basic stats.
3. New Game / Main Menu.
```

---

## Epic 13: Testing & Balancing

## Goal

Đảm bảo MVP đúng luật, không kẹt lượt và có balance đủ ổn để chơi.

## Stories / Tasks

### E13-S1 — Unit Test Core Rules

Acceptance criteria:

```txt
1. Dice tests.
2. Movement tests.
3. Buying tests.
4. Rent tests.
5. Card tests.
6. Jail tests.
```

---

### E13-S2 — Unit Test Economy

Acceptance criteria:

```txt
1. Sell building tests.
2. Mortgage tests.
3. Unmortgage tests.
4. Loan tests nếu bật.
```

---

### E13-S3 — Debt Resolution Test Suite

Acceptance criteria:

```txt
1. Debt creation tests.
2. Pay Debt tests.
3. Declare Bankruptcy tests.
4. Bankruptcy owing bank tests.
5. Bankruptcy owing player tests.
6. No-stuck-turn tests.
```

---

### E13-S4 — Save / Load Test Suite

Acceptance criteria:

```txt
1. Save normal game.
2. Load normal game.
3. Save/load with mortgage.
4. Save/load with jailed player.
5. Save/load during Debt Resolution.
6. Invalid save handling.
```

---

### E13-S5 — E2E Critical Flows

Acceptance criteria:

```txt
1. Create game.
2. Roll/move/buy.
3. Pay rent.
4. Enter Debt Resolution.
5. Mortgage then Pay Debt.
6. Save/load.
7. Bankruptcy.
8. Game over.
```

---

### E13-S6 — Manual Playtest Pass

Acceptance criteria:

```txt
1. Ít nhất một ván chơi từ đầu tới winner.
2. Không stuck turn.
3. Debt Resolution dễ hiểu.
4. Board đọc được.
5. Game length không quá khó chịu.
6. Ghi lại balance issues.
```

---

## 14. Suggested Milestone Breakdown

## Milestone P0.1 — Engine Skeleton

```txt
E1-S1 Core Types
E1-S2 Initial Game State
E1-S3 Reducer
E1-S4 Phase Validation
```

Done when:

```txt
Có thể tạo GameState và dispatch action dummy.
```

---

## Milestone P0.2 — Board + Turn

```txt
E2-S1 BoardConfig
E2-S3 Render Board
E3-S2 Setup Game
E3-S3 Turn Order
```

Done when:

```txt
Có thể tạo game 2 player và thấy board.
```

---

## Milestone P0.3 — Dice + Move

```txt
E4-S1 Roll Dice
E4-S2 Movement
E4-S4 Dice UI
E4-S5 Token Animation Basic optional
```

Done when:

```txt
Player roll dice và token di chuyển quanh board.
```

---

## Milestone P0.4 — Buy + Rent

```txt
E5-S1 Buy Property Engine
E5-S2 Buy Property Modal
E5-S3 Rent Calculation
E5-S4 Payment Engine
```

Done when:

```txt
Có thể mua property và trả rent.
```

---

## Milestone P1.0 — Core Playable

Includes:

```txt
Cards basic
Jail basic
Building basic
Basic bankruptcy
Winner
```

Done when:

```txt
Chơi được một ván core từ đầu tới cuối.
```

---

## Milestone P2.0 — Finance Complete

Includes:

```txt
Sell building
Mortgage
Unmortgage
Debt Resolution
Bankruptcy owing bank/player
Emergency Loan optional
```

Done when:

```txt
Người chơi thiếu tiền có thể xử lý nợ mà không kẹt lượt.
```

---

## Milestone P3.0 — MVP Release Candidate

Includes:

```txt
Save/load
UI polish
Animation basic
Game log polish
Critical tests
Manual playtest
```

Done when:

```txt
MVP có thể chơi cá nhân ổn định trên browser desktop.
```

---

## 15. Priority Labels

Dùng labels:

```txt
P0 = Required for prototype
P1 = Required for Core Playable
P2 = Required for Ambitious MVP Finance
P3 = Required for MVP Polish / Release Candidate
P4 = Post-MVP
```

MoSCoW labels:

```txt
Must-have
Should-have
Could-have
Won't-have for MVP
```

Risk labels:

```txt
High-risk
Medium-risk
Low-risk
```

Suggested high-risk items:

```txt
Debt Resolution
Bankruptcy owing player
Save/load during Debt Resolution
Card movement into rent/payment
State machine transitions
```

---

## 16. MVP Cut Plan

Nếu scope quá lớn, cắt theo thứ tự:

```txt
1. Sound effects
2. Extra animation
3. End game stats chi tiết
4. Multiple rule presets
5. Emergency Loan
6. Một số card effect phức tạp
7. Better art assets
8. Reduced motion setting nếu chưa kịp
```

Không nên cắt khỏi Ambitious MVP:

```txt
Board 40 ô
Dice/movement
Buy/rent
Building basic
Sell building
Mortgage
Unmortgage + interest
Debt Resolution
Bankruptcy
Save/load
No-stuck-turn tests
```

---

## 17. Open Questions

## 17.1 Scope Questions

```txt
1. Emergency Loan là must-have hay stretch?
2. Rule presets có cần ngay MVP không?
3. Save/load một slot hay nhiều slot?
4. Quick Game có vào MVP không? Recommendation: không.
5. Sound có là MVP requirement không hay optional?
```

---

## 17.2 Design Questions

```txt
1. Theme chính của board là gì?
2. Currency hiển thị là gì?
3. Tên chính thức của game có giữ Property Tycoon Web không?
4. Tên 8 property group là gì?
5. Cơ Hội / Khí Vận có giữ tên này không?
```

---

## 17.3 Technical Questions

```txt
1. Zustand hay Redux Toolkit?
2. Hand-written state machine hay XState?
3. Có cần seedable random trong production không?
4. Board config embed trong save hay reference bằng boardId?
5. Game log lưu full hay capped?
6. Debt returnContext nên explicit hay inferred?
```

---

## 17.4 Balance Questions

```txt
1. Starting cash là bao nhiêu?
2. Pass Start bonus là bao nhiêu?
3. Property price table cụ thể thế nào?
4. Rent table cụ thể thế nào?
5. Tax amount là bao nhiêu?
6. Jail fine là bao nhiêu?
7. Mortgage value luôn bằng 50% price hay data-driven?
8. Emergency Loan max là bao nhiêu?
```

---

## 18. Summary

`08-roadmap-and-backlog.md` biến spec của Property Tycoon Web thành kế hoạch triển khai theo phase và epic.

Roadmap chính:

```txt
P0 — Playable Prototype
Phase 1 — Core Playable
Phase 2 — Ambitious MVP Finance
Phase 3 — MVP Polish
Phase 4 — Advanced Rules
Phase 5 — Advanced 2D Polish & Juicy Animations
Phase 6 — Online
```

13 epic chính:

```txt
Epic 1: Game engine foundation
Epic 2: Board data & rendering
Epic 3: Player setup & turn system
Epic 4: Dice & movement
Epic 5: Property ownership & rent
Epic 6: Cards
Epic 7: Jail
Epic 8: Building system
Epic 9: Advanced finance
Epic 10: Debt resolution & bankruptcy
Epic 11: Save/load
Epic 12: UI polish & animation
Epic 13: Testing & balancing
```

Ưu tiên lớn nhất:

```txt
Playable first.
No stuck turn.
Debt Resolution works.
Save/load reliable.
Polish later.
```
