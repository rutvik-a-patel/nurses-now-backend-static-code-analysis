import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CONSTANT } from '../constants/message';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class VerifyFirebaseTokeGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException(CONSTANT.ERROR.UNAUTHORIZED);
      }

      const token = authHeader.split(' ')[1];
      const decodedToken = await getAuth().verifyIdToken(token);
      if (!decodedToken) {
        throw new UnauthorizedException(CONSTANT.ERROR.UNAUTHORIZED);
      }

      req.social_user = decodedToken;
      return true;
    } catch (_error) {
      throw new UnauthorizedException(CONSTANT.ERROR.UNAUTHORIZED);
    }
  }
}
