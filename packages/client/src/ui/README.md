# ui/

React UI layer - all user-facing components.

## Structure

- **`screens/`** - Full-screen views (SetupGameScreen, GameScreen, etc.)
- **`panels/`** - Game panels (PlayerPanel, PropertyPanel, ActionPanel)
- **`shared/`** - Reusable components (Button, Modal, CharacterSprite)

## Key Concepts

### Screens

Top-level views that compose panels and shared components:

- **SetupGameScreen** - Player setup and game configuration
- **GameScreen** - Main game view with board and panels
- **SaveLoadScreen** - Save/load game management

### Panels

Game-specific UI sections:

- **PlayerPanel** - Player info, cash, properties
- **PropertyPanel** - Property details and actions
- **ActionPanel** - Game actions (roll dice, buy, build, etc.)
- **LogPanel** - Game event log

### Shared Components

Reusable UI primitives:

- **Button** - Styled button with variants
- **Modal** - Dialog overlay
- **CharacterSprite** - Character avatar display

## State Management

UI components consume state from stores:

```typescript
import { useGameStore } from '../app/store/useGameStore'
import { useUIStore } from '../app/store/useUIStore'

const { state, dispatch } = useGameStore()
const { showModal, inspectedPropertyId } = useUIStore()
```

## Guidelines

- Keep components focused and single-purpose
- Use Tailwind for styling
- Text strings come from `config/text.ts`
- Dispatch actions via `useGameStore`
- UI state (modals, selections) goes in `useUIStore`
