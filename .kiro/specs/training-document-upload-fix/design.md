# Training Document Upload and Download Fix - Design

## Overview

This design addresses critical bugs in the training document upload and download system. The core issues stem from inconsistent file path handling, timing problems with file associations, and inadequate error handling. The solution involves fixing the file path resolution logic, improving the file association workflow, and adding comprehensive error handling.

## Architecture

### Current Issues

1. **File Path Inconsistency**: The `filePath` stored in the database includes the relative path from `public/` (e.g., `uploads/training/file.pdf`), but the download route may not be resolving this correctly
2. **File Association Timing**: Files are uploaded and then associated with materials after save, creating a window for orphaned files
3. **Download Route Resolution**: The download route constructs the full path but may have issues with path joining
4. **Missing Validation**: Insufficient validation of file existence before returning success

### Proposed Solution

```
┌─────────────────────────────────────────────────────────────┐
│                     Training Manager UI                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ FileUpload │→ │FileManager │→ │ TrainingManager Form │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└────────────┬────────────────────────────────┬───────────────┘
             │                                 │
             ↓                                 ↓
┌────────────────────────────┐   ┌────────────────────────────┐
│  File Upload API           │   │  Training Material API     │
│  /api/admin/training/      │   │  /api/admin/training       │
│  files/upload              │   │                            │
│                            │   │  1. Validate files exist   │
│  1. Validate file          │   │  2. Create material        │
│  2. Store to filesystem    │   │  3. Associate files        │
│  3. Create FileStorage doc │   │  4. Verify associations    │
│  4. Return file metadata   │   │                            │
└────────────┬───────────────┘   └────────────┬───────────────┘
             │                                 │
             ↓                                 ↓
┌────────────────────────────────────────────────────────────┐
│                    FileManager Service                      │
│                                                             │
│  • uploadFile(buffer, name, type, userId)                  │
│  • validateFile(buffer, type, name)                        │
│  • associateFileWithMaterial(fileId, materialId)           │
│  • verifyFileExists(filePath)                              │
│  • deleteFile(fileId, userId)                              │
└────────────┬──────────────────────────────────────────────┘
             │
             ↓
┌────────────────────────────────────────────────────────────┐
│                   File Download Flow                        │
│                                                             │
│  User clicks download                                       │
│       ↓                                                     │
│  /api/training/files/[id]/download                         │
│       ↓                                                     │
│  1. Authenticate user                                       │
│  2. Find file in FileStorage                               │
│  3. Verify file exists on filesystem                       │
│  4. Construct full path: process.cwd() + '/public/' +      │
│     file.filePath                                          │
│  5. Read file buffer                                       │
│  6. Set headers (Content-Type, Content-Disposition)        │
│  7. Stream file to client                                  │
│  8. Log download event                                     │
└────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. FileManager Service Updates

**Location**: `src/lib/file-manager.ts`

**Changes**:
- Add `verifyFileExists()` method to check filesystem before returning success
- Update `uploadFile()` to return full file metadata including verified path
- Add `getFileFullPath()` helper to consistently construct full paths
- Improve error messages with specific failure reasons

```typescript
interface FileUploadResult {
  success: boolean;
  file?: {
    id: string;
    originalName: string;
    fileName: string;
    filePath: string;  // Relative from public/
    fullPath: string;  // Absolute path for verification
    mimeType: string;
    size: number;
    createdAt: Date;
  };
  error?: string;
}

// New helper method
static getFileFullPath(filePath: string): string {
  return path.join(process.cwd(), 'public', filePath);
}

// New verification method
static async verifyFileExists(filePath: string): Promise<boolean> {
  try {
    const fullPath = this.getFileFullPath(filePath);
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}
```

### 2. File Upload API Updates

**Location**: `src/app/api/admin/training/files/upload/route.ts`

**Changes**:
- Verify file was written to disk before returning success
- Return complete file metadata including verified paths
- Add better error handling for filesystem operations
- Log upload events for debugging

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... existing auth and validation ...

    // Upload file using FileManager
    const result = await FileManager.uploadFile(
      buffer,
      file.name,
      file.type,
      new mongoose.Types.ObjectId(session.user.id)
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // CRITICAL: Verify file exists on filesystem
    const fileExists = await FileManager.verifyFileExists(result.file!.filePath);
    if (!fileExists) {
      // Rollback database entry
      await FileStorage.deleteOne({ id: result.file!.id });
      return NextResponse.json(
        { error: 'File upload verification failed' },
        { status: 500 }
      );
    }

    // Return complete file information
    return NextResponse.json({
      success: true,
      file: {
        id: result.file!.id,
        originalName: result.file!.originalName,
        fileName: result.file!.fileName,
        filePath: result.file!.filePath,
        mimeType: result.file!.mimeType,
        size: result.file!.size,
        uploadedAt: result.file!.createdAt,
      },
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
```

### 3. Training Material API Updates

**Location**: `src/app/api/admin/training/route.ts`

**Changes**:
- Validate all uploaded files exist before creating material
- Associate files immediately after material creation
- Verify associations succeeded
- Rollback on failure

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... existing validation ...

    // CRITICAL: Verify all uploaded files exist
    if (materialData.type === 'download' && materialData.uploadedFiles?.length > 0) {
      for (const file of materialData.uploadedFiles) {
        const fileExists = await FileManager.verifyFileExists(file.filePath);
        if (!fileExists) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'FILE_NOT_FOUND',
                message: `Uploaded file not found: ${file.originalName}`,
                fileId: file.id,
              },
            },
            { status: 400 }
          );
        }
      }
    }

    // Create material
    const material = new TrainingMaterial(materialToSave);
    await material.save();

    // CRITICAL: Associate files immediately after save
    if (materialData.type === 'download' && materialData.uploadedFiles) {
      const associationResults = await Promise.all(
        materialData.uploadedFiles.map(file =>
          FileManager.associateFileWithMaterial(file.id, material._id)
        )
      );

      // Verify all associations succeeded
      const failedAssociations = associationResults.filter(result => !result);
      if (failedAssociations.length > 0) {
        // Rollback: delete the material
        await TrainingMaterial.deleteOne({ _id: material._id });
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_ASSOCIATION_FAILED',
              message: 'Failed to associate files with material',
            },
          },
          { status: 500 }
        );
      }
    }

    // Populate and return
    await material.populate('createdBy', 'name contactEmail');
    return NextResponse.json({ success: true, data: material }, { status: 201 });
  } catch (error) {
    // ... error handling ...
  }
}
```

### 4. File Download API Updates

**Location**: `src/app/api/training/files/[id]/download/route.ts`

**Changes**:
- Use consistent path resolution with FileManager helper
- Add better error messages
- Verify file exists before attempting read
- Improve logging

```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // ... existing auth ...

    const { FileStorage } = await import('@/models');
    const file = await FileStorage.findOne({ id: params.id });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found in database', fileId: params.id },
        { status: 404 }
      );
    }

    // ... permission checks ...

    // CRITICAL: Use consistent path resolution
    const fullPath = FileManager.getFileFullPath(file.filePath);

    // Verify file exists before attempting read
    const fileExists = await FileManager.verifyFileExists(file.filePath);
    if (!fileExists) {
      console.error(`File not found on filesystem: ${fullPath}`);
      console.error(`Database filePath: ${file.filePath}`);
      return NextResponse.json(
        {
          error: 'File not found on filesystem',
          fileId: params.id,
          filePath: file.filePath,
        },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(fullPath);

    // Set headers
    const headers = new Headers();
    headers.set('Content-Type', file.mimeType);
    headers.set('Content-Length', file.size.toString());
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.originalName)}"`
    );

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        fileId: params.id,
      },
      { status: 500 }
    );
  }
}
```

### 5. FileManager Component Updates

**Location**: `src/components/admin/FileManager.tsx`

**Changes**:
- Add error state display
- Improve file removal handling
- Add retry mechanism for failed operations

```typescript
const [error, setError] = useState<string | null>(null);

// Enhanced file removal with error handling
const handleFileRemoved = async (fileId: string) => {
  try {
    setError(null);
    const response = await fetch(`/api/admin/training/files/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete file');
    }

    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  } catch (error) {
    console.error('Error deleting file:', error);
    setError(error instanceof Error ? error.message : 'Failed to delete file');
  }
};

// Add error display in render
{error && (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-800">{error}</p>
    <button
      onClick={() => setError(null)}
      className="text-xs text-red-600 underline mt-1"
    >
      Dismiss
    </button>
  </div>
)}
```

## Data Models

### FileStorage Model

**No changes required** - The existing model is correct. The issue is in how the data is used, not the schema.

### TrainingMaterial Model

**No changes required** - The model correctly stores the uploadedFiles array.

## Error Handling

### Error Types

1. **FILE_NOT_FOUND**: File exists in database but not on filesystem
2. **FILE_UPLOAD_FAILED**: File could not be written to disk
3. **FILE_VERIFICATION_FAILED**: File was written but verification failed
4. **FILE_ASSOCIATION_FAILED**: File could not be associated with material
5. **VALIDATION_ERROR**: File failed validation checks

### Error Response Format

```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details?: any,  // Additional context
    fileId?: string,  // Relevant file ID
    filePath?: string  // Relevant file path
  }
}
```

### Rollback Strategy

1. **Upload Failure**: No rollback needed (file not created)
2. **Verification Failure**: Delete FileStorage document
3. **Association Failure**: Delete TrainingMaterial document, mark files as orphaned
4. **Material Creation Failure**: Files remain orphaned for cleanup

## Testing Strategy

### Unit Tests

1. **FileManager.verifyFileExists()**: Test with existing and non-existing files
2. **FileManager.getFileFullPath()**: Test path construction on different OS
3. **File upload with verification**: Test success and failure cases
4. **File association**: Test success and rollback scenarios

### Integration Tests

1. **Complete upload flow**: Upload file → Create material → Download file
2. **Upload failure recovery**: Upload fails → Verify no orphaned files
3. **Association failure recovery**: Association fails → Verify material deleted
4. **Download with missing file**: File in DB but not on disk → Verify 404

### Manual Testing Checklist

1. Upload a PDF document to a training material
2. Verify the file appears in the file list
3. Save the training material
4. Reload the page and verify the file is still there
5. Click download and verify the file downloads correctly
6. Try uploading an invalid file type and verify error message
7. Try uploading a file that's too large and verify error message
8. Delete a file and verify it's removed from the list

## Performance Considerations

1. **File Verification**: Add caching for file existence checks to avoid repeated filesystem access
2. **Batch Operations**: When associating multiple files, use Promise.all for parallel execution
3. **Download Streaming**: For large files, consider streaming instead of loading entire buffer
4. **Cleanup Job**: Run orphaned file cleanup as a background job, not during user requests

## Security Considerations

1. **Path Traversal**: Validate that filePath doesn't contain `..` or absolute paths
2. **File Type Validation**: Verify file content matches declared MIME type
3. **Access Control**: Verify user has permission to download file
4. **Rate Limiting**: Implement download rate limiting to prevent abuse
5. **Audit Logging**: Log all file operations for security auditing

## Migration Strategy

No database migration required. This is a bug fix that doesn't change the data schema.

## Deployment Notes

1. **Zero Downtime**: Changes are backward compatible
2. **Monitoring**: Add logging to track file operation success rates
3. **Rollback Plan**: If issues occur, revert to previous version (no data migration needed)
4. **Verification**: After deployment, test upload and download with various file types
