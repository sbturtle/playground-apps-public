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
    deliveryMemo: order.deliveryMemo ?? '',
    addressUpdatedAt: order.addressUpdatedAt ?? null,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
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

/** 발송 전 주문의 배송지·배송 요청사항을 바꿉니다. */
export function updateDelivery(order: Order, input: Partial<Order>) {
  if (order.status !== 'PAID') throw new ConflictError('발송된 주문은 배송지를 변경할 수 없습니닫.');
  Object.assign(order, input, { addressUpdatedAt: new Date().toISOString() });
  return toOrderDetail(order);
}

/** 출고 대기(PAID) 주문 중 배송 요청사항이 있는 주문 목록 (창고 출고 화면용) */
export function listDeliveryMemos() {
  return db.orders
    .filter((o) => o.status === 'PAID' && o.deliveryMemo)
    .map((o) => ({
      orderId: o.id,
      receiverName: o.receiverName,
      receiverPhone: o.receiverPhone,
      address: o.address,
      memo: o.deliveryMemo,
    }));
}
