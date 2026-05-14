import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { RoomManager } from './RoomManager.js';
import type { GameAction } from '@property-tycoon/shared';
import { Phase } from '@property-tycoon/shared';

function log(roomId: string, msg: string) {
  console.log(`[${new Date().toISOString()}] [${roomId}] ${msg}`);
}

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
    console.log(`[${new Date().toISOString()}] Socket connected: ${socket.id}`);

    socket.on('createRoom', (payload: Record<string, unknown>) => {
      try {
        const roomId = manager.createRoom(
          payload as { playerCount: number; playerNames: string[]; characterIds: string[]; boardId: string },
          socket.id,
        );
        log(roomId, `Room created by ${socket.id}`);
        socket.emit('roomCreated', { roomId });
      } catch (err: any) {
        console.error(`[${new Date().toISOString()}] createRoom error:`, err.message);
        socket.emit('error', { message: err.message, code: 'CREATE_FAILED' });
      }
    });

    socket.on('joinRoom', (payload: { roomId: string; playerName: string; characterId: string }) => {
      const { roomId, playerName, characterId } = payload;
      const result = manager.joinRoom(roomId, socket, { playerName, characterId, slot: 0 });
      if (!result.success) {
        log(roomId, `Join rejected: ${result.error} (${socket.id})`);
        socket.emit('error', { message: result.error, code: 'JOIN_FAILED' });
        return;
      }
      const room = manager.getRoom(roomId)!;
      const isHost = room.hostSocketId === socket.id;
      log(roomId, `Player joined: ${playerName} (${socket.id}) isHost=${isHost} players=${room.players.size}`);
      socket.emit('joinedSuccess', {
        roomId,
        playerId: socket.id,
        players: Array.from(room.players.values()),
        isHost,
      });
      socket.to(roomId).emit('playerJoined', { playerName, characterId, socketId: socket.id });
      io.to(roomId).emit('playerList', { players: Array.from(room.players.values()) });
    });

    socket.on('requestStartGame', (payload: { roomId: string }) => {
      const { roomId } = payload;
      const controller = manager.getController(roomId);
      const room = manager.getRoom(roomId);
      if (!controller || !room) { socket.emit('error', { message: 'Room not found' }); return; }
      if (room.hostSocketId !== socket.id) {
        log(roomId, `Start rejected: not host (${socket.id})`);
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }

      log(roomId, `Game starting with ${room.players.size} players`);
      const state = controller.getState();
      const result = controller.applyAction({
        type: 'START_GAME',
        payload: { players: state.players.map(p => ({ name: p.name, color: p.color })) },
      });
      if (result.success) {
        manager.setRoomStatus(roomId, 'playing');
        io.to(roomId).emit('gameStarted', { initialState: result.state });
        io.to(roomId).emit('gameStateUpdate', { state: result.state });
        log(roomId, `Game started, phase=${result.state.phase}`);
      } else {
        log(roomId, `Start failed: ${result.error}`);
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

      log(roomId, `Action: ${action.type} from ${currentPlayer.playerName}`);
      let result = controller.applyAction(action);
      if (!result.success) {
        log(roomId, `Action rejected: ${result.error}`);
        socket.emit('actionError', { message: result.error || 'Invalid action' });
        return;
      }

      // Auto-phase loop
      while (result.success && isAutoPhase(result.state.phase)) {
        const autoAction = getAutoActionForPhase(result.state);
        if (!autoAction) break;
        log(roomId, `Auto-action: ${autoAction.type}`);
        result = controller.applyAction(autoAction);
      }

      io.to(roomId).emit('gameStateUpdate', { state: result.state });
      for (const event of result.events) {
        io.to(roomId).emit('gameEvent', event);
        log(roomId, `Event: ${event.type}`);
      }
      if (result.state.phase === Phase.GAME_OVER) {
        const winner = result.state.players.find(p => !p.isBankrupt);
        log(roomId, `Game over. Winner: ${winner?.name}`);
        io.to(roomId).emit('gameOver', { winnerId: winner?.id, finalState: result.state });
        manager.setRoomStatus(roomId, 'finished');
      }
    });

    socket.on('leaveRoom', (payload: { roomId: string }) => {
      const { roomId } = payload;
      log(roomId, `Player left: ${socket.id}`);
      manager.leaveRoom(roomId, socket.id);
      socket.to(roomId).emit('playerLeft', { socketId: socket.id });
      io.to(roomId).emit('playerList', { players: Array.from(manager.getRoom(roomId)?.players.values() ?? []) });
      socket.leave(roomId);
    });

    socket.on('disconnect', (reason: string) => {
      console.log(`[${new Date().toISOString()}] Socket disconnected: ${socket.id} (${reason})`);
    });
  });
}
