import Phaser from 'phaser';
import { TileType, PropertyGroup } from '../../game-engine/types/game';
import type { BoardTile, Property, Player } from '../../game-engine/types/game';
import { THEME, getTileIcon, getCornerHint } from '../../ui/theme/tokens';
import { type BoardTileLayout } from '../../game-engine/utils/boardGeometry';

export class TileSprite extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private border?: Phaser.GameObjects.Graphics;
  private layout: BoardTileLayout;

  private colorStrip?: Phaser.GameObjects.Rectangle;
  private iconText?: Phaser.GameObjects.Text;
  private nameText!: Phaser.GameObjects.Text;
  private priceText!: Phaser.GameObjects.Text;
  private statusContainer: Phaser.GameObjects.Container;
  private ownerMarker?: Phaser.GameObjects.Rectangle;
  private buildingMarkers: Phaser.GameObjects.Text[] = [];
  private mortgageOverlay?: Phaser.GameObjects.Rectangle;
  private mortgageIcon?: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, tile: BoardTile, layout: BoardTileLayout) {
    super(scene, x, y);
    this.layout = layout;

    const { sideIndex, isCorner } = layout;
    const isProperty = tile.type === TileType.PROPERTY;
    const property = isProperty ? (tile as Property) : null;

    // 1. Background (Agnostic of type)
    const bgColor = tile.backgroundColor ?? THEME.colors.surface.DEFAULT;
    this.background = scene.add.rectangle(0, 0, width, height, bgColor);
    this.add(this.background);

    this.background.setInteractive({ useHandCursor: true });
    this.background.on('pointerdown', () => {
      this.scene.events.emit('tile-clicked', tile.id);
    });

    // Hover effects
    this.background.on('pointerover', () => {
      this.drawBorder(THEME.colors.surface.HOVER, 2);
      scene.tweens.add({ targets: this, scale: 1.02, duration: 100 });
    });

    this.background.on('pointerout', () => {
      this.drawBorder(THEME.colors.surface.BORDER, 1.5);
      scene.tweens.add({ targets: this, scale: 1, duration: 100 });
    });

    // 2. Status Container (for markers)
    this.statusContainer = scene.add.container(0, 0);
    this.add(this.statusContainer);

    // 3. Render Content Based on Type
    if (isCorner) {
      this.renderCornerLayout(scene, width, height, tile);
    } else if (sideIndex === 0 || sideIndex === 2) {
      this.renderVerticalLayout(scene, width, height, tile, property, sideIndex === 2);
    } else {
      this.renderHorizontalLayout(scene, width, height, tile, property, sideIndex === 1);
    }

    this.updateStatus(tile);
    this.applyTypeBackground(tile);
    this.drawBorder();
    scene.add.existing(this);
  }

  private renderCornerLayout(scene: Phaser.Scene, width: number, height: number, tile: BoardTile) {
    const type = tile.type as keyof typeof THEME.colors.corners;
    const style = THEME.colors.corners[type] || THEME.colors.corners.JAIL;

    // 1. Background Tint
    this.background.setFillStyle(style.bg);

    // 2. Accent Bar (Small strip at the outer corner)
    let ax = 0, ay = 0, aw = 0, ah = 0;
    const strip = 10;
    const { col, row } = this.layout;
    const isBot = row > 0;
    const isTop = row === 0;
    const isLeft = col === 0;
    const isRight = col > 0;

    if (isBot && isRight) { // Bottom Right
      ax = width / 2 - strip / 2; ay = height / 2 - strip / 2; aw = strip; ah = strip;
    } else if (isBot && isLeft) { // Bottom Left
      ax = -width / 2 + strip / 2; ay = height / 2 - strip / 2; aw = strip; ah = strip;
    } else if (isTop && isLeft) { // Top Left
      ax = -width / 2 + strip / 2; ay = -height / 2 + strip / 2; aw = strip; ah = strip;
    } else if (isTop && isRight) { // Top Right
      ax = width / 2 - strip / 2; ay = -height / 2 + strip / 2; aw = strip; ah = strip;
    }

    const accent = scene.add.rectangle(ax, ay, aw, ah, style.accent);
    this.add(accent);

    // 3. Icon
    const icon = getTileIcon(tile.type);
    this.iconText = scene.add.text(0, -25, icon, { fontSize: '72px' }).setOrigin(0.5);
    this.add(this.iconText);

    // 4. Title
    const displayName = tile.shortName || tile.name;
    this.nameText = scene.add.text(0, 25, displayName.toUpperCase(), {
      fontSize: THEME.typography.corner.size,
      color: style.text,
      fontStyle: '900',
      fontFamily: THEME.typography.fontFamily,
      align: 'center',
      wordWrap: { width: width - 20 }
    }).setOrigin(0.5);
    this.add(this.nameText);

    // 5. Hint
    const hint = getCornerHint(tile.type);
    const hintText = scene.add.text(0, 65, hint, {
      fontSize: THEME.typography.corner.hintSize,
      color: style.text,
      fontStyle: '600',
      fontFamily: THEME.typography.fontFamily
    }).setOrigin(0.5).setAlpha(0.7);
    this.add(hintText);
  }

  private renderVerticalLayout(
    scene: Phaser.Scene,
    width: number,
    height: number,
    tile: BoardTile,
    property: Property | null,
    isTop: boolean
  ) {
    const stripH = THEME.spacing.stripHeight;
    const stripColor = this.getStripColor(tile, property);

    if (stripColor !== null) {
      const sy = isTop ? height / 2 - stripH / 2 : -height / 2 + stripH / 2;
      this.colorStrip = scene.add.rectangle(0, sy, width, stripH, stripColor);
      this.add(this.colorStrip);
    }

    const innerY = isTop ? -10 : 10;
    const icon = getTileIcon(tile.type, property?.groupId);
    this.iconText = scene.add.text(0, innerY - 45, icon, { fontSize: '44px' }).setOrigin(0.5);
    this.add(this.iconText);

    const displayName = tile.shortName || tile.name;
    this.nameText = scene.add.text(0, innerY, displayName, {
      fontSize: THEME.typography.name.size,
      color: THEME.colors.text.PRIMARY,
      fontStyle: 'bold',
      fontFamily: THEME.typography.fontFamily,
      align: 'center',
      wordWrap: { width: width - 10 }
    }).setOrigin(0.5);
    this.add(this.nameText);

    let priceStr = property ? `$${property.price}` : (tile.type === TileType.TAX ? (tile.name.includes('xa xỉ') ? '$150' : '$200') : '');
    this.priceText = scene.add.text(0, innerY + 45, priceStr, {
      fontSize: THEME.typography.price.size,
      color: THEME.colors.text.SECONDARY,
      fontStyle: 'bold',
      fontFamily: THEME.typography.fontFamily
    }).setOrigin(0.5);
    this.add(this.priceText);


  }

  private renderHorizontalLayout(
    scene: Phaser.Scene,
    width: number,
    height: number,
    tile: BoardTile,
    property: Property | null,
    isLeft: boolean
  ) {
    const stripW = THEME.spacing.stripHeight;
    const stripColor = this.getStripColor(tile, property);

    if (stripColor !== null) {
      const sx = isLeft ? width / 2 - stripW / 2 : -width / 2 + stripW / 2;
      this.colorStrip = scene.add.rectangle(sx, 0, stripW, height, stripColor);
      this.add(this.colorStrip);
    }

    const contentX = isLeft ? -10 : 10;
    const icon = getTileIcon(tile.type, property?.groupId);
    this.iconText = scene.add.text(contentX - 45, 0, icon, { fontSize: '44px' }).setOrigin(0.5);
    this.add(this.iconText);

    const displayName = tile.shortName || tile.name;
    this.nameText = scene.add.text(contentX - 15, -15, displayName, {
      fontSize: THEME.typography.name.size,
      color: THEME.colors.text.PRIMARY,
      fontStyle: 'bold',
      fontFamily: THEME.typography.fontFamily,
      align: 'left',
      wordWrap: { width: width - 75 }
    }).setOrigin(0, 0.5);
    this.add(this.nameText);

    let priceStr = property ? `$${property.price}` : (tile.type === TileType.TAX ? (tile.name.includes('xa xỉ') ? '$150' : '$200') : '');
    this.priceText = scene.add.text(contentX - 15, 25, priceStr, {
      fontSize: THEME.typography.price.size,
      color: THEME.colors.text.SECONDARY,
      fontStyle: 'bold',
      fontFamily: THEME.typography.fontFamily
    }).setOrigin(0, 0.5);
    this.add(this.priceText);


  }

  private getStripColor(tile: BoardTile, property: Property | null): number | null {
    if (property) {
      // Only normal property groups (BROWN, RED, etc.) have color strips
      if (property.groupId === PropertyGroup.STATION) return null;
      if (property.groupId === PropertyGroup.UTILITY) return null;
      return THEME.colors.groups[property.groupId as keyof typeof THEME.colors.groups] || null;
    }
    return null;
  }

  private applyTypeBackground(tile: BoardTile) {
    if (tile.backgroundColor !== undefined) {
      this.background.setFillStyle(tile.backgroundColor);
    } else {
      // Fallback if data property is missing
      if (tile.type === TileType.CHANCE) {
        this.background.setFillStyle(0xFEF08A);
      } else if (tile.type === TileType.FORTUNE) {
        this.background.setFillStyle(0xFECACA);
      } else if (tile.type === TileType.TAX) {
        this.background.setFillStyle(0xFFFBEB);
      } else {
        this.background.setFillStyle(THEME.colors.surface.DEFAULT);
      }
    }
  }

  private ownerBadge?: Phaser.GameObjects.Arc;
  private buildingPips: Phaser.GameObjects.Arc[] = [];
  private mortgageStamp?: Phaser.GameObjects.Container;

  public updateStatus(tile: BoardTile, players: Player[] = [], showStatus: boolean = true) {
    this.statusContainer.setVisible(showStatus);
    if (!showStatus) return;

    const isProperty = tile.type === TileType.PROPERTY;

    // 1. Property-Specific Status
    if (isProperty) {
      const property = tile as Property;
      const owner = property.ownerId ? players.find(p => p.id === property.ownerId) : null;

      // Ownership Indicators
      if (owner) {
        const ownerColor = Phaser.Display.Color.HexStringToColor(owner.color).color;

        // A. Strip highlight
        const thickness = 6;
        if (!this.ownerMarker) {
          let mx = 0, my = 0, mw = this.background.width, mh = this.background.height;
          if (this.layout.sideIndex === 0) { my = this.background.height / 2 - thickness / 2; mh = thickness; }
          else if (this.layout.sideIndex === 1) { mx = -this.background.width / 2 + thickness / 2; mw = thickness; }
          else if (this.layout.sideIndex === 2) { my = -this.background.height / 2 + thickness / 2; mh = thickness; }
          else if (this.layout.sideIndex === 3) { mx = this.background.width / 2 - thickness / 2; mw = thickness; }
          this.ownerMarker = this.scene.add.rectangle(mx, my, mw, mh, ownerColor);
          this.statusContainer.add(this.ownerMarker);
        } else {
          this.ownerMarker.setFillStyle(ownerColor).setVisible(true);
        }

        // B. Badge Dot (Bottom-Left)
        if (!this.ownerBadge) {
          const bx = -this.background.width / 2 + 15;
          const by = this.background.height / 2 - 15;
          this.ownerBadge = this.scene.add.arc(bx, by, THEME.effects.markers.ownerBadgeSize / 2, 0, 360, false, ownerColor)
            .setStrokeStyle(1.5, 0xffffff);
          this.statusContainer.add(this.ownerBadge);
        } else {
          this.ownerBadge.setFillStyle(ownerColor).setVisible(true);
        }
      } else {
        this.ownerMarker?.setVisible(false);
        this.ownerBadge?.setVisible(false);
      }

      // Building Indicators (Land only)
      this.buildingMarkers.forEach(m => m.destroy());
      this.buildingPips.forEach(p => p.destroy());
      this.buildingMarkers = [];
      this.buildingPips = [];

      if (property.buildingLevel > 0) {
        const isHorizontal = this.layout.sideIndex === 0 || this.layout.sideIndex === 2;
        const bx = this.background.width / 2 - 15;
        const by = this.background.height / 2 - 15;

        if (property.buildingLevel === 5) {
          // Level 5: Landmark Icon
          const marker = this.scene.add.text(bx, by, '🏨', { fontSize: '14px' }).setOrigin(0.5);
          this.statusContainer.add(marker);
          this.buildingMarkers.push(marker);
        } else {
          // Level 1-4: Pips
          const pipSize = THEME.effects.markers.buildingPipSize;
          const gap = THEME.effects.markers.buildingPipGap;
          const totalWidth = (property.buildingLevel * pipSize) + ((property.buildingLevel - 1) * gap);

          for (let i = 0; i < property.buildingLevel; i++) {
            const px = bx - totalWidth / 2 + (i * (pipSize + gap)) + pipSize / 2;
            const pip = this.scene.add.arc(px, by, pipSize / 2, 0, 360, false, 0x334155).setStrokeStyle(1, 0xffffff);
            this.statusContainer.add(pip);
            this.buildingPips.push(pip);
          }
        }
      }

      // Mortgage Status
      if (property.isMortgaged) {
        if (!this.mortgageOverlay) {
          this.mortgageOverlay = this.scene.add.rectangle(0, 0, this.background.width, this.background.height, 0x000000, 0.2);
          this.statusContainer.add(this.mortgageOverlay);
        }

        if (!this.mortgageStamp) {
          this.mortgageStamp = this.scene.add.container(0, 0);
          const bg = this.scene.add.rectangle(0, 0, 70, 18, THEME.effects.markers.mortgageStampColor, 0.9)
            .setStrokeStyle(1, 0xffffff).setAngle(-25);
          const txt = this.scene.add.text(0, 0, 'THẾ CHẤP', { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' })
            .setOrigin(0.5).setAngle(-25);
          this.mortgageStamp.add([bg, txt]);
          this.statusContainer.add(this.mortgageStamp);
        }

        this.mortgageOverlay.setVisible(true);
        this.mortgageStamp.setVisible(true);
        this.background.setAlpha(0.6);
        if (this.iconText) this.iconText.setAlpha(0.4);
        if (this.nameText) this.nameText.setAlpha(0.4);
        if (this.priceText) this.priceText.setAlpha(0.4);
      } else {
        this.mortgageOverlay?.setVisible(false);
        this.mortgageStamp?.setVisible(false);
        this.background.setAlpha(1);
        if (this.iconText) this.iconText.setAlpha(1);
        if (this.nameText) this.nameText.setAlpha(1);
        if (this.priceText) this.priceText.setAlpha(1);
      }
    }

    // 2. Corner-Specific Status (Jailed State)
    if (tile.type === TileType.JAIL) {
      const playersOnTile = players.filter(p => p.position === tile.position);
      const isAnyoneJailed = playersOnTile.some(p => p.jailTurns > 0);

      if (isAnyoneJailed) {
        if (!this.jailedBadge) {
          this.jailedBadge = this.scene.add.container(0, -this.background.height / 2 + 15);
          const bg = this.scene.add.rectangle(0, 0, 60, 16, 0xDC2626, 0.9).setStrokeStyle(1, 0xffffff);
          const txt = this.scene.add.text(0, 0, 'BỊ GIAM', { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
          this.jailedBadge.add([bg, txt]);
          this.statusContainer.add(this.jailedBadge);
        }
        this.jailedBadge.setVisible(true);
      } else {
        this.jailedBadge?.setVisible(false);
      }
    }

    // Cập nhật border dựa trên trạng thái hiện tại
    this.drawBorder();
  }

  private highlight?: Phaser.GameObjects.Graphics;

  private drawBorder(
    color: number = THEME.colors.surface.BORDER,
    width: number = 1.5
  ) {
    if (!this.border) {
      this.border = this.scene.add.graphics();
      this.add(this.border);
    }

    this.border.clear();
    this.border.lineStyle(width, color, 1);

    this.border.strokeRect(
      -this.background.width / 2,
      -this.background.height / 2,
      this.background.width,
      this.background.height
    );

    this.bringToTop(this.border);
  }

  public setHighlighted(active: boolean, color: number = 0xffffff) {
    if (active) {
      if (!this.highlight) {
        this.highlight = this.scene.add.graphics();
        this.add(this.highlight);
      }
      this.highlight.clear();
      this.highlight.lineStyle(THEME.effects.tileHighlightWidth, color, 0.8);
      this.highlight.strokeRect(
        -this.background.width / 2,
        -this.background.height / 2,
        this.background.width,
        this.background.height
      );

      // Outer glow effect using rectangle with alpha gradient if possible, 
      // but for simplicity, we use a thicker stroke for now.
      this.highlight.lineStyle(THEME.effects.tileHighlightWidth * 2, color, 0.3);
      this.highlight.strokeRect(
        -this.background.width / 2 - 2,
        -this.background.height / 2 - 2,
        this.background.width + 4,
        this.background.height + 4
      );
      this.highlight.setVisible(true);
    } else {
      this.highlight?.setVisible(false);
    }
  }
}

