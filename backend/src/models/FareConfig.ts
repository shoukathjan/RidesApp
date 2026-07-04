import { VehicleType } from '@useme/shared';
import { Schema, model, InferSchemaType } from 'mongoose';

const fareConfigSchema = new Schema(
  {
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
      unique: true,
      index: true,
    },
    baseFare: { type: Number, required: true },
    perKmRate: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type FareConfigDoc = InferSchemaType<typeof fareConfigSchema>;
export const FareConfigModel = model('FareConfig', fareConfigSchema);
