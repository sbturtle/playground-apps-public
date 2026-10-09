import express, { type NextFunction, type Request, type Response } from 'express';
import { ConflictError, NotFoundError } from './errors.js';
import { notificationsRouter } from './routes/notifications.js';
import { ordersRouter } from './routes/orders.js';
import { sessionRouter } from './routes/session.js';
import { shipmentsRouter } from './routes/shipments.js';
import { seed } from './seed.js';

const app = express();
app.use(express.json());
// 로그인은 인증 미들웨어보다 먼저 처리합니다.
app.use('/api', sessionRouter);
app.use('/api', ordersRouter);
app.use('/api', shipmentsRouter);
app.use('/api', notificationsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof NotFoundError) return res.status(404).json({ message: '대상을 찾을 수 없습니다.' });
  if (err instanceof ConflictError) return res.status(409).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: '일시적인 오류가 발생했습니다.' });
});

seed();
app.listen(4000, () => console.log('web-shop api listening on :4000'));
