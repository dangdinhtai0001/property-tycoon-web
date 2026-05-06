import Phaser from 'phaser';
import { BOARD_TILE_EFFECTS } from '../../config/assets';
import { TileSpriteAnimation } from './TileSpriteAnimation';

const UTILITY_ACTIVATION = BOARD_TILE_EFFECTS.utilityActivate;
const UTILITY_ACTIVE_ALPHA = 0.95;
const UTILITY_LOOP_ALPHA = 0.76;
const UTILITY_GLOW_COLOR = 0x67e8f9;
const UTILITY_MAX_HEIGHT_RATIO = 0.42;
const UTILITY_MAX_WIDTH_RATIO = 0.62;

export function preloadUtilityTileAnimationAssets(scene: Phaser.Scene) {
  scene.load.image(UTILITY_ACTIVATION.phaserKey, UTILITY_ACTIVATION.path);
}

export class UtilityTileAnimation extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly animation: TileSpriteAnimation;
  private loopAfterActivate = false;
  private mode: 'hidden' | 'idle' | 'active' = 'hidden';

  constructor(scene: Phaser.Scene, tileWidth: number, tileHeight: number) {
    super(scene, 0, 0);

    const frameAspectRatio =
      UTILITY_ACTIVATION.sheetWidth / UTILITY_ACTIVATION.frameCount / UTILITY_ACTIVATION.sheetHeight;
    const targetHeight = tileHeight * UTILITY_MAX_HEIGHT_RATIO;
    const targetWidthFromHeight = targetHeight * frameAspectRatio;
    const maxWidth = tileWidth * UTILITY_MAX_WIDTH_RATIO;
    const displayWidth = Math.min(targetWidthFromHeight, maxWidth);
    const displayHeight = displayWidth / frameAspectRatio;

    this.glow = scene.add.ellipse(0, displayHeight * 0.18, displayWidth * 0.88, displayHeight * 0.24, UTILITY_GLOW_COLOR, 0.16);
    this.glow.setBlendMode(Phaser.BlendModes.NORMAL);
    this.add(this.glow);

    this.animation = new TileSpriteAnimation(scene, {
      textureKey: UTILITY_ACTIVATION.phaserKey,
      frameCount: UTILITY_ACTIVATION.frameCount,
      columns: UTILITY_ACTIVATION.columns,
      rows: UTILITY_ACTIVATION.rows,
      sheetWidth: UTILITY_ACTIVATION.sheetWidth,
      sheetHeight: UTILITY_ACTIVATION.sheetHeight,
    });
    this.animation
      .setDisplaySize(displayWidth, displayHeight)
      .setImageBlendMode(Phaser.BlendModes.NORMAL)
      .setImageAlpha(UTILITY_ACTIVE_ALPHA);
    this.add(this.animation);

    this.setVisible(false);
    this.setAlpha(0);
  }

  activate(loopAfter = true) {
    if (this.mode === 'active' && loopAfter === this.loopAfterActivate) return;

    this.loopAfterActivate = loopAfter;
    this.mode = 'active';
    this.setVisible(true);

    this.scene.tweens.killTweensOf([this, this.glow]);
    this.setScale(0.97);
    this.setAlpha(1);
    this.glow.setAlpha(0.16);
    this.animation.setImageAlpha(UTILITY_ACTIVE_ALPHA);

    this.animation.play({
      durationMs: UTILITY_ACTIVATION.durationMs,
      loop: false,
      onComplete: () => {
        if (this.loopAfterActivate) {
          this.startSoftLoop();
          return;
        }

        this.fadeOut();
      },
    });

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 220,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.14, to: 0.24 },
      scaleX: { from: 0.96, to: 1.08 },
      scaleY: { from: 0.96, to: 1.06 },
      duration: 320,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
  }

  showIdle() {
    if (this.mode === 'idle') return;

    this.loopAfterActivate = false;
    this.setVisible(true);
    this.scene.tweens.killTweensOf([this, this.glow]);
    this.setScale(1);
    this.setAlpha(0.84);
    this.glow.setAlpha(0.12);
    this.startSoftLoop();
  }

  deactivate() {
    if (this.mode === 'hidden') return;

    this.loopAfterActivate = false;
    this.mode = 'hidden';
    this.scene.tweens.killTweensOf([this, this.glow]);
    this.animation.stop(true);

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.setVisible(false);
        this.setScale(1);
      },
    });
  }

  private startSoftLoop() {
    this.mode = 'idle';
    this.animation.setImageAlpha(UTILITY_LOOP_ALPHA);
    this.animation.play({
      durationMs: 1680,
      loop: true,
      restart: false,
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0.84,
      duration: 260,
      ease: 'Quad.easeOut',
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.08, to: 0.15 },
      scaleX: { from: 0.98, to: 1.04 },
      scaleY: { from: 0.98, to: 1.04 },
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private fadeOut() {
    this.animation.stop(true);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 160,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.setVisible(false);
        this.mode = 'hidden';
      },
    });
  }

  destroy(fromScene?: boolean): void {
    this.scene?.tweens.killTweensOf([this, this.glow]);
    super.destroy(fromScene);
  }
}
