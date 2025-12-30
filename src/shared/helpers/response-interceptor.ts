import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CONSTANT } from '../constants/message';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        const successStatus: number[] = [
          HttpStatus.OK,
          HttpStatus.CREATED,
          HttpStatus.ACCEPTED,
        ];
        // Customize the response format as needed
        const responseData = {
          statusCode: successStatus.includes(data.status) ? 1 : 0,
          message: data.message || CONSTANT.SUCCESS.DEFAULT,
        };

        if (data?.limit !== undefined) {
          Object.assign(responseData, {
            total: data.total,
            limit: data.limit,
            offset: data.offset,
          });
        }

        Object.assign(responseData, {
          data: data.data,
        });
        response.status(data.status || HttpStatus.OK);
        return responseData; // Return the modified data
      }),
    );
  }
}
