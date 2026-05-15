'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function AppWelcome() {
  const router = useRouter();

  return (
    <div className="min-h-[100dvh] bg-[var(--bg-primary)] flex flex-col px-6 py-12 gc-safe-top">
      <div className="flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-[var(--tl-prioritize-bg)] flex items-center justify-center mb-8">
            <span className="text-3xl">🌿</span>
          </div>
          <h1 
            className="text-5xl leading-[1.1] mb-6"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Welcome to <br />
            <span className="italic" style={{ color: 'var(--tl-prioritize)' }}>GutCheck</span>
          </h1>
          <p 
            className="text-lg mb-8"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            Your localized, privacy-first companion for clinical nutrition.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="gc-pb-safe"
      >
        <button
          onClick={() => router.push('/onboard')}
          className="w-full gc-btn-primary flex items-center justify-between px-6 py-4 rounded-xl text-lg hover:scale-[1.02] transition-transform"
          style={{ backgroundColor: 'var(--tl-prioritize)', color: '#fff' }}
        >
          <span>Next</span>
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
