import { CHARACTER_SPRITES, type CharacterId } from '../../config/assets'

/** Minimal character definition — sprite metadata lives in config/assets.ts. */
export interface CharacterDef {
  id: CharacterId
  name: string
}

/** All playable characters. Sprite paths/dims are in config/assets.ts CHARACTER_SPRITES. */
export const CHARACTERS: CharacterDef[] = [
  { id: 'ghost', name: 'Ghosty' },
  { id: 'cat', name: 'Chibi Cat' },
  { id: 'magician', name: 'Cat Magician' },
  { id: 'rouge', name: 'Chibi Rogue' },
  { id: 'light knight', name: 'Light Knight' },
]

/** Returns the character definition for the given id, defaulting to the first character. */
export const getCharacter = (id: string): CharacterDef =>
  CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0]
