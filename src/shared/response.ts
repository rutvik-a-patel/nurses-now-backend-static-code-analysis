import { HttpStatus } from '@nestjs/common';
import { CONSTANT } from './constants/message';
import logger from './helpers/logger';

interface Data {
  message: string;
  data: any;
}

interface List {
  message?: string;
  total: number;
  limit: number;
  offset: number;
  data: unknown[];
}

interface ListWithSummary {
  message?: string;
  total: number;
  limit: number;
  offset: number;
  data: { data: unknown[]; summary: any };
}

const successCreate = (data: Data) => {
  return {
    status: HttpStatus.CREATED,
    message: data.message ? data.message : CONSTANT.SUCCESS.DEFAULT,
    data: data.data,
  };
};

const successResponse = (data: Data) => {
  return {
    status: HttpStatus.OK,
    message: data.message ? data.message : CONSTANT.SUCCESS.DEFAULT,
    data: data.data,
  };
};

const successAccepted = (data: Data) => {
  return {
    status: HttpStatus.ACCEPTED,
    message: data.message ? data.message : CONSTANT.SUCCESS.DEFAULT,
    data: data.data,
  };
};

const successResponseWithPagination = (data: List) => {
  const message = data.data.length
    ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
    : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record');

  return {
    status: HttpStatus.OK,
    message: data.message ? data.message : message,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    data: data.data,
  };
};

const successResponseWithPaginationWithSummary = (data: ListWithSummary) => {
  const message = data.data.data.length
    ? CONSTANT.SUCCESS.RECORD_FOUND('Record')
    : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record');

  return {
    status: HttpStatus.OK,
    message: data.message ? data.message : message,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    data: data.data,
  };
};

const failureResponse = (error: any) => {
  let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  if (
    error.name &&
    [
      'Error',
      'TypeError',
      'TypeORMError',
      'QueryFailedError',
      'EntityPropertyNotFoundError',
    ].includes(error.name)
  ) {
    logger.error(
      `${new Date().toLocaleString('es-CL')} ${error.message} \n${JSON.stringify(error.stack)}`,
    );
    if (error.code && ['23505'].includes(error.code)) {
      httpStatus = HttpStatus.BAD_REQUEST;
      error.message = CONSTANT.ERROR.ALREADY_EXISTS('Record');
    } else {
      error.message = CONSTANT.ERROR.SOMETHING_WENT_WRONG;
    }
  }

  return {
    status: httpStatus,
    message: error.message
      ? error.message
      : CONSTANT.ERROR.INTERNAL_SERVER_ERROR,
    data: error.data,
  };
};

const badRequest = (data: Data) => {
  return {
    status: HttpStatus.BAD_REQUEST,
    message: data.message ? data.message : CONSTANT.ERROR.BAD_SYNTAX,
    data: data.data,
  };
};

const validationError = (data: Data) => {
  return {
    status: HttpStatus.BAD_REQUEST,
    message: data.message ? data.message : CONSTANT.ERROR.BAD_SYNTAX,
    data: data.data,
  };
};

const unAuthenticatedRequest = () => {
  return {
    status: HttpStatus.UNAUTHORIZED,
    message: CONSTANT.ERROR.UNAUTHENTICATED,
  };
};

const unAuthorizedRequest = () => {
  return {
    status: HttpStatus.UNAUTHORIZED,
    message: CONSTANT.ERROR.UNAUTHORIZED,
  };
};

const tooManyRequest = () => {
  return {
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: CONSTANT.ERROR.TOO_MANY_REQUESTS,
  };
};

const payloadTooLarge = (message: string) => {
  return {
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    message: message,
  };
};

const recordNotFound = (data: Data) => {
  return {
    status: HttpStatus.NOT_FOUND,
    message: data.message
      ? data.message
      : CONSTANT.SUCCESS.RECORD_NOT_FOUND('Record'),
    data: data.data,
  };
};

const forbiddenRequest = () => {
  return {
    status: HttpStatus.FORBIDDEN,
    message: CONSTANT.ERROR.FORBIDDEN,
  };
};

const invalidFileFormatException = () => {
  return {
    status: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    message: 'Invalid file format',
  };
};

const response = {
  successCreate,
  successResponse,
  successAccepted,
  successResponseWithPagination,
  successResponseWithPaginationWithSummary,
  failureResponse,
  badRequest,
  validationError,
  unAuthenticatedRequest,
  unAuthorizedRequest,
  tooManyRequest,
  payloadTooLarge,
  recordNotFound,
  forbiddenRequest,
  invalidFileFormatException,
};
export default response;
