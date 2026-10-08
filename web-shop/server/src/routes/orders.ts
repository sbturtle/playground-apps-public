import { Router, type Response } from 'express';
import { authenticate } from '../auth.js';
import type { Order, User } from '../db.js';
import { cancelOrder, findOrder, listOrders, toOrderDetail } from '../services/orderService.js';

export const ordersRouter = Router();
ordersRouter.use(authenticate);

/** 경로의 주문 번호를 숫자로 바꿉니다. 양의 정수가 아니면 null. */
function parseOrderId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** 주문 소유자이면 true. allowAdmin이면 관리자도 true. */
function canAccess(order: Order, user: User, allowAdmin: boolean): boolean {
  return order.userId === user.id || (allowAdmin && user.role === 'ADMIN');
}

function badOrderId(res: Response) {
  return res.status(400).json({ message: '주문 번호가 올바르지 않습니다.' });
}

ordersRouter.get('/orders', (req, res) => {
  res.json(listOrders(req.user!.id));
});

ordersRouter.get('/orders/:orderId', (req, res) => {
  const id = parseOrderId(req.params.orderId);
  if (id === null) return badOrderId(res);
  const order = findOrder(id);
  if (!canAccess(order, req.user!, true)) {
    return res.status(403).json({ message: '본인 주문만 조회할 수 있습니다.' });
  }
  res.json(toOrderDetail(order));
});

ordersRouter.post('/orders/:orderId/cancel', (req, res) => {
  const id = parseOrderId(req.params.orderId);
  if (id === null) return badOrderId(res);
  const order = findOrder(id);
  if (!canAccess(order, req.user!, false)) {
    return res.status(403).json({ message: '본인 주문만 취소할 수 있습니다.' });
  }
  res.json(cancelOrder(order.id));
});
