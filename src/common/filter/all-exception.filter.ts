import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common'; // Filter
import type { Request, Response } from 'express'; // Tiplar

// Barcha xatolar bir xil formatda (TZ 12.1)
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name); // Log

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(); // HTTP kontekst
    const response = ctx.getResponse<Response>(); // Javob
    const request = ctx.getRequest<Request>(); // So'rov

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR; // Standart 500
    let code = 'INTERNAL_SERVER_ERROR'; // Qisqa nom
    let message = 'Internal server error'; // Xabar

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus(); // HTTP kod
      code = HttpStatus[statusCode] ?? 'HTTP_ERROR'; // Nom
      const exceptionResponse = exception.getResponse(); // Ichki javob

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse; // Oddiy satr
      }
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const data = exceptionResponse as {
          error?: string;
          message?: string | string[];
        };
        code = data.error ?? code; // Nom
        if (typeof data.message === 'string') {
          message = data.message; // Bitta xabar
        } else if (Array.isArray(data.message)) {
          message = data.message.join(', '); // Validatsiya xabarlari ro'yxati
        }
      }
    }

    // Logga yozamiz — 500 bo'lsa stack bilan (token/parol logga tushmaydi)
    this.logger.error(
      `${request.method} ${request.url} -> ${statusCode} ${message}`,
      statusCode === 500 && exception instanceof Error
        ? exception.stack
        : undefined,
    );

    // Bir xil formatdagi javob
    response.status(statusCode).json({
      statusCode, // HTTP kod
      code, // Qisqa nom
      message, // Xabar
      path: request.url, // Yo'l
      timestamp: new Date().toISOString(), // Vaqt
    });
  }
}
