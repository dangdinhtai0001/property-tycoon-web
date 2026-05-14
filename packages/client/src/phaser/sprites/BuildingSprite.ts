import Phaser from 'phaser';
import { BUILDING } from '../../config/ui';

export class BuildingSprite extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, type: 'house' | 'hotel') {
    super(scene, x, y);

    const config = type === 'house' ? BUILDING.house : BUILDING.hotel;
    const color = config.color;
    const size = config.size;

    const rect = scene.add.rectangle(0, 0, size, size, color)
      .setStrokeStyle(BUILDING.borderWidth, BUILDING.borderColor);
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
