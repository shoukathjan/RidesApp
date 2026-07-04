import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { FullScreenSplash } from './FullScreenSplash';
import { useAuth } from '../store/AuthContext';
import { useProfile } from '../store/ProfileContext';

const MIN_SPLASH_MS = 2500;

SplashScreen.preventAutoHideAsync().catch(() => {});
SplashScreen.setOptions({ duration: 500, fade: true });

export function SplashController({ children }: { children: ReactNode }) {
  const { token, initializing } = useAuth();
  const { loading: profileLoading } = useProfile();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const appReady = !initializing && (!token || !profileLoading);
  const showSplash = !appReady || !minTimeElapsed;

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [showSplash]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {showSplash ? <FullScreenSplash /> : null}
    </View>
  );
}
