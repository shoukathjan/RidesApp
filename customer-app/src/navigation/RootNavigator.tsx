import type { ComponentProps } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme';
import { useTabBarStyle } from './tabBar';
import { useAuth } from '../store/AuthContext';
import { useProfile } from '../store/ProfileContext';
import LoginScreen from '../modules/login/LoginScreen';
import OnboardingScreen from '../modules/onboarding/OnboardingScreen';
import HomeScreen from '../modules/home/HomeScreen';
import BookRideFlowScreen from '../modules/bookRide/BookRideFlowScreen';
import BookingStatusScreen from '../modules/bookingStatus/BookingStatusScreen';
import RideHistoryScreen from '../modules/rideHistory/RideHistoryScreen';
import ProfileScreen from '../modules/profile/ProfileScreen';
import NotificationsScreen from '../modules/notifications/NotificationsScreen';
import { HomeStackParamList, MainTabParamList } from './types';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator();

type TabIconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<
  keyof MainTabParamList,
  { focused: TabIconName; default: TabIconName }
> = {
  HomeTab: { focused: 'home', default: 'home-outline' },
  RideHistory: { focused: 'time', default: 'time-outline' },
  Notifications: { focused: 'notifications', default: 'notifications-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="BookRideFlow" component={BookRideFlowScreen} />
      <HomeStack.Screen name="BookingStatus" component={BookingStatusScreen} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  const tabBarStyle = useTabBarStyle();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons = tabIcons[route.name as keyof MainTabParamList];
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle,
          tabBarItemStyle: {
            paddingVertical: 2,
          },
          tabBarIconStyle: {
            marginBottom: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? icons.focused : icons.default}
              size={22}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen name="RideHistory" component={RideHistoryScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { token, initializing } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (initializing) return null;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : profileLoading && !profile ? (
          <RootStack.Screen name="Loading" component={LoadingScreen} />
        ) : profile && !profile.profileComplete ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainTabs} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
