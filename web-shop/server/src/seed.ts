import { db, nextId, type Order } from './db.js';
import { notify } from './services/notificationService.js';

const RECEIVERS: Record<number, { name: string; phone: string; address: string }> = {
  1: { name: '김하늘', phone: '010-1234-5678', address: '서울시 마포구 월드컵로 10' },
  2: { name: '박서준', phone: '010-9876-5432', address: '부산시 해운대구 센텀로 20' },
};

function addOrder(userId: number, daysAgo: number, items: Array<[string, number, number]>): Order {
  const receiver = RECEIVERS[userId];
  const order: Order = {
    id: nextId('orders'),
    userId,
    status: 'PAID',
    items: items.map(([productName, unitPrice, quantity]) => ({ id: nextId('orderItems'), productName, unitPrice, quantity })),
    receiverName: receiver.name,
    receiverPhone: receiver.phone,
    address: receiver.address,
    createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  };
  db.orders.push(order);
  notify(userId, 'ORDER_PAID', order.id, `주문 #${order.id} 결제가 완료되었습니다.`);
  return order;
}

export function seed() {
  db.users.push(
    { id: 1, name: '김하늘', email: 'sky@example.com', phone: '010-1234-5678', role: 'CUSTOMER' },
    { id: 2, name: '박서준', email: 'seojun@example.com', phone: '010-9876-5432', role: 'CUSTOMER' },
    { id: 9, name: '운영자', email: 'admin@example.com', phone: '02-000-0000', role: 'ADMIN' },
  );

  const first = addOrder(1, 5, [['무선 키보드', 59000, 1], ['키캡 세트', 25000, 2]]);
  addOrder(2, 3, [['노트북 거치대', 32000, 1]]);
  addOrder(1, 1, [['USB-C 케이블', 9900, 3]]);

  for (const item of first.items) {
    db.shipments.push({ id: nextId('shipments'), orderItemId: item.id, carrier: '한빛택배', trackingNo: `HB${100000 + item.id}`, status: 'READY' });
  }
}
