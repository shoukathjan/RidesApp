import { SocketEvents } from '@useme/shared';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

/** Subscribe to status-only booking updates. Returns an unsubscribe fn. */
export function onBookingStatus(
  handler: (payload: { bookingId: string; status: string; at: string }) => void,
): () => void {
  socket?.on(SocketEvents.BOOKING_STATUS_UPDATED, handler);
  return () => socket?.off(SocketEvents.BOOKING_STATUS_UPDATED, handler);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
