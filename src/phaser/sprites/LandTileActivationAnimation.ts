import Phaser from 'phaser';
import { BOARD_TILE_EFFECTS } from '../../config/assets';
import { TileSpriteAnimation } from './TileSpriteAnimation';

const LAND_ACTIVATION = BOARD_TILE_EFFECTS.landGardenActivate;
// Tuning knobs for land activation: adjust alpha/size here before touching layout code.
const LAND_ACTIVE_ALPHA = 0.92;
const LAND_LOOP_ALPHA = 0.7;
const LAND_GLOW_COLOR = 0xa7f3d0;
const LAND_MAX_HEIGHT_RATIO = 0.46;
const LAND_MAX_WIDTH_RATIO = 0.56;

export function preloadLandTileAnimationAssets(scene: Phaser.Scene) {
  scene.load.image(LAND_ACTIVATION.phaserKey, LAND_ACTIVATION.path);
}

export class LandTileActivationAnimation extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly animation: TileSpriteAnimation;
  private loopAfterActivate = false;
  private mode: 'hidden' | 'idle' | 'active' = 'hidden';

  constructor(scene: Phaser.Scene, tileWidth: number, tileHeight: number) {
    super(scene, 0, 0);

    const frameAspectRatio = LAND_ACTIVATION.sheetWidth / LAND_ACTIVATION.frameCount / LAND_ACTIVATION.sheetHeight;
    const targetHeight = tileHeight * LAND_MAX_HEIGHT_RATIO;
    const targetWidthFromHeight = targetHeight * frameAspectRatio;
    const maxWidth = tileWidth * LAND_MAX_WIDTH_RATIO;
    const displayWidth = Math.min(targetWidthFromHeight, maxWidth);
    const displayHeight = displayWidth / frameAspectRatio;

    this.glow = scene.add.ellipse(0, displayHeight * 0.2, displayWidth * 0.9, displayHeight * 0.26, LAND_GLOW_COLOR, 0.16);
    this.glow.setBlendMode(Phaser.BlendModes.NORMAL);
    this.add(this.glow);

    this.animation = new TileSpriteAnimation(scene, {
      textureKey: LAND_ACTIVATION.phaserKey,
      frameCount: LAND_ACTIVATION.frameCount,
      columns: LAND_ACTIVATION.columns,
      rows: LAND_ACTIVATION.rows,
      sheetWidth: LAND_ACTIVATION.sheetWidth,
      sheetHeight: LAND_ACTIVATION.sheetHeight,
    });
    this.animation
      .setDisplaySize(displayWidth, displayHeight)
      .setImageBlendMode(Phaser.BlendModes.NORMAL)
      .setImageAlpha(LAND_ACTIVE_ALPHA);
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
    this.setScale(0.96);
    this.setAlpha(1);
    this.glow.setAlpha(0.16);
    this.animation.setImageAlpha(LAND_ACTIVE_ALPHA);

    this.animation.play({
      durationMs: LAND_ACTIVATION.durationMs,
      loop: false,
      onComplete: () => {
        if (this.loopAfterActivate) {
          this.startSoftLoop();
          return;
        }

        this.fadeOutToIdle();
      },
    });

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 180,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.16, to: 0.28 },
      scaleX: { from: 0.96, to: 1.08 },
      scaleY: { from: 0.96, to: 1.08 },
      duration: 260,
      yoyo: true,
      ease: 'Sine.easeOut',
    });
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
    this.animation.setImageAlpha(LAND_LOOP_ALPHA);
    this.animation.play({
      durationMs: 1600,
      loop: true,
      restart: false,
    });

    this.scene.tweens.add({
      targets: this,
      alpha: 0.82,
      duration: 260,
      ease: 'Quad.easeOut',
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.08, to: 0.18 },
      scaleX: { from: 0.98, to: 1.04 },
      scaleY: { from: 0.98, to: 1.04 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private fadeOutToIdle() {
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

  showIdle() {
    if (this.mode === 'idle') return;

    this.loopAfterActivate = false;
    this.setVisible(true);
    this.scene.tweens.killTweensOf([this, this.glow]);
    this.setScale(1);
    this.setAlpha(0.84);
    this.glow.setAlpha(0.14);
    this.startSoftLoop();
  }

  destroy(fromScene?: boolean): void {
    this.scene?.tweens.killTweensOf([this, this.glow]);
    super.destroy(fromScene);
  }
}
