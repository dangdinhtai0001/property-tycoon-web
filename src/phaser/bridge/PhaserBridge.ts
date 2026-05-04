import Phaser from 'phaser';
import { useUIStore } from '../../app/store/useUIStore';
import { eventBus } from '../../core/EventBus';
import type { GameState } from '../../game-engine/types/game';

export class PhaserBridge {
  private static game: Phaser.Game | null = null;

  static showDiceRoll(result: number[]) {
    if (!this.game) return;
    const boardScene = this.game.scene.getScene('BoardScene');
    if (boardScene) {
      boardScene.events.emit('show-dice-roll', result);
    }
  }

  static initialize(game: Phaser.Game) {
    this.game = game;

    // Listen to EventBus for state changes
    eventBus.on('game:state-changed', ({ nextState }) => {
      this.updatePhaser(nextState);
    });

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
    // EventBus cleanup is handled globally
    this.game = null;
  }
}
