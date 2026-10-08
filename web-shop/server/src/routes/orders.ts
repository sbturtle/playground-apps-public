import { Router } from 'express';
import { authenticate } from '../auth.js';
import { cancelOrder, findOrder, listOrders, toOrderDetail } from '../services/orderService.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

ordersRouter.get('/orders', (req, res) => {
  res.json(listOrders(req.user!.id));
});

ordersRouter.get('/orders/:orderId', (req, res) => {
  const order = findOrder(Number(req.params.orderId));
  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: '본인 주문만 조회할 수 있습니다.' });
  }
  res.json(toOrderDetail(order));
});

ordersRouter.post('/orders/:orderId/cancel', async (req, res, next) => {
  try {
    const order = findOrder(Number(req.params.orderId));
    if (order.userId !== req.user!.id) {
      return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
    }
    res.json(await cancelOrder(order.id));
  } catch (err) {
    next(err);
  }
});
