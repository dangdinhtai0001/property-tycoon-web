export const SERVER_CONFIG = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  TURN_TIMEOUT_MS: process.env.TURN_TIMEOUT_MS ? parseInt(process.env.TURN_TIMEOUT_MS, 10) : 0,
  IDLE_ROOM_TTL_MS: 10 * 60 * 1000,
  RECONNECT_GRACE_PERIOD_MS: 120_000,
} as const;
