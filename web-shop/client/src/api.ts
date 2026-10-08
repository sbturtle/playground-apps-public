const BASE = '/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...init.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.message ?? '요청에 실패했습니다.');
  return body as T;
}

/**
 * 일시적인 네트워크 오류에 대비해 재시도합니다.
 * timeoutMs 안에 응답이 없거나 5xx면 retries번까지 다시 보냅니다.
 */
async function requestWithRetry<T>(path: string, init: RequestInit = {}, { retries = 2, timeoutMs = 3000 } = {}): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await request<T>(path, { ...init, signal: controller.signal });
    } catch (err) {
      const retriable = !(err instanceof ApiError) || err.status >= 500;
      if (!retriable || attempt >= retries) throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

export interface OrderSummary {
  id: number;
  status: string;
  itemCount: number;
  totalAmount: number; // 원
  createdAt: string;
}

export interface OrderItem {
  id: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  shipmentId: number | null;
}

export interface OrderDetail {
  id: number;
  status: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  createdAt: string;
  items: OrderItem[];
}

export interface Shipment {
  id: number;
  orderItemId: number;
  carrier: string;
  trackingNo: string;
  status: string;
}

export interface Notification {
  id: number;
  type: 'ORDER_PAID' | 'ORDER_SHIPPED' | 'REFUND_DONE';
  targetId: number;
  message: string;
  read: boolean;
  createdAt: string;
}

export const api = {
  orders: () => requestWithRetry<OrderSummary[]>('/orders'),
  order: (id: number) => requestWithRetry<OrderDetail>(`/orders/${id}`),
  cancelOrder: (id: number) => request<{ orderId: number; refunded: number }>(`/orders/${id}/cancel`, { method: 'POST' }),
  shipment: (id: number) => requestWithRetry<Shipment>(`/shipments/${id}`),
  notifications: () => requestWithRetry<Notification[]>('/notifications'),
  markRead: (id: number) => request<Notification>(`/notifications/${id}/read`, { method: 'POST' }),
};
