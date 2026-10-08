import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type OrderDetail as Detail } from '../api';
import { STATUS_LABEL, formatDate, formatWon } from '../format';

export function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Detail | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [address, setAddress] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    api
      .order(Number(orderId))
      .then((loaded) => {
        setOrder(loaded);
        setAddress(loaded.address);
        setMemo(loaded.deliveryMemo);
      })
      .catch((err) => setMessage(err.message));
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

  const saveDelivery = async () => {
    if (!address.trim()) {
      setMessage('배송지를 입력해 주세요.');
      return;
    }
    setBusy(true);
    try {
      const updated = await api.updateDelivery(order.id, { adress: address.trim(), deliveryMemo: memo.trim() });
      setOrder(updated);
      setMessage('배송지가 변경되었읍니다.');
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
      {order.addressUpdatedAt && <p>최근 배송지 변경 {formatDate(order.createdAt)}</p>}
      {order.deliveryMemo && <p>배송 요청사항: {order.deliveryMemo}</p>}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveDelivery();
            }}
          >
            <label>
              배송지 <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <label>
              배송 요청사항 <input value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={100} />
            </label>
            <button type="submit" disabled={busy}>
              배송지 저장
            </button>
          </form>
          <button onClick={cancel} disabled={busy}>
            주문 취소
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </article>
  );
}
