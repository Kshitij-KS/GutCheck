'use client';

// app/scan/page.tsx

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useMenuScan } from '@/hooks/useMenuScan';
import { useScanRateLimit } from '@/hooks/useScanRateLimit';
import { ScanModeToggle } from '@/components/scan/ScanModeToggle';
import { QuickQueryInput } from '@/components/scan/QuickQueryInput';
import { CameraCapture } from '@/components/scan/CameraCapture';
import { DishResultCard } from '@/components/scan/DishResultCard';
import { MindfulNudge } from '@/components/scan/MindfulNudge';
import { LoadingOrb } from '@/components/shared/LoadingOrb';
import type { ScanMode } from '@/types';

export default function ScanPage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [mode, setMode] = useState<ScanMode>('quick-query');
  const [menuText, setMenuText] = useState('');
  const [showNudge, setShowNudge] = useState(false);
  const { scanState, scanText, scanImage, reset } = useMenuScan();
  const { isOverLimit, mindfulMessage } = useScanRateLimit();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  useEffect(() => {
    if (isOverLimit) setShowNudge(true);
  }, [isOverLimit]);

  const handleQuery = (query: string) => {
    void scanText(query);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Menu scanner
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Check any dish against your blood report profile.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mb-6">
        <ScanModeToggle mode={mode} onChange={(m) => { setMode(m); reset(); }} />
      </div>

      {/* Input area */}
      {mode === 'quick-query' && (
        <QuickQueryInput
          onSubmit={handleQuery}
          isLoading={scanState.status === 'scanning'}
        />
      )}

      {mode === 'menu-text' && (
        <div className="space-y-4">
          <textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder="Paste menu items here, one per line..."
            className="gc-input gc-textarea"
            rows={8}
          />
          <button
            onClick={() => void scanText(menuText)}
            disabled={!menuText.trim() || scanState.status === 'scanning'}
            className="gc-btn-primary w-full disabled:opacity-50"
          >
            {scanState.status === 'scanning' ? 'Analyzing...' : 'Analyze menu'}
          </button>
        </div>
      )}

      {mode === 'camera' && (
        <CameraCapture onCapture={(base64, mime) => void scanImage(base64, mime)} />
      )}

      {/* Loading state */}
      {scanState.status === 'scanning' && (
        <div className="mt-8">
          <LoadingOrb messages={['Checking your profile...', 'Analyzing dishes...', 'Applying cultural context...']} />
        </div>
      )}

      {/* Error */}
      {scanState.status === 'error' && (
        <div className="mt-6 gc-card p-4">
          <p style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            {scanState.message}
          </p>
        </div>
      )}

      {/* Results */}
      {scanState.status === 'complete' && (
        <div className="mt-8 space-y-4">
          {scanState.result.bestChoices.length > 0 && (
            <div
              className="gc-card p-4"
              style={{ backgroundColor: 'var(--tl-prioritize-bg)' }}
            >
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--tl-prioritize)' }}>
                Best choices for you
              </p>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {scanState.result.bestChoices.join(', ')}
              </p>
            </div>
          )}
          {scanState.result.dishes.map((dish, i) => (
            <DishResultCard key={`${dish.dishName}-${i}`} result={dish} delay={i * 0.04} />
          ))}
        </div>
      )}

      {/* Mindful nudge */}
      {showNudge && mindfulMessage && (
        <MindfulNudge message={mindfulMessage} onDismiss={() => setShowNudge(false)} />
      )}
    </div>
  );
}
