'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import TinyMCE only on client side
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
  }
);

interface TinyMCEWrapperProps {
  value: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  height?: number;
  className?: string;
}

export default function TinyMCEWrapper({
  value,
  onChange,
  onImageUpload,
  placeholder = 'Start writing your content...',
  disabled = false,
  height = 400,
  className = '',
}: TinyMCEWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fallback textarea for server-side rendering, build time, or when TinyMCE fails to load
  if (!isClient || process.env.DISABLE_TINYMCE === 'true') {
    return (
      <div className={`wysiwyg-editor ${className}`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full p-3 border border-gray-300 rounded-md resize-none"
          style={{ height: `${height}px` }}
        />
      </div>
    );
  }

  // Handle image upload
  const handleImageUpload = async (
    blobInfo: any,
    progress: (percent: number) => void
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        progress(0);

        // Convert blob to file
        const file = new File([blobInfo.blob()], blobInfo.filename(), {
          type: blobInfo.blob().type,
        });

        progress(25);

        // Use custom handler if provided
        if (onImageUpload) {
          const imageUrl = await onImageUpload(file);
          progress(100);
          resolve(imageUrl);
        } else {
          // Simple fallback - just reject for now
          reject('Image upload not configured');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        reject(error instanceof Error ? error.message : 'Image upload failed');
      }
    });
  };

  // TinyMCE configuration
  const editorConfig = {
    height,
    menubar: false,
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'image',
      'charmap',
      'preview',
      'anchor',
      'searchreplace',
      'visualblocks',
      'code',
      'fullscreen',
      'insertdatetime',
      'media',
      'table',
      'help',
      'wordcount',
      'paste',
    ],
    toolbar: [
      'undo redo | blocks | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
      'bullist numlist outdent indent | removeformat | link image media table | code fullscreen help',
    ].join(' | '),
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      table td, table th {
        border: 1px solid #ddd;
        padding: 8px;
      }
      table th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
    `,
    placeholder,
    paste_data_images: true,
    images_upload_handler: onImageUpload ? handleImageUpload : undefined,
    automatic_uploads: !!onImageUpload,
    file_picker_types: 'image',
    image_advtab: true,
    image_caption: true,
    image_description: false,
    image_dimensions: false,
    image_title: true,
    link_default_target: '_blank',
    link_assume_external_targets: true,
    target_list: [
      { title: 'Same window', value: '' },
      { title: 'New window', value: '_blank' },
    ],
    block_formats:
      'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
    fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',
    // Prevent CSS loading issues
    content_css: false,
    skin: false,
  };

  return (
    <div className={`wysiwyg-editor ${className}`}>
      <Editor
        apiKey="no-api-key"
        value={value}
        onEditorChange={(content) => {
          // Basic sanitization
          const sanitized = content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
          onChange(sanitized);
        }}
        init={editorConfig}
        disabled={disabled}
      />
    </div>
  );
}