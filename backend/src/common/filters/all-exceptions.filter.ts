import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Ichki server xatoligi yuz berdi';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        error = (res as any).error || error;
      }
    } else if (exception && typeof exception === 'object' && (exception as any).code?.startsWith('P')) {
      // Prisma Database Error Code Handling
      const prismaCode = (exception as any).code;
      const target = (exception as any).meta?.target;
      this.logger.warn(`[DATABASE ERROR ${prismaCode}] ${request.method} ${request.url} target=${target}`);

      if (prismaCode === 'P2002') {
        status = HttpStatus.CONFLICT;
        const fieldStr = Array.isArray(target) ? target.join(', ') : (target || '');
        message = `Ushbu ma'lumot ${fieldStr ? '(' + fieldStr + ') ' : ''}tizimda allaqachon mavjud`;
        error = 'Conflict / Unique Constraint Violation';
      } else if (prismaCode === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = "So'ralgan yozuv yoki ma'lumot topilmadi";
        error = 'Not Found';
      } else if (prismaCode === 'P2003') {
        status = HttpStatus.BAD_REQUEST;
        message = "Bog'langan tashqi ma'lumot xatosi (Foreign key violation)";
        error = 'Bad Request';
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = "Ma'lumotlar bazasi so'rovi xatosi";
        error = 'Database Error';
      }
    } else if (exception instanceof Error) {
      this.logger.error(`[UNHANDLED ERROR] ${request.method} ${request.url} - ${exception.message}`, exception.stack);
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    });
  }
}
