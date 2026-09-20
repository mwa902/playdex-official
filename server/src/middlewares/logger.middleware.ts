import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms     = Date.now() - start;
      const status = res.statusCode;
      const color  = status >= 500 ? '31' : status >= 400 ? '33' : status >= 300 ? '36' : '32';
      this.logger.log(
        `\x1b[${color}m${status}\x1b[0m ${method} ${originalUrl} — ${ms}ms [${ip}]`,
      );
    });

    next();
  }
}
