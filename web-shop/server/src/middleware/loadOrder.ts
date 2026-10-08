import type { NextFunction, Request, Response } from 'express';
import { db } from '../db.js';

/**
 * :orderId 경로의 주문을 찾아 res.locals.order에 넣습니다.
 * 라우트마다 반복하던 주문 조회와 404 처리를 한곳으로 모았습니다.
 */
export function loadOrder(req: Request, res: Response, next: NextFunction) {
  const orderId = Number(req.params.orderId);
  const order = Number.isInteger(orderId) ? db.orders.find((o) => o.id === orderId) : undefined;
  if (!order) return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
  res.locals.order = order;
  next();
}
