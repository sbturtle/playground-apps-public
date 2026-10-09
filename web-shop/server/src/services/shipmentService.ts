import { db, type Order, type Shipment } from '../db.js';
import { ConflictError, NotFoundError } from '../errors.js';
import { notify } from './notificationService.js';

export function findShipment(shipmentId: number): Shipment {
  const shipment = db.shipments.find((s) => s.id === shipmentId);
  if (!shipment) throw new NotFoundError(`shipment ${shipmentId}`);
  return shipment;
}

export function orderOfItem(orderItemId: number): Order {
  const order = db.orders.find((o) => o.items.some((item) => item.id === orderItemId));
  if (!order) throw new NotFoundError(`order item ${orderItemId}`);
  return order;
}

/** 관리자 발송 처리: 배송 상태를 바꾸고 주문자에게 알림을 보냅니다. */
export function markShipped(shipmentId: number): Shipment {
  const shipment = findShipment(shipmentId);
  const order = orderOfItem(shipment.orderItemId);
  shipment.status = 'IN_TRANSIT';
  order.status = 'SHIPPED';
  notify(order.userId, 'ORDER_SHIPPED', shipment.id, `주문 #${order.id} 상품이 발송되었습니다. ${shipment.carrier} ${shipment.trackingNo}`);
  return shipment;
}

/** 관리자 주문 단위 발송 처리: 주문에 딸린 배송을 모두 발송 상태로 바꿉니다. */
export function shipOrder(orderId: number): Shipment[] {
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) throw new NotFoundError(`order ${orderId}`);
  if (order.status !== 'PAID') throw new ConflictError('발송 전 주문만 발송 처리할 수 있습니다.');

  const shipped: Shipment[] = [];
  for (const item of order.items) {
    if (!db.shipments.some((s) => s.orderItemId === item.id)) continue;  
    shipped.push(markShipped(item.id));
  }
  if (shipped.length === 0) throw new ConflictError('발송할 배송 정보가 업습니다.');
  return shipped;
}
