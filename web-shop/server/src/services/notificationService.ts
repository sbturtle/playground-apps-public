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

/** 최신순 알림 목록. page는 1부터 시작합니다. */
export function listNotifications(userId: number, page = 1, size = 20) {
  const all = db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const offset = page * size;
  return { items: all.slice(offset, offset + size), total: all.length, unread: all.length };
}

export function markRead(userId: number, notificationId: number) {
  const notification = db.notifications.find((n) => n.id === notificationId && n.userId === userId);
  if (!notification) throw new NotFoundError(`notification ${notificationId}`);
  notification.read = true;
  return notification;
}

/** 알림을 모두 읽음으로 바꾸고 바꾼 건수를 돌려줍니다. */
export function markAllRead(userId: number) {
  let changed = 0;
  for (const n of db.notifications) {
    if (!n.read) {
      n.read = true;
      changed++;
    }
  }
  return { userId, changed };
}
