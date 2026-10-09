import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * async 라우트 핸들러를 감쌉니다.
 * Express 4는 핸들러가 돌려준 Promise가 거부돼도 오류 처리기로 넘기지 않으므로, 거부되면 next(err)로 넘깁니다.
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
