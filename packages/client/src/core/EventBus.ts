import type { GameState, Phase } from '../game-engine/types/game'
import type { AnimationEvent } from '../app/store/useAnimationQueue'

/**
 * All typed events that flow through the EventBus.
 * Add new events here — never use untyped string keys.
 */
export type GameEventMap = {
  /** Emitted by useGameStore after every dispatch that changes state. */
  'state:changed': { prev: GameState; next: GameState }
  /** Emitted by useGameStore when the phase changes as part of a dispatch. */
  'phase:transition': { from: Phase; to: Phase }
  /** Emitted by animationSubscriber to add an event to the animation queue. */
  'animation:enqueue': AnimationEvent
  /** Emitted by TileSprite (via BoardScene → PhaserBridge) when a tile is clicked. */
  'tile:clicked': { tileIndex: number }
  /** Emitted by PreloaderScene once the BoardScene is fully ready. */
  'phaser:ready': void
  /** Emitted by PreloaderScene when asset loading fails. */
  'phaser:error': { reason: string }
}

type Handler<K extends keyof GameEventMap> = (payload: GameEventMap[K]) => void

/**
 * Typed pub/sub event bus. All cross-layer communication routes through this bus.
 * The singleton export `eventBus` is used throughout the app.
 * A plain `EventBus` class is also exported for testing with isolated instances.
 */
export class EventBus {
  private readonly listeners: Map<string, Set<Handler<any>>> = new Map()

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * @param event - Event name from GameEventMap
   * @param handler - Callback receiving the typed payload
   * @returns Unsubscribe function — call to stop receiving this event
   */
  on<K extends keyof GameEventMap>(event: K, handler: Handler<K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(handler as Handler<any>)
    return () => this.off(event, handler)
  }

  /** Remove a specific handler for an event. */
  off<K extends keyof GameEventMap>(event: K, handler: Handler<K>): void {
    this.listeners.get(event)?.delete(handler as Handler<any>)
  }

  /**
   * Emit an event to all subscribers.
   * Each handler is wrapped in try/catch — a failing handler does not
   * prevent other handlers from running.
   */
  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const handlers = this.listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
      try {
        handler(payload)
      } catch (err) {
        console.error(`[EventBus] Handler error for event "${event}":`, err)
      }
    }
  }
}

/** App-wide singleton EventBus instance. Import this throughout the app. */
export const eventBus = new EventBus()
