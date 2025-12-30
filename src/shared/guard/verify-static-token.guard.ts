import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CONSTANT } from '../constants/message';

@Injectable()
export class VerifyStaticTokeGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException(CONSTANT.ERROR.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const isValid = token === process.env.STATIC_TOKEN;

    if (!isValid) {
      throw new UnauthorizedException(CONSTANT.ERROR.UNAUTHORIZED);
    }

    return true;
  }
}
