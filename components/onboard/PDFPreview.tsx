'use client';

// components/onboard/PDFPreview.tsx
// pdfjs-dist canvas render of first page

import { useEffect, useRef, useState } from 'react';

interface PDFPreviewProps {
  file: File;
}

export function PDFPreview({ file }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const mimeType = file.type;

    if (mimeType.startsWith('image/')) {
      setIsImage(true);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    // PDF preview via pdfjs-dist
    const renderPDF = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext('2d');
        if (!context) return;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch {
        setError(true);
      }
    };

    void renderPDF();
  }, [file]);

  if (isImage && imageUrl) {
    return (
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="Report preview"
          className="max-h-80 rounded-xl object-contain border"
          style={{ borderColor: 'var(--border)' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 rounded-xl text-center text-sm"
        style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
      >
        Preview unavailable — the file will still be analyzed
      </div>
    );
  }

  return (
    <div className="flex justify-center overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)' }}>
      <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: '320px' }} />
    </div>
  );
}
