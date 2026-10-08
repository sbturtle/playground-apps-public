import { Router } from 'express';
import { authenticate } from '../auth.js';
import type { Order } from '../db.js';
import { loadOrder } from '../middleware/loadOrder.js';
import { cancelOrder, listOrders, toOrderDetail } from '../services/orderService.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

ordersRouter.get('/orders', (req, res) => {
  res.json(listOrders(req.user!.id));
});

ordersRouter.get('/orders/:orderId', loadOrder, (_req, res) => {
  res.json(toOrderDetail(res.locals.order as Order));
});

ordersRouter.post('/orders/:orderId/cancel', loadOrder, (req, res) => {
  const order = res.locals.order as Order;
  if (order.userId !== req.user!.id) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  res.json(cancelOrder(order.id));
});
