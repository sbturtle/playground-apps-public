import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Notification } from '../api';
import { formatDate } from '../format';

export function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.notifications().then(setItems).catch((err) => setError(err.message));
  }, []);

	// 알림을 누르면 읽음 처리한 뒤 관련 주문 상세로 이동함니다.
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
