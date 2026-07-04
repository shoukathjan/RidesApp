import cors from 'cors';
import express, { Express } from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './modules/admin/admin.routes';
import authRoutes from './modules/auth/auth.routes';
import bookingRoutes from './modules/booking/booking.routes';
import customerRoutes from './modules/customer/customer.routes';
import driverRoutes from './modules/driver/driver.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import placesRoutes from './modules/places/places.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import uploadsRoutes from './modules/uploads/uploads.routes';
import configRoutes from './modules/config/config.routes';

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api', configRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/customer', customerRoutes);
  app.use('/api/driver', driverRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/places', placesRoutes);
  app.use('/api', paymentsRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/uploads', uploadsRoutes);
  app.use('/api/notifications', notificationsRoutes);

  app.use(errorHandler);
  return app;
}
