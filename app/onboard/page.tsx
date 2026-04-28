'use client';

// app/onboard/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useAgentPipeline } from '@/hooks/useAgentPipeline';
import { FileDropzone } from '@/components/onboard/FileDropzone';
import { PDFPreview } from '@/components/onboard/PDFPreview';
import { AgentProgressStepper } from '@/components/onboard/AgentProgressStepper';
import { GuardrailAlert } from '@/components/onboard/GuardrailAlert';
import { ProfileConfirmation } from '@/components/onboard/ProfileConfirmation';
import { useState } from 'react';

export function OnboardPage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { state, run, reset } = useAgentPipeline();

  // Redirect if already onboarded
  useEffect(() => {
    if (isOnboarded) router.replace('/dashboard');
  }, [isOnboarded, router]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    void run(file);
  };

  const handleSave = () => {
    router.push('/dashboard');
  };

  const isActive = state.stage !== 'idle';
  const isError = state.stage === 'error';
  const isGuardrailBlocked = state.stage === 'guardrail_blocked';
  const isComplete = state.stage === 'complete';
  const isProcessing = ['extracting', 'guardrail_checking', 'translating'].includes(state.stage);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h1
            className="text-5xl leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Know your body.<br />Trust your meals.
          </h1>
          <p
            className="text-lg leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            Upload your blood report once. Get everyday food wisdom — for every meal, every menu.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: File upload */}
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
                Your report stays on your device. Nothing is stored on our servers.
              </p>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {selectedFile && (
                <PDFPreview file={selectedFile} />
              )}
              <AgentProgressStepper
                stage={state.stage}
                streamedText={state.stage === 'translating' ? (state as { stage: string; streamedText: string }).streamedText : undefined}
              />
            </motion.div>
          )}

          {/* Step 3: Guardrail blocked */}
          {isGuardrailBlocked && state.stage === 'guardrail_blocked' && (
            <GuardrailAlert result={state.result} onDismiss={reset} />
          )}

          {/* Step 4: Complete — profile confirmation */}
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

          {/* Error state */}
          {isError && state.stage === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="gc-card p-6 text-center"
            >
              <p
                className="mb-4"
                style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
              >
                {state.message}
              </p>
              <button onClick={reset} className="gc-btn-secondary">
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OnboardPage;
