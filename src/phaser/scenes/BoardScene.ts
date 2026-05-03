import Phaser from 'phaser';
import { TileSprite } from '../sprites/TileSprite';
import { TokenSprite } from '../sprites/TokenSprite';
import { BuildingSprite } from '../sprites/BuildingSprite';
import { TileType, Phase } from '../../game-engine/types/game';
import type { GameState, Property, Player } from '../../game-engine/types/game';
import { DiceSprite } from '../sprites/DiceSprite';
import { useGameStore } from '../../app/store/useGameStore';
import {
  getBoardTileCount,
  getBoardTileLayout,
  getBoardCornerIndexes,
  type BoardGeometry,
} from '../../game-engine/utils/boardGeometry';

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
  private lastPlayersState: Map<string, { cash: number }> = new Map();
  private lastGlobalPurchaseId: string | undefined = undefined;

  // --- Dynamic Geometry Configuration ---
  public static readonly GEOMETRY = { cols: 14, rows: 12 };

  private static readonly CORNER_TILE_SIZE = 180;

  private static readonly VERTICAL_TILE_W = 130;   // Width of Top/Bot inner tiles
  private static readonly VERTICAL_TILE_H = BoardScene.CORNER_TILE_SIZE;   // Height of Top/Bot inner tiles (depth)

  private static readonly HORIZONTAL_TILE_W = BoardScene.CORNER_TILE_SIZE; // Width of Left/Right inner tiles (depth)
  private static readonly HORIZONTAL_TILE_H = 100;  // Height of Left/Right inner tiles


  private static readonly BOARD_W = BoardScene.CORNER_TILE_SIZE * 2 + BoardScene.VERTICAL_TILE_W * (BoardScene.GEOMETRY.cols - 2);
  private static readonly BOARD_H = BoardScene.CORNER_TILE_SIZE * 2 + BoardScene.HORIZONTAL_TILE_H * (BoardScene.GEOMETRY.rows - 2);

  public static getTileLayout(index: number) {
    return getBoardTileLayout(index, BoardScene.GEOMETRY);
  }

  constructor() {
    super('BoardScene');
  }

  create() {
    this.boardContainer = this.add.container(0, 0);
    this.tilesContainer = this.add.container(0, 0);
    this.buildingsContainer = this.add.container(0, 0);
    this.tokensContainer = this.add.container(0, 0);
    this.diceContainer = this.add.container(0, 0);

    // Setup Board Background Image
    const bg = this.add.image(BoardScene.BOARD_W / 2, BoardScene.BOARD_H / 2, 'board-bg');
    bg.setDisplaySize(BoardScene.BOARD_W, BoardScene.BOARD_H);
    bg.setAlpha(0.3); 
    this.boardContainer.add(bg);

    // Subtle overlay to make it look "integrated"
    this.boardSurface = this.add.rectangle(
      BoardScene.BOARD_W / 2,
      BoardScene.BOARD_H / 2,
      BoardScene.BOARD_W,
      BoardScene.BOARD_H,
      0xffffff, 0.1
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
      state.board.forEach((tile, index) => {
        const layout = BoardScene.getTileLayout(index);
        const pos = this.getTilePosition(layout);
        const sprite = new TileSprite(this, pos.x, pos.y, pos.w, pos.h, tile, layout);
        this.tiles.push(sprite);
        this.tilesContainer.add(sprite);
      });
    }

    // Update tile statuses (Ownership, Buildings, Mortgage, Highlights)
    const showStatus = state.phase !== Phase.SETUP;
    state.board.forEach((tile, index) => {
      const sprite = this.tiles[index];
      if (sprite) {
        sprite.updateStatus(tile, state.players, showStatus);

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
      const layout = BoardScene.getTileLayout(player.position);
      const tilePos = this.getTilePosition(layout);

      // Calculate stacking offset
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

      if (token) {
        token.setVisible(showStatus);
        
        // Phase 4: Token States & Highlights
        const isCurrentPlayer = player.id === state.currentPlayerId;
        token.setSelected(isCurrentPlayer);
        token.setJailed(player.jailTurns > 0);
        token.setBankrupt(player.isBankrupt || false);
        if (isCurrentPlayer && (player.jailTurns > 0 || player.isBankrupt)) {
          useGameStore.getState().setTokenAnimState('sad');
        }

        // Ensure current player is always on top
        if (isCurrentPlayer) {
          this.tokensContainer.bringToTop(token);
        }

        // Xử lý hoạt ảnh Win/Sad dựa trên thay đổi trạng thái
        const lastState = this.lastPlayersState.get(player.id);
        const hasNewPurchase = state.lastPurchaseId !== this.lastGlobalPurchaseId && state.lastPurchaseId !== undefined;
        const isBuyer = hasNewPurchase && state.currentPlayerId === player.id;

        const { setTokenAnimState } = useGameStore.getState();
        const isCurrentPlayerToken = player.id === state.currentPlayerId;

        if (lastState) {
          if (isBuyer) {
            token.setWinTemporarily(2000);
            if (isCurrentPlayerToken) {
              setTokenAnimState('win');
              setTimeout(() => useGameStore.getState().setTokenAnimState('idle'), 2000);
            }
          } else if (player.cash < lastState.cash && !isBuyer) {
            token.setSadTemporarily(2000);
            if (isCurrentPlayerToken) {
              setTokenAnimState('sad');
              setTimeout(() => useGameStore.getState().setTokenAnimState('idle'), 2000);
            }
          }
        }
        this.lastPlayersState.set(player.id, { cash: player.cash });

        // Xử lý di chuyển
        if (lastPos !== undefined && lastPos !== player.position) {
          const path: { x: number, y: number }[] = [];
          let current = lastPos;
          const totalTiles = getBoardTileCount(BoardScene.GEOMETRY);
          const forwardDist = (player.position - lastPos + totalTiles) % totalTiles;
          const backwardDist = (lastPos - player.position + totalTiles) % totalTiles;
          const isBackward = backwardDist < forwardDist && backwardDist < 10;

          while (current !== player.position) {
            current = isBackward ? (current - 1 + totalTiles) % totalTiles : (current + 1) % totalTiles;
            const layout = BoardScene.getTileLayout(current);
            const p = this.getTilePosition(layout);
            const ox = (current === player.position) ? stackOffsetX : 0;
            const oy = (current === player.position) ? stackOffsetY : 0;
            path.push({ x: p.x + ox, y: p.y + oy });
            if (path.length > totalTiles) break;
          }
          token.moveAlongPath(path);
          if (isCurrentPlayerToken) {
            const moveDuration = path.length * 300;
            setTokenAnimState('run');
            setTimeout(() => useGameStore.getState().setTokenAnimState('idle'), moveDuration);
          }
          this.playerPositions.set(player.id, player.position);
        } else {
          const dist = Phaser.Math.Distance.Between(token.x, token.y, targetX, targetY);
          if (dist > 1) {
            token.moveToPosition(targetX, targetY, 300);
            if (isCurrentPlayerToken) {
              setTokenAnimState('run');
              setTimeout(() => useGameStore.getState().setTokenAnimState('idle'), 300);
            }
          }
        }
      }
    });

    // Cập nhật lại ID mua cuối cùng toàn cục
    this.lastGlobalPurchaseId = state.lastPurchaseId;

    // Update buildings (Phase 5: Now handled by TileSprite.updateStatus)
    this.buildingsContainer.removeAll(true);
  }

  private getTilePosition(layout: { col: number, row: number }) {
    const { col, row } = layout;
    const { cols, rows } = BoardScene.GEOMETRY;
    const { VERTICAL_TILE_W, HORIZONTAL_TILE_H, CORNER_TILE_SIZE, BOARD_W, BOARD_H } = BoardScene;

    let x: number, y: number;
    let w: number, h: number;

    // Horizontal Position (X)
    if (col === 0) {
      x = CORNER_TILE_SIZE / 2;
      w = CORNER_TILE_SIZE;
    } else if (col === cols - 1) {
      x = BOARD_W - CORNER_TILE_SIZE / 2;
      w = CORNER_TILE_SIZE;
    } else {
      x = CORNER_TILE_SIZE + (col - 0.5) * VERTICAL_TILE_W;
      w = VERTICAL_TILE_W;
    }

    // Vertical Position (Y)
    if (row === 0) {
      y = CORNER_TILE_SIZE / 2;
      h = CORNER_TILE_SIZE;
    } else if (row === rows - 1) {
      y = BOARD_H - CORNER_TILE_SIZE / 2;
      h = CORNER_TILE_SIZE;
    } else {
      y = CORNER_TILE_SIZE + (row - 0.5) * HORIZONTAL_TILE_H;
      h = HORIZONTAL_TILE_H;
    }

    return { x, y, w, h };
  }

}
