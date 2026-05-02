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
  BUILD_DECISION = 'BUILD_DECISION',
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

export enum PropertyGroup {
  BROWN = 'BROWN',
  LIGHT_BLUE = 'LIGHT_BLUE',
  PINK = 'PINK',
  ORANGE = 'ORANGE',
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
  DARK_BLUE = 'DARK_BLUE',
  STATION = 'STATION',
  UTILITY = 'UTILITY',
}

export interface BoardTile {
  id: TileId;
  type: TileType;
  name: string;
  position: number;
}

export interface Property extends BoardTile {
  type: TileType.PROPERTY;
  groupId: PropertyGroup;
  price: Money;
  rent: Money; // Base rent or rent calculation array
  ownerId?: PlayerId;
  buildingLevel: number; // 0: no house, 1-4: houses, 5: hotel
  buildingCost: Money;
  rentLevels?: Money[]; // Rent based on buildingLevel
}

export interface Player {
  id: PlayerId;
  name: string;
  cash: Money;
  position: number;
  isBankrupt: boolean;
  color: string;
  jailTurns: number; // 0 if not in jail
}

export interface Card {
  id: string;
  type: TileType.CHANCE | TileType.FORTUNE;
  description: string;
  action: any; // We'll define specific actions later
}

export interface GameState {
  players: Player[];
  currentPlayerId: PlayerId;
  phase: Phase;
  board: BoardTile[];
  lastDiceRoll?: [number, number];
  doublesCount: number;
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
  | { type: 'BUILD'; payload: { propertyId: PropertyId } }
  | { type: 'PAY_FINE' } // for jail
  | { type: 'END_TURN' };

export interface GameEvent {
  type: string;
  payload: any;
}
