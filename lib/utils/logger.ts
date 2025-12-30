export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogContext {
  location?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  cause?: any;
}

class AppLogger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = this.getMinLogLevel();
  }

  private getMinLogLevel(): LogLevel {
    if (process.env.NODE_ENV === 'production') {
      return LogLevel.INFO;
    }
    if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
      return LogLevel.DEBUG;
    }
    return LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatError(error: unknown): SerializedError | any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        cause: error.cause,
      };
    }
    return error;
  }

  private formatContext(context?: LogContext): string {
    if (!context) return '';
    const parts: string[] = [];
    if (context.location) parts.push(context.location);
    if (context.requestId) parts.push(`req:${context.requestId}`);
    if (context.userId) parts.push(`user:${context.userId}`);
    return parts.length > 0 ? `[${parts.join('|')}]` : '';
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const ctx = this.formatContext(context);
    return `${timestamp} [${level}] ${ctx} ${message}`;
  }

  private sanitizeData(data?: any): any {
    if (!data) return undefined;

    const sanitized = { ...data };

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '[REDACTED]';
      }
    }

    if (sanitized.error) {
      sanitized.error = this.formatError(sanitized.error);
    }

    return sanitized;
  }

  debug(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const formatted = this.formatMessage('DEBUG', message, context);
    console.debug(formatted, this.sanitizeData(data));
  }

  info(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const formatted = this.formatMessage('INFO', message, context);
    console.info(formatted, this.sanitizeData(data));
  }

  warn(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const formatted = this.formatMessage('WARN', message, context);
    console.warn(formatted, this.sanitizeData(data));
  }

  error(message: string, data?: any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const formatted = this.formatMessage('ERROR', message, context);
    const sanitized = this.sanitizeData(data);
    console.error(formatted, sanitized);
  }
}

export const Logger = new AppLogger();