// Xatolarni ushlash uchun kerakli Nest vositalari
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
// Express so'rov va javob turlari
import type { Request, Response } from 'express';

// Barcha xatolarni ushlaydigan filtr
@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  // Xatolarni konsolga yozuvchi logger
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Http konteksti
    const ctx = host.switchToHttp();
    // Javob obyekti
    const response = ctx.getResponse<Response>();
    // So'rov obyekti
    const request = ctx.getRequest<Request>();
    // Boshlang'ich status server xatosi
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    // Boshlang'ich xato kodi
    let code = 'INTERNAL_SERVER_ERROR';
    // Boshlang'ich xato matni
    let message = 'Internal server error';

    // Agar xato Nest xatosi bo'lsa aniq ma'lumotlarni olamiz
    if (exception instanceof HttpException) {
      // Xatoning statusini olamiz
      statusCode = exception.getStatus();
      // Status nomini kod sifatida olamiz
      code = HttpStatus[statusCode] ?? 'HTTP_ERROR';
      // Xatoning ichidagi javobni olamiz
      const exceptionResponse = exception.getResponse();

      // Javob oddiy matn bo'lsa uni xabar qilamiz
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }

      // Javob obyekt bo'lsa ichidagi xabarni ajratib olamiz
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Javobning kerakli maydonlarini belgilaymiz
        const data = exceptionResponse as {
          error?: string;
          message?: string | string[];
        };
        // Xato kodini yangilaymiz
        code = data.error ?? code;

        // Xabar matn bo'lsa to'g'ridan to'g'ri olamiz
        if (typeof data.message === 'string') {
          message = data.message;
        } else if (Array.isArray(data.message)) {
          // Xabar ro'yxat bo'lsa vergul bilan birlashtiramiz
          message = data.message.join(', ');
        }
      }
    }

    // Xatoning to'liq izini olamiz
    const errorStack =
      exception instanceof Error ? exception.stack : JSON.stringify(exception);

    // Xatoni konsolga yozamiz
    this.logger.error(
      `${request.method} ${request.url} -> ${statusCode} ${message}`,
      errorStack,
    );

    // Mijozga bir xil ko'rinishdagi xato javobini qaytaramiz
    response.status(statusCode).json({
      statusCode,
      code,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
