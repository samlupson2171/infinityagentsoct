'use client';

import React from 'react';

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
  placeholder = 'Start writing your content...',
  disabled = false,
  height = 400,
  className = '',
}: TinyMCEWrapperProps) {
  // Simple textarea fallback when TinyMCE is disabled
  return (
    <div className={`wysiwyg-editor ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        style={{ height: `${height}px` }}
      />
      <div className="text-sm text-gray-500 mt-2">
        Rich text editor is temporarily disabled. Using plain text mode.
      </div>
    </div>
  );
}