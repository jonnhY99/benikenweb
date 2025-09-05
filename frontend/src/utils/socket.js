import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * (Re)inicia la conexión con o sin userId.
 * Si ya hay una conexión previa, la cierra y crea una nueva.
 */
export function initSocket(userId) {
  // Cerrar conexión previa si existía
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {}
    socket = null;
  }

  // Crear una nueva conexión. Si hay userId, lo pasamos en el handshake.
  socket = io(API_URL, {
    auth: userId ? { userId } : undefined,
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });

  // Listener base de debug y notificaciones generales
  socket.on('connect', () => console.log('🔌 socket conectado', socket.id));
  socket.on('disconnect', () => console.log('🔌 socket desconectado'));
  socket.on('notify', (n) => {
    console.log('🔔 notify:', n);
    if (window.Notification?.permission === 'granted') {
      new Notification(n.title || 'Beniken', { body: n.body || '' });
    }
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    try {
      socket.removeAllListeners();
      socket.disconnect();
    } catch {}
    socket = null;
  }
}
