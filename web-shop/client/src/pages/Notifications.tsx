import { useEffect, useState } from 'react';
import { api, type Notification } from '../api';
import { formatDate } from '../format';

export function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.notifications().then(setItems).catch((err) => setError(err.message));
  }, []);

  const open = async (notification: Notification) => {
    if (notification.read) return;
    const updated = await api.markRead(notification.id);
    setItems((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
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
