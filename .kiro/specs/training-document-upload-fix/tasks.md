# Implementation Plan

- [x] 1. Add file verification helpers to FileManager
  - Add `getFileFullPath()` static method to consistently construct full file paths from relative paths
  - Add `verifyFileExists()` static method to check if a file exists on the filesystem
  - Update `uploadFile()` to verify file was written successfully before returning
  - Add detailed error logging for file operations
  - _Requirements: 1.1, 1.2, 3.1, 3.2, 3.4_

- [x] 2. Fix file upload API with verification
  - Update `/api/admin/training/files/upload` POST handler to verify file exists after upload
  - Add rollback logic to delete FileStorage document if verification fails
  - Improve error responses with specific error codes and details
  - Add logging for upload success and failure cases
  - _Requirements: 1.1, 1.2, 1.5, 5.1, 5.2, 5.4_

- [x] 3. Fix file download API path resolution
  - Update `/api/training/files/[id]/download` GET handler to use `FileManager.getFileFullPath()`
  - Add file existence verification before attempting to read file
  - Improve error messages to include file ID and path for debugging
  - Add logging for download attempts and failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 5.3_

- [x] 4. Improve training material API file handling
  - Update `/api/admin/training` POST handler to verify all uploaded files exist before creating material
  - Add immediate file association after material creation
  - Implement rollback logic to delete material if file association fails
  - Add validation to ensure file paths are valid and don't contain path traversal attempts
  - _Requirements: 1.3, 1.4, 3.4, 4.1, 4.2, 4.4_

- [x] 5. Update training material API for updates
  - Update `/api/admin/training/[id]` PUT handler to handle file updates correctly
  - Maintain existing file associations when updating materials
  - Add new file associations for newly uploaded files
  - Verify all files exist before saving updates
  - _Requirements: 4.2, 3.4_

- [x] 6. Enhance FileManager component error handling
  - Add error state to FileManager component
  - Display error messages when file operations fail
  - Add retry mechanism for failed file removals
  - Improve loading states during file operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 7. Add file cleanup for orphaned files
  - Update material deletion to mark associated files as orphaned
  - Ensure orphaned file cleanup runs for files older than 7 days
  - Add logging for cleanup operations
  - _Requirements: 4.3, 4.4_

- [ ]* 8. Add comprehensive error handling tests
  - Write unit tests for `FileManager.verifyFileExists()`
  - Write unit tests for `FileManager.getFileFullPath()`
  - Write integration tests for upload with verification failure
  - Write integration tests for download with missing file
  - Write integration tests for material creation with file association failure
  - _Requirements: All_

- [ ]* 9. Add end-to-end workflow tests
  - Write test for complete upload → save → download workflow
  - Write test for upload failure recovery
  - Write test for association failure recovery
  - Write test for invalid file type handling
  - Write test for file size limit handling
  - _Requirements: All_

- [x] 10. Update error messages and logging
  - Standardize error response format across all file-related APIs
  - Add detailed logging for all file operations
  - Include file IDs and paths in error messages for debugging
  - Add success logging for monitoring
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
