/** All static asset paths and sprite frame metadata. No imports from src/. */

export type CharacterId = 'ghost' | 'cat' | 'magician' | 'rouge' | 'light knight'

/** Sprite sheet metadata for each selectable character. Consumed by characters.ts, TokenSprite.ts, CharacterSprite.tsx. */
export const CHARACTER_SPRITES: Record<CharacterId, {
  /** Public path to the sprite sheet PNG */
  path: string
  /** Phaser texture key for this character */
  phaserKey: string
  /** Width of a single frame in pixels */
  frameWidth: number
  /** Height of a single frame in pixels */
  frameHeight: number
  /** Total number of animation frames */
  frameCount: number
  /** Emoji icon shown in character selector */
  icon: string
}> = {
  ghost: {
    path: '/assets/characters/ghost_character.png',
    phaserKey: 'ghost_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '👻',
  },
  cat: {
    path: '/assets/characters/charming-chibi-cat.png',
    phaserKey: 'cat_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🐱',
  },
  magician: {
    path: '/assets/characters/chibi-cat-magican.png',
    phaserKey: 'magician_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🧙‍♂️',
  },
  rouge: {
    path: '/assets/characters/chibi-rouge.png',
    phaserKey: 'rouge_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '🕵️',
  },
  'light knight': {
    path: '/assets/characters/chibi-knight.png',
    phaserKey: 'light_knight_character',
    frameWidth: 245,
    frameHeight: 245,
    frameCount: 4,
    icon: '⚔️',
  },
}

/** Full-page background images. Consumed by PreloaderScene.ts, MainMenu.tsx. */
export const BACKGROUND_IMAGES = {
  mainMenu: '/assets/bg/main-menu.png',
  board: '/assets/bg/bg-02.png',
} as const

/** Card back images shown when drawing cards. Consumed by PreloaderScene.ts. */
export const TILE_CARD_BACKS = {
  chance: '/assets/tiles/chance_back.png',
  fortune: '/assets/tiles/fortune_back.png',
} as const

/** Board tile effect sprite sheets. Consumed by Phaser tile animation helpers. */
export const BOARD_TILE_EFFECTS = {
  startGateActivate: {
    path: '/assets/board/tiles/start/start-gate-activate-12f-6c-2r-2000x667.png',
    phaserKey: 'start_gate_activate',
    frameWidth: 333,
    frameHeight: 333,
    frameCount: 12,
    columns: 6,
    rows: 2,
    animationKey: 'startGateActivate',
  },
} as const

/** SVG icon sprite sheet path. Consumed by PreloaderScene.ts. */
export const ICON_SVG_PATH = '/icons.svg' as const

/** Audio file paths keyed by logical audio key. Consumed by config/audio.ts. */
export const AUDIO_FILES: Record<string, string> = {
  // Placeholder keys — add actual audio paths when audio is implemented
  bgMusic: '/assets/audio/bg-music.mp3',
  diceRoll: '/assets/audio/dice-roll.mp3',
  purchase: '/assets/audio/purchase.mp3',
}
