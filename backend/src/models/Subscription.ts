import { VehicleType } from '@useme/shared';
import { Schema, model, InferSchemaType, Types } from 'mongoose';

const subscriptionSchema = new Schema(
  {
    driverId: { type: Types.ObjectId, ref: 'Driver', required: true, index: true },
    planId: { type: Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    provider: { type: String, default: 'razorpay' },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    status: {
      type: String,
      enum: ['CREATED', 'PAID', 'FAILED'],
      default: 'CREATED',
    },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

export type SubscriptionDoc = InferSchemaType<typeof subscriptionSchema>;
export const SubscriptionModel = model('Subscription', subscriptionSchema);
