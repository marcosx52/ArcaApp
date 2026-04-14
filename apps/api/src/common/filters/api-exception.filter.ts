import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const error = exception.getResponse();

      this.logger.error(`HTTP Exception: ${status}`, JSON.stringify(error));

      return response.status(status).json({
        success: false,
        data: null,
        errors: error,
        message: typeof error === 'string'
          ? error
          : (typeof error === 'object' && error && 'message' in error
              ? String((error as any).message)
              : 'Request failed'),
      });
    }

    const message = exception instanceof Error ? exception.message : 'Unexpected error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(message, stack);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      data: null,
      errors: null,
      message,
    });
  }
}
