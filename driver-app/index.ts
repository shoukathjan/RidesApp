import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {});

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
