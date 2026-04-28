'use client';

// components/scan/MindfulNudge.tsx
// Slides in from bottom after 8th scan — auto-dismisses after 6s
// NEVER hard-blocks

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface MindfulNudgeProps {
  message: string;
  onDismiss: () => void;
}

export function MindfulNudge({ message, onDismiss }: MindfulNudgeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 6000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
        >
          <div
            className="gc-card px-5 py-4 max-w-md w-full flex items-start gap-3"
            style={{ backgroundColor: 'var(--tl-prioritize-bg)' }}
          >
            <p
              className="flex-1 text-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}
            >
              {message}
            </p>
            <button
              onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
              style={{ color: 'var(--text-muted)' }}
              className="flex-shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
