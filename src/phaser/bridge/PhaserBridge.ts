import Phaser from 'phaser';
import { useGameStore } from '../../app/store/useGameStore';
import { useUIStore } from '../../app/store/useUIStore';
import type { GameState } from '../../game-engine/types/game';

export class PhaserBridge {
  private static game: Phaser.Game | null = null;
  private static unsubscribe: (() => void) | null = null;

  static showDiceRoll(result: number[]) {
    if (!this.game) return;
    const boardScene = this.game.scene.getScene('BoardScene');
    if (boardScene) {
      boardScene.events.emit('show-dice-roll', result);
    }
  }

  static initialize(game: Phaser.Game) {
    this.game = game;

    // Initial state
    const initialState = useGameStore.getState().state;
    this.updatePhaser(initialState);

    // Only call updatePhaser when game state changes, not UI state
    this.unsubscribe = useGameStore.subscribe(
      (store, prevStore) => {
        if (store.state !== prevStore.state) {
          this.updatePhaser(store.state);
        }
      }
    );

    // Listen to Phaser events
    game.events.on('tile-clicked', (tileId: string) => {
      useUIStore.getState().setInspectedPropertyId(tileId);
    });

    // Bubble up scene events
    const boardScene = game.scene.getScene('BoardScene');
    if (boardScene) {
      boardScene.events.on('tile-clicked', (tileId: string) => {
        useUIStore.getState().setInspectedPropertyId(tileId);
      });
    }
  }

  private static updatePhaser(state: GameState) {
    if (!this.game) return;
    
    const boardScene = this.game.scene.getScene('BoardScene');
    if (boardScene && boardScene.scene.isActive()) {
      boardScene.events.emit('update-state', state);
    } else {
      // If scene is not ready, wait a bit and try again
      this.game.events.once('poststep', () => this.updatePhaser(state));
    }
  }

  static destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.game = null;
  }
}
