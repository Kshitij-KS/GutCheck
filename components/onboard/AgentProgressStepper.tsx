'use client';

// components/onboard/AgentProgressStepper.tsx
// 3-step visual stepper showing pipeline stage

import { motion } from 'framer-motion';
import { Check, Loader2, Shield, Brain } from 'lucide-react';

interface Step {
  label: string;
  status: 'waiting' | 'active' | 'done';
}

interface AgentProgressStepperProps {
  stage: string;
  streamedText?: string;
}

export function AgentProgressStepper({ stage, streamedText }: AgentProgressStepperProps) {
  const steps: Step[] = [
    {
      label: 'Reading your report',
      status:
        stage === 'extracting' ? 'active'
        : ['guardrail_checking', 'translating', 'complete'].includes(stage) ? 'done'
        : 'waiting',
    },
    {
      label: 'Checking safety',
      status:
        stage === 'guardrail_checking' ? 'active'
        : ['translating', 'complete'].includes(stage) ? 'done'
        : 'waiting',
    },
    {
      label: 'Building your profile',
      status:
        stage === 'translating' ? 'active'
        : stage === 'complete' ? 'done'
        : 'waiting',
    },
  ];

  const icons = [Brain, Shield, Brain];

  return (
    <div className="w-full max-w-md mx-auto">
      {steps.map((step, i) => {
        const Icon = icons[i] ?? Brain;
        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
            className="flex items-start gap-4 mb-6"
          >
            {/* Step indicator */}
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  step.status === 'done' ? 'var(--tl-prioritize-bg)'
                  : step.status === 'active' ? 'var(--bg-secondary)'
                  : 'var(--bg-secondary)',
                border: `2px solid ${
                  step.status === 'done' ? 'var(--tl-prioritize)'
                  : step.status === 'active' ? 'var(--accent)'
                  : 'var(--border-strong)'
                }`,
              }}
            >
              {step.status === 'done' ? (
                <Check size={16} style={{ color: 'var(--tl-prioritize)' }} />
              ) : step.status === 'active' ? (
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
              ) : (
                <Icon size={16} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1.5">
              <p
                className="text-sm font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: step.status === 'waiting' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                {step.label}
              </p>

              {/* Streaming text for translation step */}
              {step.status === 'active' && i === 2 && (
                <div className="mt-2">
                  {streamedText && streamedText.length > 0 ? (
                    <p
                      className="text-xs max-h-32 overflow-y-auto leading-relaxed rounded-lg p-2"
                      style={{
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        backgroundColor: 'var(--bg-secondary)',
                      }}
                    >
                      {streamedText}
                    </p>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Analyzing markers and generating lifestyle recommendations&hellip;
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
