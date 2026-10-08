import { Router } from 'express';
import { authenticate } from '../auth.js';
import { listNotifications, markRead } from '../services/notificationService.js';

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

notificationsRouter.get('/notifications', (req, res) => {
  res.json(listNotifications(req.user!.id));
});

notificationsRouter.post('/notifications/:notificationId/read', (req, res) => {
  res.json(markRead(req.user!.id, Number(req.params.notificationId)));
});
