import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const current = hits.get(key);

    if (!current || current.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return next();
    }

    if (current.count >= MAX_REQUESTS) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    current.count += 1;
    next();
  }
}
