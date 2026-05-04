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
  AUCTION = 'AUCTION',
  TRADE = 'TRADE',
  SHOWING_CARD = 'SHOWING_CARD',
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
  PURPLE = 'PURPLE',
  GRAY = 'GRAY',
  STATION = 'STATION',
  UTILITY = 'UTILITY',
}

export interface BoardTile {
  id: TileId;
  type: TileType;
  name: string;
  shortName?: string;
  position: number;
  imageUrl?: string;
  backgroundColor?: number;
}

export interface Property extends BoardTile {
  type: TileType.PROPERTY;
  groupId: PropertyGroup;
  price: Money;
  rent: Money;
  ownerId?: PlayerId;
  buildingLevel: number;
  buildingCost: Money;
  rentLevels?: Money[];
  isMortgaged: boolean;
  mortgageValue: Money;
}

export interface Player {
  id: PlayerId;
  name: string;
  cash: Money;
  position: number;
  isBankrupt: boolean;
  color: string;
  jailTurns: number;
  avatarUrl?: string;
}

export interface Card {
  id: string;
  type: TileType.CHANCE | TileType.FORTUNE;
  description: string;
  action: any;
}

export interface DebtState {
  oweTo: PlayerId | 'BANK';
  amount: Money;
}

export interface GameConfig {
  startingCash: Money;
  passStartBonus: Money;
  enableAuction: boolean;
  rentMultiplier: number;
  enableDebug?: boolean;
}

export interface AuctionState {
  propertyId: PropertyId;
  currentBid: Money;
  highestBidderId?: PlayerId;
  biddingPlayerIds: PlayerId[];
  turnIndex: number;
}

export interface TradeOffer {
  offererId: PlayerId;
  targetId: PlayerId;
  offeredCash: Money;
  offeredPropertyIds: PropertyId[];
  requestedCash: Money;
  requestedPropertyIds: PropertyId[];
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
  debtState?: DebtState;
  auctionState?: AuctionState;
  tradeOffer?: TradeOffer;
  activeCard?: Card;
  lastPurchaseId?: PropertyId;
  config: GameConfig;
}

export type GameAction =
  | { type: 'START_GAME'; payload: { players: { name: string; color: string }[]; config?: GameConfig } }
  | { type: 'ROLL_DICE'; payload?: { dice?: [number, number] } }
  | { type: 'MOVE_PLAYER'; payload: { steps: number } }
  | { type: 'MOVE_ONE_STEP' }
  | { type: 'RESOLVE_TILE' }
  | { type: 'BUY_PROPERTY'; payload: { propertyId: PropertyId } }
  | { type: 'DECLINE_BUY_PROPERTY' }
  | { type: 'BID'; payload: { amount: Money } }
  | { type: 'PASS_BID' }
  | { type: 'PROPOSE_TRADE'; payload: { offer: TradeOffer } }
  | { type: 'ACCEPT_TRADE' }
  | { type: 'REJECT_TRADE' }
  | { type: 'CANCEL_TRADE' }
  | { type: 'PAY_RENT' }
  | { type: 'BUILD'; payload: { propertyId: PropertyId } }
  | { type: 'PAY_FINE' }
  | { type: 'END_TURN' }
  | { type: 'MORTGAGE_PROPERTY'; payload: { propertyId: PropertyId } }
  | { type: 'UNMORTGAGE_PROPERTY'; payload: { propertyId: PropertyId } }
  | { type: 'SELL_BUILDING'; payload: { propertyId: PropertyId } }
  | { type: 'RESOLVE_DEBT' }
  | { type: 'DECLARE_BANKRUPTCY' }
  | { type: 'DRAW_CARD' }
  | { type: 'APPLY_CARD' }
  | { type: 'TELEPORT_PLAYER'; payload: { position: number } }
  | { type: 'DEBUG_ADD_CASH'; payload: { amount: number } };

export interface GameEvent {
  type: string;
  payload: any;
}
