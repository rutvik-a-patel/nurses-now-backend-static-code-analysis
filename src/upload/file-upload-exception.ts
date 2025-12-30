import { CONSTANT } from '@/shared/constants/message';
import response from '@/shared/response';
import {
  Catch,
  ExceptionFilter,
  PayloadTooLargeException,
  BadRequestException,
} from '@nestjs/common';

@Catch(PayloadTooLargeException, BadRequestException)
export class FileUploadException implements ExceptionFilter {
  catch(exception: PayloadTooLargeException | BadRequestException) {
    if (exception.name === 'PayloadTooLargeException') {
      return response.payloadTooLarge(CONSTANT.ERROR.FILE_TOO_LARGE('10 MB'));
    } else if (exception.message === 'InvalidType') {
      return response.badRequest({
        message: CONSTANT.ERROR.ALLOWED_FILE_TYPE,
        data: {},
      });
    } else {
      return response.failureResponse(exception);
    }
  }
}
