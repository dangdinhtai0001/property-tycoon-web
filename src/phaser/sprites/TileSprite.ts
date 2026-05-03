import Phaser from 'phaser';
import { TileType, PropertyGroup } from '../../game-engine/types/game';
import type { BoardTile, Property } from '../../game-engine/types/game';

const getGroupColor = (groupId?: PropertyGroup): number => {
  switch (groupId) {
    case PropertyGroup.BROWN: return 0x78350f; // bg-yellow-900
    case PropertyGroup.LIGHT_BLUE: return 0x93c5fd; // bg-blue-300
    case PropertyGroup.PINK: return 0xf472b6; // bg-pink-400
    case PropertyGroup.ORANGE: return 0xf97316; // bg-orange-500
    case PropertyGroup.RED: return 0xdc2626; // bg-red-600
    case PropertyGroup.YELLOW: return 0xfacc15; // bg-yellow-400
    case PropertyGroup.GREEN: return 0x16a34a; // bg-green-600
    case PropertyGroup.DARK_BLUE: return 0x1e40af; // bg-blue-800
    default: return 0x94a3b8; // bg-gray-400
  }
};

export class TileSprite extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private colorBar?: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private priceText?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, tile: BoardTile) {
    super(scene, x, y);

    // Background
    this.background = scene.add.rectangle(0, 0, width, height, 0xffffff)
      .setStrokeStyle(2, 0xe2e8f0);
    this.add(this.background);

    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      this.scene.events.emit('tile-clicked', tile.id);
    });

    const isProperty = tile.type === TileType.PROPERTY;
    const property = isProperty ? (tile as Property) : null;

    // Color bar for properties
    if (isProperty && property?.groupId && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY) {
      this.colorBar = scene.add.rectangle(0, -height / 2 + 10, width, 20, getGroupColor(property.groupId));
      this.add(this.colorBar);
    }

    // Name
    this.nameText = scene.add.text(0, isProperty ? 12 : 0, tile.name, {
      fontSize: '14px',
      color: '#1e293b',
      fontWeight: '900',
      align: 'center',
      wordWrap: { width: width - 15 }
    }).setOrigin(0.5);
    this.add(this.nameText);

    // Price
    if (isProperty && property) {
      this.priceText = scene.add.text(0, height / 2 - 18, `$${property.price}`, {
        fontSize: '13px',
        color: '#475569',
        fontWeight: '900'
      }).setOrigin(0.5);
      this.add(this.priceText);
    }

    scene.add.existing(this);
  }
}
