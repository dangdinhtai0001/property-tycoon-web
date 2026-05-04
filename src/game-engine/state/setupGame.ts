import { type GameState, Phase, type GameConfig } from '../types/game';
import { BASIC_BOARD } from '../data/boards/basicBoard';
import { STARTING_CASH, PASS_START_BONUS } from '../../config/gameplay';
import { GAME_LOG } from '../../config/text';

export const DEFAULT_CONFIG: GameConfig = {
  startingCash: STARTING_CASH,
  passStartBonus: PASS_START_BONUS,
  enableAuction: false,
  rentMultiplier: 1,
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
    log: [GAME_LOG.gameStarted()],
    config,
  };
};
