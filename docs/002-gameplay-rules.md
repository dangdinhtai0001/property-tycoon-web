# Property Tycoon Web — Gameplay Rules

**Document:** `02-gameplay-rules.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa **luật chơi lõi** cho Property Tycoon Web MVP.

File này tập trung vào:

```txt
Core gameplay loop
Turn flow
Dice rules
Movement rules
Property buying
Rent rules
Building rules
Cards: Cơ Hội & Khí Vận
Jail rules
Bankruptcy rules cơ bản
````

File này **không đi sâu** vào:

```txt
Mortgage formula
Sell building formula
Emergency Loan
Interest calculation
Debt Resolution UI
Bankruptcy asset settlement chi tiết
Save/load format
State machine implementation chi tiết
```

Các phần đó nằm ở:

```txt
04-economy-and-debt.md
05-ui-ux-scope.md
06-technical-design.md
07-testing-and-acceptance.md
```

Nguyên tắc của file này:

```txt
Luật chơi lõi phải đủ rõ để hiểu một lượt diễn ra thế nào.
Nếu thiếu tiền, gameplay rules chỉ nói: chuyển sang Debt Resolution.
Chi tiết xử lý nợ nằm ở 04-economy-and-debt.md.
```

---

## 2. Core Gameplay Loop

Gameplay loop chính của Property Tycoon Web:

```txt
Tung xúc xắc
→ Di chuyển token
→ Resolve ô đang đứng
→ Mua tài sản / trả thuê / rút thẻ / trả thuế / vào tù / nghỉ
→ Quản lý tài sản nếu được phép
→ Nếu thiếu tiền, chuyển sang Debt Resolution
→ Nếu không thể trả nợ, phá sản
→ Kết thúc lượt
→ Chuyển sang người chơi tiếp theo
→ Game kết thúc khi chỉ còn 1 người chưa phá sản
```

Mục tiêu của loop:

```txt
Dễ hiểu
Không kẹt lượt
Không cần người chơi tự tính ngoài UI
Mỗi phase có action hợp lệ rõ ràng
Mọi payment thiếu tiền đều đi qua Debt Resolution
```

---

## 3. High-Level Game Phases

Gameplay nên được triển khai bằng phase rõ ràng để tránh lỗi kẹt lượt.

Các phase chính:

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

Trong tài liệu gameplay này, các phase được mô tả ở mức rule. Chi tiết technical state machine nằm ở:

```txt
06-technical-design.md
```

---

## 4. Turn Flow

## 4.1 Normal Turn Flow

Một lượt bình thường diễn ra như sau:

```txt
1. Game xác định current player.
2. Nếu player bankrupt, bỏ qua player đó.
3. Nếu player đang ở tù, xử lý Jail Decision.
4. Nếu player không ở tù, chuyển WAITING_TO_ROLL.
5. Player tung xúc xắc.
6. Game tính dice total và doubles.
7. Token di chuyển theo dice total.
8. Nếu đi qua Xuất Phát, nhận pass-start bonus.
9. Sau khi dừng lại, resolve tile.
10. Nếu có payment mà player không đủ tiền, chuyển Debt Resolution.
11. Nếu tile resolution hoàn tất, cho phép action cuối lượt nếu có.
12. Player kết thúc lượt.
13. Game chuyển sang player tiếp theo.
```

---

## 4.2 Turn Flow Diagram

```txt
START TURN
↓
Is player bankrupt?
├─ Yes → skip to next player
└─ No
   ↓
Is player jailed?
├─ Yes → JAIL_DECISION
└─ No → WAITING_TO_ROLL
   ↓
ROLLING
↓
MOVING
↓
RESOLVING_TILE
↓
Need payment?
├─ No → optional BUILD_DECISION / END_TURN
└─ Yes
   ↓
Enough cash?
   ├─ Yes → pay immediately → continue
   └─ No → DEBT_RESOLUTION
              ↓
              Can pay after raising cash?
              ├─ Yes → pay debt → continue
              └─ No → BANKRUPTCY_RESOLUTION
```

---

## 4.3 End Turn Conditions

Một lượt chỉ được kết thúc khi:

```txt
Không còn tile effect pending
Không còn card effect pending
Không còn DebtState pending
Không còn BankruptcyResolution pending
Player không đang MOVING
Player không đang ROLLING
Game chưa GAME_OVER
```

Không được kết thúc lượt nếu:

```txt
Player đang thiếu tiền chưa xử lý
Player đang ở Buy Decision chưa chọn
Player đang Card Resolution chưa apply xong effect
Player đang Jail Decision chưa chọn cách xử lý
```

---

## 4.4 Extra Turn from Doubles

Nếu player tung đôi:

```txt
Player resolve lượt hiện tại như bình thường.
Nếu không bị vào tù và không phá sản, player được tung thêm lượt.
```

Tuy nhiên:

```txt
Nếu đây là lần tung đôi thứ 3 liên tiếp trong cùng lượt tổng, player vào tù ngay.
Không di chuyển theo kết quả tung thứ 3.
Không resolve tile theo kết quả tung thứ 3.
Không nhận pass-start bonus.
Extra turn chain kết thúc.
```

---

## 5. Dice Rules

## 5.1 Dice Count

MVP dùng:

```txt
2 xúc xắc tiêu chuẩn
Mỗi xúc xắc có giá trị 1–6
Dice total = die1 + die2
```

Out of scope:

```txt
Xúc xắc đặc biệt
Speed die
Dice power-up
Dice item
Dice physics thật
```

---

## 5.2 Roll Dice

Khi phase là `WAITING_TO_ROLL`, current player có thể bấm Roll Dice.

Sau khi roll:

```txt
die1 = random integer 1–6
die2 = random integer 1–6
total = die1 + die2
isDouble = die1 === die2
```

Game phải log kết quả:

```txt
An tung 3 + 5 = 8.
Bình tung đôi 4 + 4.
```

---

## 5.3 Doubles

Nếu tung đôi:

```txt
Player được thêm lượt sau khi resolve lượt hiện tại.
doublesRolledInTurn tăng thêm 1.
```

Nếu không tung đôi:

```txt
doublesRolledInTurn reset về 0 khi chuyển người chơi.
```

---

## 5.4 Three Consecutive Doubles

Nếu player tung đôi 3 lần liên tiếp trong cùng lượt tổng:

```txt
Player bị đưa thẳng vào tù.
Không di chuyển theo kết quả tung thứ 3.
Không resolve tile.
Không nhận pass-start bonus.
Turn kết thúc.
```

Rule này có priority cao hơn movement thường.

---

## 5.5 Dice While in Jail

Khi player đang ở tù, dice được dùng theo Jail Rules.

Tóm tắt:

```txt
Player có thể thử tung đôi để ra tù.
Nếu tung được đôi, player ra tù và di chuyển theo tổng dice.
Nếu không tung được đôi, tùy jail turn count mà tiếp tục ở tù hoặc bắt buộc trả tiền.
```

Chi tiết ở mục:

```txt
12. Jail Rules
```

---

## 6. Movement Rules

## 6.1 Movement Direction

Token di chuyển theo một chiều cố định quanh board.

MVP không có:

```txt
Chọn hướng đi
Nhánh rẽ
Đường tắt
Teleport ngoài card effect
Movement path nhiều lựa chọn
```

---

## 6.2 Board Index

Board MVP có 40 ô, index từ 0 đến 39.

```txt
index 0 = Xuất Phát
index 10 = Trại Giam / Thăm tù
index 20 = Bãi Đỗ Xe / Nghỉ
index 30 = Đi Tù
```

Chi tiết board nằm ở:

```txt
03-board-design.md
```

---

## 6.3 Standard Movement

Khi player roll dice total:

```txt
newPosition = (currentPosition + diceTotal) % boardTileCount
```

Nếu player đi qua index 0 trong khi di chuyển bình thường:

```txt
Player nhận pass-start bonus.
```

Nếu player dừng đúng index 0:

```txt
Player cũng nhận pass-start bonus, trừ khi rule riêng nói khác.
```

---

## 6.4 Passing Start

Player nhận tiền khi:

```txt
Di chuyển bình thường và đi qua Xuất Phát.
Di chuyển bình thường và dừng đúng Xuất Phát.
Card effect yêu cầu advance và rule card cho phép nhận bonus.
```

Player không nhận tiền khi:

```txt
Bị gửi thẳng vào tù.
Card effect nói rõ không nhận bonus.
Movement là forced relocation không đi theo path bình thường.
```

---

## 6.5 Forced Movement

Forced movement là di chuyển do:

```txt
Card effect
Go To Jail tile
Special rule
```

Forced movement cần định nghĩa rõ:

```txt
Có đi từng ô hay teleport?
Có nhận pass-start bonus không?
Có resolve tile đích không?
Có trigger Go To Jail nếu đi tới ô đó không?
```

Default MVP:

```txt
Nếu card nói "đi tới ô X":
- Di chuyển tới ô X.
- Nếu đi qua Xuất Phát theo chiều board, nhận bonus trừ khi card nói không.
- Resolve ô đích sau khi tới.

Nếu effect nói "đi thẳng vào tù":
- Teleport tới jail index.
- Không nhận pass-start bonus.
- Không resolve jail tile như visit.
- Player status = jailed.
- Turn kết thúc.
```

---

## 6.6 Landing on Tile

Sau khi movement hoàn tất:

```txt
Game chuyển sang RESOLVING_TILE.
Tile tại player.position được resolve theo tile type.
```

Tile type có thể là:

```txt
start
land
station
utility
chance
fortune
tax
jail
go_to_jail
rest
```

---

## 7. Tile Resolution Rules

## 7.1 Start Tile

Khi player dừng ở Xuất Phát:

```txt
Player nhận pass-start bonus nếu chưa nhận trong movement này.
Tile resolution kết thúc.
```

Nếu player đã nhận bonus vì đi qua index 0 và dừng lại ở index 0 do wrap-around:

```txt
Không double-pay trừ khi rule riêng cho phép.
```

MVP khuyến nghị:

```txt
Mỗi lần đi qua/dừng ở Start trong một movement chỉ nhận bonus một lần.
```

---

## 7.2 Land Tile

Nếu tile là đất thường:

```txt
Nếu chưa có chủ → BUY_DECISION.
Nếu thuộc current player → no payment, có thể xem property info.
Nếu thuộc player khác → tính rent.
Nếu đang thế chấp → không thu rent.
```

---

## 7.3 Station Tile

Nếu tile là trạm:

```txt
Nếu chưa có chủ → BUY_DECISION.
Nếu thuộc current player → no payment.
Nếu thuộc player khác → tính station rent.
Nếu đang thế chấp → không thu rent.
```

---

## 7.4 Utility Tile

Nếu tile là tiện ích:

```txt
Nếu chưa có chủ → BUY_DECISION.
Nếu thuộc current player → no payment.
Nếu thuộc player khác → tính utility rent dựa trên dice total hoặc rule riêng.
Nếu đang thế chấp → không thu rent.
```

---

## 7.5 Chance Tile — Cơ Hội

Khi player dừng ở ô Cơ Hội:

```txt
Rút lá trên cùng từ deck Cơ Hội.
Hiển thị card.
Apply effect.
Đưa card về cuối deck hoặc giữ lại nếu là card đặc biệt.
```

---

## 7.6 Fortune Tile — Khí Vận

Khi player dừng ở ô Khí Vận:

```txt
Rút lá trên cùng từ deck Khí Vận.
Hiển thị card.
Apply effect.
Đưa card về cuối deck hoặc giữ lại nếu là card đặc biệt.
```

---

## 7.7 Tax / Fee Tile

Khi player dừng ở ô Thuế / Phí:

```txt
Player phải trả amount cho bank.
Nếu cash đủ → trả ngay.
Nếu cash không đủ → chuyển DEBT_RESOLUTION.
```

Chi tiết payment/debt nằm ở:

```txt
04-economy-and-debt.md
```

---

## 7.8 Jail / Visiting Tile

Khi player dừng ở Trại Giam bằng movement thường:

```txt
Player chỉ đang thăm tù.
Không bị jailed.
Không trả tiền.
Không rút thẻ.
Tile resolution kết thúc.
```

Nếu player bị gửi vào tù bởi effect:

```txt
Player được đặt tại jail index.
Player status = jailed.
Không xử lý như visit.
```

---

## 7.9 Go To Jail Tile

Khi player dừng ở Đi Tù:

```txt
Player bị chuyển thẳng tới jail index.
Player status = jailed.
Không nhận pass-start bonus.
Turn kết thúc.
```

---

## 7.10 Rest Tile

Khi player dừng ở Bãi Đỗ Xe / Nghỉ:

```txt
Không có effect mặc định.
Không trả tiền.
Không nhận tiền.
Không rút thẻ.
Tile resolution kết thúc.
```

MVP không dùng jackpot/free parking reward.

---

## 8. Property Buying

## 8.1 Buy Decision Trigger

Khi player dừng ở property chưa có chủ:

```txt
Game chuyển sang BUY_DECISION.
UI hiển thị thông tin property.
Player có thể mua hoặc bỏ qua.
```

Áp dụng cho:

```txt
Đất thường
Trạm
Tiện ích
```

---

## 8.2 Buying Conditions

Player có thể mua nếu:

```txt
Property chưa có chủ.
Player không bankrupt.
Player có đủ cash.
Property không bị locked.
Game phase là BUY_DECISION.
```

Khi mua:

```txt
Player trả price cho bank.
property.ownerId = player.id.
Property được thêm vào danh sách tài sản của player.
Game log ghi lại giao dịch.
```

---

## 8.3 Not Enough Cash to Buy

Nếu player không đủ cash để mua property:

```txt
Buy button disabled.
Player có thể bỏ qua mua.
Không trigger Debt Resolution vì mua property là optional.
```

MVP không cho vay hoặc thế chấp chỉ để mua property trong flow mua, trừ khi rule preset sau này cho phép.

---

## 8.4 Declining Purchase

Nếu player từ chối mua:

```txt
Property vẫn unowned.
Không có auction trong MVP.
Tile resolution kết thúc.
```

MVP không có:

```txt
Auction
Counter-offer
Bank discount
Installment purchase
Shared ownership
```

---

## 8.5 Buying While Loan Is Open

Rule này thuộc economy preset.

Default gameplay recommendation:

```txt
Nếu có open Emergency Loan, có thể disable mua property mới trong preset strict.
Nếu preset friendly, có thể vẫn cho mua.
```

Chi tiết nằm ở:

```txt
04-economy-and-debt.md
```

---

## 9. Rent Rules

## 9.1 Rent Trigger

Rent trigger khi:

```txt
Current player dừng ở property thuộc người chơi khác.
Property không bị thế chấp.
Owner không bankrupt.
Tile effect không miễn rent.
```

Nếu rent trigger:

```txt
Game tính rent amount.
Player phải trả owner.
Nếu đủ cash → trả ngay.
Nếu thiếu cash → chuyển DEBT_RESOLUTION.
```

---

## 9.2 No Rent Cases

Không thu rent nếu:

```txt
Property chưa có chủ.
Property thuộc current player.
Property đang thế chấp.
Owner bankrupt.
Player chỉ đang thăm tù ở jail tile.
Tile không phải property.
Rule/card effect miễn rent nếu có.
```

---

## 9.3 Land Rent

Đất thường dùng rent table theo building level.

Ví dụ conceptual:

```txt
buildingLevel 0 → base rent
buildingLevel 1 → rent level 1
buildingLevel 2 → rent level 2
buildingLevel 3 → rent level 3
buildingLevel 4 → rent level 4
buildingLevel 5 → max-level rent
```

Rent thực tế nên nằm trong property data:

```txt
rentByLevel: [base, level1, level2, level3, level4, level5]
```

---

## 9.4 Full Group Bonus

Nếu owner sở hữu đủ group màu và không có property nào trong group bị thế chấp:

```txt
Đất trống có thể được tăng rent.
Owner được phép xây công trình trong group đó.
```

MVP recommendation:

```txt
Nếu bất kỳ property nào trong group bị thế chấp:
- Không tính full group bonus.
- Không cho xây mới trong group đó.
```

Chi tiết mortgage nằm ở:

```txt
04-economy-and-debt.md
```

---

## 9.5 Station Rent

Trạm không có building.

Station rent phụ thuộc số lượng trạm cùng owner sở hữu.

Ví dụ conceptual:

```txt
1 trạm → rent thấp
2 trạm → rent vừa
3 trạm → rent cao
4 trạm → rent rất cao
```

Rent table nên nằm trong data config:

```txt
stationRentByCount: [0, rent1, rent2, rent3, rent4]
```

Nếu trạm đang thế chấp:

```txt
Không thu rent cho trạm đó.
```

---

## 9.6 Utility Rent

Tiện ích không có building.

Utility rent phụ thuộc dice total và số tiện ích owner sở hữu.

Ví dụ conceptual:

```txt
Nếu owner có 1 utility:
rent = diceTotal * multiplier1

Nếu owner có 2 utilities:
rent = diceTotal * multiplier2
```

Dice total dùng để tính rent nên là dice total đã khiến player dừng vào utility.

Nếu player tới utility bằng card movement:

```txt
Card effect phải định nghĩa dùng dice total nào.
Nếu không có dice total hợp lệ, rule card có thể yêu cầu roll dice để tính rent.
```

MVP nên chốt rõ từng card effect để tránh ambiguity.

---

## 9.7 Rent Payment

Khi rent được tính:

```txt
Create PaymentRequest.
Debtor = current player.
Creditor = property owner.
Amount = calculated rent.
Reason = rent.
```

Nếu debtor đủ cash:

```txt
Trừ cash debtor.
Cộng cash creditor.
Log payment.
Tile resolution kết thúc.
```

Nếu debtor thiếu cash:

```txt
Chuyển DEBT_RESOLUTION.
```

Chi tiết nợ ở:

```txt
04-economy-and-debt.md
```

---

## 10. Building Rules

## 10.1 Building Purpose

Building làm tăng rent của đất thường và tạo áp lực tài chính cho đối thủ.

Building system là core MVP, nhưng các thao tác bán công trình để trả nợ nằm sâu hơn ở economy document.

---

## 10.2 Build Eligibility

Player có thể xây nếu:

```txt
Player sở hữu đủ tất cả property trong group màu.
Không property nào trong group bị thế chấp.
Player có đủ cash.
Property là đất thường.
Game đang ở phase cho phép build.
Player không bankrupt.
```

Nếu rule loan restriction bật:

```txt
Player không được build khi đang có open Emergency Loan.
```

Chi tiết loan restriction nằm ở:

```txt
04-economy-and-debt.md
```

---

## 10.3 Building Level

MVP dùng building level:

```txt
0 = đất trống
1 = công trình cấp 1
2 = công trình cấp 2
3 = công trình cấp 3
4 = công trình cấp 4
5 = công trình cấp cao nhất / khách sạn
```

Tên hiển thị có thể đổi theo theme.

Ví dụ:

```txt
Nhà cấp 1–4 + Khách sạn
Cửa hàng → Tòa nhà → Trung tâm → Cao ốc → Landmark
Lều → Nhà → Chợ → Thành trì → Cung điện
```

---

## 10.4 Build Cost

Build cost nên nằm trong property data hoặc group data.

MVP recommendation:

```txt
Các property trong cùng group dùng chung buildCost.
Group càng đắt, buildCost càng cao.
```

---

## 10.5 Even Building Rule

MVP khuyến nghị dùng rule xây đều:

```txt
Trong cùng một group, building level giữa các property không được chênh quá 1 cấp sau khi xây.
```

Ví dụ hợp lệ:

```txt
[0, 0, 0] → build một ô → [1, 0, 0]
[1, 1, 0] → build ô level 0 → [1, 1, 1]
[2, 1, 1] → build một ô level 1 → [2, 2, 1]
```

Ví dụ không hợp lệ:

```txt
[2, 0, 0]
[3, 1, 1]
[4, 2, 1]
```

Lý do:

```txt
Tránh dồn toàn bộ building vào một ô.
Dễ balance rent.
Tạo progression tự nhiên cho cả group.
```

---

## 10.6 Build Timing

MVP recommendation:

```txt
Player được build sau khi tile resolution hoàn tất và trước khi end turn.
```

Không cho build khi:

```txt
Đang rolling
Đang moving
Đang resolve card
Đang resolve payment
Đang Debt Resolution, trừ sell building
Đang Bankruptcy Resolution
Không phải lượt của player
```

---

## 10.7 Max Building Level

Mỗi property có max building level.

Default MVP:

```txt
maxBuildingLevel = 5
```

Nếu property đã đạt max:

```txt
Build button disabled.
```

---

## 10.8 Selling Building

Gameplay file chỉ định nghĩa ngắn:

```txt
Player có thể bán công trình trong asset management hoặc Debt Resolution.
Sell building làm giảm buildingLevel và tăng cash.
```

Chi tiết rule:

```txt
Sell value = 50% build cost
```

và edge cases nằm ở:

```txt
04-economy-and-debt.md
```

---

## 11. Cards: Cơ Hội & Khí Vận

## 11.1 Deck Types

MVP có 2 deck:

```txt
Cơ Hội
Khí Vận
```

Vai trò:

```txt
Cơ Hội: biến cố mạnh, tác động lớn hơn.
Khí Vận: biến cố nhẹ hơn, đời thường/cộng đồng hơn.
```

Tên deck có thể đổi theo theme trong UI, nhưng trong engine có thể dùng:

```txt
chance
fortune
```

---

## 11.2 Deck Size

MVP target:

```txt
12 lá mỗi deck
```

Stretch:

```txt
16 lá mỗi deck
```

P0 hoặc prototype có thể dùng ít hơn để test engine:

```txt
6–8 lá mỗi deck
```

---

## 11.3 Deck Setup

Khi bắt đầu game:

```txt
Tạo deck Cơ Hội.
Tạo deck Khí Vận.
Shuffle từng deck.
Lưu thứ tự deck trong game state.
```

Save/load phải lưu thứ tự deck để game khôi phục chính xác.

---

## 11.4 Drawing Card

Khi player dừng ở card tile:

```txt
Rút card trên cùng của deck tương ứng.
Hiển thị card modal.
Apply card effect.
Nếu card thường, đưa card xuống cuối deck hoặc discard/reshuffle theo rule deck.
Nếu card giữ được, đưa vào heldCards của player.
```

MVP recommendation:

```txt
Thẻ thường quay xuống cuối deck sau khi apply.
Thẻ ra tù được giữ bởi player.
Khi dùng thẻ ra tù, thẻ quay lại deck.
```

---

## 11.5 Card Effect Categories

Cơ Hội có thể có effect:

```txt
Nhận tiền từ bank
Trả tiền cho bank
Đi tới tile cụ thể
Lùi vài bước
Đi tới trạm gần nhất
Đi tới tiện ích gần nhất
Đi thẳng vào tù
Nhận thẻ ra tù
Trả tiền sửa công trình
Thu tiền từ người chơi khác
```

Khí Vận có thể có effect:

```txt
Nhận tiền nhỏ từ bank
Trả tiền nhỏ cho bank
Nhận tiền từ mỗi người chơi
Trả tiền cho mỗi người chơi
Hoàn thuế
Viện phí / học phí / phí dịch vụ
Đi thẳng vào tù
Nhận thẻ ra tù
Nhận thưởng bất ngờ
```

---

## 11.6 Card Movement Rules

Mỗi movement card phải định nghĩa rõ:

```txt
target tile
movement type: path movement hay teleport
có nhận pass-start bonus không
có resolve tile đích không
có bỏ qua rent/tax không
```

Default MVP:

```txt
Card "đi tới tile X":
- Di chuyển theo chiều board tới tile X.
- Nếu đi qua Start, nhận bonus.
- Resolve tile đích.

Card "đi thẳng vào tù":
- Teleport tới jail.
- Không nhận Start bonus.
- Không resolve jail như visit.
- Turn kết thúc.
```

---

## 11.7 Card Payment Rules

Nếu card yêu cầu trả tiền:

```txt
Nếu đủ cash → trả ngay.
Nếu không đủ cash → chuyển DEBT_RESOLUTION.
```

Nếu card yêu cầu nhận tiền:

```txt
Cộng cash ngay.
Log event.
```

Nếu card yêu cầu trả/nhận từ nhiều player:

```txt
Resolve theo thứ tự rõ ràng.
Nếu phát sinh thiếu tiền, pause card resolution và chuyển DEBT_RESOLUTION.
```

Chi tiết nhiều creditor nằm ở:

```txt
04-economy-and-debt.md
```

---

## 11.8 Held Cards

MVP có thể có held card:

```txt
Thẻ ra tù
```

Player có thể dùng thẻ này khi đang ở tù theo Jail Rules.

Out of scope:

```txt
Trade card với người chơi khác
Card combo
Card inventory phức tạp
Card upgrade
Card tạo rule tạm thời nhiều vòng
```

---

## 12. Jail Rules

## 12.1 Entering Jail

Player vào tù khi:

```txt
Dừng vào ô Đi Tù.
Rút card có effect vào tù.
Tung đôi 3 lần liên tiếp.
```

Khi vào tù:

```txt
player.position = jailIndex
player.status = jailed
player.jailTurns = 0
player.doublesRolledInTurn = 0
Không nhận pass-start bonus nếu bị gửi thẳng vào tù
Turn kết thúc
```

---

## 12.2 Visiting Jail

Nếu player dừng ở jail tile bằng movement bình thường:

```txt
Player chỉ đang thăm tù.
player.status không đổi.
Không bị giới hạn lượt sau.
Không trả tiền.
Không cần tung đôi để ra.
```

---

## 12.3 Turn While in Jail

Khi tới lượt player đang jailed, player có các lựa chọn:

```txt
1. Trả tiền phạt để ra tù.
2. Dùng thẻ ra tù nếu có.
3. Thử tung đôi.
```

MVP UI nên hiển thị Jail Modal trước khi roll.

---

## 12.4 Pay Fine to Leave Jail

Nếu player chọn trả tiền phạt:

```txt
Nếu đủ cash:
- Trả fine cho bank.
- status = active.
- Roll dice và di chuyển bình thường.

Nếu không đủ cash:
- Chuyển DEBT_RESOLUTION.
```

Fine amount nằm trong economy config.

---

## 12.5 Use Get-Out Card

Nếu player có thẻ ra tù:

```txt
Player có thể dùng thẻ.
status = active.
Thẻ quay lại deck tương ứng.
Player roll dice và di chuyển bình thường.
```

Out of scope MVP:

```txt
Trade thẻ ra tù cho người chơi khác.
Bán thẻ ra tù.
```

---

## 12.6 Roll Doubles to Leave Jail

Nếu player chọn thử tung đôi:

```txt
Roll 2 dice.
Nếu là doubles:
- status = active.
- Di chuyển theo dice total.
- Không được thêm lượt từ doubles này.
- Resolve tile đích.

Nếu không phải doubles:
- jailTurns tăng 1.
- Turn kết thúc nếu chưa đạt giới hạn bắt buộc.
```

---

## 12.7 Maximum Jail Turns

MVP recommendation:

```txt
Player không thể ở tù quá 3 lượt thử.
```

Nếu sau số lượt tối đa vẫn không tung được đôi:

```txt
Player phải trả fine để ra tù.
Nếu không đủ cash, chuyển DEBT_RESOLUTION.
```

---

## 12.8 Rent While in Jail

MVP decision:

```txt
Player đang ở tù vẫn có thể thu rent từ property của mình.
```

Ngoại lệ:

```txt
Property đang thế chấp không thu rent.
Player bankrupt không thu rent.
```

---

## 13. Bankruptcy Rules — Basic

## 13.1 Basic Principle

Player không phá sản ngay khi cash không đủ.

Rule cơ bản:

```txt
Nếu player cần trả tiền nhưng cash không đủ:
→ chuyển DEBT_RESOLUTION.
```

Chỉ khi Debt Resolution không thể giúp player trả đủ nợ:

```txt
→ player phá sản.
```

Chi tiết Debt Resolution nằm ở:

```txt
04-economy-and-debt.md
```

---

## 13.2 Bankruptcy Trigger

Bankruptcy trigger khi:

```txt
Player đang có DebtState.
Player không thể raise đủ cash.
Declare Bankruptcy được xác nhận.
```

Nguồn nợ có thể là:

```txt
Rent
Tax/Fee
Card payment
Jail fine
Loan repayment nếu có
Special rule payment
```

---

## 13.3 Owing Bank — Basic

Nếu player phá sản vì nợ bank:

```txt
Player bị loại khỏi game.
Tài sản xử lý theo bankruptcy rules.
Game chuyển lượt hoặc kết thúc nếu chỉ còn 1 player.
```

Chi tiết xử lý tài sản:

```txt
04-economy-and-debt.md
```

---

## 13.4 Owing Player — Basic

Nếu player phá sản vì nợ player khác:

```txt
Player bị loại khỏi game.
Creditor có thể nhận một phần cash/tài sản theo rule bankruptcy.
Game chuyển lượt hoặc kết thúc nếu chỉ còn 1 player.
```

Chi tiết xử lý tài sản:

```txt
04-economy-and-debt.md
```

---

## 13.5 Removing Bankrupt Player

Khi player bankrupt:

```txt
player.status = bankrupt
Player bị loại khỏi turn order.
Player không được roll.
Player không được mua property.
Player không được thu rent.
Player không được giữ turn.
```

Engine phải đảm bảo:

```txt
Không property nào còn ownerId là bankrupt player sau bankruptcy resolution.
```

---

## 13.6 Winning the Game

Sau mỗi bankruptcy, game kiểm tra:

```txt
activePlayers = players where status !== bankrupt
```

Nếu:

```txt
activePlayers.length === 1
```

thì:

```txt
phase = GAME_OVER
winner = activePlayers[0]
```

---

## 14. Rule Priority

Khi nhiều rule có thể xảy ra cùng lúc, dùng priority sau:

```txt
1. Bankruptcy/Game Over check
2. Active DebtState must be resolved
3. Go To Jail / forced jail
4. Card effect resolution
5. Required payment
6. Property buy decision
7. Optional build/asset management
8. Extra turn from doubles
9. End turn
```

Ví dụ:

```txt
Nếu player tung đôi và dừng vào Go To Jail:
- Go To Jail thắng.
- Player vào tù.
- Không được extra turn.

Nếu player rút card phải trả tiền nhưng thiếu cash:
- Card resolution pause.
- Chuyển Debt Resolution.
- Sau khi trả nợ xong mới tiếp tục hoặc kết thúc card resolution.

Nếu player tung đôi lần thứ 3:
- Vào tù ngay.
- Không di chuyển.
- Không resolve tile.
```

---

## 15. Out of Scope for Gameplay MVP

Gameplay MVP không có:

```txt
Online multiplayer rules
AI player behavior
Trade tự do giữa người chơi
Auction
Mortgage negotiation
Player-to-player loans
Bail negotiation
Jail mini-game
Branching map
Multiple boards
Custom board rules
Dice power-ups
Combat/attack mechanics
Stock market
Insurance
Team mode
Spectator mode
```

Mortgage, sell building, loan và interest là một phần của Ambitious MVP economy, nhưng rule chi tiết nằm trong:

```txt
04-economy-and-debt.md
```

---

## 16. Gameplay Invariants

Các invariant quan trọng:

```txt
Không có cash âm sau khi action hoàn tất.
Không có nhiều hơn 1 active DebtState.
Không end turn khi còn DebtState.
Không roll dice khi không phải current player.
Không roll dice khi phase không hợp lệ.
Không resolve tile khi movement chưa hoàn tất.
Không thu rent từ mortgaged property.
Không thu rent cho bankrupt owner.
Không cho bankrupt player còn trong turn order.
Không cho property ownerId trỏ tới bankrupt player sau bankruptcy.
Không cho player vừa vào tù nhận extra turn từ doubles.
```

---

## 17. Logging Requirements

Các event gameplay quan trọng cần ghi vào game log:

```txt
Player bắt đầu lượt.
Player tung dice.
Player di chuyển từ ô X tới ô Y.
Player đi qua Xuất Phát và nhận tiền.
Player mua property.
Player từ chối mua property.
Player trả rent.
Player rút Cơ Hội.
Player rút Khí Vận.
Player trả tax/fee.
Player vào tù.
Player ra tù.
Player xây công trình.
Player thiếu tiền và vào Debt Resolution.
Player phá sản.
Player thắng game.
```

Game log nên ngắn, dễ đọc và không dùng thuật ngữ debug.

Ví dụ:

```txt
An tung 4 + 3 = 7 và di chuyển tới Khu Chợ Đông.
An mua Khu Chợ Đông với giá 120.
Bình dừng ở tài sản của An và trả 50 tiền thuê.
Chi rút Cơ Hội: Đi thẳng vào tù.
Dung thiếu 300 và phải xử lý nợ.
An phá sản vì không thể trả tiền thuê.
Bình chiến thắng ván chơi.
```

---

## 18. Gameplay Acceptance Criteria

Gameplay rules được xem là đạt khi:

```txt
1. Player có thể chơi theo lượt.
2. Dice roll hoạt động đúng.
3. Tung đôi cho thêm lượt.
4. Tung đôi 3 lần liên tiếp đưa player vào tù.
5. Movement quanh board hoạt động đúng.
6. Đi qua Xuất Phát nhận bonus.
7. Bị gửi thẳng vào tù không nhận bonus.
8. Dừng ở property chưa có chủ có thể mua.
9. Từ chối mua không trigger auction.
10. Dừng ở property người khác trigger rent.
11. Mortgaged property không thu rent.
12. Dừng ở tax/fee tile trigger payment.
13. Dừng ở Cơ Hội rút đúng deck.
14. Dừng ở Khí Vận rút đúng deck.
15. Card effect apply đúng.
16. Jail enter/exit hoạt động đúng.
17. Building eligibility hoạt động đúng.
18. Thiếu tiền chuyển Debt Resolution.
19. Bankruptcy chỉ xảy ra sau Debt Resolution.
20. Game kết thúc khi chỉ còn 1 player active.
21. Không có flow kẹt lượt.
```

---

## 19. Open Questions

Các câu hỏi gameplay cần chốt thêm:

```txt
1. Pass Start bonus là bao nhiêu?
2. Dừng đúng Xuất Phát có nhận bonus giống đi qua không?
3. Tung đôi sau khi trả tiền ra tù có được thêm lượt không?
4. Tung đôi để ra tù có được thêm lượt không? Recommendation: không.
5. Player trong tù có được build/sell/mortgage không? Recommendation: chỉ asset management nếu đến lượt, nhưng cần scope rõ.
6. Có cho build ở đầu lượt, cuối lượt, hay cả hai? Recommendation: sau tile resolution trước End Turn.
7. Card "đi tới tile X" có luôn resolve tile đích không? Recommendation: có.
8. Card movement qua Start có luôn nhận bonus không? Recommendation: có, trừ khi card nói không.
9. Nếu card yêu cầu trả tiền cho nhiều player, thứ tự trả là gì?
10. Có full-set rent bonus cho đất trống không?
11. Nếu một property trong group bị thế chấp, full-set bonus có bị tắt không? Recommendation: có.
12. Utility rent khi tới bằng card dùng dice nào?
13. Rest tile có thật sự không làm gì không, hay có bonus nhỏ?
14. Game có cho surrender ngoài Debt Resolution không? Recommendation: không trong MVP.
```

---

## 20. Summary

`02-gameplay-rules.md` định nghĩa luật chơi lõi của Property Tycoon Web MVP:

```txt
Dice
Movement
Tile resolution
Property buying
Rent
Building
Cards
Jail
Bankruptcy cơ bản
```

Nguyên tắc quan trọng nhất:

```txt
Nếu người chơi cần trả tiền nhưng không đủ cash,
game không cho cash âm và không phá sản ngay.
Thay vào đó, game chuyển sang Debt Resolution.
```

Chi tiết xử lý nợ, bán công trình, thế chấp, gỡ thế chấp, loan, lãi suất và bankruptcy settlement nằm trong:

```txt
04-economy-and-debt.md
```

[1]: https://consumercare.hasbro.com/api/download/B1002_es-ar?utm_source=chatgpt.com "MORTGAGES"
