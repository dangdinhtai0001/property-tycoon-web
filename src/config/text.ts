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
  0: 'Xuất phát',
  1: 'Làng cổ Đường Lâm',
  2: 'Làng lụa Vạn Phúc',
  3: 'Phố đi bộ Hồ Gươm',
  4: 'Khí Vận',
  5: 'Thành Cổ Loa',
  6: 'Đền Ngọc Sơn',
  7: 'Thuế thu nhập',
  8: 'Bến xe Giáp Bát',
  9: 'Làng gốm Bát Tràng',
  10: 'Cơ Hội',
  11: 'Chùa Tây Phương',
  12: 'Công viên Yên Sở',
  13: 'Nhà tù Hỏa Lò / Thăm nuôi',
  14: 'Vườn quốc gia Ba Vì',
  15: 'Phố Ngọc Lâm',
  16: 'Nhà máy nước Yên Phụ',
  17: 'Khí Vận',
  18: 'Khu đô thị Việt Hưng',
  19: 'Phố Nguyễn Văn Cừ',
  20: 'Ga Hà Nội',
  21: 'Văn Miếu - Quốc Tử Giám',
  22: 'Thuế hạ tầng',
  23: 'Cơ Hội',
  24: 'Công viên Thống Nhất',
  25: 'Phố Xã Đàn',
  26: 'Royal City Nguyễn Trãi',
  27: 'Sân vận động Mỹ Đình',
  28: 'Khí Vận',
  29: 'Trung tâm Hội nghị Quốc gia',
  30: 'Keangnam Landmark 72',
  31: 'Thuế hạ tầng',
  32: 'Bến xe Mỹ Đình',
  33: 'Phố Duy Tân',
  34: 'Cơ Hội',
  35: 'Nhà máy nước Pháp Vân',
  36: 'Phố Xuân Diệu',
  37: 'Vào Nhà tù Hỏa Lò',
  38: 'Phố Liễu Giai',
  39: 'Phố Kim Mã',
  40: 'Khí Vận',
  41: 'Phố Nguyễn Chí Thanh',
  42: 'Ga Gia Lâm',
  43: 'Phố Tràng Tiền',
  44: 'Ga Gia Lâm (Bến mới)',
  45: 'Phố Phan Đình Phùng',
  46: 'Cơ Hội',
  47: 'Phố Hàng Đào',
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
