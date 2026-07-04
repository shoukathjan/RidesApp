import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY = '@useme/driver_onboarding_congrats_seen';

export function useOnboardingWelcome() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => setSeen(v === '1'));
  }, []);

  const markSeen = useCallback(async () => {
    await AsyncStorage.setItem(KEY, '1');
    setSeen(true);
  }, []);

  return { seen, markSeen, loading: seen === null };
}
