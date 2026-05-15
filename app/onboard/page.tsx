'use client';

// app/onboard/page.tsx

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useAgentPipeline } from '@/hooks/useAgentPipeline';
import { FileDropzone } from '@/components/onboard/FileDropzone';
import { PDFPreview } from '@/components/onboard/PDFPreview';
import { AgentProgressStepper } from '@/components/onboard/AgentProgressStepper';
import { GuardrailAlert } from '@/components/onboard/GuardrailAlert';
import { ProfileConfirmation } from '@/components/onboard/ProfileConfirmation';

function OnboardLoading() {
  return (
    <div className="min-h-[100dvh] min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <p className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        GutCheck
      </p>
      <p className="mt-3 text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading&hellip;
      </p>
    </div>
  );
}

function OnboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReplace = searchParams.get('replace') === '1';

  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const setHealthProfile = useGutCheckStore((s) => s.setHealthProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { state, run, reset, resolveUnitAmbiguity } = useAgentPipeline();

  useEffect(() => {
    if (isOnboarded && !isReplace) router.replace('/dashboard');
  }, [isOnboarded, isReplace, router]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    void run(file);
  };

  const handleSave = () => {
    if (state.stage !== 'complete') return;
    setHealthProfile(state.profile);
    const { healthProfile, reportHistory } = useGutCheckStore.getState();
    void fetch('/api/drive/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: healthProfile,
        history: reportHistory,
        syncedAt: new Date().toISOString(),
      }),
    }).catch(() => {
      // Local save is already complete; Drive sync remains optional.
    });
    router.push('/dashboard');
  };

  const isActive = state.stage !== 'idle';
  const isError = state.stage === 'error';
  const isGuardrailBlocked = state.stage === 'guardrail_blocked';
  const isComplete = state.stage === 'complete';
  const isUnitAmbiguous = state.stage === 'unit_ambiguous';
  const isProcessing = ['extracting', 'guardrail_checking', 'translating'].includes(state.stage);

  return (
    <div className="min-h-[100dvh] min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl sm:text-5xl leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            {isReplace ? (
              <>
                Update your profile.<br />
                <span style={{ color: 'var(--tl-prioritize)' }}>New report, same trust.</span>
              </>
            ) : (
              <>
                Know your body.<br />
                Trust your meals.
              </>
            )}
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            {isReplace
              ? 'Upload a newer lab report. We will refresh your food rules and keep your history of changes on this device.'
              : 'Upload your blood report once. Get everyday food wisdom — for every meal, every menu.'}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isActive && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FileDropzone onFile={handleFile} />
              <p
                className="mt-4 text-xs text-center"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Your profile is stored on this device. Report processing uses the app over an encrypted
                request — we do not use it to train models.
              </p>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {selectedFile && <PDFPreview file={selectedFile} />}
              <AgentProgressStepper
                stage={state.stage}
                streamedText={state.stage === 'translating' ? (state as { stage: string; streamedText: string }).streamedText : undefined}
              />
            </motion.div>
          )}

          {isUnitAmbiguous && state.stage === 'unit_ambiguous' && (
            <motion.div
              key="unit-ambiguous"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="gc-card p-6 space-y-5"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em]" style={{ color: 'var(--text-muted)' }}>
                  Unit clarification
                </p>
                <h2
                  className="mt-2 text-2xl"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
                >
                  We need one detail before continuing.
                </h2>
                <p className="mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  We noticed {state.markers.join(', ')} was listed without a clear unit. Which unit appears on your report?
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" className="gc-btn-primary min-h-12" onClick={() => void resolveUnitAmbiguity('ng/mL')}>
                  ng/mL
                </button>
                <button type="button" className="gc-btn-secondary min-h-12" onClick={() => void resolveUnitAmbiguity('nmol/L')}>
                  nmol/L
                </button>
              </div>

              <button type="button" className="text-sm underline underline-offset-4" style={{ color: 'var(--text-muted)' }} onClick={reset}>
                Upload a different report
              </button>
            </motion.div>
          )}

          {isGuardrailBlocked && state.stage === 'guardrail_blocked' && (
            <GuardrailAlert result={state.result} onDismiss={reset} />
          )}

          {isComplete && state.stage === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ProfileConfirmation profile={state.profile} onSave={handleSave} />
            </motion.div>
          )}

          {isError && state.stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="gc-card p-6 text-center"
            >
              <p className="mb-4" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
                {state.message}
              </p>
              <button type="button" onClick={reset} className="gc-btn-secondary">
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<OnboardLoading />}>
      <OnboardContent />
    </Suspense>
  );
}
