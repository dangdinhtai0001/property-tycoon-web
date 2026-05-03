import Phaser from 'phaser';
import type { Player } from '../../game-engine/types/game';
import { THEME } from '../../ui/theme/tokens';

export class TokenSprite extends Phaser.GameObjects.Container {
  private circle: Phaser.GameObjects.Arc;
  private ring: Phaser.GameObjects.Arc;
  private text: Phaser.GameObjects.Text;
  public playerId: string;

  private visualContainer: Phaser.GameObjects.Container;
  private shadow: Phaser.GameObjects.Ellipse;
  private jailIcon?: Phaser.GameObjects.Text;
  private bankruptMarker?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, player: Player) {
    super(scene, x, y);
    this.playerId = player.id;

    const color = Phaser.Display.Color.HexStringToColor(player.color).color;
    const size = THEME.typography.token.size;

    // 0. Shadow
    this.shadow = scene.add.ellipse(0, 8, size * 1.2, size * 0.4, THEME.effects.tokenShadow.color, THEME.effects.tokenShadow.alpha);
    this.add(this.shadow);

    // Visual Container
    this.visualContainer = scene.add.container(0, 0);
    this.add(this.visualContainer);

    // 1. Ring (outer white)
    this.ring = scene.add.arc(0, 0, size / 2 + 2, 0, 360, false, 0xffffff);
    this.visualContainer.add(this.ring);

    // 2. Main Chip
    this.circle = scene.add.arc(0, 0, size / 2, 0, 360, false, color);
    this.visualContainer.add(this.circle);

    // 3. 3D Glossy Highlight
    const highlight = scene.add.arc(-size/4, -size/4, size/4, 0, 360, false, 0xffffff, 0.3);
    this.visualContainer.add(highlight);

    // 4. Initial
    this.text = scene.add.text(0, 0, player.name.charAt(0).toUpperCase(), {
      fontSize: THEME.typography.token.fontSize,
      color: '#ffffff',
      fontStyle: '900',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    this.visualContainer.add(this.text);

    // 5. Glow (for Current Player)
    this.glow = scene.add.arc(0, 0, size * 1.5, 0, 360, false, color, THEME.effects.tokenGlowAlpha);
    this.glow.setDepth(-1);
    this.visualContainer.add(this.glow);
    this.glow.setVisible(false);

    this.glowTween = scene.tweens.add({
      targets: this.glow,
      scale: 1.4,
      alpha: 0,
      duration: 1500,
      repeat: -1,
      ease: 'Quad.easeOut'
    });
    this.glowTween.pause();

    scene.add.existing(this);

    // Float Animation
    scene.tweens.add({
      targets: this.visualContainer,
      y: -8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Shadow Sync
    scene.tweens.add({
      targets: this.shadow,
      scaleX: 0.8,
      scaleY: 0.8,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private glow: Phaser.GameObjects.Arc;
  private glowTween: Phaser.Tweens.Tween;

  setSelected(selected: boolean) {
    if (selected) {
      this.glow.setVisible(true);
      this.glowTween.resume();
      this.ring.setStrokeStyle(4, 0xffffff);
    } else {
      this.glow.setVisible(false);
      this.glowTween.pause();
      this.ring.setStrokeStyle(0);
      this.ring.setScale(1);
      this.ring.setAlpha(1);
    }
  }

  setJailed(jailed: boolean) {
    if (jailed) {
      if (!this.jailIcon) {
        this.jailIcon = this.scene.add.text(12, -12, '⛓️', { fontSize: '14px' }).setOrigin(0.5);
        this.add(this.jailIcon);
      }
      this.jailIcon.setVisible(true);
    } else {
      this.jailIcon?.setVisible(false);
    }
  }

  setBankrupt(bankrupt: boolean) {
    if (bankrupt) {
      this.visualContainer.setAlpha(0.4);
      this.visualContainer.setScale(0.85);
      if (!this.bankruptMarker) {
        this.bankruptMarker = this.scene.add.text(0, 0, '❌', { fontSize: '20px' }).setOrigin(0.5).setAlpha(0.7);
        this.add(this.bankruptMarker);
      }
      this.bankruptMarker.setVisible(true);
    } else {
      this.visualContainer.setAlpha(1);
      this.visualContainer.setScale(1);
      this.bankruptMarker?.setVisible(false);
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

  async moveAlongPath(path: { x: number, y: number }[], durationPerTile: number = 250) {
    if (path.length === 0) return;
    if (this.scene) this.scene.tweens.killTweensOf(this);
    for (const point of path) {
      if (!this.scene) return;
      await new Promise<void>(resolve => {
        if (!this.scene) { resolve(); return; }
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
