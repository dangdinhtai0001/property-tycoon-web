# Property Tycoon Web — Product Scope

**Document:** `01-product-scope.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa phạm vi sản phẩm cho **Property Tycoon Web MVP**.

Mục tiêu chính của file này là trả lời rõ:

```txt
MVP có gì?
MVP không có gì?
Đâu là phạm vi bắt buộc?
Đâu là phạm vi optional?
Đâu là những thứ để phase sau?
Những quyết định scope nào đã được chốt?
Những câu hỏi scope nào còn mở?
````

Tài liệu này không mô tả chi tiết từng rule gameplay, economy formula, UI flow hoặc data model. Các phần đó được tách sang tài liệu riêng.

Các file liên quan:

```txt
00-overview.md
02-gameplay-rules.md
03-board-design.md
04-economy-and-debt.md
05-ui-ux-scope.md
06-technical-design.md
07-testing-and-acceptance.md
08-roadmap-and-backlog.md
```

---

## 2. Product Vision

**Property Tycoon Web** là một game board bất động sản chơi trên browser, hỗ trợ nhiều người chơi thay phiên nhau trên cùng một máy.

Game lấy cảm hứng từ dòng game property-trading cổ điển, nhưng phải có nhận diện riêng:

```txt
Tên riêng
Theme riêng
Board layout riêng
Tên ô riêng
Card text riêng
Icon/token riêng
Visual style riêng
Economy values riêng
Rule tuning riêng
```

Mục tiêu không phải clone một game có sẵn, mà là tạo một game property-trading nguyên bản, dễ chơi trên browser, có đủ chiều sâu tài chính và có nền tảng kỹ thuật đủ sạch để mở rộng sau này.

MVP được định hướng là **Ambitious MVP**:

```txt
Không tham 3D sớm
Không làm online multiplayer sớm
Không làm AI bot sớm
Không làm trade tự do giữa người chơi trong MVP
Nhưng có board 40 ô và hệ thống tài chính nâng cao
```

Điểm khác biệt lớn của MVP là người chơi không phá sản ngay khi thiếu tiền. Thay vào đó, game có **Debt Resolution** để người chơi có thể bán công trình, thế chấp tài sản, gỡ nợ hoặc dùng emergency loan nếu rule preset cho phép.

---

## 3. Product Goals

## 3.1 Primary Goals

MVP cần đạt các mục tiêu sau:

```txt
1. Chơi được một ván từ đầu tới cuối trên browser.
2. Hỗ trợ 2–6 người chơi trên cùng một máy.
3. Có board 40 ô đủ rõ và đủ lớn để tạo cảm giác board game đầy đủ.
4. Có gameplay loop property-trading hoàn chỉnh.
5. Có hệ thống mua tài sản, thu rent, xây công trình và phá sản.
6. Có hệ thống tài chính nâng cao: bán công trình, thế chấp, gỡ thế chấp, lãi suất, Debt Resolution.
7. Có save/load local.
8. Có UI đủ rõ để chơi không cần debug console.
9. Không có lỗi làm kẹt lượt chơi.
10. Tách game logic khỏi render layer để có thể mở rộng sau này.
```

## 3.2 Secondary Goals

Các mục tiêu phụ, nên có nếu không làm chậm core MVP quá nhiều:

```txt
1. Animation cơ bản cho dice, token, card và money changes.
2. Sound effect cơ bản.
3. Game log.
4. End game stats đơn giản.
5. Rule preset cơ bản.
6. Emergency Loan optional.
```

## 3.3 Non-Goals for MVP

MVP không nhằm chứng minh:

```txt
Online multiplayer
3D graphics
AI bot
Mobile-first experience
Trade tự do giữa người chơi
Auction system
Cloud save
Account system
Competitive/ranked mode
```

Những phần này chỉ xem xét sau khi game local 2D/2.5D chạy ổn.

---

## 4. MVP Scope Summary

```txt
Mode: Local multiplayer, same device
Players: 2–6
Platform: Browser desktop
Rendering: 2D/2.5D
Board size: 40 ô
Backend: Không
Database server: Không
Login/account: Không
Online multiplayer: Không
Save: Local browser save
Core loop: Dice → Move → Resolve Tile → Manage Money/Assets → End Turn
Core rules: Buy property, rent, tax, cards, jail, building, bankruptcy
Advanced finance: Sell building, mortgage, unmortgage, fixed interest, Debt Resolution
Optional finance: Emergency Bank Loan
MVP excludes: 3D, online, AI, trade tự do, auction, mobile-first, cloud save
```

---

## 5. MVP In Scope

Các hạng mục sau nằm trong phạm vi MVP.

---

## 5.1 Local Same-Device Multiplayer

Game hỗ trợ nhiều người chơi trên cùng một máy.

In scope:

```txt
2–6 người chơi
Mỗi người chơi có tên riêng
Mỗi người chơi có màu/token riêng
Người chơi thay phiên theo lượt
Tất cả input được thực hiện trên cùng một browser
Không cần login
Không cần tạo phòng
Không cần kết nối mạng
```

Out of scope trong phần này:

```txt
Online room
Invite link
Remote player
Spectator
Reconnect
Server sync
Anti-cheat
```

---

## 5.2 Browser Desktop Platform

MVP chạy trên browser desktop.

In scope:

```txt
Chrome-like modern browser
Desktop/laptop viewport
Mouse-first interaction
Keyboard support cơ bản nếu tiện
Responsive vừa đủ để không vỡ layout ở màn hình phổ biến
```

Out of scope:

```txt
Mobile-first UI
Touch-first control
Native mobile app
Desktop native app
Tablet-specific layout
Console/TV layout
```

Ghi chú: Game không cần tối ưu mobile trong MVP, nhưng code UI không nên tự khóa hoàn toàn khả năng responsive sau này.

---

## 5.3 Board 40 Tiles

MVP dùng board 40 ô cố định.

In scope:

```txt
Board 40 ô
1 ô Xuất Phát
22 đất thường
4 nhà ga / trạm
2 tiện ích
3 ô Cơ Hội
3 ô Khí Vận
2 ô Thuế / Phí
1 ô Trại Giam / Thăm tù
1 ô Đi Tù
1 ô Bãi Đỗ Xe / Nghỉ
```

Out of scope:

```txt
Board 32 ô
Board 48+ ô
Board random
Board editor
Multiple board maps
Custom map
Branching paths
Multiple routes
```

Lý do chốt 40 ô:

```txt
Board 32 ô bị xem là quá nhỏ.
40 ô đủ không gian cho property groups, trạm, tiện ích, card, tax, jail và rest tile.
40 ô giúp pacing tốt hơn và tạo cảm giác board game đầy đủ hơn.
```

Chi tiết nằm trong:

```txt
03-board-design.md
```

---

## 5.4 Core Gameplay Rules

MVP cần có game loop chơi được từ đầu tới cuối.

In scope:

```txt
Tung 2 xúc xắc
Di chuyển quanh board theo một chiều cố định
Nhận tiền khi đi qua Xuất Phát
Resolve ô khi dừng lại
Mua tài sản chưa có chủ
Trả rent khi vào tài sản của người khác
Trả tax/fee cho ngân hàng
Rút thẻ Cơ Hội
Rút thẻ Khí Vận
Vào tù
Ra tù
Xây công trình
Phá sản
Xác định người thắng
```

Out of scope:

```txt
Dice đặc biệt
Chọn hướng đi
Nhánh rẽ
Mini-game
Rule biến thể phức tạp
Negotiation
Auction
```

Chi tiết nằm trong:

```txt
02-gameplay-rules.md
```

---

## 5.5 Property Ownership

MVP cần có hệ thống tài sản rõ ràng.

In scope:

```txt
Tài sản có thể chưa có chủ
Tài sản có thể thuộc về một người chơi
Tài sản có giá mua
Tài sản có rent
Tài sản có group/color set nếu là đất thường
Tài sản có trạng thái thế chấp hoặc không thế chấp
Tài sản có thể có building level nếu là đất thường
```

Các loại tài sản trong MVP:

```txt
Đất thường
Nhà ga / Trạm
Tiện ích
```

Out of scope:

```txt
Tài sản đồng sở hữu
Tài sản có nhiều owner
Tài sản thuê tạm thời
Tài sản có effect riêng theo lượt
Custom property do người chơi tạo
```

---

## 5.6 Building System

MVP có hệ thống xây công trình trên đất thường.

In scope:

```txt
Người chơi có thể xây khi sở hữu đủ bộ màu
Mỗi ô đất thường có building level
Building level làm tăng rent
Có cấp tối đa
Có thể bán công trình cho ngân hàng
Có thể reset công trình khi phá sản
```

Building level đề xuất:

```txt
0 = đất trống
1 = nhà cấp 1
2 = nhà cấp 2
3 = nhà cấp 3
4 = nhà cấp 4
5 = khách sạn / công trình cấp cao nhất
```

Out of scope:

```txt
Nhiều loại công trình khác nhau
Công trình có skill riêng
Công trình tạo tài nguyên phụ
Upgrade trạm/tiện ích
Building placement tự do trên map
3D building
```

---

## 5.7 Advanced Finance

MVP mới có lớp tài chính nâng cao.

In scope:

```txt
Bán công trình để lấy tiền
Thế chấp tài sản
Gỡ thế chấp
Lãi suất cố định khi gỡ thế chấp
Debt Resolution trước khi phá sản
Emergency Loan optional theo rule preset
```

Không có trade tự do giữa người chơi trong MVP.

Điều này nghĩa là người chơi có thể xoay sở tài chính thông qua ngân hàng, nhưng không thể tự do thương lượng hoặc trao đổi tài sản với người chơi khác.

Chi tiết nằm trong:

```txt
04-economy-and-debt.md
```

---

## 5.8 Debt Resolution

Debt Resolution là một phase bắt buộc trong MVP.

Trigger:

```txt
Người chơi cần trả tiền nhưng cash hiện tại không đủ.
```

Người chơi có thể xử lý bằng:

```txt
Bán công trình
Thế chấp tài sản hợp lệ
Dùng tiền vừa raise được để trả nợ
Vay khẩn cấp nếu rule preset bật và đủ điều kiện
```

Nếu vẫn không đủ trả nợ:

```txt
Người chơi phá sản.
```

Out of scope:

```txt
Thương lượng giảm nợ
Xin người chơi khác cho vay
Đổi tài sản cho chủ nợ để tránh phá sản
Bảo lãnh
Debt restructuring nhiều lượt
Compound interest phức tạp
```

---

## 5.9 Cards: Cơ Hội & Khí Vận

MVP có 2 deck card.

In scope:

```txt
Deck Cơ Hội
Deck Khí Vận
Shuffle khi bắt đầu game
Rút lá trên cùng
Apply effect
Thẻ thường quay xuống cuối deck
Thẻ đặc biệt có thể được giữ nếu rule cho phép
```

Effect types có thể có:

```txt
Nhận tiền
Mất tiền
Đi tới ô cụ thể
Lùi vài bước
Đi tới trạm gần nhất
Đi tới tiện ích gần nhất
Vào tù
Nhận thẻ ra tù
Trả tiền sửa công trình
Thu tiền từ người chơi khác
```

Out of scope:

```txt
Card combo
Card có nhiều lựa chọn phức tạp
Card tạo rule tạm thời dài hạn
Card trao đổi tài sản
Card animation 3D
Deck builder
Custom cards
```

---

## 5.10 Jail

MVP có hệ thống tù cơ bản.

In scope:

```txt
Vào tù khi dừng ở ô Đi Tù
Vào tù khi rút thẻ tương ứng
Vào tù khi tung đôi 3 lần liên tiếp
Ra tù bằng tiền phạt
Ra tù bằng thẻ ra tù
Ra tù bằng tung đôi
Sau số lượt nhất định thì bắt buộc trả tiền để ra
```

Out of scope:

```txt
Bail negotiation
Người chơi khác bảo lãnh
Jail mini-game
Jail upgrades
Jail trading
```

---

## 5.11 Save / Load Local

MVP có save/load local.

In scope:

```txt
Save game vào browser
Load game từ Main Menu
Auto-save sau mỗi lượt
Reset save
Một save slot là đủ
Lưu version của save file
```

Save data cần đủ để khôi phục:

```txt
Players
Current turn
Current phase
Board state
Property ownership
Building levels
Mortgage states
Loan states
Jail states
Card deck order
Held cards
Game log
Pending debt nếu đang ở Debt Resolution
```

Out of scope:

```txt
Cloud save
Multiple save slots
Cross-device sync
Account-based save
Export/import save file
Replay save
```

---

## 5.12 UI Scope at Product Level

MVP cần UI đủ rõ để chơi.

In scope screens:

```txt
Main Menu
Setup Game
Game Screen
Pause Menu
End Game
```

In scope Game Screen areas:

```txt
Board
Player list
Current turn indicator
Dice area
Action buttons
Property info
Asset list
Game log
```

In scope modals:

```txt
Buy Property Modal
Card Draw Modal
Rent/Payment Modal
Jail Modal
Building Management Modal
Mortgage Management Modal
Debt Resolution Modal
Loan Modal nếu rule bật
```

Out of scope:

```txt
Chat
Emoji/reaction
Replay viewer
Theme editor
Full mobile layout
Advanced accessibility pass
```

Chi tiết nằm trong:

```txt
05-ui-ux-scope.md
```

---

## 5.13 Animation and Audio

MVP có animation chất lượng cao như **một trong những điểm nhấn cốt lõi của UI**, không chỉ là decoration.

In scope animation:

```txt
Dice roll animation với sprite-sheet hoặc vật lý 2D sinh động
Token move không chỉ step-by-step mà có easing và bounce effect
Token nhảy (hop) với momentum khi di chuyển qua nhiều ô
Token có trail effect khi chạy nhanh (do tung xúc xắc được số lớn)
Token xoay nhẹ khi đến góc board
Highlight ô hiện tại với glow effect
Card reveal animation
Money change effect
Modal transition
Property ownership highlight khi mua/thế chấp
Win effect đặc biệt
```

In scope audio:

```txt
Button click
Roll dice
Token move
Buy property
Draw card
Pay money
Mortgage
Sell building
Bankruptcy
Win
```

Out of scope:

```txt
Dice physics thật
Board 3D
Camera cinematic
Character animation
Particle effects phức tạp
Cutscene
Dynamic music
Voiceover
Spatial audio
```

---

## 5.14 Testing and Acceptance

MVP cần có test cho các rule quan trọng.

In scope:

```txt
Unit tests cho game rules
Tests cho movement
Tests cho property purchase
Tests cho rent
Tests cho mortgage
Tests cho Debt Resolution
Tests cho bankruptcy
Tests cho save/load
Một số flow e2e cơ bản
```

Out of scope:

```txt
Load testing
Multiplayer sync testing
Anti-cheat testing
Cross-device cloud testing
Full browser matrix testing
```

Chi tiết nằm trong:

```txt
07-testing-and-acceptance.md
```

---

## 6. Platform Scope

## 6.1 In Scope

```txt
Browser desktop
Local client-side game
No backend
No server database
No login
No online account
Local browser storage
```

MVP có thể chạy như một static web app.

Triển khai có thể là:

```txt
Local dev server khi phát triển
Static hosting khi deploy
Không cần API server
Không cần WebSocket server
Không cần database server
```

## 6.2 Out of Scope

```txt
Online multiplayer backend
Authentication service
Cloud database
Matchmaking server
Real-time room sync
Mobile native app
Desktop native app
```

## 6.3 Platform Assumptions

```txt
Người chơi dùng browser hiện đại.
Người chơi chơi trên laptop/desktop.
Một nhóm người chơi dùng chung một màn hình/máy.
Game không cần hoạt động offline như PWA trong MVP.
Game không cần đồng bộ save giữa thiết bị.
```

---

## 7. Player Scope

## 7.1 Player Count

MVP hỗ trợ:

```txt
Minimum players: 2
Maximum players: 6
```

Không hỗ trợ:

```txt
Solo play
AI filling empty seats
Spectator
Team mode
```

## 7.2 Player Data

Mỗi người chơi có:

```txt
id
name
token/color
cash
position
status
owned properties
jail state
held cards
loan state nếu rule bật
bankruptcy state
```

## 7.3 Player Status

Các trạng thái chính:

```txt
active
jailed
bankrupt
```

Có thể bổ sung trạng thái UI/phụ trong engine:

```txt
resolvingDebt
waitingForAction
```

Nhưng ở product level, chỉ cần 3 trạng thái chính.

## 7.4 Turn Order

In scope:

```txt
Người chơi thay phiên theo thứ tự đã setup.
Người chơi bankrupt bị loại khỏi turn order.
Game kết thúc khi chỉ còn 1 người chưa bankrupt.
```

Out of scope:

```txt
Random turn modifier giữa game
Skip turn effect phức tạp
Team turn
Simultaneous turn
```

---

## 8. Game Modes

## 8.1 MVP Mode — Classic Local

Classic Local là mode chính của MVP.

Scope:

```txt
2–6 người chơi
Cùng một máy
Board 40 ô
Không giới hạn thời gian
Chơi tới khi chỉ còn 1 người chưa phá sản
Có save/load local
```

Classic Local cần là mode được polish tốt nhất.

## 8.2 Rule Presets

MVP có thể có rule preset đơn giản.

Preset đề xuất:

```txt
Classic Strict
Tycoon Friendly
```

### Classic Strict

```txt
Không có Emergency Loan
Có bán công trình
Có thế chấp
Có gỡ thế chấp + lãi cố định
Debt Resolution vẫn hoạt động
```

### Tycoon Friendly

```txt
Có Emergency Loan
Loan giới hạn theo net worth hoặc fixed cap
Loan có lãi cố định
Có thể giúp game ít khắc nghiệt hơn
```

Rule presets là optional trong MVP. Nếu cần giảm scope, có thể hard-code một preset duy nhất trước.

## 8.3 Future Mode — Quick Game

Out of scope cho MVP.

Có thể thêm sau:

```txt
Giới hạn số vòng
Giới hạn thời gian
Winner là người có net worth cao nhất
Tăng tốc income/rent
Board rút gọn hoặc economy nhanh hơn
```

## 8.4 Future Mode — Custom Game

Out of scope cho MVP.

Có thể thêm sau:

```txt
Chọn board
Chọn starting cash
Chọn pass start bonus
Bật/tắt jail
Bật/tắt loan
Bật/tắt auction
Bật/tắt trade
Chọn game length
```

---

## 9. MVP Out of Scope

Các mục sau không làm trong MVP.

## 9.1 Online and Account Features

```txt
Online multiplayer
Lobby
Room code
Invite link
Matchmaking
Reconnect
Account/login
User profile
Friend list
Cloud save
Leaderboard online
Ranked mode
```

## 9.2 AI and Automation

```txt
AI bot
AI advisor
Autoplay
Computer-controlled player
Difficulty levels
Simulation mode cho người chơi thường
```

## 9.3 Advanced Player Interaction

```txt
Trade tự do giữa người chơi
Đổi đất lấy đất
Đổi đất lấy tiền
Đổi đất + tiền
Đổi thẻ ra tù
Cho vay giữa người chơi
Bảo lãnh
Rent negotiation
Debt negotiation
Voting
Alliance/team mode
```

## 9.4 Advanced Economy

```txt
Auction
Dynamic market pricing
Stock market
Compound interest phức tạp
Insurance
Rent insurance
Bankruptcy restructuring nhiều lượt
Property shares
Partial ownership
```

## 9.5 Advanced Board Features

```txt
Board editor
Custom map
Randomized board
Multiple board themes
Branching paths
Teleport network ngoài card
Seasonal board
Map events
```

## 9.6 3D and Advanced Visuals — PERMANENT NON-GOAL

Property Tycoon Web được commit là một **game 2D/2.5D thuần túy**. 3D graphics hoàn toàn KHÔNG phải là hướng đi của project này, không phải "out of scope cho MVP nhưng xem xét sau", mà là **permanent non-goal** cho cả vòng đời dự án.

```txt
3D board
3D token
3D dice physics
Camera follow
Cinematic camera
3D card reveal
3D building
3D assets
Cutscene
Advanced 3D effects
```

Thay vào đó, project ưu tiên hoàn thiện hoạt ảnh 2D/2.5D chất lượng cao với các hiệu ứng như particle effects, sprite animation, easing, trail effects và glow effects để tạo cảm giác "juicy" và thỏa mãn cho game 2D thuần.

## 9.7 Mobile and Accessibility Advanced Scope

```txt
Mobile-first UI
Touch-first UX
Native mobile app
Tablet-specific UI
Full accessibility audit
Screen reader optimized version
High contrast theme system
```

## 9.8 Social and Meta Features

```txt
Chat
Emoji/reaction
Replay viewer
Match history
Achievements
Daily rewards
Cosmetics shop
Unlockable tokens
Progression system
```

---

## 10. Boundaries and Scope Rules

## 10.1 Rule for Adding New Features

Một feature mới chỉ nên thêm vào MVP nếu thỏa ít nhất một điều kiện:

```txt
1. Cần thiết để chơi được một ván từ đầu tới cuối.
2. Cần thiết để tránh kẹt lượt hoặc lỗi logic.
3. Cần thiết để MVP có chiều sâu tài chính như đã định hướng.
4. Cần thiết để người chơi hiểu được game state.
5. Cần thiết để save/load khôi phục ván chính xác.
```

Nếu feature chỉ làm game “đẹp hơn”, “giống board game thật hơn”, hoặc “hay hơn nếu có”, nên đưa sang phase sau.

## 10.2 Scope Priority

Khi có xung đột, ưu tiên theo thứ tự:

```txt
1. Game không kẹt lượt
2. Chơi được từ đầu tới cuối
3. Luật tài chính hoạt động đúng
4. UI rõ ràng
5. Save/load chính xác
6. Animation/audio
7. Polish
```

## 10.3 MVP Cut Rules

Nếu MVP quá lớn, cắt theo thứ tự:

```txt
1. Sound effects
2. Extra animation
3. End game stats chi tiết
4. Multiple rule presets
5. Emergency Loan
6. Một số card effect phức tạp
7. Một số UI polish
```

Không nên cắt:

```txt
Board 40 ô
Core dice/movement
Buy/rent
Building cơ bản
Mortgage
Sell building
Debt Resolution
Bankruptcy
Save/load
```

Vì đây là bản sắc của Ambitious MVP.

---

## 11. IP and Originality Scope

Property Tycoon Web phải là game nguyên bản.

Không được dùng:

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

Cần tự xây:

```txt
Tên game riêng
Theme riêng
World/lore riêng nếu có
Tên khu đất riêng
Tên trạm/tiện ích riêng
Nội dung card riêng
Icon/token riêng
Board visual riêng
Economy tuning riêng
UI style riêng
```

Nguyên tắc:

```txt
Lấy cảm hứng từ genre property-trading.
Không sao chép expression cụ thể của một IP thương mại.
```

---

## 12. Key Design Decisions

Các quyết định scope đã chốt:

```txt
Decision 1: MVP là browser game.
Decision 2: MVP ưu tiên desktop browser.
Decision 3: MVP là local same-device multiplayer.
Decision 4: MVP hỗ trợ 2–6 người chơi.
Decision 5: MVP không cần backend.
Decision 6: MVP không cần account/login.
Decision 7: MVP không có online multiplayer.
Decision 8: MVP dùng board 40 ô.
Decision 9: MVP không dùng board 32 ô.
Decision 10: MVP render 2D/2.5D.
Decision 11: MVP chưa làm 3D.
Decision 12: MVP có save/load local.
Decision 13: MVP có property buying và rent.
Decision 14: MVP có building system.
Decision 15: MVP có sell building.
Decision 16: MVP có mortgage.
Decision 17: MVP có unmortgage + fixed interest.
Decision 18: MVP có Debt Resolution trước bankruptcy.
Decision 19: Emergency Loan là optional rule.
Decision 20: MVP không có trade tự do giữa người chơi.
Decision 21: MVP không có auction.
Decision 22: MVP có Cơ Hội và Khí Vận.
Decision 23: MVP có jail.
Decision 24: MVP có bankruptcy và winner.
Decision 25: MVP phải tránh clone Monopoly hoặc bất kỳ IP thương mại nào.
```

---

## 13. Open Questions Related to Scope

Các câu hỏi sau cần được chốt trước hoặc trong quá trình chuẩn bị backlog.

## 13.1 Product Identity

```txt
1. Tên chính thức có giữ là Property Tycoon Web không?
2. Game dùng tiếng Việt, tiếng Anh, hay song ngữ?
3. Theme chính là gì?
   - Modern city
   - Fantasy kingdom
   - Cyberpunk city
   - Việt Nam hóa
   - Generic business world
4. Tone của game là nghiêm túc, vui nhộn, châm biếm hay casual?
```

## 13.2 MVP Strictness

```txt
1. Emergency Loan có nằm trong MVP bắt buộc không, hay chỉ optional/stretch?
2. Rule presets có cần làm trong MVP không?
3. Nếu không có rule presets, preset mặc định là Classic Strict hay Tycoon Friendly?
4. Có cần Quick Game trong MVP không?
```

## 13.3 Player and Setup

```txt
1. Có cần giới hạn tên người chơi không?
2. Có cần chọn token shape hay chỉ chọn màu?
3. Có cần randomize turn order không?
4. Setup có cần chọn rule preset không?
```

## 13.4 Board Scope

```txt
1. Board 40 ô là cố định tuyệt đối cho MVP hay có thể thử 44 ô?
2. Có cần nhiều board layout trong dev để balance không?
3. Tile names có chốt ngay trong MVP không?
4. Theme board có ảnh hưởng đến card/property text không?
```

## 13.5 Economy Scope

```txt
1. Emergency Loan có được bật mặc định không?
2. Có cho mua tài sản mới khi còn loan chưa trả không?
3. Mortgage value là 50% price hay cấu hình riêng từng tài sản?
4. Interest khi unmortgage có luôn là 10% không?
5. Có cho player trả loan bất kỳ lúc nào không?
6. Debt Resolution có cho người chơi hủy và quay lại action trước đó không?
```

## 13.6 UI Scope

```txt
1. MVP có cần asset/token đẹp ngay không?
2. Có cần sound trong bản MVP đầu tiên không?
3. Game log lưu toàn bộ ván hay chỉ N event gần nhất?
4. Debt Resolution Modal cần mức hướng dẫn chi tiết tới đâu?
5. Có cần tutorial/onboarding không?
```

## 13.7 Save/Load Scope

```txt
1. MVP chỉ có một save slot hay nhiều save slot?
2. Có cần manual save ngoài auto-save không?
3. Có cần cảnh báo khi New Game sẽ overwrite save cũ không?
4. Có cần export/import save file không?
```

---

## 14. Scope Change Policy

Khi muốn thay đổi scope, cần ghi rõ:

```txt
Feature muốn thêm/bớt là gì?
Feature đó thuộc MVP hay phase sau?
Nó ảnh hưởng tới gameplay, UI, data model, save/load hay testing không?
Nó có làm tăng rủi ro kẹt lượt không?
Nó có làm tăng độ khó balance không?
Nó có thể làm sau mà không ảnh hưởng core loop không?
```

Mỗi thay đổi scope nên được phân loại:

```txt
Must-have
Should-have
Could-have
Won't-have for MVP
```

---

## 15. Recommended MVP Scope Lock

Để tránh scope creep, đề xuất chốt MVP như sau:

```txt
Must-have:
- Browser desktop
- Local same-device
- 2–6 players
- Board 40 ô
- Dice + movement
- Buy property
- Rent
- Tax/Fee
- Cơ Hội / Khí Vận
- Jail
- Building
- Sell building
- Mortgage
- Unmortgage + fixed interest
- Debt Resolution
- Bankruptcy
- Winner
- Save/load local
- UI đủ rõ

Should-have:
- Game log
- Token animation
- Dice animation
- Card reveal
- Basic sound
- End game stats

Could-have:
- Emergency Loan
- Rule presets
- More card effects
- Better asset art
- Extra polish

Won't-have for MVP:
- Online multiplayer
- 3D
- AI bot
- Trade tự do
- Auction
- Cloud save
- Mobile-first UI
- Custom board editor
```

---

## 16. Summary

`01-product-scope.md` chốt rằng **Property Tycoon Web MVP** là một browser game local cho 2–6 người chơi, dùng board 40 ô, render 2D/2.5D, không backend, không online, không 3D và không trade tự do giữa người chơi.

MVP vẫn tham vọng ở phần gameplay vì có hệ thống tài chính nâng cao:

```txt
Bán công trình
Thế chấp tài sản
Gỡ thế chấp
Lãi suất cố định
Debt Resolution
Emergency Loan optional
```

Scope này tạo ra một MVP có chiều sâu hơn bản property-trading tối giản, nhưng vẫn tránh các nhóm tính năng có rủi ro cao như online multiplayer, 3D, AI, trade tự do và auction.

Tài liệu tiếp theo nên đọc:

```txt
02-gameplay-rules.md
03-board-design.md
04-economy-and-debt.md
```
