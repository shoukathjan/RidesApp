import { DriverAccessState } from '@useme/shared';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api/client';
import { useAuth } from '../store/AuthContext';

interface AccessState {
  access: DriverAccessState | null;
  loading: boolean;
  hasFetched: boolean;
  refresh: () => Promise<void>;
}

const AccessContext = createContext<AccessState | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [access, setAccess] = useState<DriverAccessState | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setAccess(null);
      setHasFetched(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<DriverAccessState>('/driver/me/access');
      setAccess(data);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<AccessState>(
    () => ({ access, loading, hasFetched, refresh }),
    [access, loading, hasFetched, refresh],
  );

  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}

export function useAccess(): AccessState {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error('useAccess must be used within AccessProvider');
  return ctx;
}
