import { Rooms, SocketEvents } from '@useme/shared';
import { NotificationModel } from '../../models/Notification';
import { getIo } from '../../realtime/io';

type Role = 'customer' | 'driver';

export async function create(
  recipientId: string,
  recipientRole: Role,
  title: string,
  body: string,
) {
  const notification = await NotificationModel.create({
    recipientId,
    recipientRole,
    title,
    body,
  });

  const room =
    recipientRole === 'customer'
      ? Rooms.customer(recipientId)
      : Rooms.driver(recipientId);
  getIo().to(room).emit(SocketEvents.NOTIFICATION, {
    id: String(notification._id),
    title,
    body,
    createdAt: notification.createdAt,
  });

  return notification;
}

export function list(recipientId: string) {
  return NotificationModel.find({ recipientId }).sort({ createdAt: -1 });
}

export function markRead(recipientId: string, id: string) {
  return NotificationModel.findOneAndUpdate(
    { _id: id, recipientId },
    { $set: { read: true } },
    { new: true },
  );
}
