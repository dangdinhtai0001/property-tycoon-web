import Phaser from 'phaser';
import { TileSprite } from '../sprites/TileSprite';
import { TokenSprite } from '../sprites/TokenSprite';
import { BuildingSprite } from '../sprites/BuildingSprite';
import { TileType } from '../../game-engine/types/game';
import type { GameState, Property, Player } from '../../game-engine/types/game';
import { DiceSprite } from '../sprites/DiceSprite';

export class BoardScene extends Phaser.Scene {
  private tiles: TileSprite[] = [];
  private tokens: Map<string, TokenSprite> = new Map();
  private playerPositions: Map<string, number> = new Map();
  private tilesContainer!: Phaser.GameObjects.Container;
  private buildingsContainer!: Phaser.GameObjects.Container;
  private tokensContainer!: Phaser.GameObjects.Container;
  private diceContainer!: Phaser.GameObjects.Container;
  private boardContainer!: Phaser.GameObjects.Container;
  private boardSurface!: Phaser.GameObjects.Rectangle;

  private static readonly CORNER_TILE_SIZE = 150;  // Kích thước ô Góc

  private static readonly VERTICAL_TILE_W = 110;   // Chiều ngang ô hàng Top/Bot
  private static readonly VERTICAL_TILE_H = BoardScene.CORNER_TILE_SIZE;   // Chiều cao ô hàng Top/Bot

  private static readonly HORIZONTAL_TILE_W = BoardScene.CORNER_TILE_SIZE; // Chiều ngang ô hàng Left/Right
  private static readonly HORIZONTAL_TILE_H = 80;  // Chiều cao ô hàng Left/Right



  private static readonly BOARD_W = BoardScene.CORNER_TILE_SIZE * 2 + BoardScene.VERTICAL_TILE_W * 10;
  private static readonly BOARD_H = BoardScene.CORNER_TILE_SIZE * 2 + BoardScene.HORIZONTAL_TILE_H * 10;

  constructor() {
    super('BoardScene');
  }

  create() {
    this.boardContainer = this.add.container(0, 0);
    this.tilesContainer = this.add.container(0, 0);
    this.buildingsContainer = this.add.container(0, 0);
    this.tokensContainer = this.add.container(0, 0);
    this.diceContainer = this.add.container(0, 0);

    // Setup Board Surface
    this.boardSurface = this.add.rectangle(
      BoardScene.BOARD_W / 2,
      BoardScene.BOARD_H / 2,
      BoardScene.BOARD_W,
      BoardScene.BOARD_H,
      0xffffff, 0
    );
    this.boardContainer.add(this.boardSurface);

    // Add in order: Tiles (bottom) -> Buildings -> Borders -> Tokens -> Dice (top)
    this.boardContainer.add(this.tilesContainer);
    this.boardContainer.add(this.buildingsContainer);
    this.boardContainer.add(this.tokensContainer);

    // Dice should be above everything
    this.add.existing(this.diceContainer);
    this.diceContainer.setDepth(1000);

    // Center logo is now handled by React overlay (BoardStatus component)


    this.events.on('update-state', (state: GameState) => {
      this.updateBoard(state);
    });

    this.events.on('show-dice-roll', (result: number[]) => {
      this.showDiceRoll(result);
    });

    // Scene-level click listener for better reliability
    this.events.on('tile-clicked', (tileId: string) => {
      this.game.events.emit('tile-clicked', tileId);
    });
  }

  async showDiceRoll(result: number[]) {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.diceContainer.removeAll(true);

    const dice1 = new DiceSprite(this, centerX - 60, centerY, 100);
    const dice2 = new DiceSprite(this, centerX + 60, centerY, 100);
    this.diceContainer.add([dice1, dice2]);

    // Entrance animation
    this.diceContainer.setAlpha(0);
    this.diceContainer.setScale(0.5);
    this.tweens.add({
      targets: this.diceContainer,
      alpha: 1,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });

    await Promise.all([
      dice1.roll(result[0], 100),
      dice2.roll(result[1], 100)
    ]);

    // Show result text
    const sumText = this.add.text(centerX, centerY + 100, (result[0] + result[1]).toString(), {
      fontSize: '80px',
      color: '#2563eb',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 8
    }).setOrigin(0.5).setAlpha(0).setScale(0);

    this.diceContainer.add(sumText);

    this.tweens.add({
      targets: sumText,
      alpha: 1,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Wait a bit then fade out
    await new Promise(r => setTimeout(r, 1500));

    this.tweens.add({
      targets: [this.diceContainer],
      alpha: 0,
      scale: 0.8,
      duration: 400,
      ease: 'Power2.easeIn',
      onComplete: () => {
        this.diceContainer.removeAll(true);
      }
    });
  }

  private updateBoard(state: GameState) {
    const offsetW = (this.cameras.main.width - BoardScene.BOARD_W) / 2;
    const offsetH = (this.cameras.main.height - BoardScene.BOARD_H) / 2;

    this.boardContainer.setPosition(offsetW, offsetH);

    // Clear and redraw tiles if board configuration changed or first load
    if (this.tiles.length === 0) {
      state.board.forEach((tile) => {
        const pos = this.getTilePosition(tile.position);
        const sprite = new TileSprite(this, pos.x, pos.y, pos.w, pos.h, tile);
        this.tiles.push(sprite);
        this.tilesContainer.add(sprite);
      });
    }

    // Update tile statuses (Ownership, Buildings, Mortgage, Highlights)
    state.board.forEach((tile, index) => {
      const sprite = this.tiles[index];
      if (sprite) {
        sprite.updateStatus(tile, state.players);

        // Highlight current tile (where the current player is)
        const isCurrentTile = state.players.find(p => p.id === state.currentPlayerId)?.position === index;
        const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
        const highlightColor = currentPlayer ? Phaser.Display.Color.HexStringToColor(currentPlayer.color).color : 0xffffff;

        sprite.setHighlighted(isCurrentTile, highlightColor);
        if (isCurrentTile) {
          this.tilesContainer.bringToTop(sprite);
        }
      }
    });

    // Update tokens with smooth movement and stacking
    const playersByPosition: Record<number, Player[]> = {};
    state.players.forEach(p => {
      if (!playersByPosition[p.position]) playersByPosition[p.position] = [];
      playersByPosition[p.position].push(p);
    });

    state.players.forEach((player) => {
      const tilePos = this.getTilePosition(player.position);

      // Calculate stacking offset (Phase 4: Mini-grid / Fan-out)
      const playersOnThisTile = playersByPosition[player.position] || [];
      const playerIndex = playersOnThisTile.findIndex(p => p.id === player.id);
      let stackOffsetX = 0;
      let stackOffsetY = 0;

      if (playersOnThisTile.length > 1) {
        const count = playersOnThisTile.length;
        const spacing = 18;

        if (count === 2) {
          stackOffsetX = playerIndex === 0 ? -spacing / 2 : spacing / 2;
        } else if (count === 3) {
          const angle = (playerIndex / 3) * Math.PI * 2 - Math.PI / 2;
          stackOffsetX = Math.cos(angle) * spacing;
          stackOffsetY = Math.sin(angle) * spacing;
        } else if (count >= 4) {
          const row = Math.floor(playerIndex / 2);
          const col = playerIndex % 2;
          stackOffsetX = (col - 0.5) * spacing;
          stackOffsetY = (row - 0.5) * spacing;
        }
      }

      const targetX = tilePos.x + stackOffsetX;
      const targetY = tilePos.y + stackOffsetY;

      let token = this.tokens.get(player.id);
      const lastPos = this.playerPositions.get(player.id);

      if (!token) {
        token = new TokenSprite(this, targetX, targetY, player);
        this.tokens.set(player.id, token);
        this.tokensContainer.add(token);
        this.playerPositions.set(player.id, player.position);
      }

      // Phase 4: Token States & Highlights
      const isCurrentPlayer = player.id === state.currentPlayerId;
      token.setSelected(isCurrentPlayer);
      token.setJailed(player.jailTurns > 0);
      token.setBankrupt(player.isBankrupt || false);

      // Ensure current player is always on top within the container
      if (isCurrentPlayer) {
        this.tokensContainer.bringToTop(token);
      }

      if (lastPos !== undefined && lastPos !== player.position) {
        // Path movement...
        const path: { x: number, y: number }[] = [];
        let current = lastPos;
        const forwardDist = (player.position - lastPos + 44) % 44;
        const backwardDist = (lastPos - player.position + 44) % 44;
        const isBackward = backwardDist < forwardDist && backwardDist < 10;

        while (current !== player.position) {
          current = isBackward ? (current - 1 + 44) % 44 : (current + 1) % 44;
          const p = this.getTilePosition(current);
          const ox = (current === player.position) ? stackOffsetX : 0;
          const oy = (current === player.position) ? stackOffsetY : 0;
          path.push({ x: p.x + ox, y: p.y + oy });
          if (path.length > 44) break;
        }
        token.moveAlongPath(path);
        this.playerPositions.set(player.id, player.position);
      } else {
        const dist = Phaser.Math.Distance.Between(token.x, token.y, targetX, targetY);
        if (dist > 1) token.moveToPosition(targetX, targetY, 300);
      }
    });

    // Update buildings (Phase 5: Now handled by TileSprite.updateStatus)
    this.buildingsContainer.removeAll(true);
  }

  private getTilePosition(position: number) {
    const {
      VERTICAL_TILE_W, VERTICAL_TILE_H,
      HORIZONTAL_TILE_W, HORIZONTAL_TILE_H,
      CORNER_TILE_SIZE, BOARD_W, BOARD_H
    } = BoardScene;

    let x: number, y: number;
    let w: number, h: number;

    if (position === 0) { // Start (Bottom-Right)
      x = BOARD_W - CORNER_TILE_SIZE / 2;
      y = BOARD_H - CORNER_TILE_SIZE / 2;
      w = h = CORNER_TILE_SIZE;
    } else if (position < 11) { // Bottom Row (Vertical Tiles)
      x = BOARD_W - CORNER_TILE_SIZE - (position - 0.5) * VERTICAL_TILE_W;
      y = BOARD_H - CORNER_TILE_SIZE / 2;
      w = VERTICAL_TILE_W;
      h = VERTICAL_TILE_H;
    } else if (position === 11) { // Jail (Bottom-Left)
      x = CORNER_TILE_SIZE / 2;
      y = BOARD_H - CORNER_TILE_SIZE / 2;
      w = h = CORNER_TILE_SIZE;
    } else if (position < 22) { // Left Row (Horizontal Tiles)
      x = CORNER_TILE_SIZE / 2;
      y = BOARD_H - CORNER_TILE_SIZE - (position - 11 - 0.5) * HORIZONTAL_TILE_H;
      w = HORIZONTAL_TILE_W;
      h = HORIZONTAL_TILE_H;
    } else if (position === 22) { // Free Parking (Top-Left)
      x = CORNER_TILE_SIZE / 2;
      y = CORNER_TILE_SIZE / 2;
      w = h = CORNER_TILE_SIZE;
    } else if (position < 33) { // Top Row (Vertical Tiles)
      x = CORNER_TILE_SIZE + (position - 22 - 0.5) * VERTICAL_TILE_W;
      y = CORNER_TILE_SIZE / 2;
      w = VERTICAL_TILE_W;
      h = VERTICAL_TILE_H;
    } else if (position === 33) { // Go to Jail (Top-Right)
      x = BOARD_W - CORNER_TILE_SIZE / 2;
      y = CORNER_TILE_SIZE / 2;
      w = h = CORNER_TILE_SIZE;
    } else { // Right Row (Horizontal Tiles)
      x = BOARD_W - CORNER_TILE_SIZE / 2;
      y = CORNER_TILE_SIZE + (position - 33 - 0.5) * HORIZONTAL_TILE_H;
      w = HORIZONTAL_TILE_W;
      h = HORIZONTAL_TILE_H;
    }

    return { x, y, w, h };
  }

}
