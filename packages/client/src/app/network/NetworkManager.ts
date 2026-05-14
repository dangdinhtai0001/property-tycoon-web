import { io, type Socket } from 'socket.io-client';
import type { GameState, GameAction } from '@property-tycoon/shared';
import type { GameEvent } from '@property-tycoon/engine';

export interface PlayerInfo { playerName: string; characterId: string; socketId: string; }
export interface JoinResult { roomId: string; playerId: string; players: PlayerInfo[]; }

export class NetworkManager {
  private socket: Socket;
  onStateUpdate: ((state: GameState) => void) | null = null;
  onGameEvent: ((event: GameEvent) => void) | null = null;
  onPlayerJoined: ((player: PlayerInfo) => void) | null = null;
  onPlayerLeft: ((playerId: string) => void) | null = null;
  onGameStarted: ((initialState: GameState) => void) | null = null;
  onGameOver: ((winnerId: string) => void) | null = null;
  onError: ((message: string) => void) | null = null;
  onDisconnect: ((reason: string) => void) | null = null;

  constructor(serverUrl: string) {
    this.socket = io(serverUrl, { autoConnect: false, reconnection: true, reconnectionAttempts: 10, reconnectionDelay: 3000 });
    this.registerListeners();
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect();
      this.socket.once('connect', () => resolve());
      this.socket.once('connect_error', (err: Error) => reject(err));
    });
  }

  disconnect(): void { this.socket.disconnect(); }
  createRoom(config: any): Promise<string> {
    return new Promise((resolve) => { this.socket.emit('createRoom', config); this.socket.once('roomCreated', (data: { roomId: string }) => resolve(data.roomId)); });
  }
  joinRoom(roomId: string, playerName: string, characterId: string): Promise<JoinResult> {
    return new Promise((resolve, reject) => {
      this.socket.emit('joinRoom', { roomId, playerName, characterId });
      this.socket.once('joinedSuccess', (data: JoinResult) => resolve(data));
      this.socket.once('error', (data: { message: string }) => reject(new Error(data.message)));
    });
  }
  sendAction(action: GameAction, roomId?: string): void { this.socket.emit('playerAction', { roomId, action }); }
  leaveRoom(roomId: string): void { this.socket.emit('leaveRoom', { roomId }); }

  private registerListeners(): void {
    this.socket.on('gameStateUpdate', (data: { state: GameState }) => this.onStateUpdate?.(data.state));
    this.socket.on('gameEvent', (event: GameEvent) => this.onGameEvent?.(event));
    this.socket.on('playerJoined', (player: PlayerInfo) => this.onPlayerJoined?.(player));
    this.socket.on('playerLeft', (data: { socketId: string }) => this.onPlayerLeft?.(data.socketId));
    this.socket.on('gameStarted', (data: { initialState: GameState }) => this.onGameStarted?.(data.initialState));
    this.socket.on('gameOver', (data: { winnerId: string }) => this.onGameOver?.(data.winnerId));
    this.socket.on('actionError', (data: { message: string }) => this.onError?.(data.message));
    this.socket.on('disconnect', (reason: string) => this.onDisconnect?.(reason));
  }
}
