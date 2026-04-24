'use client';

// components/onboard/FileDropzone.tsx

import { useCallback, useRef, useState } from 'react';
import { Upload, FileText, Image, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFileUpload } from '@/lib/security';

interface FileDropzoneProps {
  onFileReady: (file: File, extractedText: string, imageBase64?: string, mimeType?: 'image/jpeg' | 'image/png' | 'image/webp') => void;
  disabled?: boolean;
}

export function FileDropzone({ onFileReady, disabled }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setError(null);
    const validation = validateFileUpload(file, { maxSizeMB: 10 });
    if (!validation.isSafe) {
      setError(validation.reason ?? 'Invalid file');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      if (file.type === 'application/pdf') {
        // Dynamic import for pdfjs to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => ('str' in item ? item.str : '')).join(' ') + '\n';
        }

        onFileReady(file, fullText.trim());
      } else {
        // Image: convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1] ?? '';
          const mimeType = file.type as 'image/jpeg' | 'image/png' | 'image/webp';
          // For images, send a placeholder text + the actual image
          onFileReady(file, 'Blood report image uploaded', base64, mimeType);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileReady]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
  }, [processFile]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
            {selectedFile.type === 'application/pdf' ? (
              <FileText className="h-6 w-6 text-emerald-400" />
            ) : (
              <Image className="h-6 w-6 text-emerald-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white truncate">{selectedFile.name}</p>
            <p className="text-sm text-slate-400">
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
              {isProcessing && ' · Processing...'}
            </p>
          </div>
          {isProcessing ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <button onClick={clearFile} className="rounded-lg p-1 text-slate-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 text-center transition-all',
            isDragOver
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
            <Upload className="h-8 w-8 text-slate-400" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">Drop your blood report here</p>
            <p className="mt-1 text-sm text-slate-400">
              PDF, PNG, JPG, or WEBP — up to 10MB
            </p>
          </div>
          <div className="flex gap-3">
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">PDF</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">PNG</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">JPG</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">WEBP</span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
