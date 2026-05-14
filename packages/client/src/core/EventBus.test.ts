import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventBus } from './EventBus'

let bus: EventBus

beforeEach(() => {
  bus = new EventBus()
})

describe('EventBus', () => {
  it('handler receives emitted payload', () => {
    const handler = vi.fn()
    bus.on('test-event' as any, handler)
    bus.emit('test-event' as any, { value: 42 } as any)
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('on() returns an unsubscribe function that stops future events', () => {
    const handler = vi.fn()
    const unsub = bus.on('test-event' as any, handler)
    unsub()
    bus.emit('test-event' as any, {} as any)
    expect(handler).not.toHaveBeenCalled()
  })

  it('off() removes a specific handler', () => {
    const handler = vi.fn()
    bus.on('test-event' as any, handler)
    bus.off('test-event' as any, handler)
    bus.emit('test-event' as any, {} as any)
    expect(handler).not.toHaveBeenCalled()
  })

  it('a failing handler does not prevent other handlers from running', () => {
    const bad = vi.fn(() => { throw new Error('boom') })
    const good = vi.fn()
    bus.on('test-event' as any, bad)
    bus.on('test-event' as any, good)
    expect(() => bus.emit('test-event' as any, {} as any)).not.toThrow()
    expect(good).toHaveBeenCalled()
  })

  it('multiple subscribers all receive the event', () => {
    const h1 = vi.fn()
    const h2 = vi.fn()
    bus.on('test-event' as any, h1)
    bus.on('test-event' as any, h2)
    bus.emit('test-event' as any, { x: 1 } as any)
    expect(h1).toHaveBeenCalledWith({ x: 1 })
    expect(h2).toHaveBeenCalledWith({ x: 1 })
  })
})
