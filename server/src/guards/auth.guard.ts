import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC = 'isPublic';

/** Attach @Public() to a route/controller to skip this guard */
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata(IS_PUBLIC, true);

/**
 * Simple header-based guard.
 * Checks for x-api-key: <AUTH_TOKEN env var>.
 * Mark routes @Public() to bypass.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const authToken = process.env.AUTH_TOKEN;
    if (!authToken) return true; // Guard disabled when no token configured

    const req    = ctx.switchToHttp().getRequest();
    const header = req.headers['x-api-key'] as string | undefined;

    if (header !== authToken) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
