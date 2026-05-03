# Property Tycoon Web — Overview

**Document:** `00-overview.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này là điểm bắt đầu cho toàn bộ bộ tài liệu thiết kế của **Property Tycoon Web**.

Mục tiêu của file này là giúp người đọc nhanh chóng hiểu:

- Game này là gì.
- MVP đang nhắm tới phạm vi nào.
- Các quyết định thiết kế lớn đã được chốt.
- Những gì chắc chắn chưa làm trong MVP.
- Nên đọc file nào tiếp theo nếu muốn đi sâu vào gameplay, board, economy, UI, technical design hoặc backlog.

File này không đi quá sâu vào từng rule chi tiết. Các phần chi tiết được tách sang các tài liệu chuyên biệt để dễ bảo trì.

---

## 2. Product One-Liner

**Property Tycoon Web** là một game board bất động sản chơi trên browser, hỗ trợ 2–6 người chơi thay phiên nhau trên cùng một máy, tập trung vào mua tài sản, thu tiền thuê, xây công trình, quản lý nợ, thế chấp tài sản và loại đối thủ khỏi cuộc chơi bằng sức mạnh tài chính.

---

## 3. Product Vision

Property Tycoon Web lấy cảm hứng từ dòng game property-trading cổ điển, nhưng không clone nội dung, tên gọi, thiết kế, board layout, icons, cards, property names hoặc artwork của bất kỳ game thương mại nào.

Game hướng tới trải nghiệm:

```txt
Dễ bắt đầu
→ Có cảm giác quen thuộc với người thích board game bất động sản
→ Có đủ chiều sâu tài chính để tạo drama
→ Chơi được local trên browser
→ Không cần backend, không cần đăng nhập
→ Có hoạt ảnh 2D chất lượng cao làm tăng cảm giác chơi
````

MVP được định hướng là một bản **Ambitious MVP 2D thuần**: chưa online, chưa AI, chưa trade tự do giữa người chơi; nhưng có thêm lớp tài chính nâng cao như bán nhà, thế chấp, gỡ thế chấp, lãi suất và Debt Resolution. Đặc biệt, MVP ưu tiên hoạt ảnh 2D/2.5D chất lượng cao (high-quality 2D animations) với các hiệu ứng đặc biệt cho xúc xắc, di chuyển token và tương tác UI để tăng cảm giác hồi hộp và thỏa mãn khi chơi. Mục tiêu "hoạt ảnh 2D/2.5D chất lượng cao" này được hiện thực hóa nhờ sức mạnh của game engine **Phaser**, đảm nhận toàn bộ việc render môi trường game (board, token, dice) trên Canvas/WebGL.

---

## 4. Core Gameplay Loop

Gameplay loop chính:

```txt
Tung xúc xắc
→ Di chuyển token
→ Resolve ô đang đứng
→ Mua tài sản / trả thuê / rút thẻ / trả thuế / vào tù / nghỉ
→ Quản lý tài sản và công trình
→ Xử lý nợ nếu thiếu tiền
→ Bán nhà / thế chấp / vay khẩn cấp nếu cần
→ Phá sản nếu không thể trả nợ
→ Chuyển lượt
→ Xác định người thắng khi chỉ còn 1 người chưa phá sản
```

Game cần đảm bảo một ván có thể chơi từ đầu tới cuối mà không cần debug console, không bị kẹt lượt và không cần người chơi tự tính toán ngoài UI.

---

## 5. MVP Summary

```txt
Mode: Local multiplayer, same device
Players: 2–6
Platform: Browser desktop
Rendering: 2D/2.5D
Board size: 40 ô
Backend: Không
Account/Login: Không
Online multiplayer: Không
Save: Local browser save
Core rules: dice, movement, property purchase, rent, tax, cards, jail, building, bankruptcy
Advanced finance: sell building, mortgage, unmortgage, fixed interest, debt resolution
Optional rule: emergency bank loan
Excluded from MVP: 3D, online multiplayer, AI bot, free player-to-player trade, auction, custom board editor
```

MVP không phải là bản đơn giản tối thiểu nhất. MVP ở đây được hiểu là bản đầu tiên đủ hoàn chỉnh để chơi vui, có chiều sâu tài chính, có save/load local và có UI đủ rõ.

---

## 6. Target Experience

Người chơi nên cảm nhận game như sau:

```txt
Tôi có thể tạo một ván nhanh trên browser.
Tôi có thể chơi cùng bạn bè trên cùng một máy.
Tôi hiểu rõ lượt hiện tại cần làm gì.
Tôi có thể mua đất, xây công trình và thu rent.
Khi thiếu tiền, tôi không phá sản ngay mà có cơ hội xoay sở.
Tôi có thể bán công trình, thế chấp tài sản hoặc vay khẩn cấp nếu rule bật.
Tôi thắng khi quản lý tài sản và dòng tiền tốt hơn người khác.
```

MVP cần vừa rõ ràng, ổn định, dễ chơi mà vừa có hoạt ảnh chất lượng cao làm điểm nhấn (đặc biệt là khi tung xúc xắc và di chuyển token) để tăng độ thỏa mãn khi chơi.

---

## 7. Key Design Decisions

Các quyết định lớn đã được chốt:

```txt
Decision 1: MVP dùng board 40 ô, không dùng board 32 ô.
Decision 2: MVP chạy trên browser desktop.
Decision 3: MVP là local same-device multiplayer.
Decision 4: MVP hỗ trợ 2–6 người chơi.
Decision 5: MVP dùng 2D/2.5D, chưa làm 3D.
Decision 6: MVP không cần backend.
Decision 7: MVP không cần login/account.
Decision 8: MVP không có online multiplayer.
Decision 9: MVP có save/load local.
Decision 10: MVP có mortgage và sell building.
Decision 11: MVP có unmortgage với fixed interest.
Decision 12: MVP có Debt Resolution trước khi phá sản.
Decision 13: Emergency Loan là optional rule preset.
Decision 14: MVP không có trade tự do giữa người chơi.
Decision 15: MVP không có auction.
Decision 16: Game logic phải tách khỏi render layer.
Decision 17: Không clone nội dung, tên, thiết kế, icon, card, property hoặc board của Monopoly.
```

---

## 8. Why 40 Tiles?

Board 32 ô bị xem là quá nhỏ cho định hướng game này vì:

* Vòng chơi quá nhanh.
* Không đủ không gian cho nhiều nhóm tài sản.
* Khó tạo cảm giác tăng tiến từ khu rẻ tới khu đắt.
* Ít chỗ cho trạm, tiện ích, thuế, card, tù và ô nghỉ.
* Game dễ bị ngắn và thiếu cảm giác “đã”.

MVP chốt **40 ô** để có pacing tốt hơn và đủ không gian cho gameplay property-trading đầy đủ.

Board lớn hơn 40 ô có thể được thử nghiệm sau, nhưng không nên là mặc định trong MVP vì sẽ làm tăng độ khó balance, UI và thời lượng ván.

---

## 9. High-Level Board Composition

Board 40 ô đề xuất:

| Tile Type           | Quantity | Purpose                                      |
| ------------------- | -------: | -------------------------------------------- |
| Xuất Phát           |        1 | Nhận tiền khi đi qua                         |
| Đất thường          |       22 | Mua, thu rent, xây công trình                |
| Nhà ga / Trạm       |        4 | Tài sản đặc biệt, rent theo số trạm cùng chủ |
| Tiện ích            |        2 | Rent phụ thuộc xúc xắc                       |
| Cơ Hội              |        3 | Rút thẻ biến cố mạnh                         |
| Khí Vận             |        3 | Rút thẻ biến cố nhẹ/đời thường               |
| Thuế / Phí          |        2 | Trả tiền cho ngân hàng                       |
| Trại Giam / Thăm tù |        1 | Vị trí tù và ô thăm tù                       |
| Đi Tù               |        1 | Di chuyển thẳng tới Trại Giam                |
| Bãi Đỗ Xe / Nghỉ    |        1 | Ô an toàn, không làm gì                      |
| **Total**           |   **40** |                                              |

Chi tiết board, nhóm màu, vị trí từng ô và pacing được mô tả trong:

```txt
03-board-design.md
```

---

## 10. Economy Direction

Điểm khác biệt quan trọng của MVP này là có lớp tài chính nâng cao.

MVP không chỉ có:

```txt
Mua đất
→ Thu rent
→ Hết tiền
→ Phá sản
```

Mà có thêm:

```txt
Thiếu tiền
→ Debt Resolution
→ Bán công trình
→ Thế chấp tài sản
→ Vay khẩn cấp nếu rule bật
→ Trả nợ nếu đủ tiền
→ Chỉ phá sản nếu không thể xoay sở
```

Các cơ chế tài chính chính:

| Mechanic           | MVP Status | Note                                            |
| ------------------ | ---------: | ----------------------------------------------- |
| Bán nhà/công trình |         Có | Bán lại cho ngân hàng, nhận một phần build cost |
| Thế chấp tài sản   |         Có | Nhận tiền từ ngân hàng, tài sản không thu rent  |
| Gỡ thế chấp        |         Có | Trả mortgage value + lãi cố định                |
| Lãi suất           |         Có | Fixed interest, đề xuất 10%                     |
| Debt Resolution    |         Có | Phase bắt buộc trước phá sản                    |
| Emergency Loan     |   Optional | Bật/tắt theo rule preset                        |
| Trade tự do        |      Không | Để phase sau                                    |
| Auction            |      Không | Để phase sau                                    |

Chi tiết economy, mortgage, loan và Debt Resolution được mô tả trong:

```txt
04-economy-and-debt.md
```

---

## 11. Player-to-Player Trade Decision

MVP **không có giao dịch tự do giữa người chơi**.

Không có:

```txt
Đổi đất lấy đất
Đổi đất lấy tiền
Đổi đất + tiền
Đổi thẻ ra tù
Thương lượng rent
Cho vay giữa người chơi
Bảo lãnh giữa người chơi
```

Lý do:

* Trade làm tăng mạnh độ phức tạp UI.
* Cần xác nhận từ hai bên.
* Dễ gây trạng thái kẹt lượt.
* Làm Debt Resolution phức tạp hơn nhiều.
* Cần nhiều rule phụ để tránh exploit.

MVP vẫn có chiều sâu tài chính thông qua giao dịch với ngân hàng: bán nhà, thế chấp, gỡ thế chấp và vay khẩn cấp nếu rule bật.

---

## 12. Technical Direction

MVP chạy hoàn toàn trên client.

Stack đề xuất:

```txt
Frontend: Vite + React + TypeScript
State: Zustand hoặc Redux Toolkit
Game Rendering: Phaser (WebGL/Canvas) — cho Board, Token, Dice
UI Layer: React DOM — cho Modal, Menu, Panel
Styling: Tailwind CSS hoặc CSS Modules
Testing: Vitest + Playwright
Storage MVP: localStorage
Storage later: IndexedDB nếu cần nhiều save slot hoặc dữ liệu lớn
Backend: none for MVP
```

Kiến trúc là **Hybrid**: game logic thuần TypeScript, UI Modal/Menu bằng React DOM, và toàn bộ môi trường game (Board, Token, Dice) do Phaser (WebGL/Canvas) đảm nhận.

Nguyên tắc kỹ thuật quan trọng nhất:

```txt
Game logic phải tách khỏi render layer.
```

Cấu trúc mong muốn:

```txt
/game-engine
  actions/
  rules/
  reducers/
  selectors/
  data/
  tests/

/ui
  phaser/        ← Phaser scenes, sprites, camera controllers
  panels/
  modals/
  animation/
```

Lý do:

* Dễ test rule bằng unit test.
* Dễ debug game state.
* Dễ thay UI sau này.
* Có thể thêm hoạt ảnh phức tạp hơn mà không viết lại toàn bộ logic.
* Có thể thêm online multiplayer sau này bằng cách reuse game engine.

Chi tiết technical design được mô tả trong:

```txt
06-technical-design.md
```

---

## 13. Save / Load Direction

MVP có save/load local trong browser.

Yêu cầu chính:

```txt
Có thể save game đang chơi.
Có thể load game từ Main Menu.
Có auto-save sau mỗi lượt.
Có reset save.
Một save slot là đủ cho MVP.
```

Save state cần lưu đủ để khôi phục ván chính xác, gồm:

```txt
version
savedAt
rulePreset
boardId
players
currentPlayerId
turnNumber
phase
dice state
board state
property ownership
building levels
mortgage states
loan states
jail states
card deck order
held card state
game log
pending debt state nếu đang ở Debt Resolution
```

MVP có thể dùng `localStorage` vì game state chủ yếu là JSON nhỏ. Nếu sau này có nhiều save slot, replay log dài, custom board hoặc dữ liệu lớn hơn, cân nhắc chuyển sang IndexedDB.

---

## 14. UX Direction

MVP cần rõ ràng hơn là đẹp phức tạp.

Người chơi luôn cần biết:

```txt
Đang tới lượt ai?
Đang ở phase nào?
Có thể bấm nút gì?
Vì sao phải trả tiền?
Còn thiếu bao nhiêu tiền?
Có thể bán/thế chấp gì để trả nợ?
Khi nào lượt kết thúc?
Ai đang dẫn trước?
Ai đã phá sản?
```

MVP screens:

```txt
Main Menu
Setup Game
Game Screen
Pause Menu
End Game
```

Các modal quan trọng:

```txt
Buy Property Modal
Property Info Modal
Card Draw Modal
Rent/Payment Modal
Jail Modal
Building Management Modal
Mortgage Management Modal
Debt Resolution Modal
Loan Modal nếu rule bật
```

Chi tiết UI/UX được mô tả trong:

```txt
05-ui-ux-scope.md
```

---

## 15. MVP Success Definition

MVP được xem là thành công khi:

```txt
1. Tạo được game 2–6 người chơi.
2. Board 40 ô render rõ trên desktop browser.
3. Người chơi thay phiên theo lượt.
4. Dice, movement và pass-start bonus hoạt động đúng.
5. Người chơi có thể mua tài sản chưa có chủ.
6. Người chơi phải trả rent khi vào tài sản của người khác.
7. Rent phản ánh ownership, group, building level và mortgage state.
8. Cơ Hội và Khí Vận hoạt động.
9. Jail hoạt động.
10. Building system hoạt động.
11. Sell building hoạt động.
12. Mortgage và unmortgage hoạt động.
13. Fixed interest hoạt động.
14. Debt Resolution chạy trước bankruptcy.
15. Emergency Loan hoạt động nếu rule preset bật.
16. Bankruptcy xử lý đúng.
17. Game xác định winner.
18. Save/load khôi phục được game state.
19. UI đủ rõ để chơi không cần debug console.
20. Không có lỗi làm kẹt lượt chơi.
```

Chi tiết acceptance criteria và test cases được mô tả trong:

```txt
07-testing-and-acceptance.md
```

---

## 16. MVP Out of Scope

Các mục sau không làm trong MVP:

```txt
Online multiplayer
AI bot
3D board
Trade tự do giữa người chơi
Auction
Custom board editor
Multiple themes
Mobile-first UI
Cloud save
Login/account
Leaderboard
Chat
Replay viewer
Anti-cheat
Dice physics thật
Compound interest phức tạp
Negotiation UI
Player-to-player lending
Bail negotiation
```

Các mục này có thể được xem xét trong phase sau.

---

## 17. Phase Direction

Roadmap cấp cao:

```txt
Phase 1 — Core Playable
- Board 40 ô
- 2–6 players
- Dice
- Movement
- Buy property
- Rent
- Tax
- Cards
- Jail
- Basic bankruptcy
- Winner

Phase 2 — Ambitious MVP Finance
- Sell building
- Mortgage
- Unmortgage + fixed interest
- Debt Resolution
- Emergency Loan optional
- Advanced bankruptcy resolution

Phase 3 — MVP Polish
- Token animation
- Dice animation
- Card reveal
- Game log
- Save/load
- Sound cơ bản
- UI polish
- End game stats

Phase 4 — Advanced Rules
- Trade tự do
- Auction
- Quick mode
- Rule presets nâng cao
- Multiple save slots

Phase 5 — Advanced 2D Polish & Juicy Animations
- Particle effects (xúc xắc, token di chuyển)
- Sprite sheet animation cho xúc xắc
- Token hop/bounce với easing
- Trail effect khi token chạy nhanh
- Glow effect cho building và mortgaged property
- Card reveal animation
- Sound effects nâng cao
- Visual feedback cho mỗi hành động

Phase 6 — Online Multiplayer
- Lobby
- Room code
- Turn sync
- Reconnect
- Server-authoritative game state
- Optional chat
```

Chi tiết roadmap và backlog được mô tả trong:

```txt
08-roadmap-and-backlog.md
```

---

## 18. Documentation Map

Bộ tài liệu nên được chia như sau:

```txt
docs/
  README.md
  00-overview.md
  01-product-scope.md
  02-gameplay-rules.md
  03-board-design.md
  04-economy-and-debt.md
  05-ui-ux-scope.md
  06-technical-design.md
  07-testing-and-acceptance.md
  08-roadmap-and-backlog.md
```

Vai trò từng file:

| File                           | Purpose                                            |
| ------------------------------ | -------------------------------------------------- |
| `README.md`                    | Mục lục tài liệu                                   |
| `00-overview.md`               | Tổng quan project và quyết định lớn                |
| `01-product-scope.md`          | Phạm vi MVP, in scope, out of scope                |
| `02-gameplay-rules.md`         | Luật chơi lõi                                      |
| `03-board-design.md`           | Thiết kế board 40 ô                                |
| `04-economy-and-debt.md`       | Mortgage, loan, lãi suất, Debt Resolution          |
| `05-ui-ux-scope.md`            | Screen, panel, modal, animation, audio             |
| `06-technical-design.md`       | Architecture, state machine, data model, save/load |
| `07-testing-and-acceptance.md` | Test cases và MVP success criteria                 |
| `08-roadmap-and-backlog.md`    | Phase plan, epics, backlog, open questions         |

---

## 19. Important IP Note

Property Tycoon Web không được sử dụng:

```txt
Tên Monopoly
Logo Monopoly
Board layout y hệt Monopoly
Property names của Monopoly
Card text của Monopoly
Icons/token đặc trưng của Monopoly
Artwork hoặc visual identity của Monopoly
Format hoặc design gây nhầm lẫn với Monopoly
```

Project nên tự xây:

```txt
Tên game riêng
Theme riêng
Tên ô riêng
Nhóm màu riêng
Card text riêng
Visual style riêng
Icon/token riêng
Economy values riêng
Board layout đủ khác biệt
```

Mục tiêu là tạo một game property-trading nguyên bản, không phải bản sao của một IP thương mại.

---

## 20. Open Questions

Các câu hỏi cần chốt trong các tài liệu tiếp theo:

```txt
1. Tên chính thức có giữ là Property Tycoon Web không?
2. Theme chính là gì: modern city, fantasy, cyberpunk, Việt Nam hóa, hay generic?
3. Starting cash là bao nhiêu?
4. Pass Start bonus là bao nhiêu?
5. Tax là flat fee hay theo phần trăm tài sản?
6. Rent dùng bảng cố định hay công thức?
7. Mortgage value là 50% price hay cấu hình riêng từng tài sản?
8. Emergency Loan mặc định bật hay tắt?
9. Có cho mua tài sản mới khi còn loan chưa trả không?
10. Có bắt xây đều/bán đều trong nhóm màu không?
11. Khách sạn là level 5 hay một loại building riêng?
12. Mortgaged property khi phá sản vì nợ player sẽ reset về bank hay chuyển cho creditor kèm phí?
13. Có cần Quick Game trong MVP không?
14. Save/load cần một slot hay nhiều slot?
15. Game log lưu bao nhiêu sự kiện gần nhất?
```

---

## 21. Short Summary

Property Tycoon Web MVP là một game property-trading local trên browser với board 40 ô, 2–6 người chơi, render 2D/2.5D, không backend, không online và không trade tự do.

Điểm khác biệt lớn của MVP là có lớp tài chính nâng cao:

```txt
Bán công trình
Thế chấp tài sản
Gỡ thế chấp với lãi cố định
Debt Resolution trước phá sản
Emergency Loan optional
```

Mục tiêu là tạo một bản game chơi được từ đầu tới cuối, đủ rõ ràng, đủ chiều sâu, có save/load local và có nền tảng kỹ thuật tốt để sau này mở rộng lên advanced rules, 3D hoặc online multiplayer.
