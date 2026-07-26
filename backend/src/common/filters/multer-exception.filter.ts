import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { MulterError } from 'multer';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: { code?: string; message?: string }, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const message = exception.code === 'LIMIT_FILE_SIZE' ? 'File too large' : (exception.message || 'Invalid upload');

    response.status(400).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    });
  }
}
