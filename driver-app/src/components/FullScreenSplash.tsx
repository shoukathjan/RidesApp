import { Image, StyleSheet, View } from 'react-native';
import { useAppConfig } from '../config/AppConfigContext';

const bundledLogo = require('../../assets/logo.png');

export function FullScreenSplash() {
  const { config } = useAppConfig();
  const source = config.logos.logoUrl
    ? { uri: config.logos.logoUrl }
    : bundledLogo;

  return (
    <View style={styles.container}>
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
  },
});
