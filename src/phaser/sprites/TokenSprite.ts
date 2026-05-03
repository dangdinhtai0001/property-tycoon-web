import Phaser from 'phaser';
import type { Player } from '../../game-engine/types/game';

export class TokenSprite extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  public playerId: string;

  private visualContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y);
    this.playerId = player.id;

    const color = Phaser.Display.Color.HexStringToColor(player.color).color;

    // Create a nested container for the visual parts to allow independent animation
    this.visualContainer = scene.add.container(0, 0);
    this.add(this.visualContainer);

    // Outer circle (border)
    const border = scene.add.arc(0, 0, 22, 0, 360, false, 0xffffff);
    this.visualContainer.add(border);

    // Inner circle (player color)
    this.circle = scene.add.arc(0, 0, 19, 0, 360, false, color);
    this.visualContainer.add(this.circle);

    // Player initial or number
    this.text = scene.add.text(0, 0, player.name.charAt(0), {
      fontSize: '20px',
      color: '#ffffff',
      fontWeight: '900'
    }).setOrigin(0.5);
    this.visualContainer.add(this.text);

    scene.add.existing(this);

    // Add float animation to the VISUAL container, not the parent
    scene.tweens.add({
      targets: this.visualContainer,
      y: -8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtle scale pulse on the circles
    scene.tweens.add({
      targets: [this.circle, border],
      scale: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });

    // Glow effect for selected/current player
    this.glow = scene.add.arc(0, 0, 35, 0, 360, false, color, 0.3);
    this.glow.setDepth(-1); // Behind everything else in this container
    this.visualContainer.add(this.glow);
    this.glow.setVisible(false);

    this.glowTween = scene.tweens.add({
      targets: this.glow,
      scale: 1.5,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Quad.easeOut'
    });
    this.glowTween.pause();
  }

  private glow: Phaser.GameObjects.Arc;
  private glowTween: Phaser.Tweens.Tween;
  private isMoving: boolean = false;

  setSelected(selected: boolean) {
    if (selected) {
      this.glow.setVisible(true);
      this.glowTween.resume();
    } else {
      this.glow.setVisible(false);
      this.glowTween.pause();
      this.glow.setScale(1);
      this.glow.setAlpha(0.3);
    }
  }

  moveTo(x: number, y: number, duration: number = 500) {
    // If already moving, we might want to chain or cancel
    // For simplicity, we just stop current tweens on this object's position
    this.scene.tweens.killTweensOf(this);

    this.scene.tweens.add({
      targets: this,
      x: x,
      y: y,
      duration: duration,
      ease: 'Power2'
    });
  }

  /**
   * Moves the token tile by tile along the board's edge
   */
  async moveAlongPath(path: { x: number, y: number }[], durationPerTile: number = 250) {
    if (path.length === 0) return;

    this.isMoving = true;
    this.scene.tweens.killTweensOf(this);

    for (const point of path) {
      await new Promise<void>(resolve => {
        this.scene.tweens.add({
          targets: this,
          x: point.x,
          y: point.y,
          duration: durationPerTile,
          ease: 'Sine.easeInOut',
          onComplete: () => resolve()
        });
      });
    }

    this.isMoving = false;
  }
}
