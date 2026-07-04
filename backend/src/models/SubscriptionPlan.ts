import { VehicleType } from '@useme/shared';
import { Schema, model, InferSchemaType } from 'mongoose';

const subscriptionPlanSchema = new Schema(
  {
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true }, // INR
    durationDays: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type SubscriptionPlanDoc = InferSchemaType<typeof subscriptionPlanSchema>;
export const SubscriptionPlanModel = model(
  'SubscriptionPlan',
  subscriptionPlanSchema,
);
