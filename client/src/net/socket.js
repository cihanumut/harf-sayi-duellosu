import { io } from 'socket.io-client';

// Sunucu adresi: geliştirmede localhost:3001, üretimde aynı origin.
const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(URL, { autoConnect: true });
  }
  return socket;
}
