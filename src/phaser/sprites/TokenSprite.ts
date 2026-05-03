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

    // 0. Drop Shadow (Stays on the board, doesn't float)
    const shadow = scene.add.ellipse(0, 5, 40, 15, 0x000000, 0.2);
    this.add(shadow);

    // Create a nested container for the visual parts to allow independent animation
    this.visualContainer = scene.add.container(0, 0);
    this.add(this.visualContainer);

    // 1. Outer border (thicker white border)
    const border = scene.add.arc(0, 0, 28, 0, 360, false, 0xffffff);
    this.visualContainer.add(border);

    // 2. Main Circle (player color)
    this.circle = scene.add.arc(0, 0, 24, 0, 360, false, color);
    this.visualContainer.add(this.circle);

    // 3. 3D Glossy Highlight
    const highlight = scene.add.arc(-8, -8, 12, 0, 360, false, 0xffffff, 0.3);
    this.visualContainer.add(highlight);

    // 4. Player initial or number
    this.text = scene.add.text(0, 0, player.name.charAt(0).toUpperCase(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.visualContainer.add(this.text);

    scene.add.existing(this);

    // Add float animation to the VISUAL container
    scene.tweens.add({
      targets: this.visualContainer,
      y: -12,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Shadow pulse (scales inversely with height)
    scene.tweens.add({
      targets: shadow,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Glow effect for selected/current player
    this.glow = scene.add.arc(0, 0, 45, 0, 360, false, color, 0.3);
    this.glow.setDepth(-1);
    this.visualContainer.add(this.glow);
    this.glow.setVisible(false);

    this.glowTween = scene.tweens.add({
      targets: this.glow,
      scale: 1.6,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Quad.easeOut'
    });
    this.glowTween.pause();
  }

  private glow: Phaser.GameObjects.Arc;
  private glowTween: Phaser.Tweens.Tween;
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

  moveToPosition(x: number, y: number, duration: number = 500) {
    if (!this.scene) return;
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

    if (this.scene) this.scene.tweens.killTweensOf(this);

    for (const point of path) {
      if (!this.scene) {
        return;
      }
      await new Promise<void>(resolve => {
        if (!this.scene) {
          resolve();
          return;
        }
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

  }
}
