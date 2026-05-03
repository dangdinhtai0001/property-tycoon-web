export interface CharacterDef {
  id: string;
  name: string;
  icon: string;
  image: string;
  phaserKey: string;
  frameWidth: number;
  frameHeight: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'ghost',
    name: 'Ghosty',
    icon: '👻',
    image: '/assets/characters/ghost_character.png',
    phaserKey: 'ghost_character',
    frameWidth: 245,
    frameHeight: 245,
  },
  {
    id: 'cat',
    name: 'Chibi Cat',
    icon: '🐱',
    image: '/assets/characters/charming-chibi-cat.png',
    phaserKey: 'cat_character',
    frameWidth: 245,
    frameHeight: 245,
  },
  {
    id: 'magician',
    name: 'Cat Magician',
    icon: '🧙‍♂️',
    image: '/assets/characters/chibi-cat-magican.png',
    phaserKey: 'magician_character',
    frameWidth: 245,
    frameHeight: 245,
  },
  {
    id: 'rouge',
    name: 'Chibi Rogue',
    icon: '🕵️',
    image: '/assets/characters/chibi-rouge.png',
    phaserKey: 'rouge_character',
    frameWidth: 245,
    frameHeight: 245,
  },
  {
    id: 'light knight',
    name: 'Light Knight',
    icon: '🕵️',
    image: '/assets/characters/chibi-knight.png',
    phaserKey: 'light_knight_character',
    frameWidth: 245,
    frameHeight: 245,
  },
];

export const getCharacter = (id: string): CharacterDef =>
  CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
