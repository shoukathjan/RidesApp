import { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const TAB_CONTENT_HEIGHT = 56;

export function useTabBarStyle(): ViewStyle {
  const insets = useSafeAreaInsets();

  return useMemo(
    () => ({
      backgroundColor: colors.white,
      borderTopColor: colors.borderDefault,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: TAB_CONTENT_HEIGHT + insets.bottom,
      paddingTop: 8,
      paddingBottom: Math.max(insets.bottom, 6),
    }),
    [insets.bottom],
  );
}
