import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { RoomManager } from './RoomManager.js';
import { registerHandlers } from './SocketHandler.js';
import { SERVER_CONFIG } from './Config.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, { cors: { origin: SERVER_CONFIG.CORS_ORIGIN, methods: ['GET', 'POST'] } });
const roomManager = new RoomManager();
registerHandlers(io, roomManager);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
setInterval(() => roomManager.garbageCollect(), 5 * 60 * 1000);

httpServer.listen(SERVER_CONFIG.PORT, () => console.log(`Server running on port ${SERVER_CONFIG.PORT}`));
