import { useEffect, useState } from 'react';
import { api, type Notification } from '../api';
import { formatDate } from '../format';

const PAGE_SIZE = 20;

export function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    api
      .notifications(page)
      .then((r) => {
        setItems(r.items);
        setTotal(r.total);
        setUnread(r.unread);
      })
      .catch((err) => setError(err.message));
  }, [page]);

  const open = async (notification: Notification) => {
    if (notification.read) return;
    const updated = await api.markRead(notification.id);
    setItems((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const readAll = async () => {
    const r = await api.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    setNotice(`${r.changed}개를 읽음 처리됬습니다.`);
  };

  if (error) return <p role="alert">{error}</p>;

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section>
      <h1>
        알림 {unread > 0 && <span className="badge">{unread}</span>}
      </h1>
      <button onClick={readAll} disabled={unread === 0}>
        모두 읽음
      </button>
      {notice && <p role="status">{notice}</p>}
      <ul>
        {items.map((n) => (
          <li key={n.id} className={n.read ? 'read' : 'unread'} onClick={() => open(n)}>
            {n.message} <time>{formatDate(n.createdAt)}</time>
          </li>
        ))}
      </ul>
      <nav>
        <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
          이전
        </button>
        <span>
          {page} / {lastPage}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= lastPage}>
          다음
        </button>
      </nav>
    </section>
  );
}
