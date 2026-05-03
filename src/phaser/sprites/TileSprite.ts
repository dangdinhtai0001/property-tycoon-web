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
  private iconText?: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;
  private infoText: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;
  private image?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, tile: BoardTile) {
    super(scene, x, y);

    const isProperty = tile.type === TileType.PROPERTY;
    const property = isProperty ? (tile as Property) : null;
    const pos = tile.position;

    // Determine Layout Type
    const isCorner = pos === 0 || pos === 10 || pos === 20 || pos === 30;
    const isVerticalSide = (pos > 10 && pos < 20) || (pos > 30 && pos < 40);
    const isHorizontalSide = (pos > 0 && pos < 10) || (pos > 20 && pos < 30);

    // 1. Background
    this.background = scene.add.rectangle(0, 0, width, height, 0xffffff)
      .setStrokeStyle(2, 0xe2e8f0);
    this.add(this.background);

    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      this.scene.events.emit('tile-clicked', tile.id);
    });

    if (isCorner) {
      this.renderCornerLayout(scene, width, height, tile);
    } else if (isVerticalSide) {
      this.renderVerticalLayout(scene, width, height, tile, property);
    } else {
      this.renderHorizontalLayout(scene, width, height, tile, property);
    }

    this.updateStatus(tile);
    scene.add.existing(this);
  }

  private renderCornerLayout(scene: Phaser.Scene, width: number, height: number, tile: BoardTile) {
    // Try to load image if available
    if (tile.imageUrl) {
      // Assuming images are preloaded with keys like 'tile-image-{id}'
      const imageKey = `tile-img-${tile.id}`;
      if (scene.textures.exists(imageKey)) {
        this.image = scene.add.image(0, 0, imageKey);
        const scale = Math.min(width / this.image.width, height / this.image.height) * 0.8;
        this.image.setScale(scale);
        this.add(this.image);
        return;
      }
    }

    // Fallback: Large Icon and Name
    const getIcon = () => {
      switch (tile.type) {
        case TileType.START: return '🚩';
        case TileType.JAIL: return '🚔';
        case TileType.REST: return '🏖️';
        case TileType.GO_TO_JAIL: return '👮';
        default: return '📍';
      }
    };

    this.iconText = scene.add.text(0, -10, getIcon(), { fontSize: '42px' }).setOrigin(0.5);
    this.add(this.iconText);

    this.nameText = scene.add.text(0, height / 2 - 15, tile.name, {
      fontSize: '12px',
      color: '#1e293b',
      fontWeight: '900',
      align: 'center',
      wordWrap: { width: width - 10 }
    }).setOrigin(0.5);
    this.add(this.nameText);
  }

  private renderHorizontalLayout(scene: Phaser.Scene, width: number, height: number, tile: BoardTile, property: Property | null) {
    const isTop = tile.position > 20 && tile.position < 30;
    const hasColorBar = property && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY;

    // Color Bar (Faces Board Center)
    if (hasColorBar) {
      const barY = isTop ? height / 2 - 10 : -height / 2 + 10;
      this.colorBar = scene.add.rectangle(0, barY, width, 20, getGroupColor(property.groupId));
      this.add(this.colorBar);
    }

    // Offset content based on color bar position
    const contentYOffset = hasColorBar ? (isTop ? -10 : 10) : 0;

    // Layer 1: Icon (Always show for properties now)
    const iconY = isTop ? -height / 2 + 18 : height / 2 - 18;
    this.iconText = scene.add.text(0, iconY + contentYOffset, this.getTileIcon(tile, property), { fontSize: '18px' }).setOrigin(0.5);
    this.add(this.iconText);

    // Layer 2: Short Name
    const displayName = tile.shortName || tile.name;
    this.nameText = scene.add.text(0, contentYOffset, displayName, {
      fontSize: '12px',
      color: '#0f172a',
      fontWeight: '900',
      align: 'center',
      wordWrap: { width: width - 10 }
    }).setOrigin(0.5);
    this.add(this.nameText);

    // Layer 3: Price / Info
    let info = '';
    if (property) info = `$${property.price}`;
    else if (tile.type === TileType.TAX) info = tile.name.includes('xa xỉ') ? '$150' : '$200';

    const infoY = isTop ? -height / 2 + 35 : height / 2 - 35;
    this.infoText = scene.add.text(0, infoY + contentYOffset, info, { fontSize: '11px', color: '#334155', fontWeight: '900' }).setOrigin(0.5);
    this.add(this.infoText);

    this.statusText = scene.add.text(0, isTop ? height / 2 - 25 : -height / 2 + 25, '', { fontSize: '10px', color: '#334155', fontWeight: '900' }).setOrigin(0.5);
    this.add(this.statusText);
  }

  private renderVerticalLayout(scene: Phaser.Scene, width: number, height: number, tile: BoardTile, property: Property | null) {
    const isLeft = tile.position > 10 && tile.position < 20;
    const hasColorBar = property && property.groupId !== PropertyGroup.STATION && property.groupId !== PropertyGroup.UTILITY;

    // Color Bar (Faces Board Center)
    if (hasColorBar) {
      const barX = isLeft ? width / 2 - 10 : -width / 2 + 10;
      this.colorBar = scene.add.rectangle(barX, 0, 20, height, getGroupColor(property.groupId));
      this.add(this.colorBar);
    }

    // Offset content based on color bar position
    const contentXOffset = hasColorBar ? (isLeft ? -10 : 10) : 0;

    // Layer 1: Icon
    const iconX = isLeft ? -width / 2 + 18 : width / 2 - 18;
    this.iconText = scene.add.text(iconX + contentXOffset, 0, this.getTileIcon(tile, property), { fontSize: '20px' }).setOrigin(0.5);
    this.add(this.iconText);

    // Layer 2: Short Name
    const displayName = tile.shortName || tile.name;
    this.nameText = scene.add.text(contentXOffset, -10, displayName, {
      fontSize: '12px',
      color: '#0f172a',
      fontWeight: '900',
      align: 'center',
      wordWrap: { width: width - 25 }
    }).setOrigin(0.5);
    this.add(this.nameText);

    // Layer 3: Price / Info
    let info = '';
    if (property) info = `$${property.price}`;
    this.infoText = scene.add.text(contentXOffset, 10, info, { fontSize: '11px', color: '#334155', fontWeight: '900' }).setOrigin(0.5);
    this.add(this.infoText);

    this.statusText = scene.add.text(isLeft ? width / 2 - 25 : -width / 2 + 25, 0, '', { fontSize: '10px', color: '#334155', fontWeight: '900' }).setOrigin(0.5);
    this.add(this.statusText);
  }

  private getTileIcon(tile: BoardTile, property: Property | null): string {
    switch (tile.type) {
      case TileType.CHANCE: return '🎲';
      case TileType.FORTUNE: return '🍀';
      case TileType.TAX: return '💸';
      case TileType.PROPERTY: 
        if (property?.groupId === PropertyGroup.STATION) return '🚉';
        if (property?.groupId === PropertyGroup.UTILITY) return '⚡';
        return '🏠';
      default: return '📍';
    }
  }

  private ownerMarker?: Phaser.GameObjects.Arc;

  public updateStatus(tile: BoardTile, players: Player[] = []) {
    if (tile.type !== TileType.PROPERTY) return;
    const property = tile as Property;
    
    // 1. Owner Marker & Border Glow
    const owner = property.ownerId ? players.find(p => p.id === property.ownerId) : null;
    
    if (owner) {
      const ownerColor = Phaser.Display.Color.HexStringToColor(owner.color).color;
      
      if (!this.ownerMarker) {
        // Position at bottom-right of the tile
        const markerX = this.background.width / 2 - 12;
        const markerY = this.background.height / 2 - 12;
        this.ownerMarker = this.scene.add.arc(markerX, markerY, 8, 0, 360, false, ownerColor);
        this.ownerMarker.setStrokeStyle(2, 0xffffff);
        this.add(this.ownerMarker);
      } else {
        this.ownerMarker.setFillStyle(ownerColor);
        this.ownerMarker.setVisible(true);
      }
      
      // Highlight tile border with owner color
      this.background.setStrokeStyle(4, ownerColor);
    } else {
      if (this.ownerMarker) this.ownerMarker.setVisible(false);
      this.background.setStrokeStyle(2, 0xe2e8f0);
    }
    
    // 2. Building Level & Mortgage Status
    let statusParts = [];
    if (property.buildingLevel > 0) {
      if (property.buildingLevel === 5) {
        statusParts.push('🏨');
      } else {
        statusParts.push('🏠'.repeat(property.buildingLevel));
      }
    }
    
    if (property.isMortgaged) {
      statusParts.push('🔒 TC');
      this.background.setFillStyle(0xf1f5f9);
      this.background.setAlpha(0.8);
    } else {
      this.background.setFillStyle(0xffffff);
      this.background.setAlpha(1);
    }

    if (this.statusText) {
      this.statusText.setText(statusParts.join(' '));
      this.statusText.setColor('#64748b');
      this.statusText.setFontStyle('900');
    }
  }
}

