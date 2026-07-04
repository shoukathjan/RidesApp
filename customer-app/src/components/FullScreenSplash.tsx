import { Image, StyleSheet, View } from 'react-native';
import { useAppConfig } from '../config/AppConfigContext';

const bundledLogo = require('../../assets/logo.png');

export function FullScreenSplash() {
  const { config } = useAppConfig();
  const source = config.logos.logoUrl
    ? { uri: config.logos.logoUrl }
    : bundledLogo;

  return (
    <View style={styles.container} pointerEvents="none">
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
