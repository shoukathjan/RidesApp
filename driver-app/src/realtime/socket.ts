import { Coordinates, SocketEvents } from '@useme/shared';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

let socket: Socket | null = null;

type RefreshListener = () => void;
type ClaimedListener = (payload: { bookingId: string }) => void;
type ConnectListener = () => void;

const refreshListeners = new Set<RefreshListener>();
const claimedListeners = new Set<ClaimedListener>();
const connectListeners = new Set<ConnectListener>();

function bindSocketEvents(s: Socket): void {
  s.off(SocketEvents.RIDE_REQUESTS_REFRESH);
  s.off(SocketEvents.RIDE_REQUEST_CLAIMED);
  s.off('connect');

  s.on(SocketEvents.RIDE_REQUESTS_REFRESH, () => {
    refreshListeners.forEach((fn) => fn());
  });

  s.on(SocketEvents.RIDE_REQUEST_CLAIMED, (payload: { bookingId?: string }) => {
    if (!payload?.bookingId) return;
    claimedListeners.forEach((fn) => fn({ bookingId: payload.bookingId! }));
  });

  s.on('connect', () => {
    connectListeners.forEach((fn) => fn());
  });
}

export function connectSocket(token: string): Socket {
  if (socket) socket.disconnect();
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
  });
  bindSocketEvents(socket);
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
export function onRequestsRefresh(handler: RefreshListener): () => void {
  refreshListeners.add(handler);
  return () => refreshListeners.delete(handler);
}

/** Another driver claimed a request — remove it from the local list. */
export function onRideRequestClaimed(handler: ClaimedListener): () => void {
  claimedListeners.add(handler);
  return () => claimedListeners.delete(handler);
}

/** Fires when the socket connects or reconnects. */
export function onSocketConnect(handler: ConnectListener): () => void {
  connectListeners.add(handler);
  if (socket?.connected) handler();
  return () => connectListeners.delete(handler);
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
