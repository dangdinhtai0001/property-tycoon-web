import Phaser from 'phaser';
import { BOARD_TILE_EFFECTS } from '../../config/assets';

const START_GATE = BOARD_TILE_EFFECTS.startGateActivate;
const START_GATE_GLOW_COLOR = 0xfbbf24;
const START_GATE_FRAME_RATE = 18;
const START_GATE_MAX_HEIGHT_RATIO = 0.62;
const START_GATE_MAX_WIDTH_RATIO = 0.44;

export function preloadStartGateAnimationAssets(scene: Phaser.Scene) {
  scene.load.spritesheet(
    START_GATE.phaserKey,
    START_GATE.path,
    { frameWidth: START_GATE.frameWidth, frameHeight: START_GATE.frameHeight }
  );
}

export function createStartGateAnimation(scene: Phaser.Scene) {
  if (scene.anims.exists(START_GATE.animationKey)) return;

  scene.anims.create({
    key: START_GATE.animationKey,
    frames: scene.anims.generateFrameNumbers(START_GATE.phaserKey, {
      start: 0,
      end: START_GATE.frameCount - 1,
    }),
    frameRate: START_GATE_FRAME_RATE,
    repeat: -1,
  });
}

export class StartGateAnimation extends Phaser.GameObjects.Container {
  private readonly sprite: Phaser.GameObjects.Sprite;
  private readonly glow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, tileWidth: number, tileHeight: number) {
    super(scene, 0, 0);

    const frameAspectRatio = START_GATE.frameWidth / START_GATE.frameHeight;
    const targetHeight = tileHeight * START_GATE_MAX_HEIGHT_RATIO;
    const targetWidthFromHeight = targetHeight * frameAspectRatio;
    const maxWidth = tileWidth * START_GATE_MAX_WIDTH_RATIO;
    const displayWidth = Math.min(targetWidthFromHeight, maxWidth);
    const displayHeight = displayWidth / frameAspectRatio;

    this.glow = scene.add.ellipse(0, tileHeight * 0.18, tileWidth * 0.34, tileHeight * 0.09, START_GATE_GLOW_COLOR, 0.2);
    this.glow.setBlendMode(Phaser.BlendModes.SCREEN);
    this.add(this.glow);

    this.sprite = scene.add.sprite(0, tileHeight * 0.16, START_GATE.phaserKey, 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDisplaySize(displayWidth, displayHeight);
    this.sprite.setAlpha(0.98);
    this.add(this.sprite);
    this.playLoop();
  }

  playLoop() {
    if (!this.scene || !this.active) return;

    this.scene.tweens.killTweensOf([this, this.glow]);
    this.sprite.play(START_GATE.animationKey, true);

    this.scene.tweens.add({
      targets: this,
      y: -3,
      duration: 1400,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.14, to: 0.28 },
      scaleX: { from: 0.94, to: 1.14 },
      scaleY: { from: 0.9, to: 1.08 },
      duration: 1100,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  playActivation(_delay: number = 0) {
    this.playLoop();
  }

  destroy(fromScene?: boolean): void {
    this.scene?.tweens.killTweensOf([this, this.glow]);
    super.destroy(fromScene);
  }
}
