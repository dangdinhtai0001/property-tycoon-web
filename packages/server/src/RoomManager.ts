import { GameController } from '@property-tycoon/engine';
import type { Socket } from 'socket.io';
import type { GameRoom, PlayerSocket } from './types.js';
import { SERVER_CONFIG } from './Config.js';

export class RoomManager {
  private rooms = new Map<string, GameRoom>();
  private controllers = new Map<string, GameController>();

  createRoom(config: { playerCount: number; playerNames: string[]; characterIds: string[]; boardId: string }, hostSocketId: string): string {
    const roomId = this.generateRoomId();
    const playerConfigs = config.playerNames.map((name, i) => ({
      name,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i % 6],
    }));
    this.controllers.set(roomId, new GameController(playerConfigs));
    this.rooms.set(roomId, { id: roomId, hostSocketId, players: new Map(), socketToPlayerId: new Map(), status: 'waiting', createdAt: Date.now(), lastActivityAt: Date.now() });
    return roomId;
  }

  joinRoom(roomId: string, socket: Socket, info: Omit<PlayerSocket, 'socketId'>): { success: true } | { success: false; error: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };
    if (room.status !== 'waiting') return { success: false, error: 'Game already in progress' };
    const maxPlayers = this.controllers.get(roomId)!.getState().players.length;
    if (room.players.size >= maxPlayers) return { success: false, error: 'Room is full' };
    room.players.set(socket.id, { socketId: socket.id, playerName: info.playerName, characterId: info.characterId, slot: info.slot });
    room.lastActivityAt = Date.now();
    socket.join(roomId);
    return { success: true };
  }

  leaveRoom(roomId: string, socketId: string): void {
    this.rooms.get(roomId)?.players.delete(socketId);
  }

  getRoom(roomId: string): GameRoom | undefined { return this.rooms.get(roomId); }
  getController(roomId: string): GameController | undefined { return this.controllers.get(roomId); }

  setRoomStatus(roomId: string, status: GameRoom['status']): void {
    const room = this.rooms.get(roomId);
    if (room) room.status = status;
  }

  garbageCollect(): void {
    const now = Date.now();
    for (const [id, room] of this.rooms) {
      if (now - room.lastActivityAt > SERVER_CONFIG.IDLE_ROOM_TTL_MS) { this.rooms.delete(id); this.controllers.delete(id); }
    }
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 4; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return this.rooms.has(id) ? this.generateRoomId() : id;
  }
}
