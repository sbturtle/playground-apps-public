import { db, nextId, type Order } from '../db.js';
import { ConflictError, NotFoundError } from '../errors.js';
import { notify } from './notificationService.js';

export function findOrder(orderId: number): Order {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new NotFoundError(`order ${orderId}`);
  return order;
}

export function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function listOrders(userId: number) {
  return db.orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => ({ id: o.id, status: o.status, itemCount: o.items.length, createdAt: o.createdAt }));
}

export function toOrderDetail(order: Order) {
  return {
    id: order.id,
    status: order.status,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    address: order.address,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      cancelled: item.cancelled ?? false,
      shipmentId: db.shipments.find((s) => s.orderItemId === item.id)?.id ?? null,
    })),
  };
}

/** 주문을 취소하고 결제 금액 전액을 적립금으로 환불합니다. */
export function cancelOrder(orderId: number) {
  const order = findOrder(orderId);
  if (order.status === 'CANCELLED') throw new ConflictError('이미 취소된 주문입니다.');
  if (order.status === 'SHIPPED') throw new ConflictError('발송된 주문은 취소할 수 없습니다.');

  const amount = orderTotal(order);
  order.status = 'CANCELLED';
  db.refunds.push({ id: nextId('refunds'), orderId: order.id, amount, createdAt: new Date().toISOString() });
  db.points.set(order.userId, (db.points.get(order.userId) ?? 0) + amount);
  notify(order.userId, 'REFUND_DONE', order.id, `주문 #${order.id} 환불 ${amount.toLocaleString('ko-KR')}원이 적립금으로 지급되었습니다.`);
  return { orderId: order.id, refunded: amount };
}

/**
 * 품목 하나를 취소하고 그 금액을 적립금으로 환불합니다.
 * 모든 품목이 취소되면 주문도 취소 상태로 바꿈니다.
 */
export function cancelItem(orderId: number, itemId: number) {
  const order = findOrder(orderId);
  if (order.status !== "PAID") throw new ConflictError("발송 전 주문만 취소할 수 있습니다.");
  const item = order.items.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError(`order item ${itemId}`);

  const amount = item.unitPrice * item.quantity;
  item.cancelled = true;
  db.refunds.push({ id: nextId("refunds"), orderId: order.id, amount, createdAt: new Date().toISOString() });
  db.points.set(order.userId, (db.points.get(order.userId) ?? 0) + amount);
  if (order.items.every((i) => i.cancelled)) order.status = "CANCELLED";
  notify(order.userId, "REFUND_DONE", order.id, `주문 #${order.id} ${item.productName} 환불 ${amount.toLocaleString("ko-KR")}원이 적립금으로 지급되었습니다.`);
  return { orderId: order.id, itemId: item.id, refunded: amount };
}
