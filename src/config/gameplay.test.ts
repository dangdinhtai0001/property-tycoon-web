import { describe, it, expect } from 'vitest'
import {
  STARTING_CASH,
  PASS_START_BONUS,
  JAIL_FINE,
  MAX_JAIL_TURNS,
  BUILDING_LIMITS,
  AUCTION_MIN_BID,
  AUCTION_BID_INCREMENT,
  MORTGAGE_RATE,
  UNMORTGAGE_RATE,
  GROUP_RENT_MULTIPLIER,
  STATION_BASE_RENT,
  UTILITY_MULTIPLIER_SINGLE,
  UTILITY_MULTIPLIER_BOTH,
  TAX_LUXURY_AMOUNT,
  TAX_INCOME_AMOUNT,
  SAVE_STORAGE_KEY,
} from './gameplay'

describe('config/gameplay sanity checks', () => {
  it('STARTING_CASH is positive', () => expect(STARTING_CASH).toBeGreaterThan(0))
  it('PASS_START_BONUS is positive', () => expect(PASS_START_BONUS).toBeGreaterThan(0))
  it('JAIL_FINE is positive', () => expect(JAIL_FINE).toBeGreaterThan(0))
  it('MAX_JAIL_TURNS is at least 1', () => expect(MAX_JAIL_TURNS).toBeGreaterThanOrEqual(1))
  it('MORTGAGE_RATE is between 0 and 1', () => {
    expect(MORTGAGE_RATE).toBeGreaterThan(0)
    expect(MORTGAGE_RATE).toBeLessThan(1)
  })
  it('UNMORTGAGE_RATE is greater than MORTGAGE_RATE', () => {
    expect(UNMORTGAGE_RATE).toBeGreaterThan(MORTGAGE_RATE)
  })
  it('GROUP_RENT_MULTIPLIER is at least 1', () => expect(GROUP_RENT_MULTIPLIER).toBeGreaterThanOrEqual(1))
  it('BUILDING_LIMITS.house is positive', () => expect(BUILDING_LIMITS.house).toBeGreaterThan(0))
  it('SAVE_STORAGE_KEY is a non-empty string', () => expect(SAVE_STORAGE_KEY.length).toBeGreaterThan(0))
})
