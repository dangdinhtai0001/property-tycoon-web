import { describe, it, expect } from 'vitest'
import { ObjectPool } from './ObjectPool'

interface TestObj {
  value: number
  active: boolean
  reset(): void
  activate(): void
}

const makeFactory = () => {
  let n = 0
  return (): TestObj => ({
    value: ++n,
    active: false,
    reset() { this.active = false },
    activate() { this.active = true },
  })
}

describe('ObjectPool', () => {
  it('acquire returns an instance and calls activate()', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    const obj = pool.acquire()
    expect(obj.active).toBe(true)
  })

  it('release calls reset() and returns the instance to the pool', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    const obj = pool.acquire()
    pool.release(obj)
    expect(obj.active).toBe(false)
    expect(pool.availableCount).toBe(2)
  })

  it('acquire/release cycle — same object is reused', () => {
    const pool = new ObjectPool(makeFactory(), 1)
    const a = pool.acquire()
    pool.release(a)
    const b = pool.acquire()
    expect(a).toBe(b)
  })

  it('creates new instance when pool is exhausted (soft cap)', () => {
    const pool = new ObjectPool(makeFactory(), 1)
    const a = pool.acquire()
    const b = pool.acquire()
    expect(b).not.toBe(a)
    expect(b.active).toBe(true)
  })

  it('releaseAll returns all active instances to the pool', () => {
    const pool = new ObjectPool(makeFactory(), 3)
    pool.acquire()
    pool.acquire()
    pool.acquire()
    pool.releaseAll()
    expect(pool.availableCount).toBe(3)
  })

  it('size reflects total allocated instances', () => {
    const pool = new ObjectPool(makeFactory(), 2)
    expect(pool.size).toBe(2)
    pool.acquire(); pool.acquire(); pool.acquire()
    expect(pool.size).toBe(3)
  })
})
