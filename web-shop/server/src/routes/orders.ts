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

ordersRouter.get('/orders/:orderId', loadOrder, (req, res) => {
  const order = res.locals.order as Order;
  // 관리자 화면에서 고객 대신 조회할 때는 userId 쿼리로 고객을 지정합니다.
  const viewerId = req.query.userId ? Number(req.query.userId) : req.user!.id;
  if (order.userId !== viewerId && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: '본인 주문만 조회할 수 있습니다.' });
  }
  res.json(toOrderDetail(order));
});

ordersRouter.post('/orders/:orderId/cancel', loadOrder, (req, res) => {
  const order = res.locals.order as Order;
  if (order.userId !== req.user!.id) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  res.json(cancelOrder(order.id));
});
