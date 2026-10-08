import type { NextFunction, Request, Response } from 'express';
import { db, type User } from './db.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/** 데모용 세션: Authorization: Bearer user-<id> */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const id = token?.startsWith('user-') ? Number(token.slice(5)) : NaN;
  const user = db.users.find((u) => u.id === id);
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: '관리자만 사용할 수 있습니다.' });
  next();
}
