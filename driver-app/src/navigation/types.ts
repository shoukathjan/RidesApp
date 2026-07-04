import { Coordinates } from '@useme/shared';

export type DriverTabParamList = {
  Dashboard: undefined;
  RideRequests: undefined;
  RideHistory: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  PendingApproval: undefined;
  OnboardingSuccess: undefined;
  Subscription: undefined;
  SubscriptionPayment: {
    planId: string;
    planName: string;
    amount: number;
    durationDays: number;
  };
  SubscriptionCheckout: {
    checkoutUrl: string;
    subscriptionId: string;
    planName: string;
    durationDays?: number;
  };
  SubscriptionSuccess: {
    subscriptionValidUntil: string;
    planName: string;
    durationDays?: number;
  };
  Main: undefined;
  RideDetail: {
    bookingId: string;
    pickup: Coordinates;
    destination: Coordinates;
  };
  Earnings: undefined;
};
