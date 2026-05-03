import Phaser from 'phaser';
import { TileSprite } from '../sprites/TileSprite';
import { TokenSprite } from '../sprites/TokenSprite';
import { BuildingSprite } from '../sprites/BuildingSprite';
import { TileType, Phase } from '../../game-engine/types/game';
import type { GameState, Property, Player } from '../../game-engine/types/game';
import { DiceSprite } from '../sprites/DiceSprite';

export class BoardScene extends Phaser.Scene {
  private tiles: TileSprite[] = [];
  private tokens: Map<string, TokenSprite> = new Map();
  private playerPositions: Map<string, number> = new Map();
  private tilesContainer: Phaser.GameObjects.Container;
  private buildingsContainer: Phaser.GameObjects.Container;
  private tokensContainer: Phaser.GameObjects.Container;
  private diceContainer: Phaser.GameObjects.Container;
  private boardContainer: Phaser.GameObjects.Container;

  constructor() {
    super('BoardScene');
  }

  create() {
    this.boardContainer = this.add.container(0, 0);
    this.tilesContainer = this.add.container(0, 0);
    this.buildingsContainer = this.add.container(0, 0);
    this.tokensContainer = this.add.container(0, 0);
    this.diceContainer = this.add.container(0, 0);
    
    // Add in order: Tiles (bottom) -> Buildings -> Tokens -> Dice (top)
    this.boardContainer.add(this.tilesContainer);
    this.boardContainer.add(this.buildingsContainer);
    this.boardContainer.add(this.tokensContainer);
    
    // Dice should be above everything
    this.add.existing(this.diceContainer);
    this.diceContainer.setDepth(1000);
    
    // Background for center
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
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
      fontWeight: '900',
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
    // Adjusted sizes to better fit the 1000x1000 coordinate space
    const tileSize = 82;
    const cornerSize = 130;
    const boardWidth = cornerSize * 2 + tileSize * 9;
    const offset = (this.cameras.main.width - boardWidth) / 2;

    // Clear and redraw tiles if board configuration changed or first load
    if (this.tiles.length === 0) {
      state.board.forEach((tile) => {
        const pos = this.getTilePosition(tile.position, offset, tileSize, cornerSize);
        const sprite = new TileSprite(this, pos.x, pos.y, pos.w, pos.h, tile);
        this.tiles.push(sprite);
        this.tilesContainer.add(sprite);
      });
    }

    // Update tokens with smooth movement and stacking
    const playersByPosition: Record<number, Player[]> = {};
    state.players.forEach(p => {
      if (!playersByPosition[p.position]) playersByPosition[p.position] = [];
      playersByPosition[p.position].push(p);
    });

    state.players.forEach((player) => {
      const tilePos = this.getTilePosition(player.position, offset, tileSize, cornerSize);
      
      // Calculate stacking offset
      const playersOnThisTile = playersByPosition[player.position] || [];
      const playerIndex = playersOnThisTile.findIndex(p => p.id === player.id);
      let stackOffsetX = 0;
      let stackOffsetY = 0;
      
      if (playersOnThisTile.length > 1) {
        const angle = (playerIndex / playersOnThisTile.length) * Math.PI * 2;
        const radius = 15;
        stackOffsetX = Math.cos(angle) * radius;
        stackOffsetY = Math.sin(angle) * radius;
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
      } else if (lastPos !== undefined && lastPos !== player.position) {
        // Calculate path
        const path: {x: number, y: number}[] = [];
        let current = lastPos;
        
        // Determine direction: forward or backward
        const forwardDist = (player.position - lastPos + 40) % 40;
        const backwardDist = (lastPos - player.position + 40) % 40;
        
        // If backward distance is shorter and small, move backward (e.g. "Go back 3 spaces")
        const isBackward = backwardDist < forwardDist && backwardDist < 10;
        
        while (current !== player.position) {
          if (isBackward) {
            current = (current - 1 + 40) % 40;
          } else {
            current = (current + 1) % 40;
          }
          
          const p = this.getTilePosition(current, offset, tileSize, cornerSize);
          
          // Apply stacking offset only to the final destination
          const ox = (current === player.position) ? stackOffsetX : 0;
          const oy = (current === player.position) ? stackOffsetY : 0;
          
          path.push({ x: p.x + ox, y: p.y + oy });
          
          // Safety break
          if (path.length > 40) break;
        }

        token.moveAlongPath(path);
        this.playerPositions.set(player.id, player.position);
      } else {
        // Just adjust stacking if needed without full path
        const dist = Phaser.Math.Distance.Between(token.x, token.y, targetX, targetY);
        if (dist > 2) {
          token.moveTo(targetX, targetY, 300);
        }
      }
    });

    // Update buildings
    this.buildingsContainer.removeAll(true);
    state.board.forEach((tile) => {
      if (tile.type === TileType.PROPERTY) {
        const property = tile as Property;
        if (property.buildingLevel && property.buildingLevel > 0) {
          const tilePos = this.getTilePosition(tile.position, offset, tileSize, cornerSize);
          if (property.buildingLevel === 5) {
            const b = new BuildingSprite(this, tilePos.x + tilePos.w/2 - 25, tilePos.y - tilePos.h/2 + 25, 'hotel');
            this.buildingsContainer.add(b);
          } else {
            for (let i = 0; i < property.buildingLevel; i++) {
              // Layout houses in a row or grid
              const offsetX = (i % 2 === 0) ? -15 : 15;
              const offsetY = (i < 2) ? -15 : 15;
              const b = new BuildingSprite(this, tilePos.x + offsetX, tilePos.y + offsetY - tilePos.h/4, 'house');
              this.buildingsContainer.add(b);
            }
          }
        }
      }
    });
  }

  private getTilePosition(position: number, offset: number, tileSize: number, cornerSize: number) {
    const boardSize = cornerSize * 2 + tileSize * 9;
    let x: number, y: number;
    let w = tileSize, h = tileSize;

    if (position === 0) { // Start
      x = boardSize - cornerSize / 2;
      y = boardSize - cornerSize / 2;
      w = h = cornerSize;
    } else if (position < 10) { // Bottom
      x = boardSize - cornerSize - (position - 0.5) * tileSize;
      y = boardSize - cornerSize / 2;
      h = cornerSize;
    } else if (position === 10) { // Jail
      x = cornerSize / 2;
      y = boardSize - cornerSize / 2;
      w = h = cornerSize;
    } else if (position < 20) { // Left
      x = cornerSize / 2;
      y = boardSize - cornerSize - (position - 10 - 0.5) * tileSize;
      w = cornerSize;
    } else if (position === 20) { // Free Parking
      x = cornerSize / 2;
      y = cornerSize / 2;
      w = h = cornerSize;
    } else if (position < 30) { // Top
      x = cornerSize + (position - 20 - 0.5) * tileSize;
      y = cornerSize / 2;
      h = cornerSize;
    } else if (position === 30) { // Go to Jail
      x = boardSize - cornerSize / 2;
      y = cornerSize / 2;
      w = h = cornerSize;
    } else { // Right
      x = boardSize - cornerSize / 2;
      y = cornerSize + (position - 30 - 0.5) * tileSize;
      w = cornerSize;
    }

    return { x: x + offset, y: y + offset, w, h };
  }
}
