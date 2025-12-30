import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import getIp from 'src/shared/helpers/get-ip';

@Injectable()
export class SetIpAddressInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    const ip = getIp(request);
    const method = request.method;

    if (method == 'POST' && request.body) {
      Object.assign(context.switchToHttp().getRequest().body, {
        created_at_ip: ip,
        updated_at_ip: ip,
      });
    } else if ((method == 'PATCH' || method == 'PUT') && request.body) {
      Object.assign(context.switchToHttp().getRequest().body, {
        updated_at_ip: ip,
      });
    } else if (method == 'DELETE' && request.body) {
      Object.assign(context.switchToHttp().getRequest().body, {
        deleted_at_ip: ip,
      });
    }

    return next.handle();
  }
}
