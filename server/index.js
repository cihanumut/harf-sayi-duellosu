import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createRoomManager } from './rooms.js';

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

const handleConnection = createRoomManager(io);
io.on('connection', (socket) => {
  handleConnection(socket);
});

httpServer.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
