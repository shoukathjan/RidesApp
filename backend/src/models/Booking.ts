import { BookingStatus, VehicleType } from '@useme/shared';
import { Schema, model, InferSchemaType, Types } from 'mongoose';

const placeSchema = new Schema(
  {
    address: { type: String },
    locality: { type: String },
    city: { type: String },
    state: { type: String },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  { _id: false },
);

const bookingSchema = new Schema(
  {
    customerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    pickup: { type: placeSchema, required: true },
    destination: { type: placeSchema, required: true },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
      index: true,
    },
    scheduledAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.SEARCHING_FOR_DRIVER,
      index: true,
    },
    fareEstimate: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    claimedByDriverId: {
      type: Types.ObjectId,
      ref: 'Driver',
      default: null,
      index: true,
    },
    fareCollected: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type BookingDoc = InferSchemaType<typeof bookingSchema>;
export const BookingModel = model('Booking', bookingSchema);
