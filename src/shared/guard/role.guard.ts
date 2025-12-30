import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CONSTANT } from '../constants/message';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // No roles specified, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming you have user data in the request

    if (!user) {
      throw new HttpException(CONSTANT.ERROR.FORBIDDEN, 0);
      // No user, deny access
    }

    if (!roles.includes(user.role)) {
      throw new HttpException(CONSTANT.ERROR.FORBIDDEN, 0); // User role not allowed
    }

    return true;
  }
}
