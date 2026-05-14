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

export enum PropertyKind {
  LAND = 'LAND',
  STATION = 'STATION',
  UTILITY = 'UTILITY',
}

export interface Property extends BoardTile {
  type: TileType.PROPERTY;
  kind: PropertyKind;
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

export type CardEffectType =
  | 'RECEIVE_MONEY'
  | 'PAY_MONEY'
  | 'PAY_PER_PROPERTY'
  | 'PAY_PER_BUILDING'
  | 'MOVE_TO_TILE'
  | 'MOVE_STEPS'
  | 'MOVE_TO_NEAREST'
  | 'MOVE_TO_NEAREST_UNOWNED_PROPERTY'
  | 'TEMP_RENT_MODIFIER'
  | 'TEMP_BUILD_COST_MODIFIER'
  | 'TEMP_UNMORTGAGE_DISCOUNT'
  | 'ONE_TIME_RENT_DISCOUNT'
  | 'ONE_TIME_PURCHASE_DISCOUNT'
  | 'DISABLE_ACTION_UNTIL_ROUND_END'
  | 'ADJUST_BUILDING_LEVEL';

export interface Card {
  id: string;
  type: TileType.CHANCE | TileType.FORTUNE;
  title: string;
  description: string;
  effect: {
    type: CardEffectType;
    value?: number;
    target?: string;
    duration?: number;
    tileId?: string;
    position?: number;
  };
}

export interface TemporaryModifier {
  id: string;
  playerId?: PlayerId;
  effect: CardEffectType;
  value: number;
  target?: string;
  remainingRounds: number;
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
  chanceDeck: Card[];
  fortuneDeck: Card[];
  temporaryModifiers: TemporaryModifier[];
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

export interface NewGameConfig {
  playerCount: number;
  playerNames: string[];
  characterIds: string[];
  boardId: string;
}
