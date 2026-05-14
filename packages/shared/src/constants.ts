/** Starting cash given to each player at game start. Consumed by setupGame.ts. */
export const STARTING_CASH = 1500

/** Bonus cash received when passing or landing on START. Consumed by movementRules.ts. */
export const PASS_START_BONUS = 200

/** Fine paid to exit jail voluntarily. Consumed by jailRules.ts. */
export const JAIL_FINE = 50

/** Maximum turns a player can remain jailed before forced fine. Consumed by jailRules.ts. */
export const MAX_JAIL_TURNS = 3

/** Max buildings per property type. Consumed by buildingRules.ts. */
export const BUILDING_LIMITS = { house: 4, hotel: 1 } as const

/** Minimum opening bid in an auction. Consumed by auctionRules.ts. */
export const AUCTION_MIN_BID = 10

/** Minimum raise increment per auction bid. Consumed by auctionRules.ts. */
export const AUCTION_BID_INCREMENT = 10

/** Fraction of property price received when mortgaging (0.5 = 50%). Consumed by financeRules.ts, basicBoard.ts. */
export const MORTGAGE_RATE = 0.5

/** Fraction of property price paid to unmortgage (0.55 = 55%). Consumed by financeRules.ts. */
export const UNMORTGAGE_RATE = 0.55

/** Rent multiplier when owner holds a full color group with no buildings. Consumed by rentRules.ts. */
export const GROUP_RENT_MULTIPLIER = 2

/** Rent for stations based on number owned (0-4). Consumed by rentRules.ts. */
export const STATION_RENT_BY_COUNT = [0, 25, 50, 100, 200] as const

/** Dice total multiplier for utilities based on number owned (0-2). Consumed by rentRules.ts. */
export const UTILITY_MULTIPLIER_BY_COUNT = [0, 4, 10] as const

/** Tax amount for the luxury tax tile. Consumed by gameReducer.ts. */
export const TAX_LUXURY_AMOUNT = 150

/** Tax amount for the income tax tile. Consumed by gameReducer.ts. */
export const TAX_INCOME_AMOUNT = 200

/** localStorage key prefix for save slots. Consumed by gameStorage.ts. */
export const SAVE_STORAGE_KEY = 'property-tycoon-save'

/** Save file schema version — increment when GameState shape changes. Consumed by gameStorage.ts. */
export const SAVE_VERSION = 1

/** Names for building levels (Landmark Progression). Consumed by gameReducer.ts, financeRules.ts. */
export const BUILDING_LEVEL_NAMES: Record<number, string> = {
  0: 'Đất trống',
  1: 'Nhà phố',
  2: 'Shophouse',
  3: 'Chung cư mini',
  4: 'Cao ốc',
  5: 'Landmark',
}

/** Game log message templates. Consumed by gameReducer.ts and rules. */
export const GAME_LOG = {
  gameStarted: () => 'Chào mừng các nhà đầu tư! Thành phố đã mở cửa, ván chơi chính thức bắt đầu.',
  playerLandedOn: (playerName: string, tileName: string) =>
    `${playerName} đã dừng chân tại ${tileName}.`,
  playerMoved: (playerName: string, steps: number, tileName: string) =>
    `${playerName} tiến thêm ${steps} bước và dừng lại tại ${tileName}.`,
  playerPaidRent: (playerName: string, amount: number, ownerName: string, propertyName: string) =>
    `${playerName} dừng tại ${propertyName} của ${ownerName} và phải trả $${amount} tiền thuê.`,
  playerPaidJailFine: (playerName: string, amount: number) =>
    `${playerName} quyết định nộp phạt $${amount} để lấy lại tự do và tiếp tục cuộc chơi.`,
  playerMortgaged: (playerName: string, propertyName: string, amount: number) =>
    `${playerName} thế chấp ${propertyName} để xoay sở thêm $${amount}. Tài sản này tạm thời không thu tiền thuê.`,
  playerUnmortgaged: (playerName: string, propertyName: string, cost: number) =>
    `${playerName} đã thanh toán $${cost} để giải chấp ${propertyName}. Việc kinh doanh tại đây đã hoạt động trở lại.`,
  auctionStarted: (propertyName: string) =>
    `Bắt đầu buổi đấu giá công khai cho khu đất ${propertyName}. Cơ hội cuối cho các nhà đầu tư nhanh tay!`,
  tradeProposed: (offererName: string, targetName: string) =>
    `${offererName} đang đề nghị một thỏa thuận giao dịch chiến lược với ${targetName}.`,
  tradeRejected: () => 'Thỏa thuận bất thành. Các bên không tìm được tiếng nói chung trong giao dịch này.',
  tradeAccepted: (offererName: string, targetName: string) =>
    `Giao dịch thành công! ${offererName} và ${targetName} đã đạt được thỏa thuận quan trọng.`,
  playerDrewCard: (playerName: string, cardType: string, description: string) =>
    `${playerName} rút một thẻ ${cardType}: "${description}"`,
  playerPaidTax: (playerName: string, taxName: string, amount: number) =>
    `${playerName} thực hiện nghĩa vụ đóng ${taxName} số tiền $${amount} cho thành phố.`,
  landmarkCompleted: (playerName: string, propertyName: string) =>
    `Kinh ngạc chưa! ${playerName} đã hoàn thành siêu công trình LANDMARK tại ${propertyName}. Một biểu tượng mới của sự thịnh vượng!`,
  playerBuilt: (playerName: string, buildingName: string, propertyName: string, rent: number) =>
    `${playerName} nâng cấp ${propertyName} lên thành ${buildingName}. Tiền thuê tại đây đã tăng lên $${rent}.`,
  buyProperty: (playerName: string, propertyName: string, price: number) =>
    `${playerName} chi $${price} để mua ${propertyName}. Một bước đi quan trọng trong việc xây dựng đế chế bất động sản.`,
  playerDeclinedPurchase: (playerName: string, propertyName: string) =>
    `${playerName} đã từ chối mua ${propertyName} và tiếp tục cuộc hành trình.`,
  debtStarted: (playerName: string, amount: number, reason: string) =>
    `${playerName} không đủ tiền mặt để thanh toán $${amount} cho ${reason}. Giai đoạn giải quyết nợ bắt đầu.`,
  debtResolved: (playerName: string) =>
    `${playerName} đã hoàn tất thanh toán nợ nần và có thể tiếp tục hành trình.`,
  bankruptcy: (playerName: string) =>
    `Đáng tiếc! ${playerName} đã tuyên bố phá sản. Toàn bộ tài sản đã được thu hồi hoặc bàn giao lại.`,
  passStart: (playerName: string, amount: number) =>
    `${playerName} đi qua Cổng Khởi Hành và nhận được $${amount} tiền đầu tư từ thành phố.`,
  debugAddedCash: (playerName: string, amount: number) =>
    `[DEBUG] Đã thêm $${amount} cho ${playerName}`,
  debugJumped: (tileName: string, steps: number) =>
    `[DEBUG] Nhảy đến ${tileName} (Vượt qua ${steps} ô)`,
}

/** Tile names keyed by board position index. Consumed by basicBoard.ts. */
export const TILE_NAMES: Record<number, string> = {
  0: 'Cổng Khởi Hành',
  1: 'Hẻm Hoa Giấy',
  2: 'Hẻm Nắng Vàng',
  3: 'Chợ Đêm',
  4: 'Khí Vận',
  5: 'Chợ Nổi',
  6: 'Chợ Hoa',
  7: 'Thuế Thu Nhập',
  8: 'Trạm Xe Bus',
  9: 'Phố Đèn Lồng',
  10: 'Cơ Hội',
  11: 'Phố Hội',
  12: 'Phố Tranh',
  13: 'Khu Cách Ly',
  14: 'Tháp Văn Phòng',
  15: 'Khu Khởi Nghiệp',
  16: 'Nhà Máy Nước',
  17: 'Khí Vận',
  18: 'Tòa Nhà Xanh',
  19: 'Công Viên Phần Mềm',
  20: 'Trạm Tàu Điện',
  21: 'Khu Trí Tuệ Nhân Tạo',
  22: 'Xưởng Sáng Tạo',
  23: 'Cơ Hội',
  24: 'Trạm Dừng Chân',
  25: 'Tháp Tài Chính',
  26: 'Sàn Giao Dịch',
  27: 'Phố Ngân Hàng',
  28: 'Khí Vận',
  29: 'Bến Du Thuyền',
  30: 'Biệt Thự Ven Sông',
  31: 'Thuế Hạ Tầng',
  32: 'Trạm Xe Liên Tỉnh',
  33: 'Căn Hộ Ánh Trăng',
  34: 'Cơ Hội',
  35: 'Nhà Máy Điện',
  36: 'Đại Lộ Ánh Sáng',
  37: 'Vào Khu Cách Ly',
  38: 'Trục Đường Di Sản',
  39: 'Quảng Trường Trung Tâm',
  40: 'Khí Vận',
  41: 'Landmark Tower',
  42: 'Grand Mall',
  43: 'Central Park Complex',
  44: 'Sân Bay Nội Đô',
  45: 'Tầng Mây',
  46: 'Cơ Hội',
  47: 'Đỉnh Thành Phố',
}
