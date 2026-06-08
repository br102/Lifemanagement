import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    const message = exception instanceof HttpException
      ? exception.getResponse()
      : (exception instanceof Error ? exception.message : 'Internal server error');

    if (exception instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', exception.message, exception.stack);
    } else {
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', exception);
    }

    response.status(status).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
