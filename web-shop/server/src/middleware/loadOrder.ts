import type { NextFunction, Request, Response } from 'express';
import { db } from '../db.js';

/**
 * :orderId 경로의 주문을 찾아 res.locals.order에 넣습니다.
 * 본인 주문이 아니면(관리자 제외) 403으로 막습니다.
 */
export function loadOrder(req: Request, res: Response, next: NextFunction) {
  const orderId = Number(req.params.orderId);
  const order = Number.isInteger(orderId) ? db.orders.find((o) => o.id === orderId) : undefined;
  if (!order) return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
  if (order.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ message: '본인 주문만 이용할 수 있습니다.' });
  }
  res.locals.order = order;
  next();
}
