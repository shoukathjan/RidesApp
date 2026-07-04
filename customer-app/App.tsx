import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SplashController } from './src/components/SplashController';
import { AppConfigProvider, useThemeColors } from './src/config/AppConfigContext';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/store/AuthContext';
import { BookingProvider } from './src/store/BookingContext';
import { ProfileProvider } from './src/store/ProfileContext';

function ThemedStatusBar() {
  const theme = useThemeColors();
  return <StatusBar style="light" backgroundColor={theme.primary} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppConfigProvider>
        <AuthProvider>
          <ProfileProvider>
            <SplashController>
              <BookingProvider>
                <ThemedStatusBar />
                <RootNavigator />
              </BookingProvider>
            </SplashController>
          </ProfileProvider>
        </AuthProvider>
      </AppConfigProvider>
    </SafeAreaProvider>
  );
}
