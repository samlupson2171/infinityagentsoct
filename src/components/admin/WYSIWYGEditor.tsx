'use client';

import React from 'react';
import TinyMCEWrapper from './TinyMCEWrapper';
import { createTinyMCEImageHandler } from '@/lib/image-upload-handler';

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
  // Handle image upload with default handler
  const handleImageUpload = async (file: File): Promise<string> => {
    if (onImageUpload) {
      return onImageUpload(file);
    } else {
      // Use default TinyMCE image handler
      const defaultHandler = createTinyMCEImageHandler();
      return defaultHandler(file);
    }
  };

  return (
    <TinyMCEWrapper
      value={value}
      onChange={onChange}
      onImageUpload={handleImageUpload}
      placeholder={placeholder}
      disabled={disabled}
      height={height}
      className={className}
    />
  );
}

/**
 * Basic content sanitization
 */
function sanitizeContent(content: string): string {
  if (!content) return '';

  // Remove script tags and event handlers
  let sanitized = content.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove potentially dangerous protocols
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/data:text\/html/gi, 'data:text/plain');

  return sanitized;
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
