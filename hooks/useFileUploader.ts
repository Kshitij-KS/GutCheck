import { useState, useCallback, useRef } from 'react';

export interface FilePreview {
  objectUrl: string;
  name: string;
  size: number;
  base64: string;
  mimeType: string;
}

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

interface UseFileUploaderProps {
  validateFile: (file: File) => ValidationResult;
  readErrorMessage?: string;
}

export function useFileUploader({ validateFile, readErrorMessage = 'Could not read file.' }: UseFileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(null);

  const clearPreview = useCallback(() => {
    if (preview?.objectUrl) {
      URL.revokeObjectURL(preview.objectUrl);
    }
    setPreview(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [preview]);

  const handleFile = useCallback((file: File) => {
    setError(null);

    const validation = validateFile(file);
    if (!validation.ok) {
      setError(validation.message);
      return;
    }

    // Build object URL for instant preview
    const objectUrl = URL.createObjectURL(file);

    // Read base64 for API submission
    const reader = new FileReader();
    reader.onerror = () => setError(readErrorMessage);
    reader.onload = () => {
      try {
        const dataUrl = String(reader.result);
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match?.[1] || !match[2]) {
          throw new Error(readErrorMessage);
        }

        if (preview?.objectUrl) {
          URL.revokeObjectURL(preview.objectUrl);
        }

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
  }, [preview, validateFile, readErrorMessage]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return {
    inputRef,
    error,
    isDragging,
    setIsDragging,
    preview,
    clearPreview,
    handleFile,
    handleDrop,
  };
}
