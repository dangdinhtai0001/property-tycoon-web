/** Phaser canvas logical width in pixels. */
export const CANVAS_WIDTH = 1940

/** Phaser canvas logical height in pixels. */
export const CANVAS_HEIGHT = 1380

/** Canvas aspect ratio used for responsive scaling. */
export const ASPECT_RATIO = CANVAS_WIDTH / CANVAS_HEIGHT

/** Duration constants for all animations in milliseconds. */
export const ANIMATION_DURATIONS = {
  /** Full dice roll animation sequence */
  diceRoll: 1200,
  /** Time to tween one board step during token movement */
  tokenMove: 150,
  /** Money floater display duration */
  moneyFloat: 1000,
  /** Card reveal transition */
  cardReveal: 400,
} as const

/** z-index layers for React overlay stacking. */
export const Z_INDICES = {
  board: 0,
  overlay: 10,
  modal: 20,
  toast: 30,
} as const

/**
 * Hex color values for each property group strip.
 * Consumed by TileSprite.ts (Phaser canvas) and any React tile renderers.
 */
export const TILE_COLORS: Record<string, number> = {
  BROWN: 0x92400E,
  LIGHT_BLUE: 0x38BDF8,
  PINK: 0xF472B6,
  ORANGE: 0xFB923C,
  RED: 0xEF4444,
  YELLOW: 0xFACC15,
  GREEN: 0x22C55E,
  DARK_BLUE: 0x1E40AF,
  STATION: 0x334155,
  UTILITY: 0x0D9488,
  CHANCE: 0xF43F5E,
  FORTUNE: 0x10B981,
  TAX: 0xD97706,
  START: 0x2563EB,
  JAIL: 0x475569,
  REST: 0x059669,
  GO_TO_JAIL: 0xDC2626,
}

/** Corner tile colors (background, accent, text) for special corner tiles. */
export const CORNER_COLORS = {
  START: { bg: 0xEFF6FF, accent: 0xF4B740, text: '#1E3A8A' },
  JAIL: { bg: 0xF1F5F9, accent: 0x475569, text: '#1E293B' },
  REST: { bg: 0xECFDF5, accent: 0x10B981, text: '#065F46' },
  GO_TO_JAIL: { bg: 0xFEF2F2, accent: 0xDC2626, text: '#7F1D1D' },
} as const

/** Surface/background colors for tile rendering. */
export const SURFACE_COLORS = {
  DEFAULT: 0xFFFFFF,
  MUTED: 0xF8FAFC,
  BORDER: 0xDBE4EF,
  HOVER: 0x93C5FD,
} as const

/** Text color strings for tile labels. */
export const TEXT_COLORS = {
  PRIMARY: '#1E293B',
  SECONDARY: '#64748B',
  PRICE: '#334155',
  MUTED: '#94A3B8',
} as const

/** Typography configuration for tile/token rendering. */
export const TYPOGRAPHY = {
  fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
  nameSize: '17px',
  priceSize: '20px',
  labelSize: '18px',
  cornerSize: '25px',
  cornerHintSize: '15px',
  tokenSize: 30,
} as const

/** Spacing constants for tile layout. */
export const SPACING = {
  stripHeight: 25,
  padding: 6,
  radius: 12,
} as const

/** Visual effect parameters for token and tile rendering. */
export const EFFECTS = {
  tokenShadow: { color: 0x0f172a, alpha: 0.22, blur: 18 },
  tokenGlowAlpha: 0.35,
  tileHighlightWidth: 4,
  ownerBadgeSize: 12,
  buildingPipSize: 5,
  buildingPipGap: 2,
  mortgageAlpha: 0.35,
  mortgageStampColor: 0xDC2626,
} as const

/** Player token colors in order of player index. */
export const PLAYER_COLORS = [
  '#EF4444', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899',
]
