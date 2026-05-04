import { ObjectPool } from '../../core/ObjectPool';
import { DiceSprite } from '../sprites/DiceSprite';
import type Phaser from 'phaser';

/**
 * Object pool for DiceSprite instances.
 * Reduces GC pressure during frequent dice roll animations.
 */
export class DicePool extends ObjectPool<DiceSprite> {
  constructor(
    private scene: Phaser.Scene,
    private size: number = 80,
    initialSize: number = 2
  ) {
    super(
      () => new DiceSprite(scene, 0, 0, size),
      (dice) => {
        dice.setActive(false);
        dice.setVisible(false);
        dice.setPosition(0, 0);
        dice.setAlpha(1);
        dice.setScale(1);
        dice.setAngle(0);
      },
      initialSize
    );
  }

  /**
   * Acquire a dice sprite and position it.
   */
  acquireDice(x: number, y: number): DiceSprite {
    const dice = this.acquire();
    dice.setPosition(x, y);
    dice.setActive(true);
    dice.setVisible(true);
    return dice;
  }
}
