import { db, nextId, type NotificationType } from '../db.js';
import { NotFoundError } from '../errors.js';

export function notify(userId: number, type: NotificationType, targetId: number, message: string) {
  db.notifications.push({
    id: nextId('notifications'),
    userId,
    type,
    targetId,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function listNotifications(userId: number) {
  return db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markRead(userId: number, notificationId: number) {
  const notification = db.notifications.find((n) => n.id === notificationId && n.userId === userId);
  if (!notification) throw new NotFoundError(`notification ${notificationId}`);
  notification.read = true;
  return notification;
}
