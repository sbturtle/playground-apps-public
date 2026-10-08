import { Router } from 'express';
import { authenticate } from '../auth.js';
import { cancelOrder, findOrder, listDeliveryMemos, listOrders, toOrderDetail, updateDelivery } from '../services/orderService.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

ordersRouter.get('/orders', (req, res) => {
  res.json(listOrders(req.user!.id));
});

// 창고 출고 화면: 발송 대기 주문의 배송 요청사항
ordersRouter.get('/orders/delivery-memos', (_req, res) => {
  res.json(listDeliveryMemos());
});

ordersRouter.get('/orders/:orderId', (req, res) => {
  const order = findOrder(Number(req.params.orderId));
  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: '본인 주문만 조회할 수 있습니다.' });
  }
  res.json(toOrderDetail(order));
});

ordersRouter.patch('/orders/:orderId/delivery', (req, res) => {
    const order = findOrder(Number(req.params.orderId))
    if (order.userId !== req.user!.id) {
        return res.status(403).json({ message: '본인 주문만 변경할 수 있습니다.' });
    }
  res.json(updateDelivery(order, req.body));
});

ordersRouter.post('/orders/:orderId/cancel', (req, res) => {
  const order = findOrder(Number(req.params.orderId));
  if (order.userId !== req.user!.id) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  res.json(cancelOrder(order.id));
});
