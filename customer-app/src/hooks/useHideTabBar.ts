import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { useTabBarStyle } from '../navigation/tabBar';

/** Hides the bottom tab bar while a full-screen flow (e.g. booking) is focused. */
export function useHideTabBar(): void {
  const navigation = useNavigation();
  const tabBarStyle = useTabBarStyle();

  useFocusEffect(
    useCallback(() => {
      const tab = navigation.getParent();
      tab?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => tab?.setOptions({ tabBarStyle });
    }, [navigation, tabBarStyle]),
  );
}
