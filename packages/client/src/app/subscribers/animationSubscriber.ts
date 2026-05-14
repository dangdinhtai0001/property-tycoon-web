import { eventBus } from '../../core/EventBus'
import { useAnimationQueue } from '../store/useAnimationQueue'
import { TileType, type Property, type GameState } from '@property-tycoon/shared'

/**
 * Subscribes to game state changes and enqueues animations based on state diffs.
 * Replaces MoneyWatcher and BuildingWatcher components.
 */
export function initializeAnimationSubscriber() {
  const prevCashRef: Record<string, number> = {}
  const prevAssetsRef: Record<string, { propertyCount: number; buildingCount: number }> = {}
  const prevBuildingLevelsRef: Record<string, number> = {}

  eventBus.on('state:changed', ({ prev, next }) => {
    handleMoneyAnimations(prev, next)
    handleBuildingAnimations(prev, next)
  })

  function handleMoneyAnimations(_prevState: GameState, nextState: GameState) {
    const { enqueue } = useAnimationQueue.getState()

    nextState.players.forEach((player) => {
      // Only trigger animations for the current player
      if (player.id !== nextState.currentPlayerId) {
        // Update refs but don't enqueue
        const playerProperties = nextState.board.filter(
          (t) => t.type === TileType.PROPERTY && (t as Property).ownerId === player.id
        ) as Property[]
        prevCashRef[player.id] = player.cash
        prevAssetsRef[player.id] = {
          propertyCount: playerProperties.length,
          buildingCount: playerProperties.reduce((sum, p) => sum + (p.buildingLevel || 0), 0),
        }
        return
      }

      const prevCash = prevCashRef[player.id]

      // Calculate current assets
      const playerProperties = nextState.board.filter(
        (t) => t.type === TileType.PROPERTY && (t as Property).ownerId === player.id
      ) as Property[]

      const propertyCount = playerProperties.length
      const buildingCount = playerProperties.reduce((sum, p) => sum + (p.buildingLevel || 0), 0)

      const prevAssets = prevAssetsRef[player.id]

      if (prevCash !== undefined && player.cash < prevCash) {
        const isInvestment =
          prevAssets && (propertyCount > prevAssets.propertyCount || buildingCount > prevAssets.buildingCount)

        if (!isInvestment) {
          const lossAmount = prevCash - player.cash
          enqueue({
            type: 'MONEY_LOSS',
            payload: {
              playerId: player.id,
              amount: lossAmount,
            },
          })
        }
      } else if (prevCash !== undefined && player.cash > prevCash) {
        const isDivestment =
          prevAssets && (propertyCount < prevAssets.propertyCount || buildingCount < prevAssets.buildingCount)

        if (!isDivestment) {
          const gainAmount = player.cash - prevCash
          enqueue({
            type: 'MONEY_GAIN',
            payload: {
              playerId: player.id,
              amount: gainAmount,
            },
          })
        }
      }

      // Update refs
      prevCashRef[player.id] = player.cash
      prevAssetsRef[player.id] = { propertyCount, buildingCount }
    })
  }

  function handleBuildingAnimations(_prevState: GameState, nextState: GameState) {
    const { enqueue } = useAnimationQueue.getState()

    nextState.board.forEach((tile) => {
      if (tile.type === TileType.PROPERTY) {
        const property = tile as Property
        const prevLevel = prevBuildingLevelsRef[property.id]

        if (prevLevel !== undefined && property.buildingLevel > prevLevel) {
          // Building level increased!
          enqueue({
            type: 'BUILDING_SPARKLE',
            payload: {
              name: property.name,
              level: property.buildingLevel,
            },
          })
        }

        // Update ref
        prevBuildingLevelsRef[property.id] = property.buildingLevel
      }
    })
  }
}
