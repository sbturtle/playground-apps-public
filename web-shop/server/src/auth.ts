import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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

// 서명 키. TOKEN_SECRET 환경 변수가 없으면 실행할 때마다 새로 만듭니다.
const SECRET = process.env.TOKEN_SECRET ?? randomBytes(32).toString('hex');
// 서명 없는 데모 토큰(user-<id>) 허용 여부. 다음 버전에서 없앱니다.
const ALLOW_LEGACY_TOKEN = process.env.ALLOW_LEGACY_TOKEN === '1';

function sign(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('base64url');
}

/** 사용자 토큰을 발급합니다: user-<id>.<서명> */
export function issueToken(user: User): string {
  const body = `user-${user.id}`;
  return `${body}.${sign(body)}`;
}

/** 토큰을 확인해 사용자 ID를 돌려줍니다. 형식이나 서명이 맞지 않으면 null */
function verifyToken(token: string): number | null {
  const [body, signature] = token.split('.');
  if (!body.startsWith('user-')) return null;
  if (signature === undefined) return ALLOW_LEGACY_TOKEN ? Number(body.slice(5)) : null;
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return Number(body.slice(5));
}

/** 로그인 세션: Authorization: Bearer user-<id>.<서명> */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const id = token ? verifyToken(token) : null;
  const user = db.users.find((u) => u.id === id);
  if (!user) return res.status(401).json({ message: '로그인이 필요합니다.' });
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: '관리자만 사용할 수 있습니다.' });
  next();
}
