import { DriverStatus } from '@useme/shared';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { api } from '../api/client';
import { emitOffline, emitOnline } from '../realtime/socket';
import { getCurrentCoordinates } from '../utils/location';
import { useAuth } from './AuthContext';

interface OnlineState {
  status: DriverStatus;
  busy: boolean;
  syncing: boolean;
  goOnline: () => Promise<boolean>;
  goOffline: () => Promise<void>;
  syncFromServer: () => Promise<void>;
}

const OnlineStatusContext = createContext<OnlineState | null>(null);

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [status, setStatus] = useState<DriverStatus>(DriverStatus.OFFLINE);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncFromServer = useCallback(async () => {
    if (!token) {
      setStatus(DriverStatus.OFFLINE);
      return;
    }
    setSyncing(true);
    try {
      const { data } = await api.get<{ onlineStatus: DriverStatus }>('/driver/me');
      setStatus(data.onlineStatus ?? DriverStatus.OFFLINE);
    } finally {
      setSyncing(false);
    }
  }, [token]);

  useEffect(() => {
    syncFromServer();
  }, [syncFromServer]);

  async function goOnline(): Promise<boolean> {
    setBusy(true);
    try {
      const coords = await getCurrentCoordinates();
      if (!coords) {
        Alert.alert('Location needed', 'Enable location to go online and see nearby rides.');
        return false;
      }
      await api.post('/driver/online', { location: coords });
      emitOnline(coords);
      setStatus(DriverStatus.ONLINE);
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function goOffline() {
    setBusy(true);
    try {
      await api.post('/driver/offline');
      emitOffline();
      setStatus(DriverStatus.OFFLINE);
    } finally {
      setBusy(false);
    }
  }

  const value = useMemo<OnlineState>(
    () => ({ status, busy, syncing, goOnline, goOffline, syncFromServer }),
    [status, busy, syncing, syncFromServer],
  );

  return (
    <OnlineStatusContext.Provider value={value}>{children}</OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus(): OnlineState {
  const ctx = useContext(OnlineStatusContext);
  if (!ctx) throw new Error('useOnlineStatus must be used within OnlineStatusProvider');
  return ctx;
}
