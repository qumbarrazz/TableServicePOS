import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('kds:status-update', (payload) => io.emit('kds:status-updated', payload));
  socket.on('order:created', (payload) => io.emit('order:created', payload));
});

server.listen(env.port, () => {
  console.log(`Backend running on ${env.port}`);
});
