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
  // Remaining 39 tile names populated in Task 8 when basicBoard.ts is migrated
}

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
 * Card texts keyed by card id. Populated in Task 8 when cards.ts is migrated.
 */
export const CARD_TEXTS: Record<string, { title: string; description: string }> = {}
