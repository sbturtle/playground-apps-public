import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type OrderSummary } from '../api';
import { STATUS_LABEL, formatDate } from '../format';

const FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'PAID', label: '결제 완료' },
  { value: 'SHIPPED', label: '발송' },
  { value: 'CANCELED', label: '취소' },
];

export function OrderList() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');  

  useEffect(() => {
    api.orders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  const visible = filter === 'ALL' ? orders : orders.filter((order) => order.status === filter);  

  return (
    <>
      <div className="toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="주문 상태 필터">
          {FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <span>총 {orders.length}건</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>주문 번호</th>
            <th>상태</th>
            <th>상품 수</th>
            <th>주문일</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((order) => (
            <tr key={order.id}>
              <td>
                <Link to={`/orders/${order.id}`}>#{order.id}</Link>
              </td>
              <td>{STATUS_LABEL[order.status]}</td>
              <td>{order.itemCount}개</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {visible.length === 0 && <p>조건에 맞는 주문이 업습니다.</p>}
    </>
  );
}
