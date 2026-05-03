# Property Tycoon Web — UI/UX Scope

**Document:** `05-ui-ux-scope.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa phạm vi UI/UX cho **Property Tycoon Web MVP**.

File này tập trung vào:

```txt
Screen list
Game screen layout
Board UI
Player panel
Dice area
Action buttons
Property modal
Card modal
Jail modal
Debt Resolution modal
Mortgage modal
Building modal
Animation scope
Audio scope
````

Mục tiêu chính của UI/UX MVP:

```txt
1. Người chơi luôn biết đang tới lượt ai.
2. Người chơi luôn biết mình có thể làm gì tiếp theo.
3. Người chơi hiểu vì sao tiền bị trừ/cộng.
4. Người chơi hiểu tài sản nào đang owned, mortgaged hoặc có building.
5. Người chơi không cần debug console để chơi.
6. Người chơi không bị kẹt lượt do thiếu action rõ ràng.
7. Debt Resolution phải cực kỳ rõ vì đây là modal phức tạp nhất MVP.
```

File này không định nghĩa chi tiết implementation React, state machine hoặc data model. Các phần đó nằm ở:

```txt
02-gameplay-rules.md
04-economy-and-debt.md
06-technical-design.md
07-testing-and-acceptance.md
```

---

## 2. UX Principles

## 2.1 Clarity First

MVP ưu tiên rõ ràng hơn đẹp phức tạp.

UI cần trả lời liên tục:

```txt
Đang tới lượt ai?
Người chơi đang ở ô nào?
Phase hiện tại là gì?
Nút nào có thể bấm?
Vì sao nút này bị disabled?
Người chơi có bao nhiêu tiền?
Người chơi đang nợ ai?
Người chơi còn thiếu bao nhiêu?
Người chơi có thể bán/thế chấp/vay gì?
Khi nào lượt kết thúc?
```

## 2.2 State-Driven UI

UI phải render theo `GameState`.

Không nên để UI tự suy luận luật riêng.

Good:

```txt
state.phase === "DEBT_RESOLUTION"
→ Show Debt Resolution Modal
```

Bad:

```txt
UI tự kiểm tra cash < rent rồi tự mở modal mà không qua engine.
```

Rule chi tiết nằm trong:

```txt
06-technical-design.md
```

## 2.3 One Primary Action at a Time

Ở mỗi phase, UI nên có một primary action rõ nhất.

Ví dụ:

| Phase             | Primary Action                        |
| ----------------- | ------------------------------------- |
| `WAITING_TO_ROLL` | Roll Dice                             |
| `BUY_DECISION`    | Buy Property / Skip                   |
| `JAIL_DECISION`   | Pay Fine / Use Card / Roll for Double |
| `DEBT_RESOLUTION` | Pay Debt nếu đủ tiền                  |
| `BUILD_DECISION`  | End Turn hoặc Manage Assets           |
| `GAME_OVER`       | New Game / Main Menu                  |

## 2.4 Explain Disabled Actions

Nếu một action bị disabled, UI nên hiển thị lý do.

Ví dụ:

```txt
Không đủ tiền để mua.
Bạn cần sở hữu đủ bộ màu để xây.
Bạn phải bán hết công trình trước khi thế chấp.
Tài sản đang thế chấp nên không thu rent.
Bạn không thể kết thúc lượt khi còn nợ chưa trả.
```

## 2.5 Confirm Irreversible Actions

Các action có hậu quả lớn cần confirmation:

```txt
Sell Building
Mortgage Property
Take Emergency Loan
Declare Bankruptcy
Quit Game
Reset Save
Start New Game khi đang có save
```

Confirmation text phải nói rõ hậu quả, không dùng wording mơ hồ kiểu “OK”.

---

## 3. Screen List

MVP có các screen chính:

| Screen      | Purpose                        | MVP |
| ----------- | ------------------------------ | --: |
| Main Menu   | New Game / Load Game           | Yes |
| Setup Game  | Chọn người chơi và rule preset | Yes |
| Game Screen | Màn chơi chính                 | Yes |
| Pause Menu  | Save / Resume / Quit           | Yes |
| End Game    | Winner và thống kê cơ bản      | Yes |

Out of scope:

```txt
Login Screen
Online Lobby
Room Code Screen
Matchmaking Screen
Profile Screen
Leaderboard Screen
Shop/Cosmetics Screen
Replay Viewer
Board Editor
```

---

## 4. Main Menu

## 4.1 Purpose

Main Menu là entry point của game.

Cần cho phép:

```txt
New Game
Load Game
Settings nếu cần
Quit/Exit nếu chạy trong wrapper sau này
```

## 4.2 UI Elements

Main Menu nên có:

```txt
Game title
Primary button: New Game
Secondary button: Load Game
Disabled Load Game nếu không có save
Small version text
Optional settings button
```

## 4.3 Save Warning

Nếu người chơi bấm New Game khi đã có save:

```txt
Show confirmation:
"Bạn đã có một ván đang lưu. Bắt đầu ván mới sẽ ghi đè save hiện tại."
Actions:
- Start New Game
- Cancel
```

---

## 5. Setup Game Screen

## 5.1 Purpose

Setup Game dùng để tạo ván mới.

Cần cấu hình:

```txt
Số người chơi
Tên từng người chơi
Màu/token từng người chơi
Rule preset nếu có
Start Game
Back to Main Menu
```

## 5.2 Player Setup

MVP hỗ trợ 2–6 người chơi.

UI fields:

```txt
Player count selector
Player name input
Token color selector
Token/icon selector optional
Validation message nếu tên trống hoặc trùng
```

## 5.3 Rule Preset

Nếu rule preset được đưa vào MVP, hiển thị:

```txt
Classic Strict
Tycoon Friendly
```

Classic Strict:

```txt
Không có Emergency Loan
Có sell building
Có mortgage
Có unmortgage + fixed interest
Có Debt Resolution
```

Tycoon Friendly:

```txt
Có Emergency Loan
Loan có lãi cố định
Loan có giới hạn
```

Nếu rule preset chưa làm ở MVP đầu tiên:

```txt
Hard-code Classic Strict hoặc một preset mặc định.
Ẩn UI rule preset.
```

## 5.4 Start Game Validation

Start Game chỉ enable khi:

```txt
Player count hợp lệ
Tất cả player có tên hợp lệ
Không trùng màu/token nếu rule yêu cầu
Rule preset hợp lệ
```

---

## 6. Game Screen Layout

## 6.1 Purpose

Game Screen là màn hình chính của toàn bộ ván chơi.

Nó cần hiển thị:

```txt
Board
Current player
Player status
Dice
Action buttons
Property/card/payment modals
Asset management
Game log
```

## 6.2 Recommended Desktop Layout

Layout đề xuất:

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: Game title / turn / phase / pause     [React DOM]   │
├───────────────┬───────────────────────────────┬──────────────┤
│ Player Panel  │                               │ Action Panel │
│  [React DOM]  │   Board UI + Token + Dice     │  [React DOM] │
│ Asset Summary │     [Phaser Canvas]           │ Current Tile │
│  [React DOM]  │                               │  [React DOM] │
├───────────────┴───────────────────────────────┴──────────────┤
│ Game Log                                      [React DOM]    │
└──────────────────────────────────────────────────────────────┘
```

Phân định rõ khu vực render:

```txt
Phaser Canvas (WebGL/Canvas):
- Board UI: 40 tiles, ownership markers, building indicators
- Token Display: vị trí và animation token
- Dice Area: sprite animation xúc xắc
- Particle/Glow effects toàn bộ game world

React DOM:
- Player Panel: danh sách người chơi, tiền, trạng thái
- Action Buttons: Roll Dice, End Turn, Manage Assets
- Current Tile info panel
- Game Log
- Top Bar
- Tất cả Modal (Buy Property, Debt Resolution, Jail, Building, Mortgage...)
```

Alternative:

```txt
Left: Player list + asset summary [React DOM]
Center: Board [Phaser Canvas]
Right: Dice + actions + current tile info [React DOM]
Bottom: Game log [React DOM]
```

## 6.3 Responsive Requirement

MVP ưu tiên desktop.

Minimum target:

```txt
1366x768 usable
1440x900 comfortable
1920x1080 ideal
```

Out of scope:

```txt
Mobile-first layout
Portrait mobile layout
Touch-first UX
```

Nhưng UI không nên hard-code quá mức khiến future responsive bất khả thi.

---

## 7. Board UI

## 7.1 Purpose

Board UI hiển thị 40 ô, vị trí token, ownership, building và trạng thái tài sản. Toàn bộ Board UI được render bởi **Phaser** (WebGL/Canvas), không phải DOM. Phaser scene đọc `GameState` để cập nhật vị trí token, trạng thái tile, ownership markers và hiệu ứng.

Board phải giúp người chơi hiểu nhanh:

```txt
Ai đang đứng ở đâu?
Ô này là loại gì?
Ô này thuộc ai?
Ô này có building không?
Ô này có bị mortgage không?
Ô hiện tại cần resolve là ô nào?
```

## 7.2 Board Layout

MVP dùng board 40 ô.

Layout đề xuất:

```txt
Square board
10 ô mỗi cạnh
4 góc đặc biệt
Token đi quanh viền
Khu trung tâm có thể dùng cho dice/card/action summary nếu cần
```

Corner positions:

```txt
Index 0: Xuất Phát
Index 10: Trại Giam / Thăm tù
Index 20: Bãi Đỗ Xe / Nghỉ
Index 30: Đi Tù
```

Chi tiết board nằm ở:

```txt
03-board-design.md
```

## 7.3 Tile Visual Requirements

Mỗi tile cần hiển thị:

```txt
Tile name
Tile type icon hoặc visual marker
Group color nếu là đất thường
Price hoặc rent summary nếu đủ chỗ
Owner marker nếu đã có chủ
Mortgage marker nếu đang thế chấp
Building indicator nếu có building
Current player highlight nếu token đang đứng ở đó
```

## 7.4 Token Display

Token display cần xử lý:

```txt
Một player trên một ô
Nhiều player trên cùng một ô
Player đang ở tù
Player bankrupt
Current player highlight
```

Nếu nhiều player cùng ô:

```txt
Stack tokens nhỏ
Hoặc fan-out tokens
Hoặc badge số lượng + hover detail
```

## 7.5 Ownership Display

Owned property nên thể hiện bằng:

```txt
Player color strip
Owner badge
Border color
Small token icon
```

Nếu property unowned:

```txt
No owner marker
Price visible if possible
```

Nếu property mortgaged:

```txt
Overlay icon
Desaturated tile
Label: Mortgaged / Thế chấp
No rent indicator hoặc rent disabled
```

## 7.6 Building Display

Building level có thể hiển thị bằng:

```txt
Small pips
House icons
Level number
Tiny building stack
```

MVP khuyến nghị:

```txt
Level 1–4: small dots/icons
Level 5: special icon hoặc badge
```

## 7.7 Tile Interaction

Click/hover tile nên mở Property Info Modal hoặc Tile Info.

For property tile:

```txt
Show owner
Show price
Show rent table
Show building level
Show mortgage state
Show actions if current player can act
```

For card/tax/special tile:

```txt
Show tile description
Show effect summary
```

---

## 8. Player Panel

## 8.1 Purpose

Player Panel cho biết tình trạng của tất cả người chơi.

Cần hiển thị:

```txt
Tên người chơi
Token/color
Tiền mặt
Vị trí hiện tại
Trạng thái: active / jailed / bankrupt
Số tài sản sở hữu
Số công trình
Số tài sản đang thế chấp
Loan status nếu có
Current player indicator
```

## 8.2 Player Row

Mỗi player row nên có:

```txt
Token icon
Name
Cash
Status badge
Property count
Mortgage count
Loan badge optional
```

Ví dụ:

```txt
🔴 An — $1,240 — Active — 5 properties — 1 mortgaged
🔵 Bình — $320 — Jailed — 3 properties
⚫ Chi — Bankrupt
```

## 8.3 Status Badges

Status badge:

```txt
Active
In Jail
Bankrupt
Current Turn
In Debt Resolution
```

Visual priority:

```txt
Current player phải nổi bật nhất.
Bankrupt player nên mờ đi.
Jailed player có badge rõ.
```

## 8.4 Player Detail

Click player row có thể mở detail panel:

```txt
Cash
Owned properties
Buildings
Mortgaged properties
Held cards
Open loans
Stats đơn giản
```

MVP có thể dùng Asset Panel thay vì modal riêng.

---

## 9. Dice Area

## 9.1 Purpose

Dice Area hiển thị dice và hành động tung xúc xắc.

Cần trả lời:

```txt
Có thể roll chưa?
Kết quả roll vừa rồi là gì?
Có phải doubles không?
Đã tung doubles mấy lần liên tiếp?
Nếu đang ở tù, roll này có ý nghĩa gì?
```

## 9.2 UI Elements

Dice Area gồm:

```txt
2 dice visuals
Roll Dice button
Dice total
Doubles indicator
Doubles count warning
Jail roll note nếu player đang tù
```

## 9.3 States

### Waiting to Roll

```txt
Show Roll Dice button enabled.
Dice có thể idle animation nhẹ.
```

### Rolling

```txt
Disable Roll Dice button.
Play dice animation.
Show temporary rolling state.
```

### Rolled

```txt
Show die1 + die2 = total.
If doubles: show "Tung đôi — có thêm lượt nếu không vào tù."
If third doubles: show "Tung đôi lần 3 — vào tù."
```

### Jail Roll

```txt
Show context:
"Bạn đang ở tù. Tung đôi để ra tù."
```

## 9.4 Animation Timing

Dice animation nên ngắn:

```txt
Recommended: 500–900ms
Max: 1200ms
```

Animation không nên làm người chơi chờ quá lâu ở mỗi lượt.

---

## 10. Action Buttons

## 10.1 Purpose

Action Buttons là nơi người chơi thực hiện hành động chính theo phase.

UI không nên hiển thị quá nhiều action cùng lúc.

## 10.2 Action Area Rules

Action Area phải:

```txt
Hiển thị primary action rõ nhất.
Disable action không hợp lệ.
Giải thích lý do disabled nếu hover/click.
Không cho action trái phase.
Không cho End Turn khi còn pending debt/card/payment.
```

## 10.3 Actions by Phase

| Phase             | Primary Actions                            |
| ----------------- | ------------------------------------------ |
| `WAITING_TO_ROLL` | Roll Dice                                  |
| `BUY_DECISION`    | Buy / Skip                                 |
| `CARD_RESOLUTION` | Confirm / Continue                         |
| `JAIL_DECISION`   | Pay Fine / Use Card / Roll Doubles         |
| `BUILD_DECISION`  | Build / Manage Assets / End Turn           |
| `DEBT_RESOLUTION` | Pay Debt / Raise Cash / Declare Bankruptcy |
| `GAME_OVER`       | New Game / Main Menu                       |

## 10.4 Button Labels

Use descriptive labels.

Good:

```txt
Roll Dice
Buy for $120
Skip Purchase
Pay Rent $80
Sell Building for $50
Mortgage for $100
Pay Debt $420
Declare Bankruptcy
End Turn
```

Avoid:

```txt
OK
Done
Confirm
Continue
Yes
No
```

unless context is completely clear.

## 10.5 Destructive Buttons

Destructive actions:

```txt
Declare Bankruptcy
Reset Save
Quit Game
Start New Game over existing save
```

Should use:

```txt
Danger color
Confirmation dialog
Clear consequence copy
No accidental default confirm
```

---

## 11. Property Modal

## 11.1 Purpose

Property Modal hiển thị chi tiết một property hoặc tile.

Có 2 use case:

```txt
Player click tile để xem thông tin.
Game mở modal khi player dừng vào property chưa có chủ hoặc property của người khác.
```

## 11.2 Property Info Content

For land property:

```txt
Property name
Group name/color
Owner
Price
Mortgage value
Mortgage state
Building level
Build cost
Rent table
Current rent
Full group status
Available actions
```

For station:

```txt
Station name
Owner
Price
Mortgage value
Rent by station count
Current owner station count
Current rent
Mortgage state
Available actions
```

For utility:

```txt
Utility name
Owner
Price
Mortgage value
Rent formula
Owner utility count
Current dice total if relevant
Current rent
Mortgage state
Available actions
```

## 11.3 Buy Property Modal

Triggered when:

```txt
Current player lands on unowned property.
```

Content:

```txt
Property name
Type
Price
Rent preview
Group information
Player cash
Cash after purchase
Buy button
Skip button
```

Buy button enabled when:

```txt
Property unowned
Player has enough cash
Phase is BUY_DECISION
```

If not enough cash:

```txt
Show disabled Buy button:
"Không đủ tiền để mua."
```

Skipping purchase:

```txt
Property remains unowned.
No auction in MVP.
```

## 11.4 Owned Property Info

If property belongs to current player:

```txt
Show owned state.
Show building/mortgage actions if phase allows.
No rent payment.
```

If property belongs to another player:

```txt
Show owner.
Show rent amount.
Show whether rent will be charged.
If mortgaged, show "Tài sản đang thế chấp — không thu rent."
```

---

## 12. Payment / Rent Modal

## 12.1 Purpose

Payment Modal giải thích payment bắt buộc.

Use cases:

```txt
Pay rent
Pay tax
Pay card penalty
Pay jail fine
```

## 12.2 Content

Payment modal should show:

```txt
Reason
Debtor
Creditor
Amount
Player current cash
Cash after payment if enough
Property/card/tile source
```

Example:

```txt
Bạn dừng ở Khu Công Nghệ A của Bình.

Tiền thuê: $180
Tiền hiện có: $420
Sau khi trả: $240
```

## 12.3 If Cash Is Enough

Show:

```txt
Pay button
```

Or auto-pay with brief confirmation/log.

MVP recommendation:

```txt
Auto-pay rent/tax if cash is enough.
Show small payment summary/log.
Use modal only for important/high-value payment if needed.
```

## 12.4 If Cash Is Not Enough

Do not subtract money.

Instead:

```txt
Open Debt Resolution Modal.
```

---

## 13. Card Modal

## 13.1 Purpose

Card Modal hiển thị card vừa rút và effect của nó.

Decks:

```txt
Cơ Hội
Khí Vận
```

## 13.2 Card Modal Content

Card modal should show:

```txt
Deck type
Card title
Card illustration/icon optional
Card description
Effect summary
Confirm/Apply button
```

Example:

```txt
Cơ Hội

Cơ Hội Đầu Tư
Nhận $100 từ ngân hàng.

[Nhận tiền]
```

## 13.3 Card Effect Clarity

Card description must be explicit.

Good:

```txt
Đi tới Trạm gần nhất. Nếu đi qua Xuất Phát, nhận tiền.
Trả $50 cho ngân hàng.
Nhận $20 từ mỗi người chơi khác.
Đi thẳng vào tù. Không nhận tiền qua Xuất Phát.
```

Avoid:

```txt
Có biến động xảy ra.
Bạn gặp may.
Bạn bị phạt.
```

## 13.4 Card Resolution States

Card Modal states:

```txt
Reveal
Reading
Applying
Completed
```

MVP có thể combine Reading + Applying:

```txt
Show card → player clicks Continue → apply effect
```

## 13.5 Held Card

If card can be held:

```txt
Show "Thẻ này được giữ lại."
Add to player held cards after confirm.
```

For Get Out of Jail style card:

```txt
Show badge in Player Panel.
```

---

## 14. Jail Modal

## 14.1 Purpose

Jail Modal xuất hiện khi current player đang ở tù.

Nó cần cho player chọn cách xử lý lượt tù.

## 14.2 Jail Modal Content

Show:

```txt
Player name
Jail turns used
Max jail turns
Fine amount
Player cash
Has get-out card?
Available actions
Explanation
```

Example:

```txt
Bạn đang ở tù.

Lượt thử: 1 / 3
Bạn có thể:
- Trả $50 để ra tù
- Dùng thẻ ra tù
- Tung đôi để ra tù
```

## 14.3 Actions

Available actions:

```txt
Pay Fine
Use Get-Out Card
Roll for Doubles
```

Pay Fine enabled when:

```txt
Player has enough cash
```

If not enough cash:

```txt
Clicking Pay Fine or mandatory fine triggers Debt Resolution.
```

Use Card enabled when:

```txt
Player has held jail card
```

Roll for Doubles enabled when:

```txt
Player has jail turns remaining
```

## 14.4 Mandatory Release

If player reaches max jail turns:

```txt
Show message:
"Bạn đã hết lượt thử. Bạn phải trả tiền phạt để ra tù."
```

If player cannot pay:

```txt
Open Debt Resolution Modal.
```

---

## 15. Debt Resolution Modal

## 15.1 Purpose

Debt Resolution Modal là modal quan trọng và phức tạp nhất MVP.

Nó xuất hiện khi:

```txt
Player cần trả tiền nhưng cash hiện tại không đủ.
```

Modal này phải giúp người chơi hiểu:

```txt
Người chơi đang nợ bao nhiêu?
Nợ ai?
Vì sao nợ?
Tiền mặt hiện tại bao nhiêu?
Còn thiếu bao nhiêu?
Có thể bán gì?
Có thể thế chấp gì?
Có được vay không?
Khi nào nút Pay Debt bật?
Khi nào hiện Declare Bankruptcy?
```

## 15.2 Trigger

Debt Resolution Modal mở khi:

```txt
state.phase === "DEBT_RESOLUTION"
state.activeDebtState !== null
```

Không mở modal này bằng UI tự suy luận.

## 15.3 Required Summary Section

Top section phải hiển thị rõ:

```txt
Debtor
Creditor
Reason
Amount due
Current cash
Shortfall
```

Example:

```txt
An đang nợ Bình $420 vì tiền thuê Khu Công Nghệ A.

Tiền mặt hiện có: $120
Còn thiếu: $300
```

## 15.4 Financial Snapshot

Modal nên có financial snapshot:

```txt
Current cash
Amount due
Shortfall
Max from selling buildings
Max from mortgaging properties
Emergency loan available
Total possible cash after all actions
```

Example:

```txt
Bạn cần trả: $420
Bạn có: $120
Còn thiếu: $300

Có thể xoay sở:
- Bán công trình: tối đa +$150
- Thế chấp tài sản: tối đa +$260
- Vay khẩn cấp: tối đa +$300

Tổng khả dụng tối đa: $830
```

## 15.5 Sellable Buildings Section

Show list of sellable buildings.

Each row:

```txt
Property name
Group
Current building level
Sell value
New building level after selling
Rent impact optional
Sell button
Disabled reason if not sellable
```

Example:

```txt
Khu Công Nghệ B
Level 3 → Level 2
Nhận: $50
[Sell]
```

If none:

```txt
Không có công trình nào có thể bán.
```

## 15.6 Mortgageable Properties Section

Show list of mortgageable properties.

Each row:

```txt
Property name
Type
Current rent
Mortgage value
Warning: sẽ không thu rent khi thế chấp
Mortgage button
Disabled reason if not mortgageable
```

Example:

```txt
Trạm Bắc
Giá trị thế chấp: $100
Sau khi thế chấp: tài sản này không thu rent.
[Mortgage]
```

Disabled reasons:

```txt
Tài sản không thuộc về bạn.
Tài sản đã thế chấp.
Phải bán hết công trình trong nhóm này trước.
Tài sản đang bị khóa bởi effect khác.
```

## 15.7 Emergency Loan Section

Show only if rule preset supports it or as disabled explanation.

Fields:

```txt
Loan enabled?
Current open loan?
Maximum loan
Suggested loan amount
Interest
Total repayment
Restrictions after loan
Take Loan button
```

Example enabled:

```txt
Vay khẩn cấp khả dụng

Có thể vay: $300
Lãi cố định: $30
Cần trả lại: $330

Khi còn khoản vay, bạn không thể xây công trình mới.

[Take Loan]
```

Example disabled:

```txt
Vay khẩn cấp không khả dụng trong preset hiện tại.
```

Disabled reasons:

```txt
Rule preset không bật Emergency Loan.
Bạn đã có một khoản vay chưa trả.
Không còn thiếu tiền.
Khoản vay tối đa không đủ hoặc bằng 0.
```

## 15.8 Pay Debt Button

`Pay Debt` button enabled when:

```txt
player.cash >= debt.amountDue
state.phase === "DEBT_RESOLUTION"
activeDebtState exists
```

Button label:

```txt
Pay Debt $420
```

If disabled:

```txt
Còn thiếu $300 để trả nợ.
```

When clicked:

```txt
Dispatch PAY_DEBT.
Engine pays creditor.
DebtState cleared.
Game returns to previous resolution context.
```

## 15.9 Declare Bankruptcy Button

`Declare Bankruptcy` should be shown carefully.

MVP recommendation:

```txt
Show button but disabled until bankruptcy is actually unavoidable.
```

Enable when:

```txt
player.cash < debt.amountDue
AND no sellable buildings can raise enough
AND no mortgageable properties can raise enough
AND emergency loan unavailable or insufficient
```

Alternative:

```txt
Allow early bankruptcy only if game design wants surrender.
```

MVP default:

```txt
Do not allow early voluntary bankruptcy if player can still pay by selling/mortgaging.
```

Disabled copy:

```txt
Bạn vẫn còn cách xoay sở để trả nợ.
```

Enabled copy:

```txt
Bạn không còn đủ tài sản hoặc lựa chọn để trả nợ.
```

Confirmation copy:

```txt
Bạn sẽ phá sản và bị loại khỏi ván chơi. Hành động này không thể hoàn tác.
```

Actions:

```txt
Declare Bankruptcy
Cancel
```

## 15.10 Debt Resolution Modal Layout

Recommended layout:

```txt
┌──────────────────────────────────────────────┐
│ Debt Resolution                              │
│ An nợ Bình $420 vì tiền thuê                 │
├──────────────────────────────────────────────┤
│ Cash: $120   Due: $420   Shortfall: $300     │
├──────────────────────────────────────────────┤
│ Options Summary                              │
│ Sell buildings: +$150                        │
│ Mortgage properties: +$260                   │
│ Emergency loan: +$300                        │
├──────────────────────────────────────────────┤
│ Sell Buildings                               │
│ [rows...]                                    │
├──────────────────────────────────────────────┤
│ Mortgage Properties                          │
│ [rows...]                                    │
├──────────────────────────────────────────────┤
│ Emergency Loan                               │
│ [loan details...]                            │
├──────────────────────────────────────────────┤
│ [Pay Debt $420]        [Declare Bankruptcy]  │
└──────────────────────────────────────────────┘
```

## 15.11 Debt Resolution Must Not Allow

Inside Debt Resolution, UI must not allow:

```txt
Roll Dice
End Turn
Buy Property
Build New Building
Unmortgage Property
Draw New Card
Open unrelated modal that changes game state
Trade with player
```

Allowed:

```txt
Sell Building
Mortgage Property
Take Emergency Loan
Pay Debt
Declare Bankruptcy
View property details read-only
```

## 15.12 Save/Load During Debt Resolution

If game is saved during Debt Resolution:

```txt
Load should return to Debt Resolution Modal.
Debt amount must not double-charge.
Actions already taken must remain applied.
```

UI should show:

```txt
Bạn đang tiếp tục xử lý khoản nợ đang dở.
```

---

## 16. Mortgage Modal

## 16.1 Purpose

Mortgage Modal cho phép player thế chấp tài sản hoặc xem trạng thái thế chấp.

Use cases:

```txt
Player đang quản lý tài sản trong BUILD_DECISION.
Player đang cần raise cash trong DEBT_RESOLUTION.
Player click property đang owned.
```

## 16.2 Mortgage Content

Show:

```txt
Property name
Property type
Owner
Current rent
Mortgage value
Current mortgage state
Effect warning
Related group status
```

Warning:

```txt
Sau khi thế chấp, tài sản này sẽ không thu tiền thuê cho tới khi được gỡ thế chấp.
```

If land group has buildings:

```txt
Bạn phải bán toàn bộ công trình trong nhóm này trước khi thế chấp.
```

## 16.3 Mortgage Action

Button:

```txt
Mortgage for $100
```

Enabled when:

```txt
Property belongs to current player
Property not already mortgaged
Property has no building
Group has no buildings if land
Phase allows mortgage
```

## 16.4 Unmortgage Action

If property is mortgaged, show:

```txt
Mortgage value
Interest
Total unmortgage cost
Player cash
```

Button:

```txt
Unmortgage for $110
```

Enabled when:

```txt
Current player owns property
Property is mortgaged
Player has enough cash
Phase allows unmortgage
Not in Debt Resolution
```

## 16.5 Confirmation

Mortgage should require confirmation.

Example:

```txt
Thế chấp Trạm Bắc?

Bạn sẽ nhận $100.
Tài sản này sẽ không thu rent cho tới khi bạn gỡ thế chấp.

[Mortgage] [Cancel]
```

Unmortgage may not need extra confirmation if cost is clearly shown, but MVP can still confirm for safety.

---

## 17. Building Modal

## 17.1 Purpose

Building Modal cho phép player xây hoặc bán công trình.

Use cases:

```txt
Player owns full group.
Player wants to increase rent.
Player needs to sell building during Debt Resolution.
Player clicks owned land property.
```

## 17.2 Building Content

Show:

```txt
Property name
Group
Current building level
Max building level
Build cost
Sell value
Current rent
Rent after build
Rent after sell
Group building levels
Eligibility status
```

## 17.3 Build Action

Button:

```txt
Build for $100
```

Enabled when:

```txt
Player owns full group
No property in group is mortgaged
Player has enough cash
Building level < max
Even building rule allows it
Phase is BUILD_DECISION
No open loan if rule blocks building
```

Disabled reasons:

```txt
Bạn chưa sở hữu đủ bộ màu.
Một tài sản trong nhóm đang thế chấp.
Không đủ tiền.
Đã đạt cấp tối đa.
Bạn cần xây đều trong nhóm.
Bạn đang có khoản vay chưa trả.
```

## 17.4 Sell Building Action

Button:

```txt
Sell for $50
```

Enabled when:

```txt
Property belongs to player
Building level > 0
Even selling rule allows it
Phase is BUILD_DECISION or DEBT_RESOLUTION
```

In Debt Resolution, sell action should show immediate impact:

```txt
Còn thiếu trước khi bán: $300
Sau khi bán: còn thiếu $250
```

## 17.5 Group View

Building Modal should show group overview:

```txt
Property A — Level 2
Property B — Level 2
Property C — Level 1
```

This helps explain even-building/even-selling rules.

---

## 18. Asset Panel / Asset Management

## 18.1 Purpose

Asset Panel giúp current player quản lý tài sản.

Show:

```txt
Owned properties
Grouped by color/type
Building levels
Mortgage state
Rent summary
Build/sell/mortgage actions
Loan status
Held cards
```

## 18.2 Grouping

Recommended grouping:

```txt
Color groups first
Stations
Utilities
Mortgaged properties
Held cards
Loans
```

## 18.3 Current Player Focus

Asset Panel nên mặc định hiển thị tài sản của current player.

Có thể cho xem player khác read-only.

---

## 19. Game Log

## 19.1 Purpose

Game Log giúp người chơi hiểu lịch sử gần nhất.

Log nên ghi:

```txt
Roll dice
Move
Pass Start
Buy property
Pay rent
Draw card
Tax payment
Enter jail
Exit jail
Build
Sell building
Mortgage
Unmortgage
Take loan
Debt created
Debt paid
Bankruptcy
Winner
```

## 19.2 Log Style

Log nên ngắn và dễ đọc.

Examples:

```txt
An tung 3 + 4 = 7.
An đi qua Xuất Phát và nhận $200.
Bình mua Khu Chợ Đông với giá $120.
Chi trả $80 tiền thuê cho Bình.
Dung thế chấp Trạm Bắc và nhận $100.
An phá sản vì không thể trả nợ.
```

## 19.3 Log Length

MVP options:

```txt
Show latest 20–50 events in UI.
Store full log in save if size acceptable.
```

If log gets too long:

```txt
Store full event history later, but MVP can cap visible log.
```

---

## 20. Pause Menu

## 20.1 Purpose

Pause Menu cho phép người chơi tạm dừng hoặc thoát.

Actions:

```txt
Resume
Save Game
Quit to Main Menu
Reset Save
Settings optional
```

## 20.2 Quit Confirmation

If quitting during game:

```txt
Show confirmation:
"Bạn có muốn lưu trước khi thoát không?"
Actions:
- Save and Quit
- Quit Without Saving
- Cancel
```

## 20.3 Debt Resolution Warning

If pause during Debt Resolution:

```txt
Allow Save.
Do not allow actions that clear or ignore debt.
When load, return to Debt Resolution.
```

---

## 21. End Game Screen

## 21.1 Purpose

End Game hiển thị winner và thống kê cơ bản.

Content:

```txt
Winner name
Winner token/color
Final cash
Final properties
Players bankrupt order
Basic stats
New Game
Main Menu
```

## 21.2 Basic Stats

MVP stats:

```txt
Turns taken
Properties owned
Rent collected
Rent paid
Buildings built
Mortgages taken
Bankruptcy order
```

Out of scope:

```txt
Detailed graphs
Replay timeline
Shareable result image
Online leaderboard
```

---

## 22. Modal Accessibility and Keyboard Behavior

## 22.1 General Modal Requirements

All modals should:

```txt
Have clear title
Trap keyboard focus while open
Close with explicit close/cancel when safe
Return focus to triggering element after close
Use Escape only when dismissing is safe
Use descriptive action labels
Prevent background interaction if modal blocks game flow
```

## 22.2 Blocking Modals

Blocking modals:

```txt
Debt Resolution Modal
Bankruptcy Confirmation
Jail Modal when action required
Buy Decision Modal
Card Modal during card resolution
```

These should not be dismissible by clicking outside if dismissing would leave game without a valid next action.

## 22.3 Non-Blocking Modals

Non-blocking modals:

```txt
Property Info Modal
Player Detail Modal
Rules Help Modal
```

These can be closed more freely.

---

## 23. Animation Scope

## 23.1 MVP Animation — Core UI Features

MVP animations là một trong những điểm nhấn cốt lõi, không chỉ decoration:

```txt
Dice roll animation sinh động:
- Sprite-sheet animation hoặc 3D-like 2D physics
- Spin effect 360° hoặc flip multiple times
- Kết thúc tại số xúc xắc hiện tại
- Bounce/shake effect khi dừng lại

Token movement với hiệu ứng:
- Move tile by tile với easing (không chỉ linear)
- Hop/bounce effect khi di chuyển
- Xoay nhẹ token khi đến góc board
- Trail effect khi tung xúc xắc được số lớn (>8)
- Glow/shine effect khi token đặt vào tile

Current tile highlight:
- Glow effect quanh tile hiện tại

Card flip/reveal:
- 3D-like flip hoặc reveal animation

Money gain/loss floating text:
- Floating + fade out animation

Modal transition:
- Smooth fade in/scale in

Building added/removed effect:
- Sparkle/glow animation

Mortgage overlay change:
- Shimmer effect

Bankruptcy effect:
- Dramatic glow effect

Winner celebration:
- Confetti-like effect
- Token spin/bounce
```

## 23.2 Animation Principles

Animations should:

```txt
Clarify state change
Be short
Be skippable or not block too long
Not hide important information
Not own game logic
```

Animations should not:

```txt
Delay every small action too much
Make board hard to read
Require physics
Change rule state by themselves
```

## 23.2b Animation Implementation — Phaser

Tất cả animations trong game world (board, token, dice) sử dụng hệ thống của **Phaser**, không dùng CSS Transition hay Framer Motion:

```txt
Token hop/bounce:
- Dùng Phaser Tweens với easing curve (ease-out lên, ease-in xuống)
- Phaser Timeline để chuỗi nhiều hop liên tiếp

Token trail effect:
- Dùng Phaser Particles hoặc afterimage technique trong Phaser scene

Dice animation:
- Dùng Phaser SpriteSheet animation với anims.play()
- Bounce/shake khi dừng bằng Phaser Tween

Glow / particle effects:
- Dùng Phaser.GameObjects.Particles.ParticleEmitter
- Shader effect nếu cần glow phức tạp

Timing & easing:
- duration, ease, yoyo, repeat được kiểm soát hoàn toàn qua Phaser Tween config
- Không dùng CSS transition-duration hay Framer Motion variants cho game world
```

React DOM animations (modal transition, money float) vẫn có thể dùng CSS transition hoặc Framer Motion vì chúng nằm ngoài Phaser Canvas.

## 23.3 Recommended Timing

Suggested timing (prioritize "juicy" feel over speed):

| Animation           | Recommended Duration | Notes                                  |
| ------------------- | -------------------: | -------------------------------------- |
| Button feedback     |             80–150ms | Quick response                         |
| Modal transition    |            150–250ms | Smooth fade in                         |
| Card reveal         |            300–600ms | Let card flip be satisfying            |
| Dice roll           |          1000–1500ms | Thrill moment - let it linger          |
| Token move per tile |            150–250ms | Hop/bounce takes time to feel good     |
| Token trail effect  |            800–1200ms | Trail fades gradually                  |
| Money change        |            600–1000ms | Floating text drifts upward            |
| Bankruptcy effect   |          1000–1500ms | Dramatic event                         |
| Winner effect       |          2000–3000ms | Celebration should feel substantial    |

Note: Animations không nên làm người chơi chờ vô lý, nhưng cũng không nên quá nhanh đến mức mất đi cảm giác thỏa mãn (juicy feel).

## 23.4 Token Movement Animation

Token phải di chuyển từng ô một với hiệu ứng sinh động.

### Basic Movement

```txt
Position 4 → dice total 5
Animate tile-by-tile:
4 → 5 → 6 → 7 → 8 → 9
Then resolve tile 9.
```

### Token Effects During Movement

**Hop/Bounce:**
- Token nhảy lên một chút khi di chuyển sang ô tiếp theo
- Bounce curve phải có easing (ease-out khi lên, ease-in khi xuống)
- Độ cao bounce giảm dần nếu tung xúc xắc số nhỏ (<5)
- Độ cao bounce tăng nếu tung xúc xắc số lớn (>8)

**Trail Effect:**
- Khi dice tung được số lớn (8+), token để lại trail/shadow
- Trail fade out từ từ sau khi token dừng
- Có thể dùng blur hoặc duplicate token với opacity giảm

**Rotation:**
- Token xoay nhẹ (~10-15°) khi đến góc board
- Xoay mượt (easing) để tạo cảm giác tự nhiên
- Reset xoay khi dừng lại

**Glow Effect:**
- Khi token đặt vào tile, glow effect phát từ tile
- Glow intensity tùy vào tile type:
  - Property của người chơi: vàng
  - Mortgaged property: xám
  - Trạm/tiện ích: cam
  - Thuế/Cơ Hội/Khí Vận: đỏ

### Teleport/Forced Movement

Nếu movement bị force (card, jail):

```txt
Use different visual effect (không phải hop).
Có thể dùng fade out → fade in hoặc warp effect.
Do not imply pass-start bonus nếu không eligible.
```

## 23.5 Reduced Motion

MVP should include at least a simple reduced motion option if easy:

```txt
Disable long token animation
Shorten dice animation
Disable decorative effects
Keep essential highlights
```

---

## 24. Audio Scope

## 24.1 MVP Audio

MVP audio effects:

```txt
Button click
Roll dice
Token move
Buy property
Draw card
Pay money
Receive money
Build
Sell building
Mortgage
Unmortgage
Enter jail
Bankruptcy
Win
```

## 24.2 Audio Controls

Need basic controls:

```txt
Mute all
SFX volume
Music volume if music exists
```

MVP music optional.

## 24.3 Audio Principles

Audio should:

```txt
Confirm important actions
Be short
Not be too loud
Not overlap excessively
Respect mute setting
```

Audio should not:

```txt
Be required to understand game state
Play long voiceovers
Use copyrighted assets without permission
```

---

## 25. Help / Rules UI

## 25.1 Purpose

MVP nên có minimal help để người chơi hiểu các khái niệm khó.

Useful help topics:

```txt
How to win
How turns work
What rent means
What mortgage means
What Debt Resolution means
How jail works
Why an action is disabled
```

## 25.2 Placement

Help can appear as:

```txt
Small tooltip
Info icon
Rules modal
Contextual hint inside modal
```

Debt Resolution should include contextual explanation directly, not only hidden in help.

---

## 26. UI Copy Guidelines

## 26.1 Tone

Tone nên:

```txt
Rõ ràng
Ngắn
Không quá kỹ thuật
Không đổ lỗi người chơi
Không dùng debug terminology
```

## 26.2 Money Copy

Use consistent format:

```txt
$120
+$100
-$80
```

Or if game uses custom currency:

```txt
120 coins
+100 coins
-80 coins
```

Need decide currency display later.

## 26.3 Good Copy Examples

```txt
Bạn đang nợ Bình $420 vì tiền thuê.
Còn thiếu $300 để trả nợ.
Bạn có thể bán công trình hoặc thế chấp tài sản để xoay sở.
Tài sản đang thế chấp sẽ không thu rent.
Bạn phải bán hết công trình trong nhóm này trước khi thế chấp.
```

## 26.4 Avoid

```txt
Invalid action.
Error.
Cannot do this.
OK.
Confirm.
Transaction failed.
```

Unless accompanied by clear explanation.

---

## 27. UI Out of Scope for MVP

Not included in MVP:

```txt
Chat
Emoji/reaction
Online lobby UI
Mobile-first layout
Full accessibility audit
Screen reader optimized full pass
Theme editor
Custom board editor
Replay viewer
Advanced analytics UI
Cosmetic inventory
Avatar shop
Animated cutscenes
3D camera UI
```

---

## 28. UI Acceptance Criteria

UI/UX MVP được xem là đạt khi:

```txt
1. Có Main Menu.
2. Có Setup Game.
3. Có Game Screen.
4. Có Pause Menu.
5. Có End Game.
6. Board 40 ô render rõ trên desktop.
7. Current player luôn dễ nhận biết.
8. Dice area hiển thị roll/result rõ.
9. Action buttons đúng theo phase.
10. Disabled actions có lý do rõ.
11. Property modal hiển thị owner/price/rent/mortgage/building.
12. Card modal hiển thị card và effect rõ.
13. Jail modal cho chọn cách ra tù.
14. Debt Resolution Modal hiển thị debt/cash/shortfall rõ.
15. Debt Resolution Modal liệt kê sellable buildings.
16. Debt Resolution Modal liệt kê mortgageable properties.
17. Debt Resolution Modal hiển thị loan option nếu có.
18. Pay Debt chỉ bật khi cash đủ trả nợ.
19. Declare Bankruptcy chỉ bật khi không còn cách trả nợ theo rule MVP.
20. Mortgage modal giải thích hậu quả không thu rent.
21. Building modal giải thích build/sell và rule xây đều.
22. Game log ghi các sự kiện quan trọng.
23. Save/load không làm mất pending debt UI.
24. UI chơi được không cần debug console.
25. Không có flow UI làm kẹt lượt.
```

---

## 29. Open Questions

Các câu hỏi cần chốt sau:

```txt
1. Currency hiển thị là $, coin, hay tên tiền riêng?
2. Board dùng style modern city, fantasy, cyberpunk hay Việt Nam hóa?
3. Có cần dark mode ngay MVP không?
4. Có cần reduced motion setting ngay MVP không?
5. Có cần keyboard shortcuts không?
6. Có auto-pay rent/tax nếu đủ tiền không, hay luôn show modal?
7. Debt Resolution có nên là full-screen modal thay vì dialog nhỏ không?
8. Có cho xem asset của player khác không?
9. Game log lưu bao nhiêu dòng trong UI?
10. Có cần tutorial overlay cho lần chơi đầu không?
11. Có cần sound setting trong MVP đầu tiên không?
12. Có cần confirmation cho unmortgage không?
13. Có nên cho close Property Info bằng click outside không?
14. Có nên cho close Debt Resolution bằng Escape không? Recommendation: không, vì blocking.
```

---

## 30. Summary

`05-ui-ux-scope.md` định nghĩa UI/UX cho Property Tycoon Web MVP.

Các screen chính:

```txt
Main Menu
Setup Game
Game Screen
Pause Menu
End Game
```

Các UI quan trọng:

```txt
Board UI
Player Panel
Dice Area
Action Buttons
Property Modal
Card Modal
Jail Modal
Debt Resolution Modal
Mortgage Modal
Building Modal
Game Log
```

Modal quan trọng nhất là **Debt Resolution Modal**. Nó phải luôn trả lời rõ:

```txt
Người chơi đang nợ bao nhiêu?
Tiền mặt hiện tại bao nhiêu?
Còn thiếu bao nhiêu?
Có thể bán gì?
Có thể thế chấp gì?
Có được vay không?
Khi nào Pay Debt bật?
Khi nào Declare Bankruptcy bật?
```

UX nguyên tắc:

```txt
Rõ trước, đẹp sau.
State-driven UI.
Một primary action tại một thời điểm.
Không cho action trái phase.
Không để người chơi kẹt trong lượt.
```


[1]: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/?utm_source=chatgpt.com "Dialog (Modal) Pattern | APG | WAI"
