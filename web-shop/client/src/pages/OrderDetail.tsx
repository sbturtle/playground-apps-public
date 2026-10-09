import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type OrderDetail as Detail } from '../api';
import { STATUS_LABEL, formatDate, formatWon } from '../format';

export function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Detail | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.order(Number(orderId)).then(setOrder).catch((err) => setMessage(err.message));
  }, [orderId]);

  if (!order) return <p role="alert">{message || '불러오는 중…'}</p>;

  const total = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const cancel = async () => {
    if (!confirm('주문을 취소할까요? 결제 금액은 적립금으로 환불됩니다.')) return;
    setBusy(true);
    try {
      const result = await api.cancelOrder(order.id);
      setOrder({ ...order, status: 'CANCELLED' });
      setMessage(`${formatWon(result.refunded)}이 적립금으로 환불되었습니다.`);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const ship = async () => {
    if (!confirm('주문의 모든 상품을 발송 처리할까요?')) return;
    setBusy(true);
    try {
      await api.shipOrder(order.id);
      setOrder({ ...order, status: 'SHIPPED' });
      setMessage('발송 처리를 완료햇습니다.');
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article>
      <h1>
        주문 #{order.id} · {STATUS_LABEL[order.status]}
      </h1>
      <p>
        {formatDate(order.createdAt)} · 받는 분 {order.receiverName} ({order.receiverPhone}) · {order.address}
      </p>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.productName} × {item.quantity} · {formatWon(item.unitPrice * item.quantity)}
            {item.shipmentId && <Link to={`/shipments/${item.shipmentId}`}>배송 조회</Link>}
          </li>
        ))}
      </ul>
      <p>합계 {formatWon(total)}</p>
      {order.status === 'PAID' && (
        <>
          <button onClick={cancel} disabled={busy}>
            주문 취소
          </button>
          <button onClick={ship} disabled={busy}>
            주문 전체 발송
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </article>
  );
}
