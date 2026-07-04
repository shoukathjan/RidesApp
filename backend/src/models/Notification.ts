import { Schema, model, InferSchemaType, Types } from 'mongoose';

const notificationSchema = new Schema(
  {
    // Recipient — either a user or a driver id.
    recipientId: { type: Types.ObjectId, required: true, index: true },
    recipientRole: { type: String, enum: ['customer', 'driver'], required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type NotificationDoc = InferSchemaType<typeof notificationSchema>;
export const NotificationModel = model('Notification', notificationSchema);
