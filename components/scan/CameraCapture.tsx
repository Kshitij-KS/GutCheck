'use client';

// components/scan/CameraCapture.tsx
// getUserMedia, live preview, capture frame → base64

import { useEffect, useRef, useState } from 'react';
import { Camera, XCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string, mimeType: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError('Camera access denied. Please enable camera permissions.'));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '';
    onCapture(base64, 'image/jpeg');
  };

  if (error) {
    return (
      <div
        className="flex items-center gap-3 p-4 rounded-xl"
        style={{ backgroundColor: 'var(--tl-avoid-bg)', color: 'var(--tl-avoid)' }}
      >
        <XCircle size={18} />
        <p className="text-sm" style={{ fontFamily: 'var(--font-body)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#000' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
          style={{ maxHeight: '360px', objectFit: 'cover' }}
        />
      </div>
      <canvas ref={canvasRef} className="sr-only" />
      <button onClick={capture} className="gc-btn-primary w-full flex items-center justify-center gap-2">
        <Camera size={16} />
        Capture menu
      </button>
    </div>
  );
}
