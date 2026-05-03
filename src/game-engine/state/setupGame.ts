import { type GameState, Phase, type GameConfig } from '../types/game';
import { BASIC_BOARD } from '../data/boards/basicBoard';

export const DEFAULT_CONFIG: GameConfig = {
  startingCash: 1500,
  passStartBonus: 200,
  enableAuction: false,
  quickModeMultiplier: 1,
  enableDebug: false,
};

export const createInitialGame = (
  playerConfigs: { name: string; color: string; avatarUrl?: string }[],
  config: GameConfig = DEFAULT_CONFIG
): GameState => {
  const players = playerConfigs.map((p, index) => ({
    id: `player-${index}`,
    name: p.name,
    cash: config.startingCash,
    position: 0,
    isBankrupt: false,
    color: p.color,
    jailTurns: 0,
    avatarUrl: p.avatarUrl,
  }));

  return {
    players,
    currentPlayerId: players[0].id,
    phase: Phase.WAITING_TO_ROLL,
    board: BASIC_BOARD,
    doublesCount: 0,
    log: ['Game đã bắt đầu!'],
    config,
  };
};
