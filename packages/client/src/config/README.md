# config/

Centralized configuration constants for the entire application.

## Files

- **`gameplay.ts`** - Game rules and mechanics (starting cash, jail rules, rent multipliers, building limits)
- **`assets.ts`** - Asset paths and dimensions for sprites, tiles, dice, and characters
- **`ui.ts`** - UI layout constants (board dimensions, tile sizes, token positions)
- **`text.ts`** - All user-facing text strings for UI labels and messages
- **`audio.ts`** - Audio file paths and volume settings
- **`animation.ts`** - Animation timing, durations, and easing curves

## Usage

Import constants directly:

```typescript
import { STARTING_CASH, PASS_START_BONUS } from './config/gameplay'
import { BOARD_TILES } from './config/assets'
import { ANIMATION } from './config/animation'
```

## Guidelines

- All magic numbers and hardcoded values should live here
- Config values are read-only (exported as `const`)
- Keep related constants grouped together
- Add tests for critical gameplay values in `gameplay.test.ts`
