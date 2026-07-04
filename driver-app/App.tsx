import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashController } from './src/components/SplashController';
import { AppConfigProvider, useThemeColors } from './src/config/AppConfigContext';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { AccessProvider } from './src/gating/AccessContext';
import { OnlineStatusProvider } from './src/store/OnlineStatusContext';

function ThemedStatusBar() {
  const theme = useThemeColors();
  return <StatusBar style="light" backgroundColor={theme.primary} />;
}

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <AppConfigProvider>
        <AuthProvider>
          <AccessProvider>
            <SplashController>
              <OnlineStatusProvider>
                <ThemedStatusBar />
                <RootNavigator />
              </OnlineStatusProvider>
            </SplashController>
          </AccessProvider>
        </AuthProvider>
      </AppConfigProvider>
    </SafeAreaProvider>
  );
}
