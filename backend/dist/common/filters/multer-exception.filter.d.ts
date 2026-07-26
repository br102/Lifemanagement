import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class MulterExceptionFilter implements ExceptionFilter {
    catch(exception: {
        code?: string;
        message?: string;
    }, host: ArgumentsHost): void;
}
