/**
 * Standardized error codes for file operations
 */
export enum FileErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // File Upload Errors
  NO_FILE = 'NO_FILE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FILE_VERIFICATION_FAILED = 'FILE_VERIFICATION_FAILED',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  INVALID_FILE_PATH = 'INVALID_FILE_PATH',
  
  // File Download Errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_NOT_FOUND_IN_DATABASE = 'FILE_NOT_FOUND_IN_DATABASE',
  FILE_NOT_FOUND_ON_FILESYSTEM = 'FILE_NOT_FOUND_ON_FILESYSTEM',
  FILE_READ_FAILED = 'FILE_READ_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // File Association Errors
  FILE_ASSOCIATION_FAILED = 'FILE_ASSOCIATION_FAILED',
  MATERIAL_NOT_FOUND = 'MATERIAL_NOT_FOUND',
  
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTENT_SANITIZATION_ERROR = 'CONTENT_SANITIZATION_ERROR',
  
  // System Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

/**
 * Standardized error response structure
 */
export interface FileErrorResponse {
  success: false;
  error: {
    code: FileErrorCode;
    message: string;
    details?: string | Record<string, any>;
    fileId?: string;
    filePath?: string;
    materialId?: string;
    timestamp?: string;
  };
}

/**
 * Standardized success response structure
 */
export interface FileSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Create a standardized error response
 */
export function createFileErrorResponse(
  code: FileErrorCode,
  message: string,
  options: {
    details?: string | Record<string, any>;
    fileId?: string;
    filePath?: string;
    materialId?: string;
  } = {}
): FileErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      ...options,
    },
  };
}

/**
 * Create a standardized success response
 */
export function createFileSuccessResponse<T>(
  data: T,
  message?: string
): FileSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * File operation logger with consistent formatting
 */
export class FileOperationLogger {
  private static formatMessage(
    operation: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS',
    message: string,
    context?: Record<string, any>
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [File ${operation}] [${level}] ${message}${contextStr}`;
  }

  static logUploadStart(fileName: string, fileSize: number, userId: string): void {
    console.log(
      this.formatMessage('Upload', 'INFO', 'Upload started', {
        fileName,
        fileSize,
        userId,
      })
    );
  }

  static logUploadSuccess(
    fileId: string,
    fileName: string,
    duration: number
  ): void {
    console.log(
      this.formatMessage('Upload', 'SUCCESS', 'Upload completed', {
        fileId,
        fileName,
        durationMs: duration,
      })
    );
  }

  static logUploadError(
    fileName: string,
    error: string,
    details?: Record<string, any>
  ): void {
    console.error(
      this.formatMessage('Upload', 'ERROR', `Upload failed: ${error}`, {
        fileName,
        ...details,
      })
    );
  }

  static logDownloadStart(fileId: string, userId: string, userRole: string): void {
    console.log(
      this.formatMessage('Download', 'INFO', 'Download started', {
        fileId,
        userId,
        userRole,
      })
    );
  }

  static logDownloadSuccess(
    fileId: string,
    fileName: string,
    duration: number,
    fileSize: number
  ): void {
    console.log(
      this.formatMessage('Download', 'SUCCESS', 'Download completed', {
        fileId,
        fileName,
        durationMs: duration,
        fileSize,
      })
    );
  }

  static logDownloadError(
    fileId: string,
    error: string,
    details?: Record<string, any>
  ): void {
    console.error(
      this.formatMessage('Download', 'ERROR', `Download failed: ${error}`, {
        fileId,
        ...details,
      })
    );
  }

  static logDeletionStart(fileId: string, userId: string): void {
    console.log(
      this.formatMessage('Deletion', 'INFO', 'Deletion started', {
        fileId,
        userId,
      })
    );
  }

  static logDeletionSuccess(fileId: string, fileName: string): void {
    console.log(
      this.formatMessage('Deletion', 'SUCCESS', 'Deletion completed', {
        fileId,
        fileName,
      })
    );
  }

  static logDeletionError(
    fileId: string,
    error: string,
    details?: Record<string, any>
  ): void {
    console.error(
      this.formatMessage('Deletion', 'ERROR', `Deletion failed: ${error}`, {
        fileId,
        ...details,
      })
    );
  }

  static logAssociationStart(fileId: string, materialId: string): void {
    console.log(
      this.formatMessage('Association', 'INFO', 'Association started', {
        fileId,
        materialId,
      })
    );
  }

  static logAssociationSuccess(fileId: string, materialId: string): void {
    console.log(
      this.formatMessage('Association', 'SUCCESS', 'Association completed', {
        fileId,
        materialId,
      })
    );
  }

  static logAssociationError(
    fileId: string,
    materialId: string,
    error: string
  ): void {
    console.error(
      this.formatMessage(
        'Association',
        'ERROR',
        `Association failed: ${error}`,
        {
          fileId,
          materialId,
        }
      )
    );
  }

  static logVerificationStart(filePath: string): void {
    console.log(
      this.formatMessage('Verification', 'INFO', 'Verification started', {
        filePath,
      })
    );
  }

  static logVerificationSuccess(filePath: string): void {
    console.log(
      this.formatMessage('Verification', 'SUCCESS', 'Verification passed', {
        filePath,
      })
    );
  }

  static logVerificationError(filePath: string, error: string): void {
    console.error(
      this.formatMessage(
        'Verification',
        'ERROR',
        `Verification failed: ${error}`,
        {
          filePath,
        }
      )
    );
  }

  static logMaterialCreationStart(materialType: string, userId: string): void {
    console.log(
      this.formatMessage('Material', 'INFO', 'Material creation started', {
        materialType,
        userId,
      })
    );
  }

  static logMaterialCreationSuccess(
    materialId: string,
    materialType: string,
    fileCount: number
  ): void {
    console.log(
      this.formatMessage('Material', 'SUCCESS', 'Material created', {
        materialId,
        materialType,
        fileCount,
      })
    );
  }

  static logMaterialCreationError(
    materialType: string,
    error: string,
    details?: Record<string, any>
  ): void {
    console.error(
      this.formatMessage(
        'Material',
        'ERROR',
        `Material creation failed: ${error}`,
        {
          materialType,
          ...details,
        }
      )
    );
  }

  static logRollback(operation: string, reason: string, context?: Record<string, any>): void {
    console.warn(
      this.formatMessage(
        'Rollback',
        'WARN',
        `Rollback initiated: ${reason}`,
        {
          operation,
          ...context,
        }
      )
    );
  }

  static logCleanupStart(olderThanDays: number): void {
    console.log(
      this.formatMessage('Cleanup', 'INFO', 'Cleanup started', {
        olderThanDays,
      })
    );
  }

  static logCleanupSuccess(deletedCount: number, duration: number): void {
    console.log(
      this.formatMessage('Cleanup', 'SUCCESS', 'Cleanup completed', {
        deletedCount,
        durationMs: duration,
      })
    );
  }

  static logCleanupError(error: string, details?: Record<string, any>): void {
    console.error(
      this.formatMessage('Cleanup', 'ERROR', `Cleanup failed: ${error}`, details)
    );
  }
}
