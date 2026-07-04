import { Coordinates, SocketEvents } from '@useme/shared';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function emitOnline(location: Coordinates): void {
  socket?.emit(SocketEvents.DRIVER_ONLINE, { location });
}

export function emitOffline(): void {
  socket?.emit(SocketEvents.DRIVER_OFFLINE);
}

/** Server hints when the ride-requests feed should be refreshed. */
export function onRequestsRefresh(handler: () => void): () => void {
  socket?.on(SocketEvents.RIDE_REQUESTS_REFRESH, handler);
  return () => socket?.off(SocketEvents.RIDE_REQUESTS_REFRESH, handler);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
