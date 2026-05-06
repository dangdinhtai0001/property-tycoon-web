import Phaser from "phaser";

type FrameRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TileSpriteAnimationConfig = {
  textureKey: string;
  frameCount: number;
  columns: number;
  rows: number;
  sheetWidth: number;
  sheetHeight: number;
};

export type TileSpriteAnimationPlayOptions = {
  durationMs?: number;
  loop?: boolean;
  restart?: boolean;
  onComplete?: () => void;
};

const MIN_FRAME_DELAY_MS = 40;
const FRAME_INSET_X = 1;

export class TileSpriteAnimation extends Phaser.GameObjects.Container {
  private readonly image: Phaser.GameObjects.Image;
  private readonly frameRects: FrameRect[];
  private readonly sheetWidth: number;
  private readonly sheetHeight: number;
  private targetWidth?: number;
  private targetHeight?: number;
  private frameIndex = 0;
  private isPlaying = false;
  private timer?: Phaser.Time.TimerEvent;
  private onComplete?: () => void;
  private loop = false;

  constructor(scene: Phaser.Scene, config: TileSpriteAnimationConfig) {
    super(scene, 0, 0);

    this.sheetWidth = config.sheetWidth;
    this.sheetHeight = config.sheetHeight;
    this.frameRects = buildFrameRects(config);
    this.image = scene.add.image(0, 0, config.textureKey).setOrigin(0.5);
    this.add(this.image);

    this.applyFrame(0);
  }

  setDisplaySize(width: number, height: number) {
    this.targetWidth = width;
    this.targetHeight = height;
    this.applyFrameScale();
    return this;
  }

  setImageBlendMode(value: Phaser.BlendModes | string) {
    this.image.setBlendMode(value);
    return this;
  }

  setImageAlpha(value: number) {
    this.image.setAlpha(value);
    return this;
  }

  play(options: TileSpriteAnimationPlayOptions = {}) {
    const {
      durationMs = 1000,
      loop = false,
      restart = true,
      onComplete,
    } = options;

    if (this.isPlaying && !restart) return;

    this.stopTimer();
    this.loop = loop;
    this.isPlaying = true;
    this.onComplete = onComplete;
    this.frameIndex = 0;
    this.applyFrame(0);

    const frameDelay = Math.max(
      MIN_FRAME_DELAY_MS,
      Math.round(durationMs / this.frameRects.length),
    );
    this.timer = this.scene.time.addEvent({
      delay: frameDelay,
      loop: true,
      callback: () => {
        this.advanceFrame();
      },
    });
  }

  stop(resetToFirstFrame = true) {
    this.stopTimer();
    this.isPlaying = false;
    this.loop = false;
    this.onComplete = undefined;

    if (resetToFirstFrame) {
      this.frameIndex = 0;
      this.applyFrame(0);
    }
  }

  destroy(fromScene?: boolean): void {
    this.stopTimer();
    super.destroy(fromScene);
  }

  private advanceFrame() {
    if (!this.active || this.frameRects.length === 0) {
      this.stop();
      return;
    }

    const nextFrame = this.frameIndex + 1;
    if (nextFrame >= this.frameRects.length) {
      if (this.loop) {
        this.frameIndex = 0;
        this.applyFrame(0);
        return;
      }

      this.stopTimer();
      this.isPlaying = false;
      this.applyFrame(this.frameRects.length - 1);
      const complete = this.onComplete;
      this.onComplete = undefined;
      complete?.();
      return;
    }

    this.frameIndex = nextFrame;
    this.applyFrame(this.frameIndex);
  }

  private applyFrame(index: number) {
    const frame = this.frameRects[index];
    this.image.setCrop(frame.x, frame.y, frame.width, frame.height);
    this.applyFrameScale();
  }

  private stopTimer() {
    this.timer?.remove(false);
    this.timer = undefined;
  }

  private applyFrameScale() {
    if (!this.targetWidth || !this.targetHeight) return;

    const frame = this.frameRects[this.frameIndex];
    const scaleX = this.targetWidth / frame.width;
    const scaleY = this.targetHeight / frame.height;
    const frameCenterX = frame.x + frame.width / 2;
    const frameCenterY = frame.y + frame.height / 2;
    const sheetCenterX = this.sheetWidth / 2;
    const sheetCenterY = this.sheetHeight / 2;

    this.image.setScale(scaleX, scaleY);
    this.image.setPosition(
      -(frameCenterX - sheetCenterX) * scaleX,
      -(frameCenterY - sheetCenterY) * scaleY,
    );
  }
}

function buildFrameRects(config: TileSpriteAnimationConfig): FrameRect[] {
  const frames: FrameRect[] = [];

  for (let frameIndex = 0; frameIndex < config.frameCount; frameIndex += 1) {
    const col = frameIndex % config.columns;
    const row = Math.floor(frameIndex / config.columns);

    const x = Math.round((col * config.sheetWidth) / config.columns);
    const nextX = Math.round(((col + 1) * config.sheetWidth) / config.columns);
    const y = Math.round((row * config.sheetHeight) / config.rows);
    const nextY = Math.round(((row + 1) * config.sheetHeight) / config.rows);

    const rawWidth = nextX - x;
    const insetX = rawWidth > FRAME_INSET_X * 2 ? FRAME_INSET_X : 0;

    frames.push({
      x: x + insetX,
      y,
      width: rawWidth - insetX * 2,
      height: nextY - y,
    });
  }

  return frames;
}
