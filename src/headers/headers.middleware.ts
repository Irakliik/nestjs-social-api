import { Injectable, NestMiddleware } from '@nestjs/common';

import type { Request, Response, NextFunction } from 'express';
@Injectable()
export class HeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.set({
      'Content-Type': 'application/json',
      'X-Powered-By': 'NestJS',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      Date: new Date().toUTCString(),
    });

    next();
  }
}
