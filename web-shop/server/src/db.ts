export type Role = 'CUSTOMER' | 'ADMIN';
export type OrderStatus = 'PAID' | 'SHIPPED' | 'CANCELLED';
export type ShipmentStatus = 'READY' | 'IN_TRANSIT' | 'DELIVERED';
export type NotificationType = 'ORDER_PAID' | 'ORDER_SHIPPED' | 'REFUND_DONE';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface OrderItem {
  id: number;
  productName: string;
  unitPrice: number; // 원
  quantity: number;
  /** 부분 취소된 품목 */
  cancelled?: boolean;
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  items: OrderItem[];
  receiverName: string;
  receiverPhone: string;
  address: string;
  createdAt: string;
}

export interface Shipment {
  id: number;
  orderItemId: number;
  carrier: string;
  trackingNo: string;
  status: ShipmentStatus;
}

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  targetId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Refund {
  id: number;
  orderId: number;
  amount: number;
  createdAt: string;
}

export const db = {
  users: [] as User[],
  orders: [] as Order[],
  shipments: [] as Shipment[],
  notifications: [] as Notification[],
  refunds: [] as Refund[],
  /** userId → 적립금 잔액(원) */
  points: new Map<number, number>(),
};

const sequences = new Map<string, number>();

/** 테이블마다 1부터 증가하는 ID를 발급합니다. */
export function nextId(table: string): number {
  const next = (sequences.get(table) ?? 0) + 1;
  sequences.set(table, next);
  return next;
}
