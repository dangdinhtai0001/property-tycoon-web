import { type GameState, Phase, type GameConfig } from '../types/game';
import { BASIC_BOARD } from '../data/boards/basicBoard';
import { STARTING_CASH, PASS_START_BONUS } from '../../config/gameplay';
import { GAME_LOG } from '../../config/text';

import { CHANCE_CARDS, FORTUNE_CARDS } from '../data/cards';

export const DEFAULT_CONFIG: GameConfig = {
  startingCash: STARTING_CASH,
  passStartBonus: PASS_START_BONUS,
  enableAuction: false,
  rentMultiplier: 1,
  enableDebug: false,
};

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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
    chanceDeck: shuffle(CHANCE_CARDS),
    fortuneDeck: shuffle(FORTUNE_CARDS),
    temporaryModifiers: [],
    config,
  };
};
