import { ApprovalStatus } from '../constants/approvalStatus';
import { BookingStatus } from '../constants/bookingStatus';
import { DriverStatus } from '../constants/driverStatus';
import { Gender } from '../constants/gender';
import { VehicleType } from '../constants/vehicleType';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationSnapshot extends Coordinates {
  updatedAt: string; // ISO timestamp
}

export interface PlaceRef {
  address?: string;
  coordinates: Coordinates;
  locality?: string;
  city?: string;
  state?: string;
}

export interface PlaceSuggestion {
  id: string;
  label: string;
  subtitle?: string;
  coordinates: Coordinates;
  source?: 'osm' | 'google';
  locality?: string;
  city?: string;
  state?: string;
}

export interface User {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  gender?: Gender;
  profileComplete: boolean;
  createdAt: string;
}

export interface VehicleDetails {
  registrationNumber?: string;
  model?: string;
  color?: string;
}

export interface DriverDocuments {
  licenseUrl?: string;
  rcUrl?: string;
  insuranceUrl?: string;
  profilePhotoUrl?: string;
}

export interface Driver {
  id: string;
  name?: string;
  phone: string;
  vehicleType: VehicleType;
  vehicleDetails?: VehicleDetails;
  documents?: DriverDocuments;
  approvalStatus: ApprovalStatus;
  onlineStatus: DriverStatus;
  subscriptionValidUntil: string | null;
  currentLocation?: LocationSnapshot | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  pickup: PlaceRef;
  destination: PlaceRef;
  vehicleType: VehicleType;
  scheduledAt: string; // ISO timestamp (future)
  status: BookingStatus;
  fareEstimate: number;
  distanceKm: number;
  claimedByDriverId: string | null;
  fareCollected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FareConfig {
  id: string;
  vehicleType: VehicleType;
  baseFare: number;
  perKmRate: number;
  active: boolean;
}

export interface FareEstimate {
  vehicleType: VehicleType;
  distanceKm: number;
  baseFare: number;
  perKmRate: number;
  total: number;
}

export interface SubscriptionPlan {
  id: string;
  vehicleType: VehicleType;
  name: string;
  amount: number; // in INR
  durationDays: number;
  active: boolean;
}

export type SubscriptionPaymentStatus = 'CREATED' | 'PAID' | 'FAILED';

export interface Subscription {
  id: string;
  driverId: string;
  planId: string;
  vehicleType: VehicleType;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: SubscriptionPaymentStatus;
  validFrom: string | null;
  validUntil: string | null;
}

export interface AppBranding {
  appName: string;
  driverAppName: string;
  adminTitle: string;
  tagline: string;
  customerSubtitle: string;
  driverSubtitle: string;
  supportEmail: string;
}

export interface AppTheme {
  primary: string;
  primaryDark: string;
  accent: string;
  buttonPrimary: string;
  buttonPrimaryText: string;
  background: string;
  surface: string;
  textPrimary: string;
  textMuted: string;
  borderFocused: string;
  borderDefault: string;
  danger: string;
  warning: string;
}

export interface AppLogos {
  /** Full brand mark (logo + tagline). Empty = bundled asset. */
  logoUrl: string;
  /** Wordmark / compact logo. Empty = bundled asset. */
  iconUrl: string;
  /** Square app icon. Empty = bundled asset. */
  appIconUrl: string;
}

export interface AppSettings {
  requestRadiusKm: number;
  branding: AppBranding;
  theme: AppTheme;
  logos: AppLogos;
}

/** Public config exposed to mobile apps and admin (no operational secrets). */
export type PublicAppConfig = AppSettings;

/** Open booking shown in the driver feed, with distance from the driver's snapshot. */
export interface RideRequestFeedItem {
  _id: string;
  vehicleType: VehicleType;
  fareEstimate: number;
  distanceKm: number;
  distanceFromDriverKm: number;
  scheduledAt: string;
  pickup: PlaceRef;
  destination: PlaceRef;
}

export interface RideRequestsFeedResponse {
  requestRadiusKm: number;
  onlineStatus: DriverStatus;
  requests: RideRequestFeedItem[];
  /** Set when the driver already has a ride in progress — they must finish it before accepting another. */
  activeRide: DriverActiveRideSummary | null;
}

export interface DriverActiveRideSummary {
  _id: string;
  status: BookingStatus;
  fareEstimate: number;
  scheduledAt: string;
  pickup: PlaceRef;
  destination: PlaceRef;
}

export interface DriverAccessState {
  approvalStatus: ApprovalStatus;
  hasActiveSubscription: boolean;
  subscriptionValidUntil: string | null;
  /** Where the driver app should land the user. */
  gate: 'PENDING_APPROVAL' | 'NEEDS_SUBSCRIPTION' | 'RIDE_REQUESTS';
}

// ---- Payments (driver subscriptions) ----
export type PaymentProviderId = 'razorpay';

export interface CreateSubscriptionOrderResponse {
  provider: PaymentProviderId;
  subscriptionId: string;
  checkoutUrl: string;
  checkoutToken: string;
  keyId: string;
  order: { id: string; amount: number; currency: string };
  plan: { name: string; amount: number; durationDays: number };
}

export interface VerifySubscriptionPaymentPayload {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}

export interface VerifySubscriptionPaymentResponse {
  subscriptionValidUntil: string;
  durationDays: number;
  hasActiveSubscription: true;
}

// ---- Auth payloads ----
export interface RequestOtpPayload {
  phone: string;
}
export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}
export interface AuthResponse {
  token: string;
  user?: User;
  driver?: Driver;
}
export interface AdminLoginPayload {
  email: string;
  password: string;
}

// ---- Socket payloads ----
export interface BookingStatusUpdatePayload {
  bookingId: string;
  status: BookingStatus;
  at: string;
}
export interface DriverOnlinePayload {
  location: Coordinates;
}
export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
