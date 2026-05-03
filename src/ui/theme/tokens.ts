export const THEME = {
  colors: {
    // Property Groups
    groups: {
      BROWN: 0x92400E,      // Terracotta/Amber-800
      LIGHT_BLUE: 0x38BDF8, // Sky-400
      PINK: 0xF472B6,       // Pink-400
      ORANGE: 0xFB923C,     // Orange-400
      RED: 0xEF4444,        // Red-500
      YELLOW: 0xFACC15,     // Yellow-400
      GREEN: 0x22C55E,      // Green-500
      DARK_BLUE: 0x1E40AF,  // Blue-800
    },
    // Special Tile Types
    types: {
      STATION: 0x334155,    // Slate-700
      UTILITY: 0x0D9488,    // Teal-600
      CHANCE: 0xF43F5E,     // Rose-500
      FORTUNE: 0x10B981,    // Emerald-500
      TAX: 0xD97706,        // Amber-600
      START: 0x2563EB,      // Blue-600
      JAIL: 0x475569,       // Slate-600
      REST: 0x059669,       // Emerald-600
      GO_TO_JAIL: 0xDC2626, // Red-600
    },
    // Corner Landmarks
    corners: {
      START: { bg: 0xEFF6FF, accent: 0xF4B740, text: '#1E3A8A' },
      JAIL: { bg: 0xF1F5F9, accent: 0x475569, text: '#1E293B' },
      REST: { bg: 0xECFDF5, accent: 0x10B981, text: '#065F46' },
      GO_TO_JAIL: { bg: 0xFEF2F2, accent: 0xDC2626, text: '#7F1D1D' },
    },
    // Backgrounds & Surfaces
    surface: {
      DEFAULT: 0xFFFFFF,
      MUTED: 0xF8FAFC,
      BORDER: 0xDBE4EF,
      HOVER: 0x93C5FD,
    },
    // Text
    text: {
      PRIMARY: '#1E293B',
      SECONDARY: '#64748B',
      PRICE: '#334155',
      MUTED: '#94A3B8',
    }
  },
  typography: {
    fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
    name: {
      size: '17px',
      weight: '500',
    },
    price: {
      size: '20px',
      weight: '600',
    },
    label: {
      size: '18px',
      weight: '700',
    },
    corner: {
      size: '25px',
      weight: '800',
      hintSize: '15px',
    },
    token: {
      size: 30,
      fontSize: '16px',
    }
  },
  spacing: {
    stripHeight: 25,
    padding: 6,
    radius: 12,
  },
  effects: {
    tokenShadow: { color: 0x0f172a, alpha: 0.22, blur: 18 },
    tokenGlowAlpha: 0.35,
    tileHighlightWidth: 4,
    markers: {
      ownerBadgeSize: 12,
      buildingPipSize: 5,
      buildingPipGap: 2,
      mortgageAlpha: 0.35,
      mortgageStampColor: 0xDC2626,
    }
  }
};

export const getTileIcon = (type: string, groupId?: string): string => {
  switch (type) {
    case 'FORTUNE': return '⚡';
    case 'CHANCE': return '🍀';
    case 'TAX': return '💸';
    case 'START': return '🚩';
    case 'JAIL': return '⛓️';
    case 'REST': return '🌳';
    case 'GO_TO_JAIL': return '👮';
    case 'PROPERTY':
      if (groupId === 'STATION') return '🚉';
      if (groupId === 'UTILITY') return '💧';
      return '🏠';
    default: return '📍';
  }
};

export const getCornerHint = (type: string): string => {
  switch (type) {
    case 'START': return 'NHẬN TIỀN KHI ĐI QUA';
    case 'JAIL': return 'THĂM TÙ / BỊ GIAM';
    case 'REST': return 'Ô AN TOÀN';
    case 'GO_TO_JAIL': return 'VÀO TÙ NGAY';
    default: return '';
  }
};
