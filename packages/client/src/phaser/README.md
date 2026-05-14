# phaser/

Phaser.js rendering layer - handles all visual presentation.

## Structure

- **`scenes/`** - Phaser scenes (PreloaderScene, BoardScene)
- **`sprites/`** - Custom sprite classes (TileSprite, TokenSprite, DiceSprite)
- **`pools/`** - Object pools for sprites (DicePool)
- **`bridge/`** - Bridge between React and Phaser (PhaserBridge)

## Key Concepts

### PhaserBridge

Singleton that connects React/Zustand to Phaser scenes.

```typescript
import { PhaserBridge } from './phaser/bridge/PhaserBridge'

// Initialize once when Phaser game is created
PhaserBridge.initialize(game)

// Trigger animations
PhaserBridge.showDiceRoll([3, 5])
```

Listens to EventBus events and updates Phaser scenes accordingly.

### Scenes

- **PreloaderScene** - Loads assets and emits `phaser:ready` event
- **BoardScene** - Main game board with tiles, tokens, and dice

### Sprites

Custom sprite classes extend `Phaser.GameObjects.Sprite`:

- **TileSprite** - Board tiles with hover effects
- **TokenSprite** - Player tokens with smooth movement
- **DiceSprite** - Animated dice with roll effects

### Object Pools

- **DicePool** - Pre-allocates dice sprites to reduce GC pressure during animations

## Guidelines

- Keep Phaser code isolated from game logic
- Use EventBus for communication with other layers
- Sprite positions and sizes come from `config/ui.ts`
- Asset paths come from `config/assets.ts`
- Animation timings come from `config/animation.ts`
