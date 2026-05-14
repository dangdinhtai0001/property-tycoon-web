export interface PlayerSocket {
  socketId: string;
  playerName: string;
  characterId: string;
  slot: number;
}

export interface GameRoom {
  id: string;
  hostSocketId: string | null;
  players: Map<string, PlayerSocket>;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
  lastActivityAt: number;
}
