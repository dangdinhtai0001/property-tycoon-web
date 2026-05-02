Bản dưới đây lấy scope gốc của bạn làm nền: spec ban đầu đã có board 32–40 ô, các loại ô cần có như Xuất Phát, đất thường, nhà ga/trạm, tiện ích, thuế/phí, Cơ Hội, Khí Vận, Trại Giam, Đi Tù và Bãi Đỗ Xe/Nghỉ.  Mình chốt lại thành board 40 ô vì benchmark property-trading cổ điển thường dùng cấu trúc 40 ô với 22 đất, 4 railroad/trạm, 2 utility, 3 Chance, 3 Community Chest, 2 tax và 4 góc đặc biệt; nhưng trong tài liệu vẫn nhấn mạnh phải dùng theme/tên/layout riêng để tránh clone IP. ([HowStuffWorks][1])

````md
# Property Tycoon Web — Board Design

**Document:** `03-board-design.md`  
**Version:** v1.1 — Ambitious MVP  
**Status:** Draft  
**Date:** 2026-05-02  
**Project codename:** Property Tycoon Web

---

## 1. Purpose of This Document

Tài liệu này định nghĩa thiết kế bàn cờ cho **Property Tycoon Web MVP**.

File này chỉ tập trung vào board:

```txt
Board có bao nhiêu ô?
Vì sao chọn số lượng đó?
Có những loại ô nào?
Tỷ lệ giữa tài sản / thẻ / thuế / tù / nghỉ ra sao?
Các nhóm tài sản được chia thế nào?
Pacing của board nên như thế nào?
Tên ô và theme nên đặt theo nguyên tắc nào?
Sau này có thể mở rộng board ra sao?
````

File này không mô tả chi tiết:

```txt
Rule dice
Rule rent
Rule mortgage
Rule bankruptcy
Card effect chi tiết
UI modal chi tiết
Data model TypeScript chi tiết
```

Các phần đó nằm ở:

```txt
02-gameplay-rules.md
04-economy-and-debt.md
05-ui-ux-scope.md
06-technical-design.md
```

---

## 2. Board Size Decision

## 2.1 Final MVP Decision

MVP sử dụng board:

```txt
Board size: 40 ô
Board type: fixed layout
Movement: one-direction loop
Branching paths: none
Random board: none
Board editor: none
```

Board 40 ô là board size chính thức cho MVP.

Không dùng board 32 ô trong MVP.

Không dùng board 48+ ô trong MVP.

Không làm nhiều board theme trong MVP.

---

## 2.2 Decision Summary

| Option |          Decision | Reason                                                   |
| ------ | ----------------: | -------------------------------------------------------- |
| 32 ô   |  Rejected for MVP | Quá nhỏ, vòng chơi nhanh, ít không gian cho nhóm tài sản |
| 36 ô   |  Rejected for MVP | Vẫn hơi thiếu chỗ cho đầy đủ tile type                   |
| 40 ô   |          Accepted | Đủ lớn, dễ chia nhóm, pacing tốt, vẫn dễ render          |
| 44 ô   | Future experiment | Có thể thử sau khi economy ổn                            |
| 48+ ô  |        Out of MVP | Dài, khó balance, UI phức tạp hơn                        |

---

## 3. Why 40 Tiles?

## 3.1 Product Reason

Board 40 ô tạo cảm giác một game property-trading đầy đủ hơn board 32 ô.

Lý do:

```txt
Có đủ không gian cho nhiều nhóm đất.
Có đủ chỗ cho trạm, tiện ích, thuế, card, jail và rest tile.
Người chơi mất nhiều lượt hơn để đi hết một vòng.
Các khu tài sản đắt/rẻ có cảm giác phân vùng rõ hơn.
Game có nhiều điểm dừng và nhiều biến cố hơn.
Pacing phù hợp hơn với MVP tham vọng có mortgage, building và debt resolution.
```

Board 32 ô phù hợp nếu mục tiêu là game rất ngắn và đơn giản. Nhưng với Property Tycoon Web, MVP đã có tài chính nâng cao, nên board quá nhỏ sẽ làm game thiếu không gian để các quyết định tài chính phát huy tác dụng.

---

## 3.2 Gameplay Reason

Board 40 ô giúp tạo 4 giai đoạn cảm xúc trong một vòng:

```txt
Early segment:
- Giá đất thấp
- Người chơi dễ mua
- Ít rủi ro tài chính

Lower-mid segment:
- Bắt đầu có nhóm màu quan trọng
- Người chơi cân nhắc hoàn thiện bộ

Upper-mid segment:
- Rent bắt đầu nguy hiểm hơn
- Building/mortgage bắt đầu quan trọng

Late segment:
- Đất đắt
- Rent cao
- Người chơi thiếu tiền dễ rơi vào Debt Resolution
```

Với board 40 ô, game có đủ độ dài để:

```txt
Người chơi đi qua nhiều loại ô.
Card movement có ý nghĩa.
Jail có tác động chiến thuật.
Trạm/tiện ích xuất hiện đều.
Các nhóm màu có vị trí riêng.
Debt Resolution không xảy ra quá sớm hoặc quá ngẫu nhiên.
```

---

## 3.3 UI Reason

Board 40 ô vẫn có thể render tốt trên desktop browser.

Layout đề xuất:

```txt
Square board layout
10 ô mỗi cạnh
4 góc đặc biệt
Token di chuyển quanh viền
Khu trung tâm dùng cho dice, log, card hoặc action panel
```

Cách render này được tối ưu cho 2D/2.5D với các hiệu ứng hạt (particle effects), glow effects và shadow effects để tạo chiều sâu và cảm giác "juicy".

---

## 4. Tile Composition

## 4.1 MVP Tile Count

Board MVP có 40 ô với composition sau:

| Tile Type           | Quantity | Purpose                                      |
| ------------------- | -------: | -------------------------------------------- |
| Xuất Phát           |        1 | Nhận tiền khi đi qua hoặc dừng lại           |
| Đất thường          |       22 | Mua, thu rent, xây công trình                |
| Nhà ga / Trạm       |        4 | Tài sản đặc biệt, rent theo số trạm cùng chủ |
| Tiện ích            |        2 | Tài sản đặc biệt, rent phụ thuộc dice        |
| Cơ Hội              |        3 | Rút thẻ biến cố mạnh                         |
| Khí Vận             |        3 | Rút thẻ biến cố nhẹ/đời thường               |
| Thuế / Phí          |        2 | Trả tiền cho ngân hàng                       |
| Trại Giam / Thăm tù |        1 | Vừa là ô thăm tù, vừa là vị trí khi bị giam  |
| Đi Tù               |        1 | Di chuyển thẳng tới Trại Giam                |
| Bãi Đỗ Xe / Nghỉ    |        1 | Ô an toàn, không làm gì                      |
| **Total**           |   **40** |                                              |

---

## 4.2 Tile Category Definitions

### Xuất Phát

Role:

```txt
Điểm bắt đầu của tất cả người chơi.
Khi đi qua, người chơi nhận pass-start bonus.
Khi dừng lại, có thể nhận cùng bonus hoặc bonus đặc biệt tùy rule.
```

MVP decision:

```txt
Có đúng 1 ô Xuất Phát.
Vị trí index 0.
```

---

### Đất thường

Role:

```txt
Loại tài sản chính của game.
Có thể mua.
Có thể thu rent.
Có thể thuộc nhóm màu.
Có thể xây công trình nếu sở hữu đủ bộ.
Có thể bán công trình.
Có thể thế chấp nếu hợp lệ.
```

MVP decision:

```txt
Có 22 ô đất thường.
Chia thành 8 nhóm màu.
Là nguồn chính tạo rent pressure.
```

---

### Nhà ga / Trạm

Role:

```txt
Tài sản đặc biệt.
Không xây nhà/khách sạn.
Rent phụ thuộc số lượng trạm cùng chủ.
Tạo chiến lược sở hữu rải đều quanh board.
```

MVP decision:

```txt
Có 4 trạm.
Đặt tương đối đều quanh board.
Khoảng cách trung bình khoảng 10 ô/trạm.
```

---

### Tiện ích

Role:

```txt
Tài sản đặc biệt.
Không xây nhà/khách sạn.
Rent phụ thuộc dice hoặc công thức riêng.
Nếu sở hữu đủ bộ tiện ích, hệ số rent cao hơn.
```

MVP decision:

```txt
Có 2 tiện ích.
Không upgrade tiện ích trong MVP.
Không có effect riêng theo lượt trong MVP.
```

---

### Cơ Hội

Role:

```txt
Deck biến cố mạnh.
Tạo sự thay đổi lớn về vị trí, tiền hoặc trạng thái.
Có thể khiến người chơi di chuyển, nhận/mất tiền, vào tù hoặc tương tác với trạm/tiện ích.
```

MVP decision:

```txt
Có 3 ô Cơ Hội.
Deck riêng.
Effect mạnh hơn Khí Vận.
```

---

### Khí Vận

Role:

```txt
Deck biến cố nhẹ hơn.
Tập trung vào tiền nhỏ, sự kiện đời thường, cộng đồng hoặc bonus/phạt nhẹ.
```

MVP decision:

```txt
Có 3 ô Khí Vận.
Deck riêng.
Effect thường nhẹ hơn Cơ Hội.
```

---

### Thuế / Phí

Role:

```txt
Buộc người chơi trả tiền cho ngân hàng.
Tạo cash sink.
Gây áp lực tài chính.
Có thể trigger Debt Resolution nếu người chơi thiếu tiền.
```

MVP decision:

```txt
Có 2 ô Thuế / Phí.
Một ô nên xuất hiện ở early/mid board.
Một ô nên xuất hiện ở late board.
```

---

### Trại Giam / Thăm tù

Role:

```txt
Là ô góc đặc biệt.
Người chơi dừng bình thường thì chỉ đang thăm tù.
Người chơi bị gửi vào tù thì token nằm tại đây nhưng có trạng thái jailed.
```

MVP decision:

```txt
Có 1 ô Trại Giam / Thăm tù.
Nên đặt ở corner index 10 nếu dùng layout 10 ô mỗi cạnh.
```

---

### Đi Tù

Role:

```txt
Khi dừng vào ô này, người chơi bị chuyển thẳng tới Trại Giam.
Không nhận pass-start bonus nếu đường di chuyển đi ngang qua Xuất Phát do bị gửi tù.
```

MVP decision:

```txt
Có 1 ô Đi Tù.
Nên đặt ở corner index 30 nếu dùng layout 10 ô mỗi cạnh.
```

---

### Bãi Đỗ Xe / Nghỉ

Role:

```txt
Ô an toàn.
Không mua.
Không trả tiền.
Không rút thẻ.
Không nhận bonus mặc định.
Tạo nhịp nghỉ cho board.
```

MVP decision:

```txt
Có 1 ô Bãi Đỗ Xe / Nghỉ.
Nên đặt ở corner index 20 nếu dùng layout 10 ô mỗi cạnh.
```

---

## 5. Proposed Board Layout

## 5.1 Layout Principles

Board layout nên tuân thủ các nguyên tắc:

```txt
4 góc là 4 ô đặc biệt.
Trạm được phân bổ đều quanh board.
Card tiles không đặt quá sát nhau.
Tax tiles tạo áp lực ở 2 đoạn khác nhau.
Property groups tăng dần giá trị theo chiều di chuyển.
Mỗi cạnh board có đủ mix giữa tài sản, card, special tile.
Không đặt quá nhiều ô non-property liên tiếp.
Không đặt quá nhiều ô đắt liên tiếp mà không có nhịp nghỉ/card/trạm.
```

---

## 5.2 Recommended Index Layout

Đây là layout đề xuất cho MVP.

Tên ô trong bảng chỉ là placeholder để thể hiện cấu trúc. Tên chính thức sẽ được chốt theo theme riêng.

| Index | Tile Type           | Group | Placeholder Name | Notes       |
| ----: | ------------------- | ----- | ---------------- | ----------- |
|     0 | Xuất Phát           | —     | Xuất Phát        | Start tile  |
|     1 | Đất thường          | G1    | District 1A      | Rẻ nhất     |
|     2 | Khí Vận             | —     | Khí Vận 1        | Card nhẹ    |
|     3 | Đất thường          | G1    | District 1B      | Rẻ nhất     |
|     4 | Thuế / Phí          | —     | Phí Dịch Vụ      | Tax early   |
|     5 | Nhà ga / Trạm       | S     | Trạm 1           | Station 1   |
|     6 | Đất thường          | G2    | District 2A      | Low         |
|     7 | Cơ Hội              | —     | Cơ Hội 1         | Card mạnh   |
|     8 | Đất thường          | G2    | District 2B      | Low         |
|     9 | Đất thường          | G2    | District 2C      | Low         |
|    10 | Trại Giam / Thăm tù | —     | Trại Giam        | Corner      |
|    11 | Đất thường          | G3    | District 3A      | Low-mid     |
|    12 | Tiện ích            | U     | Tiện Ích 1       | Utility 1   |
|    13 | Đất thường          | G3    | District 3B      | Low-mid     |
|    14 | Đất thường          | G3    | District 3C      | Low-mid     |
|    15 | Nhà ga / Trạm       | S     | Trạm 2           | Station 2   |
|    16 | Đất thường          | G4    | District 4A      | Mid         |
|    17 | Khí Vận             | —     | Khí Vận 2        | Card nhẹ    |
|    18 | Đất thường          | G4    | District 4B      | Mid         |
|    19 | Đất thường          | G4    | District 4C      | Mid         |
|    20 | Bãi Đỗ Xe / Nghỉ    | —     | Nghỉ             | Corner safe |
|    21 | Đất thường          | G5    | District 5A      | Mid-high    |
|    22 | Cơ Hội              | —     | Cơ Hội 2         | Card mạnh   |
|    23 | Đất thường          | G5    | District 5B      | Mid-high    |
|    24 | Đất thường          | G5    | District 5C      | Mid-high    |
|    25 | Nhà ga / Trạm       | S     | Trạm 3           | Station 3   |
|    26 | Đất thường          | G6    | District 6A      | High        |
|    27 | Đất thường          | G6    | District 6B      | High        |
|    28 | Tiện ích            | U     | Tiện Ích 2       | Utility 2   |
|    29 | Đất thường          | G6    | District 6C      | High        |
|    30 | Đi Tù               | —     | Đi Tù            | Corner      |
|    31 | Đất thường          | G7    | District 7A      | Very high   |
|    32 | Đất thường          | G7    | District 7B      | Very high   |
|    33 | Khí Vận             | —     | Khí Vận 3        | Card nhẹ    |
|    34 | Đất thường          | G7    | District 7C      | Very high   |
|    35 | Nhà ga / Trạm       | S     | Trạm 4           | Station 4   |
|    36 | Cơ Hội              | —     | Cơ Hội 3         | Card mạnh   |
|    37 | Đất thường          | G8    | District 8A      | Đắt nhất    |
|    38 | Thuế / Phí          | —     | Thuế Cao Cấp     | Tax late    |
|    39 | Đất thường          | G8    | District 8B      | Đắt nhất    |

---

## 5.3 Corner Placement

Board 40 ô với 10 ô mỗi cạnh nên dùng 4 corner indices:

| Index | Corner Tile         | Function         |
| ----: | ------------------- | ---------------- |
|     0 | Xuất Phát           | Start/pass bonus |
|    10 | Trại Giam / Thăm tù | Jail location    |
|    20 | Bãi Đỗ Xe / Nghỉ    | Safe/rest        |
|    30 | Đi Tù               | Send to jail     |

Corner tiles giúp người chơi dễ định hướng và giúp UI board đọc tự nhiên hơn.

---

## 5.4 Station Placement

Trạm nên đặt tại:

```txt
Index 5
Index 15
Index 25
Index 35
```

Lý do:

```txt
Phân bổ đều mỗi 10 ô.
Dễ nhớ.
Tạo cảm giác trạm xuất hiện ở giữa mỗi cạnh board.
Giúp station strategy không lệ thuộc vào một vùng duy nhất.
```

---

## 5.5 Utility Placement

Tiện ích đề xuất đặt tại:

```txt
Index 12
Index 28
```

Lý do:

```txt
Không quá gần nhau.
Một tiện ích nằm nửa đầu board.
Một tiện ích nằm nửa sau board.
Không trùng nhịp với station.
Tạo đủ khoảng cách để ownership cả bộ tiện ích có ý nghĩa.
```

---

## 5.6 Card Tile Placement

Cơ Hội:

```txt
Index 7
Index 22
Index 36
```

Khí Vận:

```txt
Index 2
Index 17
Index 33
```

Nguyên tắc:

```txt
Mỗi deck có 3 điểm chạm trên board.
Không đặt hai card tile sát nhau.
Cơ Hội xuất hiện ở các đoạn có khả năng đổi hướng gameplay.
Khí Vận xuất hiện sớm hơn để tạo biến cố nhẹ.
```

---

## 5.7 Tax/Fee Placement

Thuế / Phí đề xuất đặt tại:

```txt
Index 4
Index 38
```

Lý do:

```txt
Index 4 tạo cash sink sớm.
Index 38 tạo áp lực cuối vòng, gần nhóm đất đắt.
Hai tax tile không quá gần nhau.
Late tax có thể trigger Debt Resolution ở giai đoạn căng thẳng.
```

---

## 6. Property Group Structure

## 6.1 Group Count

22 đất thường được chia thành 8 nhóm:

| Group     | Number of Properties | Value Tier     |
| --------- | -------------------: | -------------- |
| G1        |                    2 | Cheapest       |
| G2        |                    3 | Low            |
| G3        |                    3 | Low-mid        |
| G4        |                    3 | Mid            |
| G5        |                    3 | Mid-high       |
| G6        |                    3 | High           |
| G7        |                    3 | Very high      |
| G8        |                    2 | Most expensive |
| **Total** |               **22** |                |

---

## 6.2 Group Design Goals

Mỗi group cần có vai trò riêng:

```txt
G1:
- Rẻ nhất
- Dễ mua sớm
- Rent thấp
- Build cost thấp
- Ít tạo phá sản trực tiếp

G2:
- Rẻ nhưng có 3 ô
- Tạo cơ hội hoàn thiện bộ sớm
- Phù hợp với người chơi thích xây sớm

G3:
- Low-mid
- Bắt đầu có rent đáng kể khi xây

G4:
- Mid
- Nhóm ổn định, dễ dùng làm benchmark balance

G5:
- Mid-high
- Rent bắt đầu tạo áp lực rõ

G6:
- High
- Có thể tạo Debt Resolution nếu đã xây

G7:
- Very high
- Nhóm nguy hiểm ở late board

G8:
- Đắt nhất
- Chỉ 2 ô
- Giá mua cao
- Rent cao
- Build cost cao
```

---

## 6.3 Suggested Property Distribution

| Group | Tile Indices | Count | Notes          |
| ----- | ------------ | ----: | -------------- |
| G1    | 1, 3         |     2 | Cheapest       |
| G2    | 6, 8, 9      |     3 | Low            |
| G3    | 11, 13, 14   |     3 | Low-mid        |
| G4    | 16, 18, 19   |     3 | Mid            |
| G5    | 21, 23, 24   |     3 | Mid-high       |
| G6    | 26, 27, 29   |     3 | High           |
| G7    | 31, 32, 34   |     3 | Very high      |
| G8    | 37, 39       |     2 | Most expensive |

---

## 6.4 Color Group Guidelines

Color group không nên copy màu hoặc thứ tự màu của bất kỳ board game thương mại nào.

Có thể dùng palette riêng theo theme.

Ví dụ nếu theme là **modern city**:

```txt
G1: Old Town
G2: Student Quarter
G3: Creative District
G4: Market District
G5: Tech Park
G6: Financial District
G7: Luxury Waterfront
G8: Skyline Core
```

Ví dụ nếu theme là **Việt Nam hóa hiện đại**:

```txt
G1: Hẻm Nhỏ
G2: Khu Chợ
G3: Phố Cổ
G4: Khu Văn Phòng
G5: Khu Công Nghệ
G6: Trung Tâm Tài Chính
G7: Ven Sông Cao Cấp
G8: Đại Lộ Biểu Tượng
```

Ví dụ nếu theme là **fantasy tycoon**:

```txt
G1: Làng Gỗ
G2: Chợ Phiêu Lưu
G3: Cảng Buôn
G4: Học Viện Pháp Thuật
G5: Thành Lũy
G6: Mỏ Pha Lê
G7: Cung Điện Rồng
G8: Tháp Vương Quyền
```

---

## 7. Board Pacing

## 7.1 Pacing Goals

Board pacing cần tạo cảm giác tăng dần:

```txt
Đầu board:
- Rẻ
- Dễ mua
- Ít gây phá sản

Giữa board:
- Cạnh tranh bộ màu
- Rent bắt đầu nguy hiểm
- Trạm/tiện ích có vai trò rõ

Cuối board:
- Đắt
- Rent cao
- Tax mạnh
- Debt Resolution dễ xuất hiện
```

---

## 7.2 Pacing by Board Segment

### Segment 1: Index 0–9

Role:

```txt
Opening economy
Giá thấp
Người chơi dễ mua tài sản
Có 1 tax sớm để tạo cash sink
Có 1 trạm
Có cả Khí Vận và Cơ Hội
```

Tile mix:

```txt
Start: 1
Land: 5
Station: 1
Card: 2
Tax: 1
```

---

### Segment 2: Index 10–19

Role:

```txt
Low-mid to mid economy
Bắt đầu có utility
Có nhóm 3 đất liên tiếp hơn
Jail corner tạo nhịp reset vị trí
```

Tile mix:

```txt
Jail: 1
Land: 6
Utility: 1
Station: 1
Card: 1
```

---

### Segment 3: Index 20–29

Role:

```txt
Mid-high to high economy
Có safe corner ở đầu segment
Rent bắt đầu nguy hiểm hơn
Có trạm và utility
Có Cơ Hội ở đoạn giữa
```

Tile mix:

```txt
Rest: 1
Land: 6
Station: 1
Utility: 1
Card: 1
```

---

### Segment 4: Index 30–39

Role:

```txt
Late board pressure
Bắt đầu bằng Đi Tù
Có nhóm đất rất cao và đắt nhất
Có tax late
Có trạm cuối
Có card mạnh và nhẹ
```

Tile mix:

```txt
Go To Jail: 1
Land: 5
Station: 1
Card: 2
Tax: 1
```

---

## 7.3 Non-Property Density

Board cần tránh quá nhiều ô không mua được liên tiếp.

Rule đề xuất:

```txt
Không nên có hơn 2 ô non-property liên tiếp.
Không nên để 3 card/tax/special quá gần nhau.
Mỗi segment 10 ô nên có ít nhất 5 property tiles.
```

Trong layout đề xuất:

```txt
Mỗi segment có 5–6 đất thường.
Trạm/tiện ích được phân bổ đều.
Card/tax có khoảng cách tương đối ổn.
```

---

## 7.4 Risk Curve

Risk curve mong muốn:

```txt
Index 0–9:
Risk thấp đến vừa

Index 10–19:
Risk vừa

Index 20–29:
Risk vừa đến cao

Index 30–39:
Risk cao
```

Nhưng cần tránh tình trạng:

```txt
Cuối board quá áp đảo.
Người chơi thua ngay khi dính một ô.
Nhóm đất đắt nhất quá khó mua.
Nhóm đất rẻ nhất vô dụng về cuối game.
```

Balance cuối cùng sẽ do file economy quyết định:

```txt
04-economy-and-debt.md
```

---

## 8. Board Data Requirements

Board nên được định nghĩa bằng data, không hard-code trực tiếp trong UI.

## 8.1 Tile Data Fields

Mỗi tile nên có các field tối thiểu:

```ts
type BoardTile = {
  id: string;
  index: number;
  type:
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
  name: string;
  groupId?: string;
  propertyId?: string;
  amount?: number;
  deckType?: "chance" | "fortune";
};
```

---

## 8.2 Property Data Separation

Tile và property nên tách riêng.

Ví dụ:

```ts
type BoardTile = {
  id: "tile-01";
  index: 1;
  type: "land";
  propertyId: "property-g1-a";
};
```

```ts
type Property = {
  id: "property-g1-a";
  name: "District 1A";
  groupId: "g1";
  price: 60;
  mortgageValue: 30;
  buildCost: 50;
  rentByLevel: [2, 10, 30, 90, 160, 250];
};
```

Lý do tách:

```txt
Board quyết định vị trí.
Property quyết định economy.
Dễ đổi tên hoặc đổi giá mà không phá board layout.
Dễ test movement riêng với rent/economy.
Dễ tạo board khác sau này.
```

---

## 8.3 Board Config Object

Board config nên có dạng:

```ts
type BoardConfig = {
  id: string;
  name: string;
  version: number;
  tileCount: number;
  tiles: BoardTile[];
  propertyGroups: PropertyGroup[];
};
```

Ví dụ:

```ts
const classicCityBoard: BoardConfig = {
  id: "classic-city-40",
  name: "Classic City 40",
  version: 1,
  tileCount: 40,
  tiles: [],
  propertyGroups: [],
};
```

---

## 9. Naming and Theme Guidelines

## 9.1 Core Naming Rule

Property Tycoon Web phải có identity riêng.

Không dùng:

```txt
Tên property của Monopoly
Tên railroad/utility của Monopoly
Tên Chance/Community Chest y hệt
Tên board space y hệt nếu có thể tránh
Visual identity gây nhầm lẫn với Monopoly
```

Nên dùng:

```txt
Tên riêng theo theme
Tên nhóm tài sản riêng
Tên deck riêng
Tên trạm riêng
Tên tiện ích riêng
Tên tax/fee riêng
Icon riêng
Tone riêng
```

---

## 9.2 Current Vietnamese Placeholder Terms

Trong tài liệu hiện tại có thể dùng placeholder tiếng Việt:

```txt
Xuất Phát
Đất thường
Nhà ga / Trạm
Tiện ích
Cơ Hội
Khí Vận
Thuế / Phí
Trại Giam
Đi Tù
Bãi Đỗ Xe / Nghỉ
```

Những tên này là tên chức năng để mô tả rule.

Tên hiển thị trong game có thể đổi theo theme.

Ví dụ:

| Functional Name  | Possible Themed Name                    |
| ---------------- | --------------------------------------- |
| Xuất Phát        | Cổng Thành / Trung Tâm / Bến Khởi Hành  |
| Cơ Hội           | Cú Hích / Biến Động / Vận May Lớn       |
| Khí Vận          | Tin Đồn / Quỹ Cộng Đồng / Sự Kiện Nhỏ   |
| Trại Giam        | Khu Tạm Giữ / Phòng Kiểm Tra / Nhà Giam |
| Đi Tù            | Lệnh Triệu Tập / Bị Bắt / Kiểm Tra Khẩn |
| Bãi Đỗ Xe / Nghỉ | Quảng Trường / Công Viên / Trạm Nghỉ    |

---

## 9.3 Theme Direction Options

### Option A: Modern City

Tone:

```txt
Dễ hiểu
Gần property tycoon
Phù hợp web casual
Dễ đặt tên quận/khu
```

Example groups:

```txt
Old Quarter
Market Row
Creative Block
Office Ring
Tech Park
Financial Core
Waterfront Heights
Skyline Avenue
```

---

### Option B: Vietnamese-Inspired City

Tone:

```txt
Gần gũi
Có bản sắc riêng
Dễ tạo tên vui
Cẩn thận tránh dùng địa danh thật nếu không muốn tranh cãi
```

Example groups:

```txt
Hẻm Nhỏ
Khu Chợ
Phố Cũ
Khu Văn Phòng
Khu Công Nghệ
Trung Tâm Tài Chính
Ven Sông Cao Cấp
Đại Lộ Biểu Tượng
```

---

### Option C: Fantasy Commerce

Tone:

```txt
Khác biệt mạnh với Monopoly
Dễ làm art đẹp
Có thể vui hơn nếu sau này lên 3D
```

Example groups:

```txt
Làng Gỗ
Chợ Phiêu Lưu
Bến Cảng
Học Viện
Thành Lũy
Mỏ Pha Lê
Cung Điện
Tháp Vương Quyền
```

---

### Option D: Cyberpunk Tycoon

Tone:

```txt
Hiện đại
Visual mạnh
Hợp neon/2.5D
Có thể khó cân bằng readability nếu quá màu mè
```

Example groups:

```txt
Backstreet Grid
Neon Market
Data Alley
Drone Port
Bio Lab
Corporate Ring
Skyline Deck
Core Tower
```

---

## 9.4 Naming Constraints

Tên ô nên:

```txt
Ngắn
Dễ đọc trong UI nhỏ
Không quá giống IP có sẵn
Có pattern rõ theo group
Không gây nhầm với tile type
Có thể dịch/localize nếu cần
```

Tên ô không nên:

```txt
Quá dài
Quá nhiều ký tự đặc biệt
Dùng tên thương hiệu thật
Dùng địa danh thật nếu chưa cân nhắc legal/tone
Dùng joke khó hiểu
Copy tên từ board game thương mại
```

---

## 10. Board Visual Guidelines

## 10.1 MVP Visual Direction

MVP board nên ưu tiên:

```txt
Dễ đọc
Rõ tile type
Rõ ownership
Rõ player position
Rõ mortgage state
Rõ building level
Rõ current tile highlight
```

Không ưu tiên:

```txt
Art quá chi tiết
3D camera
Animation phức tạp
Tile quá nhỏ
Hiệu ứng gây khó đọc
```

---

## 10.2 Tile Visual States

Mỗi property tile nên có thể hiển thị:

```txt
Unowned
Owned by player color
Mortgaged
Has building level 1–5
Current player standing here
Multiple players standing here
Highlighted by card movement
Disabled / inactive if needed
```

---

## 10.3 Special Tile Visual States

Card tile:

```txt
Hiển thị deck type
Có icon riêng cho Cơ Hội / Khí Vận
Có hover/click info nếu cần
```

Tax tile:

```txt
Hiển thị icon phí/thuế
Nên thể hiện rõ là trả tiền cho bank
```

Jail tile:

```txt
Phân biệt thăm tù và đang bị giam bằng player status
```

Go To Jail tile:

```txt
Cần visual cảnh báo rõ
```

Rest tile:

```txt
Visual nhẹ, tạo cảm giác safe
```

---

## 11. Future Board Expansion

## 11.1 44-Tile Board

Sau MVP, có thể thử board 44 ô nếu muốn game dài hơn.

Possible use:

```txt
Thêm 4 đất thường
Hoặc thêm 2 đất + 1 card + 1 fee
Hoặc thêm special tiles mới
```

Risks:

```txt
Game dài hơn
Cần rebalance dice pacing
UI board khó fit hơn
Property group structure phải đổi
Save compatibility phức tạp hơn
```

---

## 11.2 Multiple Boards

Phase sau có thể có nhiều board:

```txt
Classic City 40
Quick City 32
Extended City 44
Fantasy Realm 40
Cyber Grid 40
```

Không làm trong MVP.

Nếu làm sau này, cần:

```txt
BoardConfig versioning
Property data riêng từng board
Card decks tương thích board
Save file lưu boardId
UI chọn board trong setup
```

---

## 11.3 Board Editor

Board editor không nằm trong MVP.

Có thể làm sau khi:

```txt
Game engine ổn định
Board config data-driven
Validation rules đầy đủ
Save/load hỗ trợ custom board
UI có khả năng preview board
```

Board editor cần validate:

```txt
Có đúng 1 start tile
Có ít nhất 1 jail tile
Có ít nhất 1 go-to-jail tile nếu jail rule bật
Không có tile index trùng
Tile count hợp lệ
Property group hợp lệ
Deck tile phải trỏ tới deck hợp lệ
Property tile phải trỏ tới property hợp lệ
```

---

## 11.4 2D Visual Enhancement Guidelines

Board design nên hỗ trợ các hiệu ứng 2D/2.5D chất lượng cao:

```txt
Particle effects:
- Xúc xắc landing (dust/puff effect)
- Token movement trail khi di chuyển nhanh
- Property purchase sparkle
- Building completed glow
- Mortgage/unmortgage shimmer

Glow effects:
- Tile highlight khi token sắp landed
- Mortgaged property dimmer/darker visual
- Building silhouette glow
- Owned property ownership glow

Shadow effects:
- Token drop shadow khi di chuyển
- Building cast shadow
- Tile depth shadow cho 2.5D effect

Easing & Animation:
- Token hop animation với bounce
- Card flip/reveal animation
- Money change floating text
- Building construction animation (level increase)
```

Nguyên tắc:

```txt
Board data structure phải hỗ trợ visual effect layers.
BoardConfig xác định tile position, type, group.
Visual system áp dụng effect dựa trên state (owned, mortgaged, building level).
Không hard-code effect vào board data.
Tách visual layer khỏi game logic.
```

---

## 12. Board Balancing Notes

## 12.1 What Board Design Controls

Board design ảnh hưởng tới:

```txt
Tần suất vào property
Tần suất rút card
Tần suất trả tax
Tần suất gặp trạm/tiện ích
Tốc độ hoàn thành color set
Độ nguy hiểm của từng segment
Tần suất trigger Debt Resolution
```

---

## 12.2 What Economy Design Controls

Economy design ảnh hưởng tới:

```txt
Giá mua
Rent
Build cost
Mortgage value
Unmortgage interest
Starting cash
Pass-start bonus
Tax amount
Loan limit
Bankruptcy pressure
```

Board file không nên hard-code economy quá sâu.

Board file chỉ nên xác định:

```txt
Ô nào nằm ở đâu.
Ô nào thuộc loại gì.
Ô nào thuộc group nào.
Pacing mong muốn là gì.
```

Economy values nên nằm trong:

```txt
04-economy-and-debt.md
```

hoặc trong data config riêng.

---

## 12.3 Balance Risks

Các rủi ro cần theo dõi khi playtest:

```txt
Người chơi đi quá nhiều vào card, thiếu property purchase.
Một group quá dễ hoàn thành.
Một group quá mạnh vì vị trí quá hay bị landed.
Trạm quá mạnh hoặc quá yếu.
Utility quá ngẫu nhiên và không đáng mua.
Tax late quá nặng gây phá sản khó chịu.
Jail quá lợi hoặc quá hại.
Go To Jail làm giảm tần suất đi qua nhóm late quá nhiều.
Rest tile quá vô nghĩa.
```

---

## 13. Acceptance Criteria for Board MVP

Board MVP được xem là đạt khi:

```txt
1. Board có đúng 40 ô.
2. Mỗi ô có index duy nhất từ 0 đến 39.
3. Có đúng 1 Xuất Phát.
4. Có đúng 1 Trại Giam / Thăm tù.
5. Có đúng 1 Đi Tù.
6. Có đúng 1 Bãi Đỗ Xe / Nghỉ.
7. Có đúng 22 đất thường.
8. Có đúng 4 trạm.
9. Có đúng 2 tiện ích.
10. Có đúng 3 Cơ Hội.
11. Có đúng 3 Khí Vận.
12. Có đúng 2 Thuế / Phí.
13. Tổng số ô bằng 40.
14. Token có thể đi vòng từ index 39 về index 0.
15. Pass-start detection hoạt động khi đi qua index 0.
16. Go To Jail đưa player tới jail index đúng.
17. Card tiles trỏ đúng deck.
18. Property tiles trỏ đúng property data.
19. Board render rõ trên desktop browser.
20. Board không cần debug console để hiểu trạng thái cơ bản.
```

---

## 14. Open Questions

Các câu hỏi cần chốt trong quá trình thiết kế board:

```txt
1. Theme chính của board là gì?
2. Tên chính thức của 8 nhóm tài sản là gì?
3. Tên chính thức của 22 đất thường là gì?
4. Tên 4 trạm là gì?
5. Tên 2 tiện ích là gì?
6. Cơ Hội và Khí Vận có giữ tên này trong UI cuối không?
7. Rest tile nên là Bãi Đỗ Xe, Công Viên, Quảng Trường hay tên khác?
8. Tax tiles nên là thuế, phí dịch vụ, phí bảo trì hay biến cố tài chính?
9. Có nên đặt tax late ở index 38 hay chuyển vị trí khác?
10. Có nên đặt Cơ Hội ở index 36 ngay trước nhóm đắt nhất không?
11. Có nên giữ utility ở index 12 và 28 không?
12. Có nên cho group G8 chỉ 2 ô nhưng rent rất cao không?
13. Có cần board 44 ô làm experiment branch sau MVP không?
14. Có cần chuẩn bị BoardConfig versioning ngay từ đầu không?
```

---

## 15. Summary

Property Tycoon Web MVP sử dụng board 40 ô cố định.

Composition chốt:

```txt
Xuất Phát: 1
Đất thường: 22
Nhà ga / Trạm: 4
Tiện ích: 2
Cơ Hội: 3
Khí Vận: 3
Thuế / Phí: 2
Trại Giam: 1
Đi Tù: 1
Bãi Đỗ Xe / Nghỉ: 1
```

22 đất thường được chia thành 8 nhóm:

```txt
2 / 3 / 3 / 3 / 3 / 3 / 3 / 2
```

Board 40 ô được chọn vì đủ lớn để hỗ trợ gameplay property-trading có chiều sâu, đủ không gian cho tài sản và special tiles, nhưng vẫn vừa sức cho MVP 2D/2.5D trên desktop browser.

Board phải được thiết kế theo hướng data-driven để sau này có thể mở rộng sang board khác, board editor hoặc visual enhancement system mà không viết lại game logic.

```
::contentReference[oaicite:2]{index=2}
```

[1]: https://entertainment.howstuffworks.com/leisure/brain-games/monopoly1.htm?utm_source=chatgpt.com "Monopoly Board and Game Pieces - How Monopoly Works"
