'use client';

// components/shared/LoadingOrb.tsx
// Organic "breathing" orb with rotating contextual messages
// animate: scale:[1,1.08,1] transition: repeat:Infinity, duration:2.4, ease:'easeInOut'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MESSAGES = [
  'Reading your markers...',
  'Aligning with your profile...',
  'Consulting regional cuisine knowledge...',
  'Building your personalized guide...',
];

interface LoadingOrbProps {
  messages?: string[];
}

export function LoadingOrb({ messages = MESSAGES }: LoadingOrbProps) {
  const [messageIdx, setMessageIdx] = useState(0);
  const [messageVisible, setMessageVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageVisible(false);
      setTimeout(() => {
        setMessageIdx((i) => (i + 1) % messages.length);
        setMessageVisible(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      {/* Breathing orb */}
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-full"
          style={{ backgroundColor: 'var(--tl-prioritize-bg)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        {/* Inner orb */}
        <div
          className="absolute inset-3 rounded-full"
          style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }}
        />
      </div>

      {/* Rotating message */}
      <motion.p
        key={messageIdx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: messageVisible ? 1 : 0, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-sm text-center"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          maxWidth: '200px',
        }}
      >
        {messages[messageIdx]}
      </motion.p>
    </div>
  );
}
