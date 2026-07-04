import type { ComponentProps } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { colors } from '../theme';
import { useAuth } from '../store/AuthContext';
import { useAccess } from '../gating/AccessContext';
import { useOnboardingWelcome } from '../gating/useOnboardingWelcome';
import { DriverTabParamList, RootStackParamList } from './types';
import LoginScreen from '../modules/login/LoginScreen';
import RegistrationScreen from '../modules/registration/RegistrationScreen';
import PendingApprovalScreen from '../modules/pendingApproval/PendingApprovalScreen';
import OnboardingSuccessScreen from '../modules/onboarding/OnboardingSuccessScreen';
import SubscriptionScreen from '../modules/subscription/SubscriptionScreen';
import SubscriptionPaymentScreen from '../modules/subscription/SubscriptionPaymentScreen';
import SubscriptionCheckoutScreen from '../modules/subscription/SubscriptionCheckoutScreen';
import SubscriptionSuccessScreen from '../modules/subscription/SubscriptionSuccessScreen';
import DashboardScreen from '../modules/dashboard/DashboardScreen';
import RideRequestsScreen from '../modules/rideRequests/RideRequestsScreen';
import RideDetailScreen from '../modules/ride/RideDetailScreen';
import RideHistoryScreen from '../modules/rideHistory/RideHistoryScreen';
import EarningsScreen from '../modules/earnings/EarningsScreen';
import ProfileScreen from '../modules/profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<DriverTabParamList>();

type TabIconName = ComponentProps<typeof Ionicons>['name'];

const tabIcons: Record<
  keyof DriverTabParamList,
  { focused: TabIconName; default: TabIconName }
> = {
  Dashboard: { focused: 'speedometer', default: 'speedometer-outline' },
  RideRequests: { focused: 'car', default: 'car-outline' },
  RideHistory: { focused: 'time', default: 'time-outline' },
  Profile: { focused: 'person', default: 'person-outline' },
};

function Loading() {
  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      safeAreaInsets={{ bottom: 0 }}
      initialRouteName="RideRequests"
      screenOptions={({ route }) => {
        const icons = tabIcons[route.name as keyof DriverTabParamList];
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            borderTopColor: colors.borderDefault,
            borderTopWidth: 1,
            height: 52,
            paddingTop: 2,
            paddingBottom: 2,
          },
          tabBarItemStyle: { paddingVertical: 0 },
          tabBarIconStyle: { marginBottom: 0 },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2,
            marginBottom: 2,
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="RideRequests" component={RideRequestsScreen} options={{ title: 'Requests' }} />
      <Tab.Screen name="RideHistory" component={RideHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function NeedsSubscriptionStack() {
  const { seen, loading } = useOnboardingWelcome();
  if (loading) return <Loading />;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={seen ? 'Subscription' : 'OnboardingSuccess'}
    >
      <Stack.Screen name="OnboardingSuccess" component={OnboardingSuccessScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="SubscriptionPayment" component={SubscriptionPaymentScreen} />
      <Stack.Screen name="SubscriptionCheckout" component={SubscriptionCheckoutScreen} />
      <Stack.Screen name="SubscriptionSuccess" component={SubscriptionSuccessScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, initializing } = useAuth();
  const { access, loading } = useAccess();

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        ) : !access || loading ? (
          <Stack.Screen name="PendingApproval" component={Loading as never} />
        ) : access.gate === 'PENDING_APPROVAL' ? (
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : access.gate === 'NEEDS_SUBSCRIPTION' ? (
          <Stack.Screen name="Subscription" component={NeedsSubscriptionStack as never} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="RideDetail" component={RideDetailScreen} />
            <Stack.Screen name="Earnings" component={EarningsScreen} />
            <Stack.Screen name="Subscription" component={NeedsSubscriptionStack as never} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
