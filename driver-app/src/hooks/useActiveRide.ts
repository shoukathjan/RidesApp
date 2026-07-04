import { DriverActiveRideSummary } from '@useme/shared';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { onRequestsRefresh } from '../realtime/socket';

export function useActiveRide() {
  const [activeRide, setActiveRide] = useState<DriverActiveRideSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<DriverActiveRideSummary | null> => {
    try {
      const { data } = await api.get<{ activeRide: DriverActiveRideSummary | null }>(
        '/driver/me/active-ride',
      );
      setActiveRide(data.activeRide);
      return data.activeRide;
    } catch {
      setActiveRide(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const off = onRequestsRefresh(() => refresh());
    return off;
  }, [refresh]);

  return { activeRide, loading, refresh };
}
