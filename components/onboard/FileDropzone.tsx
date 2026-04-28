'use client';

// components/onboard/FileDropzone.tsx
// Accept: .pdf, .jpg, .jpeg, .png, .webp. Max: 20MB.

import { useCallback, useState } from 'react';
import { Upload, FileText, Image } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileDropzoneProps {
  onFile: (file: File) => void;
}

const ACCEPTED = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const MAX_BYTES = 20 * 1024 * 1024;

export function FileDropzone({ onFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError('File is larger than 20MB. Please compress or crop the image.');
      return;
    }
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError('Please upload a PDF, JPG, PNG, or WebP file.');
      return;
    }
    onFile(file);
  }, [onFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full">
      <motion.label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{ scale: isDragging ? 1.02 : 1 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl cursor-pointer border-2 border-dashed transition-colors"
        style={{
          borderColor: isDragging ? 'var(--accent)' : 'var(--border-strong)',
          backgroundColor: isDragging ? 'var(--tl-prioritize-bg)' : 'var(--bg-secondary)',
          minHeight: '280px',
        }}
      >
        <input
          type="file"
          accept={ACCEPTED.join(',')}
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          id="report-upload"
        />
        <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <FileText size={32} strokeWidth={1.5} />
          <Image size={28} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontWeight: 500 }}>
            Drop your blood report here
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            PDF, JPG, PNG, or WebP · Up to 20MB
          </p>
          <button
            type="button"
            className="mt-4 gc-btn-primary text-sm"
            onClick={() => document.getElementById('report-upload')?.click()}
          >
            <Upload size={14} className="inline mr-2" />
            Choose file
          </button>
        </div>
      </motion.label>
      {error && (
        <motion.p
          animate={{ x: [0, -8, 8, -4, 4, 0] }}
          transition={{ duration: 0.4 }}
          className="mt-3 text-sm text-center"
          style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
