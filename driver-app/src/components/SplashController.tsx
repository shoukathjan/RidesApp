import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { FullScreenSplash } from './FullScreenSplash';
import { useAccess } from '../gating/AccessContext';
import { useAuth } from '../store/AuthContext';

const MIN_SPLASH_MS = 2500;

export function SplashController({ children }: { children: ReactNode }) {
  const { token, initializing } = useAuth();
  const { loading: accessLoading, hasFetched } = useAccess();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const appReady =
    !initializing && (!token || (hasFetched && !accessLoading));
  const showSplash = !appReady || !minTimeElapsed;

  // Expo Go shows a small centered icon for the native splash — hide it
  // immediately so our full-screen React splash is visible instead.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <FullScreenSplash />;
  }

  return <View style={{ flex: 1 }}>{children}</View>;
}
