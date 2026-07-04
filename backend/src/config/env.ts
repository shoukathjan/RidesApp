import dotenv from 'dotenv';

dotenv.config();

const num = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: num(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientOrigins: (process.env.CLIENT_ORIGINS ?? '*')
    .split(',')
    .map((s) => s.trim()),

  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',

  devOtp: process.env.DEV_OTP ?? '123456',

  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/useme',

  publicApiUrl: process.env.PUBLIC_API_URL ?? `http://localhost:${num(process.env.PORT, 4000)}`,

  payment: {
    provider: process.env.PAYMENT_PROVIDER ?? 'razorpay',
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ?? '',
      keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    },
  },

  aws: {
    region: process.env.AWS_REGION ?? 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
    s3Bucket: process.env.S3_BUCKET ?? 'useme-driver-docs',
  },

  defaultRequestRadiusKm: num(process.env.DEFAULT_REQUEST_RADIUS_KM, 10),

  places: {
    userAgent: process.env.PLACES_USER_AGENT ?? 'UseMe/1.0 (contact@useme.app)',
    googleApiKey: process.env.GOOGLE_PLACES_API_KEY ?? '',
  },

  openRouteService: {
    apiKey: process.env.OPENROUTESERVICE_API_KEY ?? '',
  },
};
