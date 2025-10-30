import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { FileStorage } from '@/models';
import type { IFileStorage } from '@/models';
import mongoose from 'mongoose';
import { FileOperationLogger } from '@/lib/errors/file-operation-errors';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  uploadPath?: string;
}

export interface FileUploadResult {
  success: boolean;
  file?: {
    id: string;
    originalName: string;
    fileName: string;
    filePath: string;
    fullPath: string;
    mimeType: string;
    size: number;
    createdAt: Date;
  };
  error?: string;
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  detectedMimeType?: string;
}

export class FileManager {
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly DEFAULT_UPLOAD_PATH = 'uploads/training';
  private static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  // File signature magic numbers for validation
  private static readonly FILE_SIGNATURES: Record<string, Buffer[]> = {
    'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
    'image/jpeg': [
      Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      Buffer.from([0xff, 0xd8, 0xff, 0xe1]),
      Buffer.from([0xff, 0xd8, 0xff, 0xe8]),
    ],
    'image/png': [
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
    'image/gif': [
      Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), // GIF87a
      Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), // GIF89a
    ],
    'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // RIFF (WebP container)
  };

  /**
   * Get full filesystem path from relative path
   */
  static getFileFullPath(filePath: string): string {
    return path.join(process.cwd(), 'public', filePath);
  }

  /**
   * Verify that a file exists on the filesystem
   */
  static async verifyFileExists(filePath: string): Promise<boolean> {
    try {
      FileOperationLogger.logVerificationStart(filePath);
      const fullPath = this.getFileFullPath(filePath);
      await fs.access(fullPath);
      FileOperationLogger.logVerificationSuccess(filePath);
      return true;
    } catch (error) {
      FileOperationLogger.logVerificationError(
        filePath,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  /**
   * Upload a file with validation and security checks
   */
  static async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    uploadedBy: mongoose.Types.ObjectId,
    options: FileUploadOptions = {}
  ): Promise<FileUploadResult> {
    const startTime = Date.now();
    
    try {
      FileOperationLogger.logUploadStart(
        originalName,
        fileBuffer.length,
        uploadedBy.toString()
      );
      
      // Validate file
      const validation = await this.validateFile(
        fileBuffer,
        mimeType,
        originalName,
        options
      );
      if (!validation.isValid) {
        FileOperationLogger.logUploadError(originalName, validation.error || 'Validation failed');
        return { success: false, error: validation.error };
      }

      // Generate secure file name
      const fileId = crypto.randomUUID();
      const fileExtension = path.extname(originalName).toLowerCase();
      const fileName = `${fileId}${fileExtension}`;

      // Create upload directory if it doesn't exist
      const uploadPath = options.uploadPath || this.DEFAULT_UPLOAD_PATH;
      const fullUploadPath = path.join(process.cwd(), 'public', uploadPath);
      await fs.mkdir(fullUploadPath, { recursive: true });

      // Write file to disk
      const filePath = path.join(fullUploadPath, fileName);
      await fs.writeFile(filePath, fileBuffer);

      // Verify file was written successfully
      const relativeFilePath = path.join(uploadPath, fileName);
      const fileExists = await this.verifyFileExists(relativeFilePath);
      if (!fileExists) {
        const error = 'File upload verification failed - file not found after write';
        FileOperationLogger.logUploadError(originalName, error, {
          fileId,
          filePath: relativeFilePath,
        });
        return {
          success: false,
          error,
        };
      }

      // Create file record in database
      const fileRecord = new FileStorage({
        id: fileId,
        originalName,
        fileName,
        filePath: relativeFilePath,
        mimeType: validation.detectedMimeType || mimeType,
        size: fileBuffer.length,
        uploadedBy,
        isOrphaned: true, // Will be set to false when associated with material
      });

      await fileRecord.save();
      
      const duration = Date.now() - startTime;
      FileOperationLogger.logUploadSuccess(fileId, originalName, duration);

      // Return complete file information
      return {
        success: true,
        file: {
          id: fileRecord.id,
          originalName: fileRecord.originalName,
          fileName: fileRecord.fileName,
          filePath: fileRecord.filePath,
          fullPath: this.getFileFullPath(fileRecord.filePath),
          mimeType: fileRecord.mimeType,
          size: fileRecord.size,
          createdAt: fileRecord.createdAt,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      FileOperationLogger.logUploadError(originalName, errorMessage, {
        error: error instanceof Error ? error.stack : undefined,
      });
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Validate file content, size, and type
   */
  static async validateFile(
    fileBuffer: Buffer,
    mimeType: string,
    originalName: string,
    options: FileUploadOptions = {}
  ): Promise<FileValidationResult> {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || this.ALLOWED_MIME_TYPES;

    // Check file size
    if (fileBuffer.length > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    // Check if file is empty
    if (fileBuffer.length === 0) {
      return {
        isValid: false,
        error: 'File is empty',
      };
    }

    // Validate MIME type
    if (!allowedTypes.includes(mimeType)) {
      return {
        isValid: false,
        error: `File type ${mimeType} is not allowed`,
      };
    }

    // Validate file extension
    const fileExtension = path.extname(originalName).toLowerCase();
    const expectedExtensions = this.getExpectedExtensions(mimeType);
    if (
      expectedExtensions.length > 0 &&
      !expectedExtensions.includes(fileExtension)
    ) {
      return {
        isValid: false,
        error: `File extension ${fileExtension} does not match MIME type ${mimeType}`,
      };
    }

    // Validate file signature (magic numbers)
    const detectedMimeType = this.detectMimeTypeFromSignature(fileBuffer);
    if (detectedMimeType && detectedMimeType !== mimeType) {
      return {
        isValid: false,
        error: `File content does not match declared MIME type. Expected: ${mimeType}, Detected: ${detectedMimeType}`,
      };
    }

    // Additional security checks
    const securityCheck = this.performSecurityChecks(fileBuffer, originalName);
    if (!securityCheck.isValid) {
      return securityCheck;
    }

    return {
      isValid: true,
      detectedMimeType: detectedMimeType || mimeType,
    };
  }

  /**
   * Delete a file from storage and database
   */
  static async deleteFile(
    fileId: string,
    userId: mongoose.Types.ObjectId
  ): Promise<boolean> {
    try {
      FileOperationLogger.logDeletionStart(fileId, userId.toString());
      
      const fileRecord = await FileStorage.findOne({ id: fileId });
      if (!fileRecord) {
        FileOperationLogger.logDeletionError(fileId, 'File not found in database');
        return false;
      }

      // Check if user has permission to delete (owner or admin)
      if (!fileRecord.uploadedBy.equals(userId)) {
        FileOperationLogger.logDeletionError(
          fileId,
          'Permission denied',
          { userId: userId.toString() }
        );
        // TODO: Add admin role check here
        return false;
      }

      // Delete physical file
      const fullPath = this.getFileFullPath(fileRecord.filePath);
      try {
        await fs.unlink(fullPath);
      } catch (error) {
        FileOperationLogger.logDeletionError(
          fileId,
          'Failed to delete physical file',
          {
            filePath: fullPath,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        );
        // Continue with database deletion even if physical file deletion fails
      }

      // Delete database record
      await FileStorage.deleteOne({ id: fileId });
      FileOperationLogger.logDeletionSuccess(fileId, fileRecord.originalName);
      return true;
    } catch (error) {
      FileOperationLogger.logDeletionError(
        fileId,
        error instanceof Error ? error.message : 'Unknown error',
        { error: error instanceof Error ? error.stack : undefined }
      );
      return false;
    }
  }

  /**
   * Associate file with a training material
   */
  static async associateFileWithMaterial(
    fileId: string,
    materialId: mongoose.Types.ObjectId
  ): Promise<boolean> {
    try {
      FileOperationLogger.logAssociationStart(fileId, materialId.toString());
      
      const result = await FileStorage.updateOne(
        { id: fileId },
        {
          associatedMaterial: materialId,
          isOrphaned: false,
        }
      );
      
      if (result.modifiedCount > 0) {
        FileOperationLogger.logAssociationSuccess(fileId, materialId.toString());
        return true;
      } else {
        FileOperationLogger.logAssociationError(
          fileId,
          materialId.toString(),
          'No documents modified'
        );
        return false;
      }
    } catch (error) {
      FileOperationLogger.logAssociationError(
        fileId,
        materialId.toString(),
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  /**
   * Get user's storage usage
   */
  static async getUserStorageUsage(
    userId: mongoose.Types.ObjectId
  ): Promise<number> {
    try {
      const result = await FileStorage.getTotalSizeByUploader(userId);
      return result.length > 0 ? result[0].totalSize : 0;
    } catch (error) {
      console.error('Storage usage calculation error:', error);
      return 0;
    }
  }

  /**
   * Clean up orphaned files older than specified days
   */
  static async cleanupOrphanedFiles(
    olderThanDays: number = 7
  ): Promise<number> {
    const startTime = Date.now();
    
    try {
      FileOperationLogger.logCleanupStart(olderThanDays);
      
      const orphanedFiles = await FileStorage.findOrphanedFiles(olderThanDays);
      
      let deletedCount = 0;

      for (const file of orphanedFiles) {
        // Delete physical file
        const fullPath = this.getFileFullPath(file.filePath);
        try {
          await fs.unlink(fullPath);
        } catch (error) {
          FileOperationLogger.logCleanupError(
            `Failed to delete physical file: ${file.filePath}`,
            { error: error instanceof Error ? error.message : 'Unknown error' }
          );
        }

        // Delete database record
        await FileStorage.deleteOne({ _id: file._id });
        deletedCount++;
      }

      const duration = Date.now() - startTime;
      FileOperationLogger.logCleanupSuccess(deletedCount, duration);
      return deletedCount;
    } catch (error) {
      FileOperationLogger.logCleanupError(
        error instanceof Error ? error.message : 'Unknown error',
        { error: error instanceof Error ? error.stack : undefined }
      );
      return 0;
    }
  }

  /**
   * Detect MIME type from file signature
   */
  private static detectMimeTypeFromSignature(buffer: Buffer): string | null {
    for (const [mimeType, signatures] of Object.entries(this.FILE_SIGNATURES)) {
      for (const signature of signatures) {
        if (buffer.subarray(0, signature.length).equals(signature)) {
          return mimeType;
        }
      }
    }
    return null;
  }

  /**
   * Get expected file extensions for a MIME type
   */
  private static getExpectedExtensions(mimeType: string): string[] {
    const extensionMap: Record<string, string[]> = {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        ['.pptx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
    };
    return extensionMap[mimeType] || [];
  }

  /**
   * Perform additional security checks
   */
  private static performSecurityChecks(
    buffer: Buffer,
    originalName: string
  ): FileValidationResult {
    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|scr|pif|com)$/i,
      /\.(php|asp|jsp|js|html|htm)$/i,
      /\.\./,
      /[<>:"|?*]/,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(originalName)) {
        return {
          isValid: false,
          error: 'File name contains suspicious characters or extensions',
        };
      }
    }

    // Check for embedded scripts in content (basic check)
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /onload=/i,
      /onerror=/i,
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        return {
          isValid: false,
          error: 'File contains potentially malicious content',
        };
      }
    }

    return { isValid: true };
  }
}
