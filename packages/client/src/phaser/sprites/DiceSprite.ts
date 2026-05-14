import Phaser from 'phaser';
import { DICE } from '../../config/ui';

export class DiceSprite extends Phaser.GameObjects.Container {
  private bodyGraphics: Phaser.GameObjects.Graphics;
  private dotsGraphics: Phaser.GameObjects.Graphics;
  private isRolling: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number = DICE.size) {
    super(scene, x, y);

    this.bodyGraphics = scene.add.graphics();
    this.dotsGraphics = scene.add.graphics();
    this.add(this.bodyGraphics);
    this.add(this.dotsGraphics);

    this.drawBody(size);
    this.drawDots(1, size);

    scene.add.existing(this);
  }

  private drawBody(size: number) {
    this.bodyGraphics.clear();

    // Shadow
    this.bodyGraphics.fillStyle(DICE.shadowColor, DICE.shadowAlpha);
    this.bodyGraphics.fillRoundedRect(-size / 2 + 4, -size / 2 + 4, size, size, DICE.cornerRadius);

    // Main body
    this.bodyGraphics.fillStyle(DICE.bodyColor, 1);
    this.bodyGraphics.lineStyle(2, DICE.borderColor, 1);
    this.bodyGraphics.fillRoundedRect(-size / 2, -size / 2, size, size, DICE.cornerRadius);
    this.bodyGraphics.strokeRoundedRect(-size / 2, -size / 2, size, size, DICE.cornerRadius);

    // Subtle gradient/shine
    this.bodyGraphics.fillStyle(DICE.shineColor, DICE.shineAlpha);
    this.bodyGraphics.fillRoundedRect(-size / 2 + 5, -size / 2 + 5, size - 10, size / 2 - 5, { tl: 8, tr: 8, bl: 0, br: 0 });
  }

  private drawDots(value: number, size: number) {
    this.dotsGraphics.clear();
    this.dotsGraphics.fillStyle(DICE.dotColor, 1);

    const dotSize = size * 0.1;
    const p = size * 0.25; // padding factor

    const positions: Record<number, [number, number][]> = {
      1: [[0, 0]],
      2: [[-p, -p], [p, p]],
      3: [[-p, -p], [0, 0], [p, p]],
      4: [[-p, -p], [p, -p], [-p, p], [p, p]],
      5: [[-p, -p], [p, -p], [0, 0], [-p, p], [p, p]],
      6: [[-p, -p], [p, -p], [-p, 0], [p, 0], [-p, p], [p, p]]
    };

    const dots = positions[value] || [];
    dots.forEach(([dx, dy]) => {
      this.dotsGraphics.fillCircle(dx, dy, dotSize);
    });
  }

  async roll(targetValue: number, size: number = DICE.size): Promise<void> {
    if (this.isRolling) return;
    this.isRolling = true;

    const duration = DICE.rollDuration;
    const steps = DICE.rollSteps;
    const stepTime = duration / steps;

    // Simulation animation
    for (let i = 0; i < steps; i++) {
      const randomVal = Math.floor(Math.random() * 6) + 1;
      this.drawDots(randomVal, size);

      // Random jitter/rotation during roll
      if (!this.scene) return;
      this.scene.tweens.add({
        targets: this,
        angle: Phaser.Math.Between(-20, 20),
        scale: Phaser.Math.FloatBetween(0.9, 1.1),
        duration: stepTime,
        ease: 'Sine.easeInOut'
      });

      await new Promise(r => setTimeout(r, stepTime));
    }

    // Final result
    this.drawDots(targetValue, size);

    // Landing animation
    return new Promise(resolve => {
      if (!this.scene) {
        resolve();
        return;
      }
      this.scene.tweens.add({
        targets: this,
        angle: 0,
        scale: 1.2,
        duration: DICE.landingDuration,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.isRolling = false;
          resolve();
        }
      });
    });
  }
}
