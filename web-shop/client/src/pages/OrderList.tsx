import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type OrderSummary } from '../api';
import { STATUS_LABEL, formatDate, formatWon } from '../format';

export function OrderList() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.orders().then(setOrders).catch((err) => setError(err.message));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>주문 번호</th>
          <th>상태</th>
          <th>상품 수</th>
          <th>결제 금액</th>
          <th>주문일</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>
              <Link to={`/orders/${order.id}`}>#{order.id}</Link>
            </td>
            <td>{STATUS_LABEL[order.status]}</td>
            <td>{order.itemCount}개</td>
            <td>{formatWon(order.totalAmount)}</td>
            <td>{formatDate(order.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
