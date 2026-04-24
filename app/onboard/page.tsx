'use client';

// app/onboard/page.tsx

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCw } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { FileDropzone } from '@/components/onboard/FileDropzone';
import { ExtractionProgress } from '@/components/onboard/ExtractionProgress';
import { ProfilePreview } from '@/components/onboard/ProfilePreview';
import { useBloodAnalysis } from '@/hooks/useBloodAnalysis';



export default function OnboardPage() {
  const router = useRouter();
  const { state, analyze, reset } = useBloodAnalysis();

  const handleFileReady = useCallback(
    async (
      _file: File,
      extractedText: string,
      imageBase64?: string,
      mimeType?: 'image/jpeg' | 'image/png' | 'image/webp'
    ) => {
      await analyze(extractedText, imageBase64, mimeType);
    },
    [analyze]
  );

  const handleConfirm = () => {
    router.push('/gutcheck');
  };

  return (
    <PageShell maxWidth="2xl" className="py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20">
          <Activity className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white">Upload Your Blood Report</h1>
        <p className="mt-2 text-slate-400">
          GutCheck will extract your health markers and build a personalized food profile
        </p>
      </div>

      <AnimatePresence mode="wait">
        {(state.status === 'idle' || state.status === 'error') && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <FileDropzone onFileReady={handleFileReady} />

            {state.status === 'error' && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-red-400">Analysis Failed</p>
                    <p className="mt-1 text-sm text-slate-400">{state.message}</p>
                  </div>
                  <button
                    onClick={reset}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              </div>
            )}

            {/* Supported formats */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">What GutCheck can read</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-400">
                <div>✓ Lab reports from any Indian diagnostic center</div>
                <div>✓ Full blood count (CBC)</div>
                <div>✓ Lipid profiles & metabolic panels</div>
                <div>✓ Thyroid, liver, kidney panels</div>
                <div>✓ HbA1c, fasting glucose, insulin</div>
                <div>✓ Vitamins D, B12, Iron studies</div>
              </div>
            </div>
          </motion.div>
        )}

        {(state.status === 'extracting' || state.status === 'analyzing') && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8"
          >
            <ExtractionProgress
              currentStep={state.status === 'extracting' ? 'extracting' : 'analyzing'}
              message={state.message}
            />
          </motion.div>
        )}

        {state.status === 'done' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ProfilePreview profile={state.result} onConfirm={handleConfirm} />
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
