'use client';

import React from 'react';

interface WYSIWYGEditorProps {
  value: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  height?: number;
  className?: string;
}

export default function WYSIWYGEditor({
  value,
  onChange,
  onImageUpload,
  placeholder = 'Start writing your content...',
  disabled = false,
  height = 400,
  className = '',
}: WYSIWYGEditorProps) {
  // Simple textarea fallback when TinyMCE is disabled
  return (
    <div className={`wysiwyg-editor ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
        style={{ height: height }}
      />
      <div className="text-sm text-gray-500 mt-2">
        Rich text editor is temporarily disabled. Using plain text mode.
      </div>
    </div>
  );
}



/**
 * Validate content length and structure
 */
export function validateContent(content: string): {
  isValid: boolean;
  error?: string;
} {
  if (!content || content.trim() === '') {
    return { isValid: false, error: 'Content cannot be empty' };
  }

  // Remove HTML tags to get text length
  const textContent = content.replace(/<[^>]*>/g, '').trim();

  if (textContent.length < 10) {
    return {
      isValid: false,
      error: 'Content must be at least 10 characters long',
    };
  }

  if (textContent.length > 50000) {
    return { isValid: false, error: 'Content cannot exceed 50,000 characters' };
  }

  return { isValid: true };
}
