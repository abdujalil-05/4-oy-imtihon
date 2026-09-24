import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      code = HttpStatus[statusCode] ?? 'HTTP_ERROR';
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as {
          error?: string;
          message?: string | string[];
        };
        code = data.error ?? code;

        if (typeof data.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          message = data.message.join(', ');
        }
      }
    }

    const errorStack =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    this.logger.error(
      `${request.method} ${request.url} -> ${statusCode} ${message}`,
      errorStack,
    );

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
