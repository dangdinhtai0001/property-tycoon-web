# Property Tycoon Web — Testing & Acceptance

**Document:** `07-testing-and-acceptance.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa cách kiểm thử và tiêu chí nghiệm thu cho **Property Tycoon Web MVP**.

File này dùng để trả lời:

```txt
Khi nào MVP được xem là đạt?
Luật nào bắt buộc phải có test?
Flow nào dễ kẹt lượt?
Debt Resolution cần test những gì?
Save/load cần khôi phục những trạng thái nào?
UI cần đạt mức rõ ràng nào?
Rủi ro lớn nhất của MVP là gì?
````

File này tập trung vào:

```txt
Testing philosophy
Core rule tests
Economy tests
Debt Resolution tests
Save/load tests
UI flow tests
MVP success criteria
Known risks
```

Các tài liệu liên quan:

```txt
02-gameplay-rules.md
03-board-design.md
04-economy-and-debt.md
05-ui-ux-scope.md
06-technical-design.md
08-roadmap-and-backlog.md
```

---

## 2. Testing Philosophy

## 2.1 Test the Engine First

Property Tycoon Web là game có nhiều rule và nhiều trạng thái. Phần dễ bug nhất không phải UI, mà là game engine.

Ưu tiên test:

```txt
GameState transition
Turn phase
Dice
Movement
Payment
Debt Resolution
Bankruptcy
Save/load
```

UI có thể polish sau, nhưng game engine sai thì toàn bộ game sẽ kẹt.

Nguyên tắc:

```txt
Game engine phải test được mà không cần render React.
```

Good:

```txt
Given GameState
When dispatch GameAction
Then expect next GameState
```

Bad:

```txt
Click button trong UI rồi chỉ nhìn bằng mắt xem đúng không.
```

---

## 2.2 Prefer Deterministic Tests

Các test cần deterministic.

Không nên để test phụ thuộc vào random thật.

Ví dụ thay vì:

```txt
Roll dice bằng Math.random()
```

nên dùng:

```txt
Roll dice với payload cố định:
die1 = 3
die2 = 4
```

Hoặc dùng mocked random service.

Lý do:

```txt
Test chạy lần nào cũng cho kết quả giống nhau.
Dễ debug.
Dễ reproduce bug.
```

---

## 2.3 Test Public Behavior, Not Implementation Details

Với UI test, ưu tiên test theo cách người chơi thật tương tác:

```txt
Click Roll Dice
Click Buy Property
Click Pay Debt
Thấy Debt Resolution Modal
Thấy cash thay đổi
Thấy End Turn enabled/disabled
```

Không nên test quá sâu vào implementation detail như tên state nội bộ của component, class CSS tạm thời hoặc cấu trúc DOM không quan trọng.

---

## 2.4 Test the Risky Paths More Than the Happy Paths

Happy path cần test, nhưng MVP này có rủi ro lớn ở các flow thiếu tiền.

Các path cần test kỹ:

```txt
Không đủ tiền trả rent
Không đủ tiền trả tax
Không đủ tiền trả jail fine
Bán công trình trong Debt Resolution
Thế chấp trong Debt Resolution
Emergency Loan nếu bật
Không còn cách trả nợ
Phá sản vì nợ bank
Phá sản vì nợ player
Save/load khi đang Debt Resolution
```

---

## 2.5 No Stuck Turn Is a Release Requirement

MVP không được release nếu có flow làm người chơi không thể tiếp tục.

Stuck turn nghĩa là:

```txt
Không có action hợp lệ
Không có modal/action để resolve state
Không thể end turn
Không thể pay debt
Không thể declare bankruptcy
Không thể resume sau save/load
Game phase không khớp với UI
```

Bất kỳ bug stuck turn nào trong critical path phải được xem là release blocker.

---

## 3. Test Levels

## 3.1 Unit Tests

Unit tests dùng cho rule engine.

Target:

```txt
Pure functions
Reducers
Selectors
Rule modules
State machine transitions
Economy calculations
```

Tool đề xuất:

```txt
Vitest
```

Unit tests nên chiếm phần lớn test suite.

---

## 3.2 Integration Tests

Integration tests dùng để test nhiều rule chạy cùng nhau.

Ví dụ:

```txt
Roll dice → move → land on property → pay rent
Card movement → pass Start → resolve destination
Rent payment insufficient → Debt Resolution → mortgage → pay debt
Jail fine insufficient → Debt Resolution → bankruptcy
```

Integration tests vẫn có thể chạy ở engine level, không cần browser.

---

## 3.3 UI Component Tests

UI component tests dùng để kiểm tra:

```txt
Button enabled/disabled đúng
Modal hiển thị đúng thông tin
Debt Resolution Modal tính shortfall đúng từ state
Property Modal hiển thị mortgage state
Jail Modal hiển thị đúng action
```

Không cần test pixel-perfect.

**Lưu ý quan trọng về Phaser Canvas:**

Logic đồ họa trên Phaser Canvas (board tiles, token position, glow effects, particle) **không thể test bằng React Testing Library** vì chúng render trên WebGL/Canvas, không phải DOM.

Kiểm thử UI game world cần dùng:

```txt
E2E tests (Playwright): chụp screenshot, kiểm tra visual state qua DOM overlay hoặc game log
Manual/visual testing: quan sát trực tiếp animation và rendering
Unit tests cho Phaser bridge logic: kiểm tra PhaserBridge gọi đúng method với đúng tham số
Mock Phaser trong unit test: dùng spy/stub để verify tokenSprite.moveTo() được gọi
```

React DOM components (Modal, Panel) vẫn test được bằng React Testing Library như bình thường.

---

## 3.4 E2E Tests

End-to-end tests dùng để test các flow quan trọng trên browser.

Tool đề xuất:

```txt
Playwright
```

E2E tests nên ít hơn unit tests, nhưng bao phủ các critical journey:

```txt
Create game
Play several turns
Buy property
Pay rent
Enter Debt Resolution
Save/load
Bankruptcy
Game over
```

---

## 3.5 Manual Playtest

Manual playtest vẫn cần thiết vì đây là game.

Manual playtest kiểm tra:

```txt
Game có vui không?
Board có dễ đọc không?
Debt Resolution có dễ hiểu không?
Ván có quá dài không?
Mortgage có bị lạm dụng không?
Người chơi mới có hiểu phải làm gì không?
```

Automated tests đảm bảo đúng luật. Manual playtest đảm bảo game có cảm giác chơi ổn.

---

## 4. Test Data Strategy

## 4.1 Use Small Test Boards for Engine Tests

Engine tests có thể dùng board nhỏ để dễ kiểm soát.

Ví dụ:

```txt
test-board-8
test-board-12
```

Nhưng phải có ít nhất một test suite dùng board MVP 40 ô.

Board nhỏ dùng để test logic:

```txt
Movement
Pass Start
Landing
Go To Jail
Rent
Card movement
```

Board 40 ô dùng để test:

```txt
Real MVP layout
Tile count
Station placement
Card tile count
Tax tile count
Jail index
Start index
```

---

## 4.2 Use Fixed Dice

Test dice/movement bằng fixed dice:

```txt
die1 = 3
die2 = 4
total = 7
```

Không dùng random trong test case.

---

## 4.3 Use Named Test Players

Test players:

```txt
playerA = An
playerB = Bình
playerC = Chi
```

Giúp test dễ đọc hơn.

---

## 4.4 Use Scenario Builders

Nên có helper tạo state.

Example:

```ts
const state = createTestGame()
  .withPlayers(["An", "Bình"])
  .withPlayerCash("An", 100)
  .withPlayerPosition("An", 6)
  .withPropertyOwner("property-g2-a", "Bình")
  .withPropertyRent("property-g2-a", 300)
  .build();
```

Mục tiêu:

```txt
Test case đọc như rule, không bị chìm trong setup.
```

---

## 5. Core Rule Tests

## 5.1 Game Setup Tests

```txt
Given valid setup with 2 players
When game starts
Then phase is WAITING_TO_ROLL
And current player is first player
And all players have starting cash
And all players start at index 0
And no property has owner
```

```txt
Given setup with less than 2 players
When starting game
Then setup is rejected
```

```txt
Given setup with more than 6 players
When starting game
Then setup is rejected
```

---

## 5.2 Turn Order Tests

```txt
Given 3 active players
When player A ends turn
Then current player becomes player B
```

```txt
Given player B is bankrupt
When player A ends turn
Then current player skips B and becomes player C
```

```txt
Given only one active player remains
When checking win condition
Then phase becomes GAME_OVER
And winner is the active player
```

---

## 5.3 Dice Tests

```txt
Given phase is WAITING_TO_ROLL
When player rolls 3 and 4
Then dice total is 7
And isDouble is false
And phase moves to MOVING
```

```txt
Given phase is WAITING_TO_ROLL
When player rolls 5 and 5
Then isDouble is true
And doublesRolledThisTurn increases by 1
```

```txt
Given player has rolled doubles twice this turn
When player rolls a third double
Then player is sent to jail
And player does not move by dice total
And player does not receive pass-start bonus
And turn ends
```

```txt
Given player rolls non-double
When turn ends
Then doublesRolledThisTurn resets
```

---

## 5.4 Movement Tests

```txt
Given player is at index 0
When player moves 7 steps
Then player position becomes 7
```

```txt
Given board has 40 tiles
And player is at index 38
When player moves 5 steps
Then player position becomes 3
And player receives pass-start bonus
```

```txt
Given player is moved directly to jail
When movement crosses Start by teleport
Then player does not receive pass-start bonus
```

```txt
Given player lands on index 30 Go To Jail
When resolving tile
Then player position becomes jail index
And player status becomes jailed
And turn ends
```

---

## 5.5 Tile Resolution Tests

```txt
Given player lands on unowned land
When resolving tile
Then phase becomes BUY_DECISION
```

```txt
Given player lands on own property
When resolving tile
Then no rent is charged
And phase moves to BUILD_DECISION or END_TURN
```

```txt
Given player lands on property owned by another player
And property is not mortgaged
When resolving tile
Then rent payment is requested
```

```txt
Given player lands on mortgaged property owned by another player
When resolving tile
Then no rent is charged
And tile resolution completes
```

```txt
Given player lands on tax tile
When resolving tile
Then payment to bank is requested
```

```txt
Given player lands on rest tile
When resolving tile
Then no payment occurs
And tile resolution completes
```

---

## 5.6 Property Buying Tests

```txt
Given player lands on unowned property
And player has enough cash
When player buys property
Then player cash decreases by property price
And property owner becomes player
And property appears in player property list
```

```txt
Given player lands on unowned property
And player does not have enough cash
When Buy Decision is shown
Then Buy button is disabled
And Debt Resolution is not triggered
```

```txt
Given player declines to buy property
When action is confirmed
Then property remains unowned
And auction is not triggered
```

---

## 5.7 Rent Tests

```txt
Given player A lands on property owned by player B
And rent is 80
And player A has cash 200
When rent is resolved
Then player A cash becomes 120
And player B cash increases by 80
```

```txt
Given player A lands on property owned by player B
And property is mortgaged
When rent is resolved
Then player A pays nothing
And player B receives nothing
```

```txt
Given player A lands on land with building level 3
When rent is calculated
Then rent uses rentByLevel[3]
```

```txt
Given owner has full property group
And no property in group is mortgaged
When rent is calculated for empty land
Then full group bonus may apply
```

```txt
Given one property in group is mortgaged
When rent is calculated for empty land in that group
Then full group bonus does not apply
```

---

## 5.8 Building Tests

```txt
Given player owns all properties in a group
And no property is mortgaged
And player has enough cash
When player builds on eligible property
Then buildingLevel increases by 1
And player cash decreases by buildCost
```

```txt
Given player does not own full group
When player attempts to build
Then action is rejected
```

```txt
Given one property in group is mortgaged
When player attempts to build
Then action is rejected
```

```txt
Given group levels are [1, 0, 0]
When player attempts to build on level 1 property
Then action is rejected by even-building rule
```

```txt
Given property is already max level
When player attempts to build
Then action is rejected
```

---

## 5.9 Card Tests

```txt
Given player lands on Cơ Hội tile
When resolving tile
Then player draws from chance deck
And phase becomes CARD_RESOLUTION
```

```txt
Given player lands on Khí Vận tile
When resolving tile
Then player draws from fortune deck
And phase becomes CARD_RESOLUTION
```

```txt
Given card gives player 100 from bank
When card effect is applied
Then player cash increases by 100
And card returns to deck bottom
```

```txt
Given card requires player to pay 50 to bank
And player has enough cash
When card effect is applied
Then player cash decreases by 50
```

```txt
Given card requires player to pay 300
And player has cash 100
When card effect is applied
Then Debt Resolution starts
And bankruptcy is not triggered immediately
```

```txt
Given card sends player to jail
When card effect is applied
Then player position becomes jail index
And player status becomes jailed
And player does not receive pass-start bonus
```

```txt
Given card moves player to target tile
And path crosses Start
And card allows Start bonus
When effect is applied
Then player receives pass-start bonus
And destination tile is resolved
```

---

## 5.10 Jail Tests

```txt
Given player lands on Go To Jail
When tile resolves
Then player is jailed
And turn ends
```

```txt
Given player lands on jail tile by normal movement
When tile resolves
Then player is only visiting
And status remains active
```

```txt
Given player is jailed
And has enough cash for fine
When player pays fine
Then player status becomes active
And player may roll/move
```

```txt
Given player is jailed
And has get-out card
When player uses card
Then player status becomes active
And card returns to deck
```

```txt
Given player is jailed
When player rolls doubles
Then player leaves jail
And moves by dice total
And does not receive extra turn from that double
```

```txt
Given player fails to roll doubles
And has not reached max jail turns
When jail roll resolves
Then jailTurns increases
And turn ends
```

```txt
Given player reaches max jail turns
And cannot pay fine
When mandatory fine is required
Then Debt Resolution starts
```

---

## 6. Economy Tests

Chi tiết economy nằm trong `04-economy-and-debt.md`. Phần này chỉ liệt kê các test bắt buộc ở mức acceptance.

## 6.1 Payment Tests

```txt
Given player owes bank 100
And player has cash 150
When payment resolves
Then player cash becomes 50
And no DebtState is created
```

```txt
Given player owes bank 100
And player has cash 50
When payment resolves
Then player cash remains 50
And DebtState is created
And phase becomes DEBT_RESOLUTION
```

```txt
Given player owes another player 80
And has cash 100
When payment resolves
Then debtor cash decreases by 80
And creditor cash increases by 80
```

```txt
Given payment amount is greater than player cash
When payment resolves
Then player cash never becomes negative
```

---

## 6.2 Sell Building Tests

```txt
Given property has buildingLevel 2
And buildCost is 100
When player sells one building
Then buildingLevel becomes 1
And player receives 50
```

```txt
Given group levels are [2, 2, 1]
When player sells from a level 2 property
Then resulting group levels are valid under even-selling rule
```

```txt
Given property has buildingLevel 0
When player attempts to sell building
Then action is rejected
```

```txt
Given property does not belong to current player
When current player attempts to sell building
Then action is rejected
```

---

## 6.3 Mortgage Tests

```txt
Given player owns property with no building
And property is not mortgaged
When player mortgages property
Then player receives mortgageValue
And property.isMortgaged becomes true
```

```txt
Given property is already mortgaged
When player attempts to mortgage again
Then action is rejected
```

```txt
Given land property has buildingLevel > 0
When player attempts to mortgage property
Then action is rejected
```

```txt
Given another property in same group has buildingLevel > 0
When player attempts to mortgage a property in that group
Then action is rejected
```

```txt
Given property is mortgaged
When another player lands on it
Then rent is not charged
```

---

## 6.4 Unmortgage Tests

```txt
Given property is mortgaged
And mortgageValue is 100
And interest is 10%
When player unmortgages property
Then player pays 110
And property.isMortgaged becomes false
```

```txt
Given property is mortgaged
And player cash is less than unmortgage cost
When player attempts to unmortgage
Then action is rejected
```

```txt
Given game is in DEBT_RESOLUTION
When player attempts to unmortgage
Then action is rejected
```

---

## 6.5 Emergency Loan Tests

```txt
Given Emergency Loan rule is disabled
And player is in Debt Resolution
When player views Debt Resolution
Then loan option is unavailable
```

```txt
Given Emergency Loan rule is enabled
And player has no open loan
And player is in Debt Resolution
When player takes loan of 200
Then player cash increases by 200
And loan amountDue is 220 if interest is 10%
```

```txt
Given player already has an open loan
When player attempts to take another loan
Then action is rejected
```

```txt
Given player has open loan
And rule blocks building while loan is open
When player attempts to build
Then action is rejected
```

---

## 7. Debt Resolution Tests

Debt Resolution là khu vực có rủi ro cao nhất. Không release MVP nếu các test này chưa pass.

## 7.1 Debt Creation Tests

```txt
Given player has cash 100 and owes rent 300
When entering Debt Resolution
Then bankruptcy is not triggered immediately
And player may sell buildings or mortgage properties
```

```txt
Given player has cash 100
And owes bank 200 from tax
When payment resolves
Then DebtState is created with creditor bank
And amountDue is 200
And source is tax
```

```txt
Given player has cash 100
And owes player B 300 from rent
When payment resolves
Then DebtState is created with creditor player B
And source is rent
```

---

## 7.2 Debt Resolution Action Tests

```txt
Given player is in Debt Resolution
And has sellable building worth 50
When player sells building
Then player cash increases by 50
And DebtState remains active
```

```txt
Given player is in Debt Resolution
And has mortgageable property worth 200
When player mortgages property
Then player cash increases by 200
And DebtState remains active
```

```txt
Given player is in Debt Resolution
And cash becomes equal to amountDue
When checking available actions
Then Pay Debt is enabled
```

```txt
Given player is in Debt Resolution
And cash is less than amountDue
When checking available actions
Then Pay Debt is disabled
```

```txt
Given player is in Debt Resolution
When player attempts to roll dice
Then action is rejected
```

```txt
Given player is in Debt Resolution
When player attempts to end turn
Then action is rejected
```

```txt
Given player is in Debt Resolution
When player attempts to buy property
Then action is rejected
```

```txt
Given player is in Debt Resolution
When player attempts to build new building
Then action is rejected
```

---

## 7.3 Pay Debt Tests

```txt
Given player is in Debt Resolution
And player cash is equal to amountDue
When player pays debt
Then payment is completed
And DebtState is cleared
And phase returns to previous resolution context
```

```txt
Given player is in Debt Resolution
And player cash is greater than amountDue
When player pays debt
Then debtor cash decreases by amountDue
And creditor receives amount if creditor is player
And DebtState is cleared
```

```txt
Given player is in Debt Resolution
And player cash is less than amountDue
When player attempts to pay debt
Then action is rejected
And DebtState remains active
```

---

## 7.4 Declare Bankruptcy Tests

```txt
Given player is in Debt Resolution
And cannot raise enough cash by selling, mortgaging, or loan
When checking actions
Then Declare Bankruptcy is enabled
```

```txt
Given player is in Debt Resolution
And can still raise enough cash
When checking actions
Then Declare Bankruptcy is disabled
```

```txt
Given Declare Bankruptcy is enabled
When player confirms bankruptcy
Then phase becomes BANKRUPTCY_RESOLUTION
```

---

## 7.5 Bankruptcy Owing Bank Tests

```txt
Given player bankrupts owing bank
When bankruptcy resolves
Then player status becomes bankrupt
And player is removed from turn order
And all player properties become unowned
And all buildings on those properties reset to 0
And all mortgage states reset
```

```txt
Given player bankrupts owing bank
And only one active player remains
When bankruptcy resolves
Then phase becomes GAME_OVER
And remaining player is winner
```

---

## 7.6 Bankruptcy Owing Player Tests

```txt
Given player A bankrupts owing player B
When bankruptcy resolves
Then player A status becomes bankrupt
And player A cash transfers to player B
And player A unmortgaged properties transfer to player B
And player A mortgaged properties return to bank or unowned
```

```txt
Given player A bankrupts owing player B
When bankruptcy resolves
Then no property ownerId references player A
```

```txt
Given player A has buildings before bankruptcy
When bankruptcy resolves
Then buildings are reset according to MVP bankruptcy rule
```

---

## 8. Save / Load Tests

## 8.1 Basic Save Tests

```txt
Given a game in progress
When game is saved
Then save file contains schemaVersion
And savedAt
And gameState
```

```txt
Given a saved game exists
When player loads game
Then gameState is restored
And current player is restored
And phase is restored
```

```txt
Given no save exists
When Main Menu renders
Then Load Game is disabled
```

---

## 8.2 Board and Player State Save Tests

```txt
Given player positions changed
When saving and loading
Then all player positions are restored
```

```txt
Given properties have owners
When saving and loading
Then ownership is restored
```

```txt
Given properties have building levels
When saving and loading
Then building levels are restored
```

```txt
Given properties are mortgaged
When saving and loading
Then mortgage states are restored
```

```txt
Given player is jailed
When saving and loading
Then jailed status and jailTurns are restored
```

---

## 8.3 Deck Save Tests

```txt
Given cards have been drawn
When saving and loading
Then deck order is preserved
```

```txt
Given player holds a get-out card
When saving and loading
Then held card remains with player
```

---

## 8.4 Debt Resolution Save Tests

```txt
Given game is in DEBT_RESOLUTION
And activeDebtState exists
When saving and loading
Then phase remains DEBT_RESOLUTION
And activeDebtState is restored
And Debt Resolution Modal can render
```

```txt
Given player sold building during Debt Resolution
When saving and loading
Then cash increase remains
And building level remains reduced
And debt is not double-charged
```

```txt
Given player mortgaged property during Debt Resolution
When saving and loading
Then property remains mortgaged
And cash increase remains
And debt is not double-charged
```

---

## 8.5 Invalid Save Tests

```txt
Given save file has unsupported schemaVersion
When loading
Then load is rejected gracefully
And app does not crash
```

```txt
Given save file has property ownerId pointing to missing player
When loading
Then load is rejected or repaired according to migration policy
```

```txt
Given save file has phase DEBT_RESOLUTION but no activeDebtState
When loading
Then load is rejected or repaired safely
```

---

## 9. UI Flow Tests

## 9.1 Main Menu Tests

```txt
Given no save exists
When user opens Main Menu
Then New Game is available
And Load Game is disabled
```

```txt
Given save exists
When user opens Main Menu
Then Load Game is available
```

```txt
Given save exists
When user clicks New Game
Then overwrite confirmation appears
```

---

## 9.2 Setup Game Tests

```txt
Given user selects 2 players
And enters valid names
When clicking Start Game
Then Game Screen opens
```

```txt
Given player name is empty
When setup renders
Then Start Game is disabled
```

```txt
Given duplicate token colors are not allowed
When two players select same color
Then Start Game is disabled or warning appears
```

---

## 9.3 Game Screen Tests

```txt
Given game starts
When Game Screen renders
Then board is visible
And player panel is visible
And dice area is visible
And action panel is visible
And game log is visible
```

```txt
Given phase is WAITING_TO_ROLL
When Game Screen renders
Then Roll Dice button is enabled
And End Turn is not primary action
```

```txt
Given phase is BUY_DECISION
When Game Screen renders
Then Buy and Skip actions are visible
```

---

## 9.4 Property Modal Tests

```txt
Given player lands on unowned property
When Buy Property Modal opens
Then property name, price, player cash, Buy button, and Skip button are visible
```

```txt
Given player does not have enough cash to buy
When Buy Property Modal opens
Then Buy button is disabled
And reason is visible
```

```txt
Given property is mortgaged
When Property Modal opens
Then mortgage state is visible
And rent disabled explanation is visible
```

---

## 9.5 Card Modal Tests

```txt
Given player lands on Cơ Hội
When Card Modal opens
Then card title, description, and effect are visible
```

```txt
Given card sends player to jail
When player confirms card
Then player is moved to jail
And status shows jailed
```

---

## 9.6 Jail Modal Tests

```txt
Given player is jailed
When their turn starts
Then Jail Modal opens
And Pay Fine, Use Card if available, and Roll Doubles actions are shown
```

```txt
Given player cannot afford jail fine
When player must pay fine
Then Debt Resolution Modal opens
```

---

## 9.7 Debt Resolution Modal Tests

```txt
Given player has cash 100 and owes rent 300
When Debt Resolution Modal opens
Then amount due is 300
And current cash is 100
And shortfall is 200
```

```txt
Given player has sellable buildings
When Debt Resolution Modal opens
Then sellable buildings are listed
And sell values are shown
```

```txt
Given player has mortgageable properties
When Debt Resolution Modal opens
Then mortgageable properties are listed
And mortgage values are shown
```

```txt
Given Emergency Loan is enabled
And player has no open loan
When Debt Resolution Modal opens
Then loan option is shown
```

```txt
Given Emergency Loan is disabled
When Debt Resolution Modal opens
Then loan option is hidden or disabled with explanation
```

```txt
Given player cash is less than amountDue
When Debt Resolution Modal opens
Then Pay Debt button is disabled
And shortfall reason is visible
```

```txt
Given player cash becomes enough after mortgaging
When Debt Resolution Modal updates
Then Pay Debt button becomes enabled
```

```txt
Given player can still raise enough cash
When Debt Resolution Modal opens
Then Declare Bankruptcy is disabled
```

```txt
Given player cannot raise enough cash
When Debt Resolution Modal opens
Then Declare Bankruptcy is enabled
```

```txt
Given Debt Resolution Modal is open
When user presses Escape or clicks outside
Then modal does not close if debt is unresolved
```

---

## 9.8 Mortgage Modal Tests

```txt
Given player owns unmortgaged property
When Mortgage Modal opens
Then mortgage value and rent warning are visible
```

```txt
Given property has building in group
When Mortgage Modal opens
Then Mortgage button is disabled
And message says buildings must be sold first
```

```txt
Given property is mortgaged
When Mortgage Modal opens
Then unmortgage cost is visible
And interest is visible
```

---

## 9.9 Building Modal Tests

```txt
Given player owns full group
When Building Modal opens
Then build cost and current levels are visible
```

```txt
Given even-building rule blocks build
When Building Modal opens
Then Build button is disabled
And reason is visible
```

```txt
Given player is in Debt Resolution
When Building Modal opens for property with buildings
Then Sell Building is available
And Build New Building is not available
```

---

## 9.10 End Game UI Tests

```txt
Given only one active player remains
When game reaches GAME_OVER
Then End Game screen shows winner
And New Game button is visible
And Main Menu button is visible
```

---

## 10. State Machine Acceptance Tests

These tests verify no illegal phase transitions.

```txt
Given phase is WAITING_TO_ROLL
When player attempts BUY_PROPERTY
Then action is rejected
```

```txt
Given phase is BUY_DECISION
When player attempts ROLL_DICE
Then action is rejected
```

```txt
Given phase is DEBT_RESOLUTION
When player attempts END_TURN
Then action is rejected
```

```txt
Given phase is GAME_OVER
When player attempts gameplay action
Then action is rejected
```

```txt
Given activeDebtState exists
When any action other than allowed debt actions is attempted
Then action is rejected
```

---

## 11. Invariant Tests

These should run after important reducer actions.

```txt
No player cash is negative.
No more than one active DebtState exists.
If phase is DEBT_RESOLUTION, activeDebtState exists.
If activeDebtState exists, phase is DEBT_RESOLUTION.
No bankrupt player is current player.
No bankrupt player owns property.
No property with buildingLevel > 0 is mortgaged.
No unowned property is mortgaged.
All player positions are valid board indices.
Winner exists if phase is GAME_OVER.
```

---

## 12. MVP Success Criteria

MVP được xem là đạt khi tất cả tiêu chí sau pass.

## 12.1 Product / Scope Criteria

```txt
1. Game chạy được trên browser desktop.
2. Không cần backend.
3. Không cần login/account.
4. Không cần online multiplayer.
5. Có thể tạo game local same-device.
6. Hỗ trợ 2–6 người chơi.
7. Có board 40 ô.
8. Có save/load local.
```

## 12.2 Core Gameplay Criteria

```txt
1. Mỗi người chơi có lượt riêng.
2. Turn order hoạt động đúng.
3. Bankrupt player bị loại khỏi turn order.
4. Tung xúc xắc hoạt động đúng.
5. Tung đôi cho thêm lượt nếu hợp lệ.
6. Tung đôi 3 lần liên tiếp đưa player vào tù.
7. Token di chuyển đúng quanh board.
8. Đi qua Xuất Phát nhận tiền.
9. Bị gửi thẳng vào tù không nhận tiền qua Xuất Phát.
10. Tile resolution hoạt động đúng theo tile type.
```

## 12.3 Board Criteria

```txt
1. Board có đúng 40 ô.
2. Có đúng 1 Xuất Phát.
3. Có đúng 22 đất thường.
4. Có đúng 4 Nhà ga / Trạm.
5. Có đúng 2 Tiện ích.
6. Có đúng 3 Cơ Hội.
7. Có đúng 3 Khí Vận.
8. Có đúng 2 Thuế / Phí.
9. Có đúng 1 Trại Giam.
10. Có đúng 1 Đi Tù.
11. Có đúng 1 Bãi Đỗ Xe / Nghỉ.
12. Board render rõ trên desktop browser.
```

## 12.4 Property / Rent Criteria

```txt
1. Vào đất chưa có chủ có thể mua.
2. Nếu không đủ tiền mua, Buy button disabled và không trigger debt.
3. Từ chối mua không trigger auction.
4. Vào đất người khác phải trả rent.
5. Rent phản ánh property type.
6. Rent phản ánh building level.
7. Rent phản ánh station count nếu là trạm.
8. Rent phản ánh utility rule nếu là tiện ích.
9. Mortgaged property không thu rent.
10. Owner bankrupt không thu rent.
```

## 12.5 Card Criteria

```txt
1. Vào ô Cơ Hội rút đúng deck.
2. Vào ô Khí Vận rút đúng deck.
3. Deck được shuffle khi bắt đầu game.
4. Card thường quay lại deck theo rule.
5. Held card hoạt động nếu có.
6. Card nhận tiền hoạt động.
7. Card mất tiền hoạt động.
8. Card movement hoạt động.
9. Card vào tù hoạt động.
10. Card payment thiếu tiền chuyển Debt Resolution.
```

## 12.6 Jail Criteria

```txt
1. Vào tù khi dừng ở Đi Tù.
2. Vào tù khi card yêu cầu.
3. Vào tù khi tung đôi 3 lần liên tiếp.
4. Jail tile bằng movement thường chỉ là thăm tù.
5. Có thể trả tiền phạt để ra tù.
6. Có thể dùng thẻ ra tù nếu có.
7. Có thể tung đôi để ra tù.
8. Sau số lượt tối đa, bắt buộc trả tiền.
9. Nếu không đủ tiền trả fine, chuyển Debt Resolution.
```

## 12.7 Building Criteria

```txt
1. Có thể xây khi sở hữu đủ group.
2. Không thể xây nếu group có mortgage.
3. Không thể xây nếu không đủ tiền.
4. Không thể xây quá max level.
5. Even-building rule hoạt động nếu bật.
6. Building level làm tăng rent.
7. Có thể bán building.
8. Sell value = 50% build cost.
9. Selling building cập nhật buildingLevel và cash đúng.
```

## 12.8 Economy / Debt Criteria

```txt
1. Payment không bao giờ làm cash âm.
2. Nếu thiếu tiền, game tạo DebtState.
3. Debt Resolution xuất hiện trước bankruptcy.
4. Player có thể bán building trong Debt Resolution.
5. Player có thể mortgage property hợp lệ trong Debt Resolution.
6. Player có thể take Emergency Loan nếu rule bật.
7. Pay Debt chỉ bật khi cash đủ.
8. Declare Bankruptcy chỉ bật khi không còn cách trả nợ theo rule MVP.
9. Unmortgage cost = mortgageValue + 10% interest.
10. Mortgaged property không thu rent.
11. Player không thể build trên group có property mortgaged.
12. Player không thể có nhiều hơn 1 open loan nếu loan rule bật.
```

## 12.9 Bankruptcy Criteria

```txt
1. Player chỉ phá sản sau Debt Resolution.
2. Bankruptcy owing bank xử lý đúng.
3. Bankruptcy owing player xử lý đúng.
4. Bankrupt player bị loại khỏi turn order.
5. Bankrupt player không còn sở hữu property.
6. Bankruptcy clear activeDebtState.
7. Game kiểm tra winner sau bankruptcy.
8. Game kết thúc khi chỉ còn 1 active player.
```

## 12.10 UI Criteria

```txt
1. Có Main Menu.
2. Có Setup Game.
3. Có Game Screen.
4. Có Pause Menu.
5. Có End Game.
6. Current player luôn dễ nhận biết.
7. Dice area hiển thị roll/result rõ.
8. Action buttons đúng theo phase.
9. Disabled actions có lý do rõ.
10. Property modal hiển thị owner/price/rent/mortgage/building.
11. Card modal hiển thị card và effect rõ.
12. Jail modal hiển thị lựa chọn ra tù.
13. Debt Resolution Modal hiển thị debt/cash/shortfall.
14. Debt Resolution Modal liệt kê sellable buildings.
15. Debt Resolution Modal liệt kê mortgageable properties.
16. Debt Resolution Modal hiển thị loan option nếu có.
17. Mortgage modal giải thích hậu quả không thu rent.
18. Building modal giải thích build/sell và rule xây đều.
19. Game log ghi sự kiện quan trọng.
20. Không cần debug console để chơi.
```

## 12.11 Save / Load Criteria

```txt
1. Save game vào local browser.
2. Load game từ Main Menu.
3. Auto-save sau mỗi lượt.
4. Save có schemaVersion.
5. Save khôi phục players.
6. Save khôi phục current player.
7. Save khôi phục phase.
8. Save khôi phục board/property ownership.
9. Save khôi phục building levels.
10. Save khôi phục mortgage states.
11. Save khôi phục loan states nếu có.
12. Save khôi phục jail states.
13. Save khôi phục deck order.
14. Save khôi phục held cards.
15. Save khôi phục activeDebtState nếu đang Debt Resolution.
16. Load invalid save không làm app crash.
```

## 12.12 No-Stuck-Turn Criteria

```txt
1. Không có phase nào thiếu action hợp lệ.
2. Không thể end turn khi còn debt.
3. Không thể roll khi chưa resolve modal bắt buộc.
4. Không thể đóng Debt Resolution khi chưa xử lý debt.
5. Không thể vào state cash âm.
6. Không thể có bankrupt player trong turn order.
7. Không thể có property owner là bankrupt player sau bankruptcy.
8. Không thể load vào state không thể tiếp tục.
```

---

## 13. Release Blockers

Các lỗi sau là blocker, không được release MVP nếu còn tồn tại:

```txt
Game kẹt lượt.
Cash âm.
Debt Resolution không thể đóng hoặc không thể resolve.
Player phá sản dù vẫn có thể trả nợ bằng action hợp lệ.
Player không phá sản được dù không còn cách trả nợ.
Bankrupt player vẫn được tới lượt.
Bankrupt player vẫn thu rent.
Save/load làm mất activeDebtState.
Load save khiến game không thể tiếp tục.
Rent tính sai với mortgaged property.
Go To Jail vẫn cho nhận pass-start bonus.
Tung đôi 3 lần vẫn cho di chuyển.
Game không xác định winner.
```

---

## 14. Known Risks

## 14.1 Debt Resolution Complexity

Rủi ro:

```txt
Debt Resolution có nhiều action: sell building, mortgage, loan, pay debt, bankruptcy.
Dễ tạo state kẹt nếu action order không rõ.
```

Mitigation:

```txt
State machine nghiêm ngặt.
Chỉ cho action hợp lệ trong DEBT_RESOLUTION.
Unit test nhiều scenario thiếu tiền.
UI hiển thị shortfall và legal actions rõ.
```

---

## 14.2 Mortgage and Building Interaction

Rủi ro:

```txt
Property có building nhưng vẫn mortgage được.
Group có mortgage nhưng vẫn build được.
Mortgaged property vẫn thu rent.
```

Mitigation:

```txt
Invariant tests.
Selector canCollectRent.
Selector canBuildOnProperty.
Selector canMortgageProperty.
```

---

## 14.3 Bankruptcy Asset Transfer

Rủi ro:

```txt
Bankruptcy owing bank và owing player có rule khác nhau.
Dễ còn ownerId trỏ tới bankrupt player.
Dễ xử lý sai mortgaged property.
```

Mitigation:

```txt
Test riêng bankruptcy owing bank.
Test riêng bankruptcy owing player.
Invariant no bankrupt owner after bankruptcy.
```

---

## 14.4 Save / Load During Pending State

Rủi ro:

```txt
Save trong Debt Resolution.
Load lại double-charge payment.
Load lại mất modal.
Load lại phase không khớp activeDebtState.
```

Mitigation:

```txt
Save activeDebtState.
Save returnContext.
Test save/load trong Debt Resolution.
Validate save before load.
```

---

## 14.5 Card Effects Causing Nested Resolution

Rủi ro:

```txt
Card effect di chuyển player tới property rồi trigger rent.
Card effect yêu cầu trả nhiều người chơi.
Card effect thiếu tiền giữa chừng.
```

Mitigation:

```txt
Card effect phải có explicit resolution flow.
DebtState có returnContext.
Test card movement/payment cases.
```

---

## 14.6 UI Allows Invalid Actions

Rủi ro:

```txt
Button hiển thị sai theo phase.
User click action không hợp lệ.
Debt modal bị đóng khi chưa trả nợ.
```

Mitigation:

```txt
Engine luôn validate action.
UI dùng getAvailableActions selector.
Blocking modal không dismiss bằng outside click.
E2E test các modal chính.
```

---

## 14.7 Game Balance Risk

Rủi ro:

```txt
Game quá dài.
Debt Resolution xảy ra quá thường xuyên.
Mortgage quá mạnh.
Emergency Loan kéo dài game quá mức.
Tax/rent gây phá sản quá sớm.
```

Mitigation:

```txt
Manual playtest.
Track basic stats.
Tuning economy knobs.
Emergency Loan optional, không bật mặc định nếu chưa balance.
```

---

## 14.8 Scope Creep

Rủi ro:

```txt
Thêm trade, auction, online, 3D quá sớm.
```

Mitigation:

```txt
MVP acceptance criteria rõ.
Out-of-scope rõ.
Feature mới phải qua scope review.
```

---

## 15. Test Coverage Priorities

## 15.1 Must-Test Before MVP

```txt
Dice/movement/pass Start
Buy/rent
Cards basic
Jail
Building
Sell building
Mortgage
Debt Resolution
Bankruptcy
Save/load
No stuck turn
Winner
```

## 15.2 Should-Test Before MVP

```txt
Emergency Loan if included
All card effect variants
All jail exit paths
Full group bonus
Even-building/even-selling
Invalid save handling
UI disabled reasons
```

## 15.3 Could-Test After MVP

```txt
Long-run simulations
Balance simulations
Visual regression
Cross-browser matrix
Accessibility audit
Performance profiling
```

---

## 16. Suggested Test File Structure

```txt
src/
  game-engine/
    tests/
      setup.test.ts
      dice.test.ts
      movement.test.ts
      tile-resolution.test.ts
      property-buying.test.ts
      rent.test.ts
      building.test.ts
      cards.test.ts
      jail.test.ts
      economy-payment.test.ts
      sell-building.test.ts
      mortgage.test.ts
      debt-resolution.test.ts
      bankruptcy.test.ts
      save-load.test.ts
      invariants.test.ts

  tests/
    e2e/
      main-menu.spec.ts
      setup-game.spec.ts
      basic-turn-flow.spec.ts
      buy-property.spec.ts
      rent-payment.spec.ts
      debt-resolution.spec.ts
      jail.spec.ts
      save-load.spec.ts
      bankruptcy-game-over.spec.ts
```

---

## 17. Manual Playtest Checklist

Use this checklist during manual playtest.

```txt
Can players understand whose turn it is?
Can players understand what to click next?
Is board readable?
Are tokens easy to see?
Are owned properties clear?
Are mortgaged properties clear?
Is rent explanation clear?
Is Debt Resolution understandable without explanation?
Do players understand why Pay Debt is disabled?
Do players understand why Declare Bankruptcy is disabled?
Does game feel too slow?
Does game feel too punishing?
Does game log help explain what happened?
Does save/load feel reliable?
Did any player get stuck?
```

---

## 18. Summary

`07-testing-and-acceptance.md` defines when Property Tycoon Web MVP is considered complete.

Most important release requirements:

```txt
Game runs from start to winner.
Core rules are covered by automated tests.
Debt Resolution works and never causes stuck turns.
Payment never creates negative cash.
Bankruptcy only happens after Debt Resolution.
Save/load can restore pending debt state.
UI clearly explains required actions.
No bankrupt player remains in turn order or owns property.
```

MVP should not be accepted until all critical rule tests, Debt Resolution tests, save/load tests, and no-stuck-turn criteria pass.

[1]: https://vitest.dev/?utm_source=chatgpt.com "Vitest | Next Generation testing framework"
