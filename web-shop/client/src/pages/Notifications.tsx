import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Notification } from '../api';
import { formatDate } from '../format';

export function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.notifications().then(setItems).catch((err) => setError(err.message));
  }, []);

  // 알림을 누르면 읽음 처리 후 관련 주문 화면으로 이동합니다.
  const open = async (notification: Notification) => {
    if (!notification.read) {
      const updated = await api.markRead(notification.id);
      setItems((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    }
    navigate(`/orders/${notification.targetId}`);
  };

  if (error) return <p role="alert">{error}</p>;

  return (
    <ul>
      {items.map((n) => (
        <li key={n.id} className={n.read ? 'read' : 'unread'} onClick={() => open(n)}>
          {n.message} <time>{formatDate(n.createdAt)}</time>
        </li>
      ))}
    </ul>
  );
}
