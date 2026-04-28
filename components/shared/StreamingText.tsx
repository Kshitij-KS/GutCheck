'use client';

// components/shared/StreamingText.tsx
// Renders streaming tokens with gentle opacity fade-in
// No typewriter cursor — words appear smoothly

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  className?: string;
}

export function StreamingText({ text, className }: StreamingTextProps) {
  const words = text.split(' ').filter(Boolean);
  const prevWordsRef = useRef<string[]>([]);

  useEffect(() => {
    prevWordsRef.current = words;
  });

  return (
    <p
      className={className}
      style={{
        fontFamily: 'var(--font-body)',
        color: 'var(--text-primary)',
        lineHeight: '1.75',
      }}
    >
      <AnimatePresence>
        {words.map((word, i) => (
          <motion.span
            key={`${i}-${word}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            style={{ display: 'inline' }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </AnimatePresence>
    </p>
  );
}
