# Property Tycoon Web — Economy & Debt

**Document:** `04-economy-and-debt.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa hệ thống kinh tế, nợ và phá sản cho **Property Tycoon Web MVP**.

Đây là một trong những tài liệu quan trọng nhất của project vì MVP mới không chỉ có mua đất và trả tiền thuê, mà còn có lớp tài chính nâng cao:

```txt
Bán công trình
Thế chấp tài sản
Gỡ thế chấp
Lãi suất cố định
Debt Resolution
Emergency Loan optional
Phá sản sau khi không thể xoay sở
````

Mục tiêu của file này là trả lời rõ:

```txt
Tiền đi từ đâu tới đâu?
Khi nào người chơi thiếu tiền?
Người chơi được làm gì để trả nợ?
Khi nào được bán công trình?
Khi nào được thế chấp?
Tài sản thế chấp có còn thu rent không?
Gỡ thế chấp tốn bao nhiêu?
Emergency Loan hoạt động thế nào?
Debt Resolution chạy ra sao?
Phá sản vì nợ ngân hàng xử lý thế nào?
Phá sản vì nợ người chơi xử lý thế nào?
Các edge case nào cần chặn để game không kẹt lượt?
```

File này không định nghĩa chi tiết board layout, card text, UI layout hoặc data model đầy đủ. Các phần đó nằm ở tài liệu riêng.

Related documents:

```txt
01-product-scope.md
02-gameplay-rules.md
03-board-design.md
05-ui-ux-scope.md
06-technical-design.md
07-testing-and-acceptance.md
08-roadmap-and-backlog.md
```

---

## 2. Economy Goals

## 2.1 Primary Goals

Hệ thống economy của MVP cần đạt các mục tiêu sau:

```txt
1. Tạo áp lực tài chính rõ ràng.
2. Cho người chơi nhiều quyết định hơn ngoài việc mua/không mua đất.
3. Tránh việc người chơi phá sản ngay lập tức khi thiếu một khoản tiền nhỏ.
4. Tạo cơ hội xoay sở bằng bán công trình và thế chấp tài sản.
5. Giữ rule đủ đơn giản để người chơi casual hiểu được.
6. Giữ logic đủ chặt để game engine không bị kẹt phase.
7. Không cần trade tự do giữa người chơi trong MVP.
8. Không cần auction trong MVP.
9. Không cần compound interest phức tạp.
10. Có thể test bằng unit test rõ ràng.
```

## 2.2 Desired Player Experience

Khi người chơi rơi vào tình trạng thiếu tiền, họ nên cảm thấy:

```txt
Mình đang gặp nguy hiểm.
Mình biết rõ mình nợ bao nhiêu.
Mình biết mình còn thiếu bao nhiêu.
Mình thấy các lựa chọn để xoay sở.
Mình có thể bán công trình hoặc thế chấp tài sản.
Mình hiểu hậu quả của việc thế chấp.
Mình chỉ phá sản khi thật sự không còn cách trả nợ.
```

MVP không nên tạo cảm giác:

```txt
Tôi bị phá sản quá đột ngột.
Tôi không biết vì sao mình nợ tiền.
Tôi không biết phải bấm gì tiếp.
Tôi có tài sản nhưng game vẫn bắt phá sản.
Tôi bị kẹt trong modal nợ.
```

---

## 3. Economy Non-Goals for MVP

MVP không làm các hệ thống sau:

```txt
Trade tự do giữa người chơi
Auction
Cho vay giữa người chơi
Bảo lãnh giữa người chơi
Thương lượng rent
Giảm nợ bằng deal riêng
Đổi đất để trả nợ
Partial ownership
Stock market
Dynamic property pricing
Insurance
Rent insurance
Compound interest nhiều lượt
Bankruptcy restructuring nhiều lượt
```

MVP tập trung vào giao dịch giữa người chơi và **ngân hàng/game system**, không phải giao dịch thương lượng tự do giữa người chơi.

---

## 4. Core Economy Concepts

## 4.1 Bank

Ngân hàng là nguồn tiền và tài sản trung tâm của game.

Ngân hàng có vai trò:

```txt
Trả tiền khi người chơi đi qua Xuất Phát
Nhận tiền khi người chơi mua tài sản
Nhận tiền thuế/phí
Nhận tiền phạt tù
Nhận tiền xây công trình
Trả tiền khi người chơi bán công trình
Trả tiền khi người chơi thế chấp tài sản
Nhận tiền khi người chơi gỡ thế chấp
Cấp Emergency Loan nếu rule bật
Nhận repayment của Emergency Loan
Nhận lại tài sản khi người chơi phá sản vì nợ bank
```

MVP có thể giả định:

```txt
Bank không bao giờ hết tiền.
Bank không phá sản.
Bank không cần UI như một người chơi.
```

## 4.2 Cash

`cash` là tiền mặt hiện có của người chơi.

Cash dùng để:

```txt
Mua tài sản
Trả rent
Trả tax/fee
Trả card penalty
Trả jail fine
Xây công trình
Gỡ thế chấp
Trả loan
```

Người chơi phá sản không phải vì `cash < 0`, mà vì họ **không thể raise đủ cash để trả khoản nợ đang pending**.

Rule quan trọng:

```txt
Không cho cash âm trong game state cuối cùng.
```

Thay vào đó, nếu người chơi không đủ tiền để trả, game tạo `DebtState` và chuyển sang `DEBT_RESOLUTION`.

---

## 4.3 Asset

Asset là tài sản có giá trị kinh tế của người chơi.

Asset bao gồm:

```txt
Đất thường
Trạm
Tiện ích
Công trình đã xây
Thẻ đặc biệt nếu có giá trị
```

Trong MVP, asset chủ yếu dùng để:

```txt
Tạo rent
Bán công trình lấy tiền
Thế chấp tài sản lấy tiền
Tính net worth nếu cần
Xử lý phá sản
```

---

## 4.4 Debt

Debt là khoản tiền người chơi bắt buộc phải trả nhưng cash hiện tại không đủ.

Nguồn debt có thể là:

```txt
Rent
Tax/Fee
Card penalty
Jail fine
Loan repayment
Special rule payment
```

Debt luôn có:

```txt
debtor
creditor
amountDue
reason
source
```

Creditor có thể là:

```txt
bank
player
```

---

## 4.5 Liquidity

Liquidity là khả năng biến tài sản thành tiền mặt ngay trong Debt Resolution.

Nguồn liquidity trong MVP:

```txt
Cash hiện có
Sellable buildings
Mortgageable properties
Emergency Loan nếu rule bật
```

Không tính vào liquidity trong MVP:

```txt
Trade với người chơi khác
Auction tài sản
Bán đất cho người chơi khác
Vay từ người chơi khác
Deal riêng
```

---

## 5. Economy Parameters

Các con số dưới đây là default đề xuất. Có thể tinh chỉnh trong balance phase.

| Parameter                   |                  Default | Notes                                  |
| --------------------------- | -----------------------: | -------------------------------------- |
| Starting cash               |                      TBD | Chốt sau khi có property price table   |
| Pass Start bonus            |                      TBD | Nên chốt cùng economy table            |
| Sell building rate          |                      50% | Bán công trình lại cho bank            |
| Mortgage value              |              Data-driven | Có thể default bằng 50% property price |
| Unmortgage interest         |                      10% | Fixed interest                         |
| Emergency loan enabled      |                 Optional | Tùy rule preset                        |
| Emergency loan interest     |                      10% | Fixed fee, không compound              |
| Emergency loan max          | `min(300, 25% netWorth)` | Có thể chỉnh                           |
| Max open loans per player   |                        1 | Để tránh lạm dụng                      |
| Allow buy while loan open   |                      TBD | Nên tắt trong preset strict            |
| Allow build while loan open |                       No | Khuyến nghị MVP                        |
| Allow trade to resolve debt |                       No | Không có trade MVP                     |

---

## 6. Cash Flow

## 6.1 Bank → Player

Ngân hàng trả tiền cho người chơi khi:

```txt
Người chơi đi qua Xuất Phát
Người chơi dừng ở Xuất Phát nếu rule cho phép
Người chơi rút card nhận tiền từ bank
Người chơi bán công trình
Người chơi thế chấp tài sản
Người chơi nhận Emergency Loan
```

## 6.2 Player → Bank

Người chơi trả tiền cho ngân hàng khi:

```txt
Mua tài sản chưa có chủ
Xây công trình
Trả tax/fee
Trả card penalty cho bank
Trả jail fine
Gỡ thế chấp
Trả Emergency Loan
```

## 6.3 Player → Player

Người chơi trả tiền cho người chơi khác khi:

```txt
Trả rent
Card effect yêu cầu trả tiền cho người chơi khác
Card effect yêu cầu trả tiền cho mỗi người chơi
Bankruptcy settlement nếu nợ player
```

Không có trong MVP:

```txt
Player-to-player trade
Player-to-player loan
Player-to-player negotiated payment
```

---

## 7. Payment Resolution Rule

Khi một effect yêu cầu người chơi trả tiền, game xử lý theo thứ tự:

```txt
1. Tạo PaymentRequest.
2. Kiểm tra debtor.cash.
3. Nếu cash >= amountDue:
   - Trả tiền ngay.
   - Kết thúc payment.
4. Nếu cash < amountDue:
   - Tạo DebtState.
   - Chuyển game phase sang DEBT_RESOLUTION.
5. Trong DEBT_RESOLUTION, người chơi raise tiền.
6. Khi cash >= amountDue:
   - Cho phép Pay Debt.
   - Trả tiền.
   - Clear DebtState.
   - Tiếp tục game.
7. Nếu không còn cách raise đủ tiền:
   - Declare Bankruptcy.
```

Rule quan trọng:

```txt
Không trừ tiền khiến cash âm.
Không resolve tiếp tile/card khi debt chưa xử lý xong.
Không end turn khi còn DebtState chưa clear.
```

---

## 8. Sell Building

## 8.1 Purpose

Sell Building cho phép người chơi lấy lại một phần tiền đã đầu tư vào công trình.

Đây là công cụ chính để:

```txt
Trả nợ
Tránh phá sản
Giảm áp lực cash
Chuẩn bị thế chấp tài sản
```

## 8.2 Rule Summary

```txt
Sell value = 50% build cost
```

Nếu công trình có nhiều cấp:

```txt
Mỗi lần bán giảm buildingLevel xuống 1.
Người chơi nhận 50% build cost của cấp vừa bán.
```

Ví dụ:

```txt
Build cost = 100
Sell 1 level → nhận 50
buildingLevel giảm 1
```

## 8.3 When Selling Is Allowed

Người chơi được bán công trình khi:

```txt
Đang trong BUILD_MANAGEMENT phase
Đang trong DEBT_RESOLUTION phase
Đang trong pre-end-turn asset management nếu game cho phép
```

Người chơi không được bán công trình khi:

```txt
Không phải lượt của mình
Game đang MOVING
Game đang ROLLING
Game đang CARD_RESOLUTION chưa xong
Game đang BANKRUPTCY_RESOLUTION
Game đã GAME_OVER
```

## 8.4 Eligible Buildings

Một công trình được bán nếu:

```txt
Property thuộc sở hữu người chơi
Property là đất thường
buildingLevel > 0
Property không bị locked bởi một effect khác
```

Không thể bán công trình trên:

```txt
Trạm
Tiện ích
Ô không phải property
Property không thuộc sở hữu người chơi
Property đã bị thế chấp
```

## 8.5 Even Selling Rule

MVP khuyến nghị dùng rule bán đều để tránh exploit.

Rule:

```txt
Trong cùng một nhóm màu, building level giữa các property không được chênh quá 1 cấp sau khi bán.
```

Ví dụ group 3 ô:

```txt
[2, 2, 1] hợp lệ
[2, 1, 1] hợp lệ
[3, 1, 1] không hợp lệ
```

Khi bán, nên bán từ property có building level cao nhất trước.

## 8.6 Hotel / Max-Level Building Handling

Nếu `buildingLevel = 5` đại diện cho khách sạn hoặc công trình cấp cao nhất, MVP xử lý đơn giản:

```txt
Bán 1 cấp từ level 5 → level 4
Nhận 50% build cost
```

Không cần mô phỏng việc đổi khách sạn thành 4 nhà riêng biệt trong MVP.

## 8.7 UI Requirements

Khi bán công trình, UI cần hiển thị:

```txt
Tên property
Building level hiện tại
Sell value
Building level sau khi bán
Rent thay đổi như thế nào
Nút Sell
Lý do không thể bán nếu bị disable
```

Trong Debt Resolution, UI nên hiển thị tổng tiền có thể raise bằng bán công trình.

---

## 9. Mortgage Property

## 9.1 Purpose

Mortgage cho phép người chơi nhận tiền từ bank bằng cách thế chấp tài sản.

Đây là công cụ tài chính lớn hơn bán công trình, nhưng có hậu quả rõ ràng:

```txt
Nhận tiền ngay
Vẫn giữ ownership
Không thu rent trên tài sản bị thế chấp
Không thể xây trên nhóm có tài sản đang thế chấp
Phải trả mortgage value + interest để mở lại
```

## 9.2 Rule Summary

Khi thế chấp:

```txt
Player nhận mortgageValue từ bank.
property.isMortgaged = true.
Property vẫn thuộc sở hữu player.
Property không thu rent.
```

## 9.3 Mortgage Value

Mortgage value nên là data-driven.

Default đề xuất:

```txt
mortgageValue = 50% property price
```

Nhưng không nên hard-code công thức này vào engine. Thay vào đó:

```ts
type PropertyEconomy = {
  price: number;
  mortgageValue: number;
};
```

Lý do:

```txt
Dễ balance từng property.
Dễ làm một số property có mortgage value đặc biệt.
Dễ chỉnh economy mà không sửa rule engine.
```

## 9.4 Eligible Properties

Một property được thế chấp nếu:

```txt
Property thuộc sở hữu người chơi.
Property chưa bị thế chấp.
Property không có building.
Nếu là đất thường thuộc group, toàn bộ group không còn building.
Property không đang bị locked bởi effect khác.
```

Không được thế chấp nếu:

```txt
Property không thuộc sở hữu người chơi.
Property đã bị thế chấp.
Property đang có building.
Property cùng group vẫn còn building.
Property đang pending transfer trong bankruptcy.
```

## 9.5 Why Buildings Must Be Sold First

Trước khi thế chấp một đất thường trong color group, group đó phải không còn công trình.

Lý do:

```txt
Tránh trường hợp player vừa giữ rent cao vừa lấy tiền mortgage.
Giữ rule dễ hiểu.
Giữ giá trị strategic của quyết định thế chấp.
Tạo trade-off rõ: bán công trình trước, rồi mới mortgage.
```

## 9.6 Rent on Mortgaged Property

Nếu người chơi khác dừng vào property đang bị thế chấp:

```txt
Không thu rent.
Không tạo DebtState.
Không payment.
Tile resolve kết thúc như ô an toàn.
```

Nếu một group có nhiều property và chỉ một property bị thế chấp:

```txt
Property bị thế chấp không thu rent.
Property không thế chấp vẫn có thể thu rent.
Full-set bonus/build eligibility có thể bị tắt nếu bất kỳ property nào trong group bị thế chấp.
```

MVP decision:

```txt
Nếu bất kỳ property nào trong group bị thế chấp:
- Không được xây thêm trong group đó.
- Không tính full-set rent bonus cho đất trống trong group đó.
```

## 9.7 Mortgage During Debt Resolution

Trong Debt Resolution, người chơi có thể thế chấp property hợp lệ để raise cash.

Flow:

```txt
Player owes 300
Player has 100 cash
Player mortgages property with mortgageValue 200
Player cash becomes 300
Pay Debt button becomes enabled
```

## 9.8 UI Requirements

Mortgage UI cần hiển thị:

```txt
Tên property
Current owner
Mortgage value
Current rent
Warning: property will not collect rent
Warning: group may lose build/full-set benefits
Button Mortgage
Reason disabled nếu không hợp lệ
```

Trong Debt Resolution, cần hiển thị:

```txt
Tổng mortgageable value
Danh sách property có thể mortgage
Số tiền còn thiếu
```

---

## 10. Unmortgage + Interest

## 10.1 Purpose

Unmortgage cho phép người chơi mở lại tài sản bị thế chấp.

Sau khi unmortgage:

```txt
Property thu rent trở lại.
Property có thể được dùng để xét full group.
Group có thể xây lại nếu mọi property đều không thế chấp.
```

## 10.2 Rule Summary

```txt
Unmortgage cost = mortgageValue + interest
Interest = 10% of mortgageValue
```

Default:

```txt
interestRate = 10%
```

Ví dụ:

```txt
mortgageValue = 100
interest = 10
unmortgageCost = 110
```

## 10.3 Rounding Rule

Nếu có số lẻ, MVP nên dùng một rule thống nhất.

Khuyến nghị:

```txt
interest = ceil(mortgageValue * interestRate)
unmortgageCost = mortgageValue + interest
```

Ví dụ:

```txt
mortgageValue = 75
interestRate = 10%
interest = ceil(7.5) = 8
unmortgageCost = 83
```

Lý do dùng `ceil`:

```txt
Tránh số thập phân trong UI.
Dễ hiểu.
Không làm người chơi trả thấp hơn lãi dự kiến.
```

## 10.4 When Unmortgage Is Allowed

Người chơi được gỡ thế chấp khi:

```txt
Đang trong lượt của mình.
Không đang resolve payment bắt buộc, trừ khi rule cho phép.
Không đang bankrupt.
Có đủ cash để trả unmortgageCost.
```

Khuyến nghị MVP:

```txt
Không cho unmortgage trong Debt Resolution.
```

Lý do:

```txt
Debt Resolution là để raise tiền trả nợ.
Unmortgage làm giảm cash, dễ gây flow khó hiểu.
```

## 10.5 Effects of Unmortgage

Khi gỡ thế chấp:

```txt
Trừ cash của player.
property.isMortgaged = false.
Property thu rent trở lại.
Cập nhật group eligibility.
Ghi game log.
```

Game log example:

```txt
An gỡ thế chấp Khu Công Nghệ A với giá 110.
```

## 10.6 UI Requirements

Unmortgage UI cần hiển thị:

```txt
Mortgage value
Interest
Total cost
Cash hiện có
Rent sau khi unmortgage
Button Unmortgage
Reason disabled nếu không đủ tiền
```

---

## 11. Emergency Loan

## 11.1 Purpose

Emergency Loan là một rule optional để làm game bớt khắc nghiệt.

Không giống mortgage, Emergency Loan không cần tài sản cụ thể, nhưng phải có giới hạn mạnh để tránh người chơi lạm dụng.

## 11.2 MVP Decision

Emergency Loan là:

```txt
Optional rule
Có thể bật/tắt theo rule preset
Không bắt buộc cho MVP strict
```

Rule presets đề xuất:

```txt
Classic Strict:
- Emergency Loan disabled

Tycoon Friendly:
- Emergency Loan enabled
```

## 11.3 When Emergency Loan Is Allowed

Người chơi chỉ được vay khẩn cấp khi:

```txt
Đang trong Debt Resolution.
cash < amountDue.
Rule preset bật Emergency Loan.
Player chưa có open loan.
Player chưa bankrupt.
Loan amount không vượt limit.
```

Không được vay khi:

```txt
Chỉ muốn mua property.
Chỉ muốn xây thêm.
Chỉ muốn gỡ thế chấp.
Không có debt pending.
Đã có open loan.
```

## 11.4 Loan Amount

MVP có thể cho vay đúng số còn thiếu, nhưng không vượt giới hạn.

Rule đề xuất:

```txt
shortfall = amountDue - cash
maxLoan = min(300, floor(netWorth * 25%))
loanPrincipal = min(shortfall, maxLoan)
```

Nếu `loanPrincipal < shortfall`, người chơi vẫn cần bán/mortgage thêm.

Alternative simpler rule:

```txt
maxLoan = 300
loanPrincipal = min(shortfall, 300)
```

Khuyến nghị MVP:

```txt
Dùng simpler rule trước nếu muốn dễ implement.
```

## 11.5 Loan Interest

Emergency Loan dùng fixed fee, không compound.

Rule đề xuất:

```txt
loanInterest = ceil(principal * 10%)
loanAmountDue = principal + loanInterest
```

Ví dụ:

```txt
principal = 200
interest = 20
amountDue = 220
```

## 11.6 Loan Repayment

Có 2 option.

### Option A — Voluntary Repayment

Người chơi có thể trả loan trong lượt của mình nếu đủ tiền.

Ưu điểm:

```txt
Ít áp lực.
Dễ chơi.
Thân thiện casual.
```

Nhược điểm:

```txt
Người chơi có thể trì hoãn lâu.
Loan ít tạo áp lực.
```

### Option B — Forced Repayment Before Building

Người chơi không được xây công trình nếu còn loan chưa trả.

Ưu điểm:

```txt
Loan có hậu quả rõ.
Ngăn snowball bằng tiền vay.
Dễ hiểu.
```

Nhược điểm:

```txt
Cần UI cảnh báo.
```

MVP recommendation:

```txt
Dùng Option B.
Người chơi có thể giữ loan, nhưng không được xây thêm cho tới khi trả hết.
```

## 11.7 Restrictions While Loan Is Open

Khi player có open loan:

```txt
Không được xây công trình mới.
Không được gỡ thế chấp nếu cash sau đó không đủ trả loan? TBD.
Có thể mua property mới? TBD theo preset.
Có thể thu rent bình thường.
Có thể trả loan bất kỳ lúc nào trong lượt.
```

Khuyến nghị MVP:

```txt
Không cho build khi có open loan.
Vẫn cho mua property mới nếu muốn game friendly.
```

Strict preset có thể:

```txt
Không cho mua property mới khi có open loan.
```

## 11.8 Loan UI Requirements

Loan UI cần hiển thị:

```txt
Rule preset có bật loan không
Số tiền còn thiếu
Loan principal có thể vay
Interest
Total repayment
Restrictions sau khi vay
Button Take Loan
Reason disabled nếu không đủ điều kiện
```

---

## 12. Debt Resolution

## 12.1 Purpose

Debt Resolution là phase trung tâm của economy MVP.

Nó đảm bảo:

```txt
Người chơi không phá sản ngay khi thiếu cash.
Người chơi có thể dùng asset để raise tiền.
Game không cho cash âm.
Game không tiếp tục resolve khi nợ chưa xử lý.
```

## 12.2 Trigger

Debt Resolution trigger khi:

```txt
Player phải trả amountDue
AND player.cash < amountDue
```

Nguồn trigger:

```txt
Rent
Tax/Fee
Card payment
Jail fine
Loan repayment nếu bắt buộc
Special rule payment
```

## 12.3 DebtState

DebtState cần lưu:

```ts
type DebtState = {
  id: string;
  debtorId: string;
  creditorType: "bank" | "player";
  creditorPlayerId?: string;
  amountDue: number;
  amountPaid?: number;
  reason: string;
  source:
    | "rent"
    | "tax"
    | "card"
    | "jail_fine"
    | "loan"
    | "other";
  createdTurn: number;
  canUseEmergencyLoan: boolean;
};
```

## 12.4 Allowed Actions in Debt Resolution

Trong Debt Resolution, player được phép:

```txt
Bán công trình hợp lệ
Thế chấp property hợp lệ
Dùng Emergency Loan nếu rule bật
Pay Debt khi cash đủ
Declare Bankruptcy nếu không còn cách
```

Không được phép:

```txt
Roll dice
End turn
Buy property
Build công trình mới
Unmortgage property
Trade với người chơi khác
Draw card mới
Trigger tile mới
Save/load destructive action nếu chưa handle pending debt
```

## 12.5 Debt Resolution Flow

```txt
Payment required
↓
cash < amountDue
↓
Create DebtState
↓
phase = DEBT_RESOLUTION
↓
Show Debt Resolution Modal
↓
Player raises cash:
- Sell building
- Mortgage property
- Emergency Loan if allowed
↓
If cash >= amountDue:
- Enable Pay Debt
↓
Player pays debt
↓
Clear DebtState
↓
Resume previous resolution flow
```

## 12.6 When to Allow Declare Bankruptcy

Declare Bankruptcy được enable khi:

```txt
cash < amountDue
AND no sellable buildings
AND no mortgageable properties
AND emergency loan unavailable or insufficient
```

Có thể vẫn cho player bấm Declare Bankruptcy sớm, nhưng MVP khuyến nghị:

```txt
Chỉ enable khi game xác định không còn cách raise đủ tiền.
```

Lý do:

```txt
Tránh người chơi phá sản nhầm.
Giảm lỗi do chưa bán/mortgage hết.
```

## 12.7 Debt Resolution UI

Debt Resolution Modal cần hiển thị:

```txt
Bạn đang nợ ai
Lý do nợ
Số tiền đang nợ
Tiền mặt hiện có
Số tiền còn thiếu
Tổng tiền có thể raise
Danh sách công trình có thể bán
Danh sách tài sản có thể thế chấp
Emergency Loan nếu có
Pay Debt button
Declare Bankruptcy button
```

Example:

```txt
Bạn đang nợ Bình 420 vì tiền thuê.

Tiền mặt hiện có: 120
Còn thiếu: 300

Bạn có thể:
- Bán công trình: tối đa +150
- Thế chấp tài sản: tối đa +260
- Vay khẩn cấp: tối đa +300

Sau khi có đủ tiền, bấm "Trả nợ".
```

## 12.8 Resume Behavior

Sau khi trả nợ thành công:

```txt
Clear DebtState.
Complete original payment.
Return to previous flow.
```

Ví dụ:

```txt
Nếu nợ phát sinh từ rent:
- Sau khi trả rent, tile resolution kết thúc.
- Nếu không còn action khác, chuyển END_TURN hoặc BUILD_DECISION.

Nếu nợ phát sinh từ card:
- Sau khi trả tiền, tiếp tục card resolution.
- Card được discard/return theo rule.
```

---

## 13. Bankruptcy When Owing Bank

## 13.1 Trigger

Người chơi phá sản vì nợ bank khi:

```txt
DebtState.creditorType = "bank"
AND player không thể raise đủ cash
AND Declare Bankruptcy được xác nhận
```

Nguồn nợ bank:

```txt
Tax/Fee
Card penalty trả cho bank
Jail fine
Loan repayment
Special bank payment
```

## 13.2 MVP Bankruptcy Resolution

Khi phá sản vì nợ bank:

```txt
Player status = bankrupt
Player bị loại khỏi turn order
Cash còn lại chuyển về bank
Tất cả công trình bị xóa
Tất cả property trở về unowned
Tất cả mortgage state reset
Tất cả loan bị hủy
Held special cards trả lại deck nếu có
DebtState bị clear
Game log ghi bankruptcy
```

## 13.3 Property Handling

MVP đơn giản hóa:

```txt
Tất cả property của player phá sản vì nợ bank trở về unowned.
Không auction trong MVP.
Không tự động bán cho người chơi khác.
```

Lý do:

```txt
MVP không có auction.
Giảm UI phức tạp.
Giảm edge case khi nhiều property mortgaged.
Dễ hiểu và dễ implement.
```

## 13.4 Buildings Handling

Khi player phá sản vì nợ bank:

```txt
Tất cả building trên property của player bị remove.
buildingLevel = 0.
Không trả thêm cash cho player vì bankruptcy đã xảy ra sau Debt Resolution.
```

Lưu ý:

```txt
Trong Debt Resolution, player đã có cơ hội bán building.
Nếu vẫn phá sản, không cần tự động bán tiếp.
```

## 13.5 Turn Handling

Sau bankruptcy:

```txt
Nếu còn hơn 1 player active:
- Remove bankrupt player khỏi turn order.
- Chuyển lượt tới player tiếp theo hợp lệ.

Nếu chỉ còn 1 player active:
- phase = GAME_OVER.
- Winner = player còn lại.
```

---

## 14. Bankruptcy When Owing Player

## 14.1 Trigger

Người chơi phá sản vì nợ player khi:

```txt
DebtState.creditorType = "player"
AND player không thể raise đủ cash
AND Declare Bankruptcy được xác nhận
```

Nguồn nợ player:

```txt
Rent
Card effect trả tiền cho player khác
Card effect trả tiền cho mỗi player
Special player payment
```

## 14.2 MVP Bankruptcy Resolution

Khi phá sản vì nợ player:

```txt
Player status = bankrupt
Player bị loại khỏi turn order
Cash còn lại chuyển cho creditor
Property không thế chấp chuyển cho creditor
Property đang thế chấp trở về bank/unowned
Tất cả building bị xóa trước khi transfer hoặc reset theo rule
Loan bị hủy
Held special cards trả lại deck nếu có
DebtState bị clear
Game log ghi bankruptcy
```

## 14.3 Why Mortgaged Properties Return to Bank in MVP

Có thể có nhiều cách xử lý tài sản thế chấp khi phá sản vì nợ player. MVP chọn cách đơn giản:

```txt
Mortgaged properties return to bank/unowned.
```

Lý do:

```txt
Không cần creditor trả phí nhận tài sản thế chấp.
Không cần UI hỏi creditor có muốn gỡ mortgage không.
Không cần xử lý inherited mortgage.
Không cần tạo debt mới cho creditor.
Giảm rủi ro kẹt BANKRUPTCY_RESOLUTION.
```

Đây là simplification có chủ đích. Phase sau có thể đổi sang rule phức tạp hơn.

## 14.4 Unmortgaged Property Transfer

Property không thế chấp có thể chuyển cho creditor.

Khi chuyển:

```txt
ownerId = creditorPlayerId
isMortgaged = false
buildingLevel = 0 nếu rule reset building
```

MVP recommendation:

```txt
Reset buildingLevel = 0 khi transfer qua bankruptcy.
```

Lý do:

```txt
Đơn giản.
Tránh creditor nhận ngay rent quá mạnh.
Tránh cần tính giá trị building còn lại.
Bankrupt player đã có cơ hội bán building trong Debt Resolution.
```

Alternative phase-later:

```txt
Transfer property with buildings intact.
```

Không khuyến nghị cho MVP.

## 14.5 Multiple Creditors

Trong MVP, mỗi DebtState chỉ có một creditor chính.

Nếu card yêu cầu trả tiền cho nhiều người chơi và debtor không đủ tiền:

Option đề xuất:

```txt
Resolve payments one by one theo turn order.
Nếu thiếu tiền ở payment nào, tạo DebtState cho creditor đó.
```

Nếu phá sản giữa chừng:

```txt
Các payment còn lại không tiếp tục.
Player bị loại.
```

Lý do:

```txt
Tránh chia tài sản cho nhiều creditor.
Dễ implement.
Dễ giải thích.
```

---

## 15. Trade Restriction During Debt

MVP không cho trade tự do giữa người chơi.

Trong Debt Resolution, player không được:

```txt
Bán property cho player khác
Đổi property lấy tiền
Đổi property lấy property
Xin giảm rent
Vay tiền từ player khác
Chuyển tài sản trực tiếp cho creditor để trả nợ
```

Chỉ được dùng:

```txt
Sell building to bank
Mortgage property to bank
Emergency Loan from bank if enabled
```

Lý do:

```txt
Giữ MVP kiểm soát được.
Tránh UI negotiation.
Tránh exploit.
Tránh kẹt lượt.
Tách rõ advanced finance khỏi trade system.
```

---

## 16. Edge Cases

## 16.1 Player Owes Money While Already in Debt Resolution

Rule:

```txt
Không tạo DebtState mới nếu đã có DebtState active.
```

Nếu effect mới phát sinh payment trong lúc đang Debt Resolution, đó là bug flow.

Engine should assert:

```txt
activeDebtState == null before creating new DebtState
```

## 16.2 Player Has Enough Assets but No Valid Actions

Có thể xảy ra nếu:

```txt
Player có property nhưng tất cả đều không mortgageable.
Player có building nhưng bị even-selling rule chặn.
Player có loan option disabled.
```

Rule:

```txt
Nếu không có legal action để raise đủ tiền, Declare Bankruptcy được enable.
```

## 16.3 Player Can Raise Some Money but Not Enough

Ví dụ:

```txt
Debt = 500
Cash = 100
Sellable + Mortgageable = 250
Loan unavailable
Max possible cash = 350
```

Rule:

```txt
Game có thể hiển thị "Không thể raise đủ tiền".
Declare Bankruptcy được enable.
```

Không bắt player bán/mortgage mọi thứ nếu vẫn không đủ.

## 16.4 Player Can Raise Enough but Chooses Not To

MVP recommendation:

```txt
Không cho declare bankruptcy nếu có thể raise đủ tiền.
```

Lý do:

```txt
Tránh player cố tình phá sản để kingmaking.
Tránh người chơi mới bấm nhầm.
```

Phase sau có thể cho surrender/declare early nếu muốn.

## 16.5 Mortgaging Last Property in a Full Set

Nếu player mortgage một property trong full set:

```txt
Property đó không thu rent.
Group mất build eligibility.
Group mất full-set rent bonus nếu rule áp dụng.
Existing buildings should already be sold before mortgage.
```

## 16.6 Trying to Build While Group Has Mortgage

Rule:

```txt
Không được build nếu bất kỳ property nào trong group bị thế chấp.
```

UI phải disable Build button và hiển thị reason.

## 16.7 Trying to Mortgage Property With Buildings in Group

Rule:

```txt
Không được mortgage nếu group còn building.
```

UI copy:

```txt
Bạn phải bán toàn bộ công trình trong nhóm này trước khi thế chấp.
```

## 16.8 Paying Rent to Bankrupt Player

Không nên xảy ra vì bankrupt player bị remove khỏi active ownership benefits.

Rule:

```txt
Nếu property owner is bankrupt, property should not remain owned by that player.
```

Engine validation:

```txt
No property.ownerId may reference bankrupt player after bankruptcy resolution.
```

## 16.9 Passing Start During Forced Movement to Jail

Nếu movement đưa thẳng vào tù:

```txt
Không nhận pass-start bonus.
```

Nếu card movement đi tới tile khác và đi qua Start:

```txt
Theo rule của card.
Nếu card không nói skip bonus, dùng movement rule default.
```

## 16.10 Debt from Jail Fine

Nếu player phải trả jail fine nhưng không đủ cash:

```txt
Create DebtState with creditorType = bank.
Player may sell/mortgage/loan.
If cannot pay, bankruptcy.
```

## 16.11 Debt from Card That Pays Multiple Players

Rule đề xuất:

```txt
Resolve từng player theo turn order.
Nếu debtor thiếu tiền khi trả cho một player:
- Create DebtState for that creditor.
- Pause remaining payments.
- If debtor pays successfully, continue remaining card payments.
- If debtor bankrupts, stop card resolution.
```

## 16.12 Save During Debt Resolution

Save file phải lưu:

```txt
activeDebtState
phase = DEBT_RESOLUTION
all cash/property/building/mortgage changes already made
source resolution context nếu cần resume
```

Khi load lại:

```txt
Game quay lại Debt Resolution Modal.
Không mất thông tin nợ.
Không double-charge payment.
```

## 16.13 Undo

MVP không có undo.

Lý do:

```txt
Undo với debt/mortgage/sell building rất phức tạp.
Cần transaction history.
Dễ tạo exploit.
```

Thay vào đó:

```txt
Actions cần confirmation nếu irreversible.
```

Irreversible actions:

```txt
Sell building
Mortgage property
Take emergency loan
Declare bankruptcy
```

## 16.14 Rounding

Tất cả tiền trong MVP là integer.

Rule:

```txt
Không dùng decimal money.
Interest dùng ceil.
Percentage calculations phải được rounded deterministically.
```

## 16.15 Negative Cash Prevention

Invariant:

```txt
player.cash >= 0
```

Nếu payment lớn hơn cash:

```txt
Không trừ tiền.
Create DebtState.
```

## 16.16 Multiple Loans

MVP rule:

```txt
Mỗi player chỉ có tối đa 1 open loan.
```

Nếu player đã có loan:

```txt
Emergency Loan disabled.
```

## 16.17 Loan and Bankruptcy

Nếu player bankrupt:

```txt
Loan bị hủy.
Không creditor player nào nhận loan.
Bank không cần tracking repayment nữa.
```

## 16.18 Bank-Owned Property After Bankruptcy

Khi property trở về bank/unowned:

```txt
ownerId = null
isMortgaged = false
buildingLevel = 0
```

## 16.19 Player Eliminated During Own Turn

Nếu player phá sản trong lượt của mình:

```txt
Resolve bankruptcy.
Remove from turn order.
Advance to next active player.
```

Không tiếp tục các action còn lại của player đó.

## 16.20 Last Player Standing

Sau mỗi bankruptcy, check:

```txt
activePlayers.length === 1
```

Nếu đúng:

```txt
phase = GAME_OVER
winnerId = activePlayers[0].id
```

---

## 17. Economy State Requirements

## 17.1 Player Economy Fields

Player cần có:

```ts
type Player = {
  id: string;
  cash: number;
  status: "active" | "jailed" | "bankrupt";
  properties: string[];
  loans: Loan[];
};
```

## 17.2 Property Economy Fields

Property cần có:

```ts
type Property = {
  id: string;
  ownerId: string | null;
  type: "land" | "station" | "utility";
  groupId?: string;
  price: number;
  mortgageValue: number;
  isMortgaged: boolean;
  buildingLevel: number;
  buildCost?: number;
  rentByLevel?: number[];
};
```

## 17.3 Loan Fields

```ts
type Loan = {
  id: string;
  playerId: string;
  principal: number;
  interestRate: number;
  interestAmount: number;
  amountDue: number;
  createdTurn: number;
  status: "open" | "paid" | "cancelled";
};
```

## 17.4 Debt Fields

```ts
type DebtState = {
  id: string;
  debtorId: string;
  creditorType: "bank" | "player";
  creditorPlayerId?: string;
  amountDue: number;
  reason: string;
  source: "rent" | "tax" | "card" | "jail_fine" | "loan" | "other";
  createdTurn: number;
  canUseEmergencyLoan: boolean;
};
```

---

## 18. Economy Actions

Core economy actions:

```txt
PAY_BANK
PAY_PLAYER
RECEIVE_FROM_BANK
BUY_PROPERTY
BUILD
SELL_BUILDING
MORTGAGE_PROPERTY
UNMORTGAGE_PROPERTY
CREATE_DEBT
PAY_DEBT
DECLARE_BANKRUPTCY
TAKE_EMERGENCY_LOAN
REPAY_LOAN
```

Each action should be:

```txt
Validated
Atomic
Logged
Testable
Save-safe
```

---

## 19. Game Log Requirements

Economy actions nên ghi log rõ.

Examples:

```txt
An mua Khu Chợ A với giá 120.
Bình trả 80 tiền thuê cho An.
Chi bán 1 cấp công trình tại Khu Công Nghệ B và nhận 50.
Dung thế chấp Trạm Bắc và nhận 100.
An gỡ thế chấp Khu Văn Phòng C với giá 110.
Bình vay khẩn cấp 200, cần trả lại 220.
Chi không thể trả nợ 450 và phá sản.
```

Game log nên giúp người chơi hiểu:

```txt
Ai mất tiền?
Ai nhận tiền?
Vì sao?
Tài sản nào bị thay đổi?
Debt Resolution xảy ra vì lý do gì?
```

---

## 20. UI Requirements Summary

## 20.1 Asset Management UI

Cần hỗ trợ:

```txt
Xem tài sản đang sở hữu
Xem building level
Xem mortgage state
Xem rent hiện tại
Xem sell value
Xem mortgage value
Xem unmortgage cost
```

## 20.2 Debt Resolution Modal

Cần hỗ trợ:

```txt
Hiển thị khoản nợ
Hiển thị cash hiện có
Hiển thị shortfall
Hiển thị sellable buildings
Hiển thị mortgageable properties
Hiển thị emergency loan option
Hiển thị Pay Debt
Hiển thị Declare Bankruptcy
```

## 20.3 Confirmation Dialogs

Cần confirmation cho:

```txt
Sell Building
Mortgage Property
Take Emergency Loan
Declare Bankruptcy
```

Không nhất thiết cần confirmation cho:

```txt
Pay Debt
Unmortgage nếu UI đã rõ
Repay Loan nếu UI đã rõ
```

---

## 21. Testing Requirements

## 21.1 Sell Building Tests

```txt
Given property has buildingLevel 2
When player sells one building
Then buildingLevel becomes 1
And player receives 50% buildCost
```

```txt
Given group levels [2,2,1]
When selling from a level 2 property
Then result [1,2,1] is valid only if even-selling rule allows it
```

## 21.2 Mortgage Tests

```txt
Given property has no building and is owned by player
When player mortgages it
Then player receives mortgageValue
And property.isMortgaged becomes true
```

```txt
Given property is mortgaged
When another player lands on it
Then no rent is charged
```

```txt
Given group has buildings
When player attempts to mortgage one property in the group
Then action is rejected
```

## 21.3 Unmortgage Tests

```txt
Given mortgageValue = 100
When player unmortgages at 10% interest
Then player pays 110
And property.isMortgaged becomes false
```

```txt
Given player cash is less than unmortgageCost
When player attempts unmortgage
Then action is rejected
```

## 21.4 Emergency Loan Tests

```txt
Given emergency loan is disabled
When player is in Debt Resolution
Then Take Loan is unavailable
```

```txt
Given player has no open loan and emergency loan is enabled
When player takes loan principal 200
Then player cash increases by 200
And open loan amountDue is 220
```

```txt
Given player already has open loan
When player attempts another emergency loan
Then action is rejected
```

## 21.5 Debt Resolution Tests

```txt
Given player has cash 100 and owes 300
When payment is requested
Then DebtState is created
And phase becomes DEBT_RESOLUTION
```

```txt
Given player in Debt Resolution raises enough cash
When Pay Debt is clicked
Then debt is paid
And DebtState is cleared
```

```txt
Given player cannot raise enough cash
When Declare Bankruptcy is confirmed
Then bankruptcy resolution runs
```

## 21.6 Bankruptcy Tests

```txt
Given player bankrupts owing bank
Then all properties become unowned
And buildings reset
And player is removed from turn order
```

```txt
Given player bankrupts owing another player
Then cash goes to creditor
And unmortgaged properties transfer to creditor
And mortgaged properties return to bank
```

```txt
Given only one active player remains
When bankruptcy resolution completes
Then game phase becomes GAME_OVER
```

---

## 22. Acceptance Criteria

Economy & Debt MVP được xem là đạt khi:

```txt
1. Payment không bao giờ làm cash âm.
2. Thiếu tiền luôn tạo DebtState.
3. Debt Resolution xuất hiện trước bankruptcy.
4. Player có thể bán công trình hợp lệ.
5. Sell value = 50% build cost.
6. Player có thể thế chấp property hợp lệ.
7. Mortgaged property không thu rent.
8. Player có thể gỡ thế chấp.
9. Unmortgage cost = mortgageValue + 10% interest.
10. Emergency Loan hoạt động nếu rule bật.
11. Player không thể lấy nhiều hơn 1 open loan.
12. Player không thể build khi có open loan nếu rule này bật.
13. Bankruptcy owing bank xử lý đúng.
14. Bankruptcy owing player xử lý đúng.
15. Bankrupt player bị remove khỏi turn order.
16. Game over khi chỉ còn 1 active player.
17. Save/load khôi phục đúng DebtState nếu đang nợ.
18. Không có flow làm kẹt lượt trong Debt Resolution.
```

---

## 23. Balance Knobs

Các giá trị có thể chỉnh khi playtest:

```txt
Starting cash
Pass Start bonus
Property prices
Rent table
Build cost
Sell building rate
Mortgage value
Unmortgage interest
Tax amount
Card payment amount
Jail fine
Emergency loan max
Emergency loan interest
Loan restrictions
```

Không nên chỉnh quá nhiều biến cùng lúc.

Playtest nên ghi lại:

```txt
Người chơi phá sản quá sớm không?
Mortgage có bị lạm dụng không?
Building có quá mạnh không?
Emergency Loan có kéo game quá dài không?
Debt Resolution có xảy ra quá thường xuyên không?
Người chơi có hiểu vì sao property không thu rent khi mortgaged không?
```

---

## 24. Recommended Defaults for First Playtest

Để playtest đầu tiên, đề xuất:

```txt
Sell building rate: 50%
Mortgage value: 50% property price hoặc data value tương đương
Unmortgage interest: 10%
Emergency Loan: disabled by default
Loan preset: Tycoon Friendly only
Max open loan: 1
Build while loan open: disabled
Trade in Debt Resolution: disabled
Auction: disabled
Mortgaged property rent: 0
Group build blocked if any property mortgaged: yes
Full-set bonus blocked if any property mortgaged: yes
```

Lý do:

```txt
Giảm biến số.
Giữ mortgage là công cụ tài chính chính.
Giữ Emergency Loan như một rule thử nghiệm, không phải core balance ban đầu.
```

---

## 25. Open Questions

Các câu hỏi cần chốt sau khi playtest hoặc trước khi implement production:

```txt
1. Starting cash là bao nhiêu?
2. Pass Start bonus là bao nhiêu?
3. Mortgage value có luôn bằng 50% price không, hay config từng property?
4. Sell building có luôn là 50% build cost không?
5. Interest khi unmortgage có luôn là 10% không?
6. Có cho unmortgage trong Debt Resolution không?
7. Emergency Loan có nằm trong MVP bắt buộc hay stretch?
8. Emergency Loan có bật mặc định không?
9. Loan max dùng fixed cap hay dựa trên net worth?
10. Có cho mua property mới khi còn open loan không?
11. Có cho gỡ thế chấp khi còn open loan không?
12. Khi bankrupt owing player, có reset building trước khi transfer không?
13. Mortgaged property khi bankrupt owing player có nên về bank hay chuyển cho creditor?
14. Có cho player declare bankruptcy dù vẫn có thể raise đủ tiền không?
15. Có cần surrender option ngoài Debt Resolution không?
16. Game log lưu toàn bộ economy action hay chỉ N action gần nhất?
```

---

## 26. Summary

Economy MVP của Property Tycoon Web được xây quanh nguyên tắc:

```txt
Thiếu tiền không phá sản ngay.
Người chơi được vào Debt Resolution.
Người chơi có thể bán công trình.
Người chơi có thể thế chấp tài sản.
Người chơi có thể vay khẩn cấp nếu rule bật.
Nếu vẫn không thể trả nợ, người chơi mới phá sản.
```

Các rule chốt quan trọng:

```txt
Sell value = 50% build cost
Mortgage value = data-driven, default khoảng 50% property price
Mortgaged property không thu rent
Unmortgage cost = mortgageValue + 10% interest
Emergency Loan = optional
Debt Resolution = bắt buộc trước bankruptcy
Trade tự do = không có trong MVP
Auction = không có trong MVP
```

Tài liệu này là source of truth cho toàn bộ logic tiền, nợ, thế chấp và phá sản trong MVP.

[1]: https://www.asmodee.co.uk/blogs/news/monopoly-rules "Monopoly Rules | Asmodee UK"
[2]: https://entertainment.howstuffworks.com/leisure/brain-games/monopoly2.htm "Monopoly Rules - How Monopoly Works | HowStuffWorks"
