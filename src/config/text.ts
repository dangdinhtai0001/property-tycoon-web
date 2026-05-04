/**
 * All user-facing strings. Import from here instead of
 * hardcoding strings in component or rule files.
 */

/** Labels for action buttons and UI controls. */
export const UI_LABELS = {
  rollDice: 'Tung xúc xắc',
  buyProperty: 'Mua ngay',
  buildHouse: 'Xây nhà',
  passAction: 'Bỏ qua',
  payRent: 'Trả tiền thuê',
  payJailFine: 'Nộp phạt ra tù',
  endTurn: 'Kết thúc lượt',
  proposeTrade: 'Đề nghị giao dịch',
  acceptTrade: 'Chấp nhận',
  rejectTrade: 'Từ chối',
  cancelTrade: 'Hủy',
  mortgage: 'Thế chấp',
  unmortgage: 'Chuộc lại',
  sellBuilding: 'Bán nhà',
  declareBankruptcy: 'Phá sản',
  startGame: 'Bắt đầu chơi',
  saveGame: 'Lưu game',
  loadGame: 'Tải game',
  quitGame: 'Thoát game',
  pauseGame: 'Tạm dừng',
  resumeGame: 'Tiếp tục',
  bid: 'Đấu giá',
  passBid: 'Bỏ qua',
} as const

/** Modal and panel titles. */
export const MODAL_TITLES = {
  auction: 'Đấu giá tài sản',
  trade: 'Giao dịch',
  debtResolution: 'Giải quyết nợ',
  propertyInfo: 'Thông tin tài sản',
  card: 'Rút thẻ',
  pauseMenu: 'Tạm dừng',
  saveSlot: 'Chọn slot lưu',
} as const

/** Error messages shown in UI. */
export const ERROR_MESSAGES = {
  insufficientFunds: 'Không đủ tiền',
  notYourTurn: 'Chưa đến lượt của bạn',
  assetLoadFailed: 'Tải tài nguyên thất bại. Vui lòng tải lại trang.',
  saveIncompatible: 'File lưu không tương thích với phiên bản này.',
  unknownError: 'Đã xảy ra lỗi. Vui lòng thử lại.',
} as const

/** Corner tile hint text shown in the corner label. */
export const CORNER_HINTS: Record<string, string> = {
  START: 'NHẬN TIỀN KHI ĐI QUA',
  JAIL: 'THĂM TÙ / BỊ GIAM',
  REST: 'Ô AN TOÀN',
  GO_TO_JAIL: 'VÀO TÙ NGAY',
}

/** Tile icon emoji by tile type and optional group. */
export const getTileIcon = (type: string, groupId?: string): string => {
  switch (type) {
    case 'FORTUNE': return '⚡'
    case 'CHANCE': return '🍀'
    case 'TAX': return '💸'
    case 'START': return '🚩'
    case 'JAIL': return '⛓️'
    case 'REST': return '🌳'
    case 'GO_TO_JAIL': return '👮'
    case 'PROPERTY':
      if (groupId === 'STATION') return '🚉'
      if (groupId === 'UTILITY') return '💧'
      return '🏠'
    default: return '📍'
  }
}

/**
 * Tile names keyed by board position index (0–39).
 * Migrated from basicBoard.ts — update here, not in the board definition.
 */
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
};

/** Theme names for property groups (Urban Journey). */
export const GROUP_THEMES: Record<string, string> = {
  BROWN: 'Hẻm Nhỏ',
  LIGHT_BLUE: 'Khu Chợ',
  PINK: 'Phố Cổ',
  ORANGE: 'Khu Văn Phòng',
  RED: 'Khu Công Nghệ',
  YELLOW: 'Trung Tâm Tài Chính',
  GREEN: 'Ven Sông Cao Cấp',
  DARK_BLUE: 'Đại Lộ Biểu Tượng',
  PURPLE: 'Khu Phức Hợp Landmark',
  GRAY: 'Skyline Core',
  STATION: 'Hệ Thống Giao Thông',
  UTILITY: 'Dịch Vụ Tiện Ích',
};

/** Names for building levels (Landmark Progression). */
export const BUILDING_LEVEL_NAMES: Record<number, string> = {
  0: 'Đất trống',
  1: 'Nhà phố',
  2: 'Shophouse',
  3: 'Chung cư mini',
  4: 'Cao ốc',
  5: 'Landmark',
};

/**
 * Game log message templates. Each function returns a formatted Vietnamese string.
 * Consumed by gameReducer.ts and rules/*.ts.
 */
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
};

/**
 * Card texts keyed by card id. Migrated from cards.ts.
 */
export const CARD_TEXTS: Record<string, { title: string; description: string }> = {
  'chance-1': { title: 'Khí Vận', description: 'Bị phạt quá tốc độ. Trả 15$.' },
  'chance-2': { title: 'Khí Vận', description: 'Ngân hàng trả lãi. Nhận 50$.' },
  'chance-3': { title: 'Khí Vận', description: 'Tiến đến ô Bắt Đầu. Nhận 200$.' },
  'chance-4': { title: 'Khí Vận', description: 'Tiến đến Phố Hàng Đào.' },
  'chance-5': { title: 'Khí Vận', description: 'Vào tù ngay lập tức. Không đi qua ô Bắt đầu, không nhận 200$.' },
  'fortune-1': { title: 'Cơ Hội', description: 'Phí khám bệnh. Trả 50$.' },
  'fortune-2': { title: 'Cơ Hội', description: 'Bán cổ phiếu có lãi. Nhận 100$.' },
  'fortune-3': { title: 'Cơ Hội', description: 'Phí bảo hiểm đáo hạn. Nhận 100$.' },
  'fortune-4': { title: 'Cơ Hội', description: 'Đi học. Trả 50$.' },
  'fortune-5': { title: 'Cơ Hội', description: 'Vào tù ngay lập tức. Không đi qua ô Bắt đầu, không nhận 200$.' },
}
