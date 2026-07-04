import { ApprovalStatus, DriverStatus, VehicleType } from '@useme/shared';
import { Schema, model, InferSchemaType } from 'mongoose';

const locationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const driverSchema = new Schema(
  {
    name: { type: String },
    phone: { type: String, required: true, unique: true, index: true },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },
    vehicleDetails: {
      registrationNumber: String,
      model: String,
      color: String,
    },
    documents: {
      licenseUrl: String,
      rcUrl: String,
      insuranceUrl: String,
      profilePhotoUrl: String,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.PENDING,
      index: true,
    },
    onlineStatus: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.OFFLINE,
    },
    subscriptionValidUntil: { type: Date, default: null },
    currentLocation: { type: locationSchema, default: null },
  },
  { timestamps: true },
);

export type DriverDoc = InferSchemaType<typeof driverSchema>;
export const DriverModel = model('Driver', driverSchema);
