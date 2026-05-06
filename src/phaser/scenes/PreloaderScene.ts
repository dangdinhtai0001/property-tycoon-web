import Phaser from 'phaser';

import {
  preloadTokenSpriteAssets,
} from '../sprites/TokenSprite';
import { preloadStartGateAnimationAssets } from '../sprites/StartGateAnimation';
import { preloadLandTileAnimationAssets } from '../sprites/LandTileActivationAnimation';
import { preloadStationTileAnimationAssets } from '../sprites/StationTileAnimation';

export class PreloaderScene extends Phaser.Scene {
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressBox?: Phaser.GameObjects.Graphics;
  private loadingText?: Phaser.GameObjects.Text;
  private percentText?: Phaser.GameObjects.Text;

  private readonly barWidth = 320;
  private readonly barHeight = 26;

  constructor() {
    super('PreloaderScene');
  }

  preload() {
    // Load assets
    preloadTokenSpriteAssets(this);
    preloadStartGateAnimationAssets(this);
    preloadLandTileAnimationAssets(this);
    preloadStationTileAnimationAssets(this);
    this.load.svg('home', 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/home.svg');
    this.load.svg('landmark', 'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/landmark.svg');
    this.load.image('board-bg', '/assets/bg/bg-02.png');
  }

  create(): void {
    this.createLoadingUI();
    this.playLoadingEffect();
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    const centerX = width / 2;
    const centerY = height / 2;

    // Background match Slate-50
    this.add.rectangle(centerX, centerY, width, height, 0xf8fafc, 1);

    this.loadingText = this.add
      .text(centerX, centerY - 60, 'ĐANG TẢI DỮ LIỆU', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '22px',
        color: '#1e293b',
        fontStyle: '900',
      })
      .setOrigin(0.5);

    this.percentText = this.add
      .text(centerX, centerY + 50, '0%', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#2563eb',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.progressBox = this.add.graphics();
    // Subtle Shadow
    this.progressBox.fillStyle(0x000000, 0.05);
    this.progressBox.fillRoundedRect(
      centerX - this.barWidth / 2 + 2,
      centerY - this.barHeight / 2 + 2,
      this.barWidth,
      this.barHeight,
      13,
    );

    // Inner Box (White)
    this.progressBox.fillStyle(0xffffff, 1);
    this.progressBox.fillRoundedRect(
      centerX - this.barWidth / 2,
      centerY - this.barHeight / 2,
      this.barWidth,
      this.barHeight,
      13,
    );
    this.progressBox.lineStyle(1, 0xe2e8f0, 1);
    this.progressBox.strokeRoundedRect(
      centerX - this.barWidth / 2,
      centerY - this.barHeight / 2,
      this.barWidth,
      this.barHeight,
      13,
    );

    this.progressBar = this.add.graphics();

    this.tweens.add({
      targets: this.loadingText,
      alpha: 0.5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private playLoadingEffect(): void {
    const progress = { value: 0 };

    this.tweens.add({
      targets: progress,
      value: 1,
      duration: 500,
      ease: 'Cubic.easeInOut',

      onUpdate: () => {
        this.drawProgress(progress.value);
      },

      onComplete: () => {
        this.scene.start('BoardScene');
      },
    });
  }

  private drawProgress(value: number): void {
    const progress = Phaser.Math.Clamp(value, 0, 1);

    const { width, height } = this.cameras.main;

    const x = width / 2 - this.barWidth / 2;
    const y = height / 2 - this.barHeight / 2;

    this.progressBar?.clear();

    // Main Gradient Bar (Simulated with two colors)
    this.progressBar?.fillStyle(0x2563eb, 1);
    this.progressBar?.fillRoundedRect(
      x + 3,
      y + 3,
      (this.barWidth - 6) * progress,
      this.barHeight - 6,
      10,
    );

    // Highligth/Reflection
    if (progress > 0.05) {
      this.progressBar?.fillStyle(0x60a5fa, 0.4);
      this.progressBar?.fillRoundedRect(
        x + 3,
        y + 3,
        (this.barWidth - 6) * progress,
        (this.barHeight - 6) / 2,
        { tl: 10, tr: 10, bl: 0, br: 0 },
      );
    }

    this.percentText?.setText(`${Math.round(progress * 100)}%`);

    const dotCount = Math.floor(this.time.now / 300) % 4;
    this.loadingText?.setText(`ĐANG TẢI DỮ LIỆU${'.'.repeat(dotCount)}`);
  }
}
