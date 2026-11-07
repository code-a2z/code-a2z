import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      status: 'error',
      message:
        exception instanceof HttpException
          ? getHttpExceptionMessage(exception)
          : 'Internal Server Error',
    });
  }
}

function getHttpExceptionMessage(exception: HttpException): string {
  const body = exception.getResponse();
  if (typeof body === 'string') {
    return body;
  }

  const message = (body as { message?: unknown }).message;
  if (Array.isArray(message)) {
    return String(message[0] ?? exception.message);
  }
  return typeof message === 'string' ? message : exception.message;
}
