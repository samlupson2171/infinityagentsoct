/**
 * Logging utility for Super Package operations
 * Provides structured logging with different severity levels
 */

import { SuperPackageError, isSuperPackageError } from '../errors/super-package-errors';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  operation: string;
  message: string;
  userId?: string;
  packageId?: string;
  details?: any;
  error?: any;
}

/**
 * Logger class for Super Package operations
 */
class SuperPackageLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log a debug message
   */
  debug(operation: string, message: string, details?: any) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, operation, message, details);
    }
  }

  /**
   * Log an info message
   */
  info(operation: string, message: string, details?: any) {
    this.log(LogLevel.INFO, operation, message, details);
  }

  /**
   * Log a warning message
   */
  warn(operation: string, message: string, details?: any) {
    this.log(LogLevel.WARN, operation, message, details);
  }

  /**
   * Log an error
   */
  error(operation: string, error: Error | SuperPackageError, details?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      operation,
      message: error.message,
      details,
      error: this.serializeError(error),
    };

    console.error('[SuperPackage Error]', JSON.stringify(logEntry, null, 2));

    // In production, you might want to send this to an external logging service
    if (!this.isDevelopment) {
      this.sendToExternalLogger(logEntry);
    }
  }

  /**
   * Log a successful operation
   */
  success(operation: string, message: string, details?: any) {
    this.info(operation, `✓ ${message}`, details);
  }

  /**
   * Private method to log messages
   */
  private log(level: LogLevel, operation: string, message: string, details?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      details,
    };

    const prefix = `[SuperPackage ${level}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, details || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, details || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, details || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, details || '');
        break;
    }
  }

  /**
   * Serialize error for logging
   */
  private serializeError(error: Error | SuperPackageError): any {
    if (isSuperPackageError(error)) {
      return {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return {
      name: error.name,
      message: error.message,
      stack: this.isDevelopment ? error.stack : undefined,
    };
  }

  /**
   * Send log entry to external logging service
   * This is a placeholder for integration with services like Sentry, LogRocket, etc.
   */
  private sendToExternalLogger(logEntry: LogEntry) {
    // TODO: Integrate with external logging service
    // Example: Sentry.captureException(logEntry.error);
  }

  /**
   * Create a scoped logger with context
   */
  withContext(context: { userId?: string; packageId?: string }) {
    return {
      debug: (operation: string, message: string, details?: any) =>
        this.debug(operation, message, { ...context, ...details }),
      info: (operation: string, message: string, details?: any) =>
        this.info(operation, message, { ...context, ...details }),
      warn: (operation: string, message: string, details?: any) =>
        this.warn(operation, message, { ...context, ...details }),
      error: (operation: string, error: Error | SuperPackageError, details?: any) =>
        this.error(operation, error, { ...context, ...details }),
      success: (operation: string, message: string, details?: any) =>
        this.success(operation, message, { ...context, ...details }),
    };
  }
}

// Export singleton instance
export const logger = new SuperPackageLogger();

/**
 * Utility function to log API request start
 */
export function logApiRequest(method: string, path: string, userId?: string) {
  logger.info('API_REQUEST', `${method} ${path}`, { userId });
}

/**
 * Utility function to log API response
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  duration: number
) {
  logger.info('API_RESPONSE', `${method} ${path} - ${statusCode}`, { duration });
}

/**
 * Utility function to log API error
 */
export function logApiError(
  method: string,
  path: string,
  error: Error | SuperPackageError,
  userId?: string
) {
  logger.error('API_ERROR', error, { method, path, userId });
}
