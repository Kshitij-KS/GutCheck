'use client';

// components/scan/MenuPhotoUpload.tsx
// UX: Select → Preview → Explicit "Analyze this menu" CTA → Upload
// Prevents accidental analysis on slow connections; lets user confirm the right photo

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUp, Upload, X, ZoomIn } from 'lucide-react';
import { validateMenuImageFile } from '@/lib/scan/menu-image';

interface MenuPhotoUploadProps {
  onUpload: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MenuPhotoUpload({ onUpload, isLoading }: MenuPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Preview state — hold data until user explicitly clicks Analyze
  const [preview, setPreview] = useState<{
    objectUrl: string;
    name: string;
    size: number;
    base64: string;
    mimeType: string;
  } | null>(null);

  // Cleanup object URL on reset
  const clearPreview = useCallback(() => {
    if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [preview]);

  const handleFile = useCallback((file: File) => {
    setError(null);

    const validation = validateMenuImageFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    // Build object URL for instant preview (no base64 needed for display)
    const objectUrl = URL.createObjectURL(file);

    // Read base64 for API submission
    const reader = new FileReader();
    reader.onerror = () => setError('Could not read menu photo.');
    reader.onload = () => {
      try {
        const dataUrl = String(reader.result);
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match?.[1] || !match[2]) throw new Error('Could not read menu photo.');

        if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl);
        setPreview({
          objectUrl,
          name: file.name,
          size: file.size,
          mimeType: match[1],
          base64: match[2],
        });
      } catch (err) {
        setError((err as Error).message);
      }
    };
    reader.readAsDataURL(file);
  }, [preview]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleAnalyze = () => {
    if (!preview || isLoading) return;
    onUpload(preview.base64, preview.mimeType);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!preview ? (
          /* ─── Drop zone ─────────────────────────────────────────────────────── */
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <motion.div
              animate={{ scale: isDragging ? 1.015 : 1 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer"
              style={{
                borderColor: isDragging ? 'var(--accent)' : 'var(--border-strong)',
                backgroundColor: isDragging ? 'var(--tl-prioritize-bg)' : 'var(--bg-secondary)',
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="sr-only"
                disabled={isLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.currentTarget.value = '';
                }}
              />

              <div
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: 'var(--bg-elevated)' }}
              >
                <ImageUp size={24} style={{ color: 'var(--accent)' }} strokeWidth={1.5} />
              </div>

              <p
                className="font-medium text-base"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
              >
                {isDragging ? 'Drop your menu photo here' : 'Upload a menu photo'}
              </p>
              <p
                className="mt-1.5 text-sm"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Drag & drop, or click to browse · JPG, PNG, WebP, HEIC · Up to 20 MB
              </p>

              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="gc-btn-primary mt-6 inline-flex min-h-11 items-center justify-center gap-2 disabled:opacity-50"
              >
                <Upload size={14} />
                Choose photo
              </button>
            </motion.div>
          </motion.div>
        ) : (
          /* ─── Preview + Analyze ─────────────────────────────────────────────── */
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="gc-card overflow-hidden"
          >
            {/* Photo preview */}
            <div className="relative" style={{ maxHeight: 280, overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.objectUrl}
                alt="Menu photo preview"
                className="w-full object-cover"
                style={{ maxHeight: 280, objectPosition: 'top' }}
              />
              {/* Overlay hint */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(28,26,23,0.3)' }}
              >
                <ZoomIn size={28} color="#fff" />
              </div>
              {/* Clear button */}
              {!isLoading && (
                <button
                  type="button"
                  onClick={clearPreview}
                  className="absolute top-2 right-2 flex items-center justify-center rounded-full h-7 w-7 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'rgba(28,26,23,0.55)' }}
                  aria-label="Remove photo"
                >
                  <X size={14} color="#fff" />
                </button>
              )}
            </div>

            {/* File info + CTAs */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 min-w-0">
                <ImageUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <p
                  className="text-sm truncate"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}
                >
                  {preview.name}
                </p>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  {formatBytes(preview.size)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="gc-btn-primary flex-1 min-h-11 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <ImageUp size={14} />
                      Analyze this menu
                    </>
                  )}
                </button>
                {!isLoading && (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="gc-btn-secondary px-4 min-h-11 flex-shrink-0 text-sm"
                    title="Choose a different photo"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Hidden file input re-used for "Change photo" */}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="sr-only"
                disabled={isLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.currentTarget.value = '';
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center text-sm"
            style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
