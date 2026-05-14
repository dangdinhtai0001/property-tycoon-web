import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { RoomManager } from './RoomManager.js';
import type { GameAction } from '@property-tycoon/shared';
import { Phase } from '@property-tycoon/shared';

function isAutoPhase(phase: Phase): boolean {
  return [Phase.ROLLING, Phase.MOVING, Phase.RESOLVING_TILE, Phase.SHOWING_CARD].includes(phase);
}

function getAutoActionForPhase(state: any): GameAction | null {
  switch (state.phase) {
    case Phase.RESOLVING_TILE: return { type: 'RESOLVE_TILE' };
    default: return null;
  }
}

export function registerHandlers(io: SocketIOServer, manager: RoomManager): void {
  io.on('connection', (socket: Socket) => {
    socket.on('createRoom', (payload: Record<string, unknown>) => {
      try {
        const roomId = manager.createRoom(
          payload as { playerCount: number; playerNames: string[]; characterIds: string[]; boardId: string },
          socket.id,
        );
        socket.emit('roomCreated', { roomId });
      } catch (err: any) {
        socket.emit('error', { message: err.message, code: 'CREATE_FAILED' });
      }
    });

    socket.on('joinRoom', (payload: { roomId: string; playerName: string; characterId: string }) => {
      const { roomId, playerName, characterId } = payload;
      const result = manager.joinRoom(roomId, socket, { playerName, characterId, slot: 0 });
      if (!result.success) { socket.emit('error', { message: result.error, code: 'JOIN_FAILED' }); return; }
      const room = manager.getRoom(roomId)!;
      socket.emit('joinedSuccess', {
        roomId,
        playerId: socket.id,
        players: Array.from(room.players.values()),
        isHost: room.hostSocketId === socket.id,
      });
      socket.to(roomId).emit('playerJoined', { playerName, characterId, socketId: socket.id });
      // Broadcast updated player list to everyone
      io.to(roomId).emit('playerList', { players: Array.from(room.players.values()) });
    });

    socket.on('requestStartGame', (payload: { roomId: string }) => {
      const { roomId } = payload;
      const controller = manager.getController(roomId);
      const room = manager.getRoom(roomId);
      if (!controller || !room) { socket.emit('error', { message: 'Room not found' }); return; }
      if (room.hostSocketId !== socket.id) { socket.emit('error', { message: 'Only the host can start the game' }); return; }

      const state = controller.getState();
      const result = controller.applyAction({
        type: 'START_GAME',
        payload: { players: state.players.map(p => ({ name: p.name, color: p.color })) },
      });
      if (result.success) {
        manager.setRoomStatus(roomId, 'playing');
        io.to(roomId).emit('gameStarted', { initialState: result.state });
        io.to(roomId).emit('gameStateUpdate', { state: result.state });
      } else {
        socket.emit('error', { message: result.error || 'Failed to start game' });
      }
    });

    socket.on('playerAction', (payload: { roomId: string; action: GameAction }) => {
      const { roomId, action } = payload;
      const controller = manager.getController(roomId);
      const room = manager.getRoom(roomId);
      if (!controller || !room) { socket.emit('actionError', { message: 'Room not found' }); return; }
      if (room.status !== 'playing') { socket.emit('actionError', { message: 'Game not in progress' }); return; }
      const currentPlayer = room.players.get(socket.id);
      if (!currentPlayer) { socket.emit('actionError', { message: 'Not a player in this room' }); return; }

      let result = controller.applyAction(action);
      if (!result.success) { socket.emit('actionError', { message: result.error || 'Invalid action' }); return; }

      // Auto-phase loop
      while (result.success && isAutoPhase(result.state.phase)) {
        const autoAction = getAutoActionForPhase(result.state);
        if (!autoAction) break;
        result = controller.applyAction(autoAction);
      }

      io.to(roomId).emit('gameStateUpdate', { state: result.state });
      for (const event of result.events) { io.to(roomId).emit('gameEvent', event); }
      if (result.state.phase === Phase.GAME_OVER) {
        const winner = result.state.players.find(p => !p.isBankrupt);
        io.to(roomId).emit('gameOver', { winnerId: winner?.id, finalState: result.state });
        manager.setRoomStatus(roomId, 'finished');
      }
    });

    socket.on('leaveRoom', (payload: { roomId: string }) => {
      const { roomId } = payload;
      manager.leaveRoom(roomId, socket.id);
      socket.to(roomId).emit('playerLeft', { socketId: socket.id });
      socket.leave(roomId);
    });
  });
}
