'use client';

// components/scan/CameraCapture.tsx
// getUserMedia, live preview, capture frame → base64
// FIX: Use useRef for stream so cleanup closure always has a live reference (was: useState → stale closure, stream never stopped)

import { useEffect, useRef, useState } from 'react';
import { Camera, XCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string, mimeType: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: ref instead of state — cleanup runs with the live value, not stale closure
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.onloadedmetadata = () => setIsReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Camera access denied. Please enable camera permissions in your browser settings.');
      });

    return () => {
      cancelled = true;
      // Always stops because we read from the ref, not a stale state copy
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReady) return;

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
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: '#000', minHeight: 200 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
          style={{ maxHeight: '360px', objectFit: 'cover' }}
        />
        {!isReady && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}
          >
            Starting camera…
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="sr-only" />
      <button
        type="button"
        onClick={capture}
        disabled={!isReady}
        className="gc-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Camera size={16} />
        Capture menu
      </button>
    </div>
  );
}
