/** Animation timing and easing configuration for UI components. */

export const ANIMATION = {
  /** Dice roll animation timings */
  dice: {
    rollDuration: 1650,
    resultHoldDuration: 1450,
    exitDuration: 360,
    faceChangeInterval: 48,
    reducedMotionRollDuration: 450,
    reducedMotionTotalDuration: 1200,
  },

  /** Token movement and state animations */
  token: {
    moveDuration: 400,
    moveEase: 'power2.out',
    stackAnimationDelay: 50,
    celebrationDuration: 2000,
  },

  /** UI transition timings */
  transitions: {
    modalFadeIn: 240,
    modalFadeOut: 200,
    panelSlide: 300,
    tooltipDelay: 500,
  },

  /** Celebration and effect durations */
  effects: {
    purchaseCelebration: 3000,
    buildingCelebration: 2500,
    moneyGain: 1500,
    moneyLoss: 1500,
    particleDuration: 1350,
  },

  /** Easing curves (cubic-bezier values) */
  easing: {
    soft: [0.22, 1, 0.36, 1] as const,
    slot: [0.16, 1, 0.3, 1] as const,
    float: [0.45, 0, 0.55, 1] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
  },
} as const;
