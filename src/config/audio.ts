/** Logical audio keys used throughout the app. */
export const AUDIO_KEYS = {
  bgMusic: 'bgMusic',
  diceRoll: 'diceRoll',
  purchase: 'purchase',
} as const

/** Default volume levels (0.0 – 1.0). */
export const DEFAULT_VOLUME = {
  music: 0.5,
  sfx: 0.8,
} as const

/** Whether audio starts muted. */
export const MUTE_DEFAULT = false
