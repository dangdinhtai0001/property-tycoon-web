/** Starting cash given to each player at game start. Consumed by setupGame.ts. */
export const STARTING_CASH = 1500

/** Bonus cash received when passing or landing on START. Consumed by movementRules.ts. */
export const PASS_START_BONUS = 200

/** Fine paid to exit jail voluntarily. Consumed by jailRules.ts. */
export const JAIL_FINE = 50

/** Maximum turns a player can remain jailed before forced fine. Consumed by jailRules.ts. */
export const MAX_JAIL_TURNS = 3

/** Max buildings per property type. Consumed by buildingRules.ts. */
export const BUILDING_LIMITS = { house: 4, hotel: 1 } as const

/** Minimum opening bid in an auction. Consumed by auctionRules.ts. */
export const AUCTION_MIN_BID = 10

/** Minimum raise increment per auction bid. Consumed by auctionRules.ts. */
export const AUCTION_BID_INCREMENT = 10

/** Fraction of property price received when mortgaging (0.5 = 50%). Consumed by financeRules.ts, basicBoard.ts. */
export const MORTGAGE_RATE = 0.5

/** Fraction of property price paid to unmortgage (0.55 = 55%). Consumed by financeRules.ts. */
export const UNMORTGAGE_RATE = 0.55

/** Rent multiplier when owner holds a full color group with no buildings. Consumed by rentRules.ts. */
export const GROUP_RENT_MULTIPLIER = 2

/** Rent for stations based on number owned (0-4). Consumed by rentRules.ts. */
export const STATION_RENT_BY_COUNT = [0, 25, 50, 100, 200] as const

/** Dice total multiplier for utilities based on number owned (0-2). Consumed by rentRules.ts. */
export const UTILITY_MULTIPLIER_BY_COUNT = [0, 4, 10] as const

/** Tax amount for the luxury tax tile. Consumed by gameReducer.ts. */
export const TAX_LUXURY_AMOUNT = 150

/** Tax amount for the income tax tile. Consumed by gameReducer.ts. */
export const TAX_INCOME_AMOUNT = 200

/** localStorage key prefix for save slots. Consumed by gameStorage.ts. */
export const SAVE_STORAGE_KEY = 'property-tycoon-save'

/** Save file schema version — increment when GameState shape changes. Consumed by gameStorage.ts. */
export const SAVE_VERSION = 1
