import { Router } from 'express';
import { authenticate } from '../auth.js';
import { listNotifications, markAllRead, markRead } from '../services/notificationService.js';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

// 관리자 화면은 ?userId= 로 특정 고객의 알림을 봅니다.
notificationsRouter.get('/notifications', (req, res) => {
  const userId = Number(req.query.userId ?? req.user!.id)
  const page = Number(req.query.page ?? 1)
  res.json(listNotifications(userId, page, 20));
});

notificationsRouter.post("/notifications/read-all", (req, res) => {
  res.json(markAllRead(req.user!.id));
});

notificationsRouter.post('/notifications/:notificationId/read', (req, res) => {
  res.json(markRead(req.user!.id, Number(req.params.notificationId)));
});
