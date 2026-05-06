import Phaser from 'phaser';
import { BOARD_TILE_EFFECTS } from '../../config/assets';
import { TileSpriteAnimation } from './TileSpriteAnimation';

const STATION_ACTIVATION = BOARD_TILE_EFFECTS.stationActivate;
const STATION_ACTIVE_ALPHA = 0.96;
const STATION_LOOP_ALPHA = 0.78;
const STATION_GLOW_COLOR = 0x93c5fd;
const STATION_MAX_HEIGHT_RATIO = 0.42;
const STATION_MAX_WIDTH_RATIO = 0.62;

export function preloadStationTileAnimationAssets(scene: Phaser.Scene) {
  scene.load.image(STATION_ACTIVATION.phaserKey, STATION_ACTIVATION.path);
}

export class StationTileAnimation extends Phaser.GameObjects.Container {
  private readonly glow: Phaser.GameObjects.Ellipse;
  private readonly animation: TileSpriteAnimation;
  private loopAfterActivate = false;
  private mode: 'hidden' | 'idle' | 'active' = 'hidden';

  constructor(scene: Phaser.Scene, tileWidth: number, tileHeight: number) {
    super(scene, 0, 0);

    const frameAspectRatio = STATION_ACTIVATION.sheetWidth / STATION_ACTIVATION.frameCount / STATION_ACTIVATION.sheetHeight;
    const targetHeight = tileHeight * STATION_MAX_HEIGHT_RATIO;
    const targetWidthFromHeight = targetHeight * frameAspectRatio;
    const maxWidth = tileWidth * STATION_MAX_WIDTH_RATIO;
    const displayWidth = Math.min(targetWidthFromHeight, maxWidth);
    const displayHeight = displayWidth / frameAspectRatio;

    this.glow = scene.add.ellipse(0, displayHeight * 0.18, displayWidth * 0.86, displayHeight * 0.24, STATION_GLOW_COLOR, 0.16);
    this.glow.setBlendMode(Phaser.BlendModes.NORMAL);
    this.add(this.glow);

    this.animation = new TileSpriteAnimation(scene, {
      textureKey: STATION_ACTIVATION.phaserKey,
      frameCount: STATION_ACTIVATION.frameCount,
      columns: STATION_ACTIVATION.columns,
      rows: STATION_ACTIVATION.rows,
      sheetWidth: STATION_ACTIVATION.sheetWidth,
      sheetHeight: STATION_ACTIVATION.sheetHeight,
    });
    this.animation
      .setDisplaySize(displayWidth, displayHeight)
      .setImageBlendMode(Phaser.BlendModes.NORMAL)
      .setImageAlpha(STATION_ACTIVE_ALPHA);
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
    this.animation.setImageAlpha(STATION_ACTIVE_ALPHA);

    this.animation.play({
      durationMs: STATION_ACTIVATION.durationMs,
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
    this.animation.setImageAlpha(STATION_LOOP_ALPHA);
    this.animation.play({
      durationMs: 1700,
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
      alpha: { from: 0.08, to: 0.14 },
      scaleX: { from: 0.98, to: 1.04 },
      scaleY: { from: 0.98, to: 1.04 },
      duration: 1000,
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
