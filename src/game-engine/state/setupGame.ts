import { type GameState, Phase } from '../types/game';
import { BASIC_BOARD } from '../data/boards/basicBoard';

export const createInitialGame = (playerConfigs: { name: string; color: string }[]): GameState => {
  const players = playerConfigs.map((config, index) => ({
    id: `player-${index}`,
    name: config.name,
    cash: 1500,
    position: 0,
    isBankrupt: false,
    color: config.color,
    jailTurns: 0,
  }));

  return {
    players,
    currentPlayerId: players[0].id,
    phase: Phase.WAITING_TO_ROLL,
    board: BASIC_BOARD,
    doublesCount: 0,
    log: ['Game đã bắt đầu!'],
  };
};
