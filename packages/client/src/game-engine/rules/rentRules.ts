import { type GameState, type Property, TileType, Phase, PropertyKind } from '../types/game';
import { STATION_RENT_BY_COUNT, UTILITY_MULTIPLIER_BY_COUNT, GROUP_RENT_MULTIPLIER } from '../../config/gameplay';
import { GAME_LOG } from '../../config/text';

export const calculateRent = (state: GameState, property: Property, diceTotal: number = 0): number => {
  const ownerId = property.ownerId;
  if (!ownerId) return 0;

  const owner = state.players.find(p => p.id === ownerId);
  if (!owner || owner.isBankrupt) return 0;

  if (property.isMortgaged) return 0;

  const ownerProperties = state.board.filter(
    t => t.type === TileType.PROPERTY && (t as Property).ownerId === ownerId
  ) as Property[];

  // Base rent multiplier from config
  let finalMultiplier = state.config?.rentMultiplier || 1;

  // Apply temporary modifiers from cards
  state.temporaryModifiers.forEach(mod => {
    if (mod.effect === 'TEMP_RENT_MODIFIER') {
      if (mod.target === 'STATION' && property.kind === PropertyKind.STATION) {
        finalMultiplier *= mod.value;
      } else if (mod.target === property.groupId) {
        finalMultiplier *= mod.value;
      }
    }
    // ONE_TIME_RENT_DISCOUNT applies when the CURRENT player is the one paying rent
    if (mod.effect === 'ONE_TIME_RENT_DISCOUNT' && mod.playerId === state.currentPlayerId) {
      finalMultiplier *= mod.value;
    }
  });

  // STATION logic
  if (property.kind === PropertyKind.STATION) {
    const stationCount = ownerProperties.filter(p => p.kind === PropertyKind.STATION).length;
    const baseStationRent = STATION_RENT_BY_COUNT[Math.min(stationCount, STATION_RENT_BY_COUNT.length - 1)] || 0;
    return Math.round(baseStationRent * finalMultiplier);
  }

  // UTILITY logic
  if (property.kind === PropertyKind.UTILITY) {
    const utilityCount = ownerProperties.filter(p => p.kind === PropertyKind.UTILITY).length;
    const multiplier = UTILITY_MULTIPLIER_BY_COUNT[Math.min(utilityCount, UTILITY_MULTIPLIER_BY_COUNT.length - 1)] || 0;
    return Math.round(diceTotal * multiplier * finalMultiplier);
  }

  // LAND logic
  let baseRent = property.rent;

  if (property.buildingLevel > 0 && property.rentLevels) {
    baseRent = property.rentLevels[property.buildingLevel];
  } else {
    // No buildings, check full color group
    const propertiesInGroup = state.board.filter(
      t => t.type === TileType.PROPERTY && (t as Property).groupId === property.groupId
    ) as Property[];
    
    const ownsAllInGroup = propertiesInGroup.every(p => p.ownerId === ownerId);
    const anyMortgagedInGroup = propertiesInGroup.some(p => p.isMortgaged);

    if (ownsAllInGroup && !anyMortgagedInGroup) {
      baseRent = property.rent * GROUP_RENT_MULTIPLIER;
    }
  }

  return Math.round(baseRent * finalMultiplier);
};

export const payRent = (state: GameState): GameState => {
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
  if (!currentPlayer) return state;

  const tile = state.board[currentPlayer.position];
  if (tile.type !== TileType.PROPERTY) return state;

  const property = tile as Property;
  if (!property.ownerId || property.ownerId === currentPlayer.id) return state;

  const owner = state.players.find(p => p.id === property.ownerId);
  if (!owner) return state;

  const diceTotal = state.lastDiceRoll ? state.lastDiceRoll[0] + state.lastDiceRoll[1] : 0;
  const rentAmount = calculateRent(state, property, diceTotal);

  const updatedPlayers = state.players.map(p => {
    if (p.id === currentPlayer.id) {
      const finalCash = Math.max(0, p.cash - rentAmount);
      return { ...p, cash: finalCash };
    }
    if (p.id === owner.id) {
      return { ...p, cash: p.cash + rentAmount };
    }
    return p;
  });

  // Remove one-time discounts if applied
  const remainingModifiers = state.temporaryModifiers.filter(
    mod => !(mod.effect === 'ONE_TIME_RENT_DISCOUNT' && mod.playerId === currentPlayer.id)
  );

  const logEntry = GAME_LOG.playerPaidRent(currentPlayer.name, rentAmount, owner.name, property.name);
  const nextLog = [logEntry];

  let nextPhase = Phase.END_TURN;
  let debtState = undefined;

  if (currentPlayer.cash < rentAmount) {
    nextPhase = Phase.DEBT_RESOLUTION;
    debtState = {
      oweTo: owner.id,
      amount: rentAmount - currentPlayer.cash
    };
    nextLog.push(GAME_LOG.debtStarted(currentPlayer.name, rentAmount, `tiền thuê tại ${property.name}`));
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: nextPhase,
    debtState,
    temporaryModifiers: remainingModifiers,
    log: [...nextLog, ...state.log],
  };
};
