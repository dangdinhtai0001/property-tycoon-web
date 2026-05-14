import { DiceSprite } from '../sprites/DiceSprite';
import type Phaser from 'phaser';

/**
 * Object pool for DiceSprite instances.
 * Reduces GC pressure during frequent dice roll animations.
 */
export class DicePool {
  private readonly available: DiceSprite[] = [];
  private readonly active: Set<DiceSprite> = new Set();
  private readonly scene: Phaser.Scene;
  private readonly diceSize: number;

  constructor(scene: Phaser.Scene, size: number = 80, initialSize: number = 2) {
    this.scene = scene;
    this.diceSize = size;

    // Pre-allocate dice sprites
    for (let i = 0; i < initialSize; i++) {
      const dice = new DiceSprite(scene, 0, 0, size);
      dice.setActive(false);
      dice.setVisible(false);
      this.available.push(dice);
    }
  }

  /**
   * Acquire a dice sprite and position it.
   */
  acquireDice(x: number, y: number): DiceSprite {
    let dice = this.available.pop();

    if (!dice) {
      // Pool exhausted, create new instance
      if (import.meta.env.DEV) {
        console.warn('[DicePool] Pool exhausted — creating new dice instance');
      }
      dice = new DiceSprite(this.scene, x, y, this.diceSize);
    }

    dice.setPosition(x, y);
    dice.setActive(true);
    dice.setVisible(true);
    dice.setAlpha(1);
    dice.setScale(1);
    dice.setAngle(0);

    this.active.add(dice);
    return dice;
  }

  /**
   * Release a dice sprite back to the pool.
   */
  release(dice: DiceSprite): void {
    if (!this.active.has(dice)) return;

    dice.setActive(false);
    dice.setVisible(false);
    dice.setPosition(0, 0);
    dice.setAlpha(1);
    dice.setScale(1);
    dice.setAngle(0);

    this.active.delete(dice);
    this.available.push(dice);
  }

  /**
   * Release all active dice back to the pool.
   */
  releaseAll(): void {
    for (const dice of this.active) {
      dice.setActive(false);
      dice.setVisible(false);
      dice.setPosition(0, 0);
      this.available.push(dice);
    }
    this.active.clear();
  }
}
