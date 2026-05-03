import Phaser from 'phaser';

export class BuildingSprite extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, type: 'house' | 'hotel') {
    super(scene, x, y);

    const color = type === 'house' ? 0x10b981 : 0xef4444; // emerald-500 or red-500
    const size = type === 'house' ? 12 : 16;

    const rect = scene.add.rectangle(0, 0, size, size, color)
      .setStrokeStyle(1, 0xffffff);
    this.add(rect);

    if (type === 'hotel') {
      const icon = scene.add.image(0, 0, 'landmark').setDisplaySize(12, 12);
      this.add(icon);
    } else {
      const icon = scene.add.image(0, 0, 'home').setDisplaySize(8, 8);
      this.add(icon);
    }

    scene.add.existing(this);
  }
}
