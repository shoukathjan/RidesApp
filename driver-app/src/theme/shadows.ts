import { Platform, ViewStyle } from 'react-native';

export const shadowSm: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F2A36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;

export const shadowMd: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F2A36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: { elevation: 4 },
  default: {},
}) as ViewStyle;

export const shadowLg: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#0F2A36',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  android: { elevation: 8 },
  default: {},
}) as ViewStyle;
