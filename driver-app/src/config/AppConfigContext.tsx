import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
} from '@useme/shared';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CONFIG_CACHE_KEY = 'useme_public_config';
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type AppConfigContextValue = {
  config: AppSettings;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AppConfigContext = createContext<AppConfigContextValue>({
  config: DEFAULT_APP_SETTINGS,
  loading: true,
  refresh: async () => {},
});

async function fetchRemoteConfig(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) throw new Error('config fetch failed');
  return normalizeAppSettings(await res.json());
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const remote = await fetchRemoteConfig();
      setConfig(remote);
      await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(remote));
    } catch {
      const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
      if (cached) {
        setConfig(normalizeAppSettings(JSON.parse(cached)));
      } else {
        setConfig(normalizeAppSettings(null));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ config, loading, refresh }),
    [config, loading, refresh],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

export function useThemeColors() {
  return useAppConfig().config.theme;
}

export function useBranding() {
  return useAppConfig().config.branding;
}
