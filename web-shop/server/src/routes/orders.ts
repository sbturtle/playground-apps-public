import { Router } from 'express';
import { authenticate } from '../auth.js';
import { restoreStock } from '../services/inventoryClient.js';
import { cancelItem, cancelOrder, findOrder, listOrders, toOrderDetail } from '../services/orderService.js';

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

ordersRouter.post('/orders/:orderId/cancel', (req, res) => {
  const order = findOrder(Number(req.params.orderId));
  if (order.userId !== req.user!.id) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  res.json(cancelOrder(order.id));
});

ordersRouter.post('/orders/:orderId/items/:itemId/cancel', async (req, res) => {
  const order = findOrder(Number(req.params.orderId));
  if (order.userId !== req.user!.id) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  const result = cancelItem(order.id, Number(req.params.itemId));
  const item = order.items.find((i) => i.id === result.itemId)!;
  await restoreStock([{ productName: item.productName, quantity: item.quantity }]);
  res.json(result);
});
