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

/**
 * Game log message templates. Each function returns a formatted Vietnamese string.
 * Consumed by gameReducer.ts and rules/*.ts.
 */
export const GAME_LOG = {
  gameStarted: () => 'Game đã bắt đầu!',
  playerLandedOn: (playerName: string, tileName: string) =>
    `${playerName} đã dừng lại tại ${tileName}.`,
  playerPaidRent: (playerName: string, amount: number, ownerName: string, propertyName: string) =>
    `${playerName} đã trả ${amount}$ tiền thuê cho ${ownerName} tại ${propertyName}.`,
  playerPaidJailFine: (playerName: string, amount: number) =>
    `${playerName} đã nộp phạt ${amount}$ để ra tù.`,
  playerMortgaged: (playerName: string, propertyName: string, amount: number) =>
    `${playerName} đã thế chấp ${propertyName} và nhận ${amount}$.`,
  auctionStarted: (propertyName: string) =>
    `Bắt đầu đấu giá tài sản ${propertyName}`,
  tradeProposed: (offererName: string, targetName: string) =>
    `${offererName} đề nghị giao dịch với ${targetName}`,
  tradeRejected: () => 'Giao dịch bị từ chối.',
  playerDrewCard: (playerName: string, cardType: string, description: string) =>
    `${playerName} rút thẻ ${cardType}: ${description}`,
  playerPaidTax: (playerName: string, taxName: string, amount: number) =>
    `${playerName} nộp ${taxName} $${amount}.`,
  debugAddedCash: (playerName: string, amount: number) =>
    `[DEBUG] Đã thêm $${amount} cho ${playerName}`,
  debugJumped: (tileName: string, steps: number) =>
    `[DEBUG] Nhảy đến ${tileName} (Vượt qua ${steps} ô)`,
}

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
