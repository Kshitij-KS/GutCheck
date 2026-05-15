'use client';

// app/scan/page.tsx
// Menu scanner — 4 input modes: quick-query, menu-text, camera, menu-upload
// Includes: offline banner, mindful nudge, explicit save CTA, OfflineScanBadge on results

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck } from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useMenuScan } from '@/hooks/useMenuScan';
import { useScanRateLimit } from '@/hooks/useScanRateLimit';
import { ScanModeToggle } from '@/components/scan/ScanModeToggle';
import { QuickQueryInput } from '@/components/scan/QuickQueryInput';
import { CameraCapture } from '@/components/scan/CameraCapture';
import { MenuPhotoUpload } from '@/components/scan/MenuPhotoUpload';
import { DishResultCard } from '@/components/scan/DishResultCard';
import { OfflineScanBadge } from '@/components/scan/OfflineScanBadge';
import { MindfulNudge } from '@/components/scan/MindfulNudge';
import { LoadingOrb } from '@/components/shared/LoadingOrb';
import type { ScanMode } from '@/types';

export default function ScanPage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [mode, setMode] = useState<ScanMode>('quick-query');
  const [menuText, setMenuText] = useState('');
  const [showNudge, setShowNudge] = useState(false);
  const [savedThisScan, setSavedThisScan] = useState(false);

  const { scanState, scanText, scanImage, reset, isOnline } = useMenuScan();
  const { isOverLimit, mindfulMessage } = useScanRateLimit();
  const addScanResult = useGutCheckStore((s) => s.addScanResult);

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  useEffect(() => {
    if (isOverLimit) setShowNudge(true);
  }, [isOverLimit]);

  // Reset save badge when a new scan starts
  useEffect(() => {
    if (scanState.status === 'scanning') setSavedThisScan(false);
  }, [scanState.status]);

  const handleQuery = (query: string) => void scanText(query);

  const handleModeChange = (m: ScanMode) => {
    setMode(m);
    reset();
    setSavedThisScan(false);
  };

  // Explicit save — spec requires a visible confirmation action
  const handleSave = () => {
    if (scanState.status !== 'complete') return;
    addScanResult(scanState.result);
    setSavedThisScan(true);
  };

  const hasOfflineDishes =
    scanState.status === 'complete' &&
    scanState.result.dishes.some((d) => d.isOfflineResult);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
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

      {/* Offline banner — shown above mode toggle when offline */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            key="offline-notice"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              backgroundColor: 'var(--tl-moderate-bg)',
              border: '1px solid rgba(139, 105, 20, 0.25)',
              fontFamily: 'var(--font-body)',
              color: 'var(--tl-moderate)',
            }}
          >
            You are offline. Quick Query and Paste Menu will use keyword matching from your cached profile.
            Camera and Upload Photo require a connection.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode toggle */}
      <div>
        <ScanModeToggle mode={mode} onChange={handleModeChange} />
      </div>

      {/* ── Input modes ───────────────────────────────────────────────────────── */}

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
          <div
            className="sticky z-10 bottom-0 -mx-4 px-4 pt-3 border-t md:static md:mx-0 md:px-0 md:pt-0 md:border-0 gc-pb-safe"
            style={{
              backgroundColor: 'var(--bg-primary)',
              boxShadow: '0 -8px 24px rgba(28, 26, 23, 0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => void scanText(menuText)}
              disabled={!menuText.trim() || scanState.status === 'scanning'}
              className="gc-btn-primary w-full min-h-12 disabled:opacity-50"
            >
              {scanState.status === 'scanning' ? 'Analyzing...' : 'Analyze menu'}
            </button>
          </div>
        </div>
      )}

      {mode === 'camera' && (
        <CameraCapture onCapture={(base64, mime) => void scanImage(base64, mime)} />
      )}

      {mode === 'menu-upload' && (
        <MenuPhotoUpload
          isLoading={scanState.status === 'scanning'}
          onUpload={(base64, mime) => void scanImage(base64, mime)}
        />
      )}

      {/* ── Loading ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {scanState.status === 'scanning' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <LoadingOrb
              messages={[
                'Checking your profile…',
                'Applying cultural context…',
                'Analyzing dishes…',
                'Almost there…',
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ─────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {scanState.status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="gc-card p-4"
          >
            <p style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
              {scanState.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {scanState.status === 'complete' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Offline results banner */}
            {hasOfflineDishes && <OfflineScanBadge variant="banner" />}

            {/* Summary card */}
            <div className="gc-card p-4 space-y-1">
              <p
                className="text-xs font-medium uppercase tracking-[0.12em]"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Analysis complete
              </p>
              <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {scanState.result.scanSummary}
              </p>
            </div>

            {/* Best choices */}
            {scanState.result.bestChoices.length > 0 && (
              <div
                className="gc-card p-4"
                style={{ backgroundColor: 'var(--tl-prioritize-bg)', border: '1px solid rgba(61,122,90,0.15)' }}
              >
                <p
                  className="text-xs font-medium uppercase tracking-[0.12em] mb-1.5"
                  style={{ color: 'var(--tl-prioritize)', fontFamily: 'var(--font-body)' }}
                >
                  Best choices for you
                </p>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  {scanState.result.bestChoices.join(' · ')}
                </p>
              </div>
            )}

            {/* Explicit save button — spec requirement */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={savedThisScan}
                className="gc-btn-secondary flex items-center gap-2 text-sm disabled:opacity-60"
              >
                <BookmarkCheck size={14} />
                {savedThisScan ? 'Saved to history' : 'Save this analysis'}
              </button>
              <button
                type="button"
                onClick={() => { reset(); setSavedThisScan(false); }}
                className="text-sm underline underline-offset-4"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                New scan
              </button>
            </div>

            {/* Dish cards */}
            {scanState.result.dishes.map((dish, i) => (
              <DishResultCard key={`${dish.dishName}-${i}`} result={dish} delay={i * 0.04} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mindful nudge overlay */}
      <AnimatePresence>
        {showNudge && mindfulMessage && (
          <MindfulNudge message={mindfulMessage} onDismiss={() => setShowNudge(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
