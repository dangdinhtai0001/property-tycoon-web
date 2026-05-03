import Phaser from 'phaser';
import { BoardScene } from './scenes/BoardScene';
import { PreloaderScene } from './scenes/PreloaderScene';

export const getGameConfig = (containerId: string): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent: containerId,
  backgroundColor: 'rgba(0,0,0,0)',
  transparent: true,
  scale: {
    mode: Phaser.Scale.FILL,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1000,
    height: 1000,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [PreloaderScene, BoardScene],
});
