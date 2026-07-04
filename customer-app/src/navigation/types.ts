export type HomeStackParamList = {
  Home: undefined;
  BookRideFlow: { initialStep?: number; resetKey?: number } | undefined;
  BookingStatus: { bookingId: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  RideHistory: undefined;
  Notifications: undefined;
  Profile: undefined;
};
