/** Objects managed by ObjectPool must implement this interface. */
export interface PooledObject {
  /** Called when the object is returned to the pool — clear all state. */
  reset(): void
  /** Called when the object is taken from the pool — set up for use. */
  activate(): void
}

/**
 * Generic object pool that pre-allocates instances and recycles them
 * to avoid runtime allocations in the game loop.
 *
 * The pool is a soft cap: if all instances are active when acquire() is called,
 * a new instance is created rather than blocking. A dev-mode warning is logged
 * so pool sizes can be tuned.
 */
export class ObjectPool<T extends PooledObject> {
  private readonly _available: T[] = []
  private readonly _active: Set<T> = new Set()
  private readonly factory: () => T

  /**
   * @param factory - Function that creates a new T instance
   * @param initialSize - Number of instances to pre-allocate
   */
  constructor(factory: () => T, initialSize: number) {
    this.factory = factory
    for (let i = 0; i < initialSize; i++) {
      this._available.push(factory())
    }
  }

  /** Total allocated instances (available + active). */
  get size(): number {
    return this._available.length + this._active.size
  }

  /** Number of instances currently available to acquire. */
  get availableCount(): number {
    return this._available.length
  }

  /** Returns an available instance, creating a new one if the pool is exhausted. */
  acquire(): T {
    let obj = this._available.pop()
    if (!obj) {
      if (import.meta.env.DEV) {
        console.warn('[ObjectPool] Pool exhausted — creating new instance. Consider increasing initialSize.')
      }
      obj = this.factory()
    }
    obj.activate()
    this._active.add(obj)
    return obj
  }

  /** Returns an instance to the pool and calls reset(). */
  release(obj: T): void {
    if (!this._active.has(obj)) return
    obj.reset()
    this._active.delete(obj)
    this._available.push(obj)
  }

  /** Returns all currently active instances to the pool. */
  releaseAll(): void {
    for (const obj of this._active) {
      obj.reset()
      this._available.push(obj)
    }
    this._active.clear()
  }
}
