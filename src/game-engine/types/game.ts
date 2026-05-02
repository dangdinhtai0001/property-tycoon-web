export type PlayerId = string;
export type PropertyId = string;
export type TileId = string;
export type Money = number;

export enum Phase {
  SETUP = 'SETUP',
  WAITING_TO_ROLL = 'WAITING_TO_ROLL',
  ROLLING = 'ROLLING',
  MOVING = 'MOVING',
  RESOLVING_TILE = 'RESOLVING_TILE',
  BUY_DECISION = 'BUY_DECISION',
  DEBT_RESOLUTION = 'DEBT_RESOLUTION',
  END_TURN = 'END_TURN',
  GAME_OVER = 'GAME_OVER',
}

export enum TileType {
  START = 'START',
  PROPERTY = 'PROPERTY',
  TAX = 'TAX',
  JAIL = 'JAIL',
  GO_TO_JAIL = 'GO_TO_JAIL',
  CHANCE = 'CHANCE',
  FORTUNE = 'FORTUNE',
  REST = 'REST',
}

export interface BoardTile {
  id: TileId;
  type: TileType;
  name: string;
  position: number;
}

export interface Property extends BoardTile {
  type: TileType.PROPERTY;
  price: Money;
  rent: Money;
  ownerId?: PlayerId;
}

export interface Player {
  id: PlayerId;
  name: string;
  cash: Money;
  position: number;
  isBankrupt: boolean;
  color: string;
}

export interface GameState {
  players: Player[];
  currentPlayerId: PlayerId;
  phase: Phase;
  board: BoardTile[];
  lastDiceRoll?: [number, number];
  log: string[];
  winnerId?: PlayerId;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { players: { name: string; color: string }[] } }
  | { type: 'ROLL_DICE'; payload?: { dice?: [number, number] } }
  | { type: 'MOVE_PLAYER'; payload: { steps: number } }
  | { type: 'BUY_PROPERTY'; payload: { propertyId: PropertyId } }
  | { type: 'DECLINE_BUY_PROPERTY' }
  | { type: 'PAY_RENT' }
  | { type: 'END_TURN' };

export interface GameEvent {
  type: string;
  payload: any;
}
