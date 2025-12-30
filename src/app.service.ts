import { HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return { status: HttpStatus.OK, message: 'Server is live!' };
  }
}
