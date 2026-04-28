'use client';

import { signIn, useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, X } from 'lucide-react';
import { useState } from 'react';

export function SaveProfilePrompt() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);

  // If user is logged in, or has dismissed the prompt, don't show it
  if (session || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
        className="mb-6 p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 relative"
        style={{
          backgroundColor: 'var(--tl-prioritize-bg)',
          borderColor: 'var(--tl-prioritize)',
        }}
      >
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white shadow-sm" style={{ color: 'var(--tl-prioritize)' }}>
            <Cloud size={24} />
          </div>
          <div>
            <h3 className="font-medium text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              Save your profile
            </h3>
            <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
              Your profile is currently saved locally on this device. Sign in to sync it to your Google Drive so you never lose it.
            </p>
          </div>
        </div>

        <button
          onClick={() => signIn('google')}
          className="w-full md:w-auto px-6 py-2 rounded-lg font-medium whitespace-nowrap hover:scale-105 transition-transform"
          style={{
            backgroundColor: 'var(--tl-prioritize)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          Sign in with Google
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
