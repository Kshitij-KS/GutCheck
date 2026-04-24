'use client';

// components/onboard/ExtractionProgress.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

type Step = 'upload' | 'extracting' | 'analyzing' | 'done';

interface ExtractionProgressProps {
  currentStep: Step;
  message?: string;
}

const steps: { key: Step; label: string; description: string }[] = [
  { key: 'upload', label: 'Report Uploaded', description: 'File received and validated' },
  { key: 'extracting', label: 'Reading Report', description: 'Extracting text from your document' },
  { key: 'analyzing', label: 'Clinical Analysis', description: 'Gemini analyzing blood markers' },
  { key: 'done', label: 'Profile Ready', description: 'Your health profile has been created' },
];

const stepOrder: Record<Step, number> = {
  upload: 0,
  extracting: 1,
  analyzing: 2,
  done: 3,
};

export function ExtractionProgress({ currentStep, message }: ExtractionProgressProps) {
  const currentIndex = stepOrder[currentStep];

  return (
    <div className="w-full space-y-6">
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
                ) : (
                  <Circle className="h-6 w-6 text-slate-700" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${isCompleted || isActive ? 'text-white' : 'text-slate-600'}`}>
                  {step.label}
                </p>
                <p className={`text-xs ${isCompleted || isActive ? 'text-slate-400' : 'text-slate-700'}`}>
                  {isActive && message ? message : step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIndex) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Live message */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-3"
          >
            <p className="text-sm text-slate-300 font-mono">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
