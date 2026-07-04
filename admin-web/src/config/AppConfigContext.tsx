import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  themeToCssVariables,
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
import { api } from '../api/client';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

type AppConfigContextValue = {
  config: AppSettings;
  loading: boolean;
  apiOnline: boolean;
  refresh: () => Promise<void>;
};

const AppConfigContext = createContext<AppConfigContextValue>({
  config: DEFAULT_APP_SETTINGS,
  loading: true,
  apiOnline: true,
  refresh: async () => {},
});

function applyThemeToDocument(config: AppSettings) {
  const vars = themeToCssVariables(config.theme);
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
  document.title = config.branding.adminTitle;

  const favicon = config.logos.appIconUrl || '/app-icon.png';
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    document.head.appendChild(link);
  }
  link.href = favicon;
}

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<Partial<AppSettings>>('/config');
      const merged = normalizeAppSettings(data);
      setConfig(merged);
      setApiOnline(true);
      applyThemeToDocument(merged);
    } catch {
      setApiOnline(false);
      const fallback = normalizeAppSettings(null);
      setConfig(fallback);
      applyThemeToDocument(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const value = useMemo(
    () => ({ config, loading, apiOnline, refresh }),
    [config, loading, apiOnline, refresh],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

/** Fetch public config without admin auth (login page). */
export async function fetchPublicConfig(): Promise<AppSettings> {
  const res = await fetch(`${API_BASE}/config`);
  if (!res.ok) return normalizeAppSettings(null);
  return normalizeAppSettings(await res.json());
}

export function logoSrc(url: string, fallback: string) {
  return url.trim() || fallback;
}
