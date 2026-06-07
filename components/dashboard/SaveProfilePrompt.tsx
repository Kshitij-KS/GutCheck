'use client';

import { signIn, useSession } from 'next-auth/react';
import { Cloud, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SaveProfilePrompt() {
  const { data: session } = useSession();
  const [dismissed, setDismissed] = useState(false);
  // Drives the `.gc-enter` fallback path: render hidden, then flip to mounted
  // after the first paint so the CSS transition runs even where
  // @starting-style is unsupported. Native engines use @starting-style.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If user is logged in, or has dismissed the prompt, don't show it.
  // Dismiss is a simple unmount (no exit animation).
  if (session || dismissed) return null;

  return (
    <div
      data-mounted={mounted}
      className={[
        'gc-enter',
        // Grid container: a reserved `close` track guarantees the dismiss
        // control, text content, and sign-in action never overlap.
        'mb-6 p-4 rounded-xl border grid items-center gap-4',
        // Mobile: content + close on row one, action spans both columns below.
        "grid-cols-[1fr_auto] [grid-template-areas:'content_close'_'action_action']",
        // md+: icon | content | action | close on a single row.
        "md:grid-cols-[auto_1fr_auto_auto] md:[grid-template-areas:'icon_content_action_close']",
      ].join(' ')}
      style={{
        backgroundColor: 'var(--tl-prioritize-bg)',
        borderColor: 'var(--tl-prioritize)',
      }}
    >
      {/* On mobile this wrapper is the `content` cell (icon + text inline).
          On md+ it dissolves (display: contents) so the icon and text become
          direct grid items occupying the `icon` and `content` tracks. */}
      <div className="[grid-area:content] flex items-center gap-4 min-w-0 [padding-inline-end:var(--space-2)] md:contents">
        <div
          className="[grid-area:icon] p-3 rounded-full shrink-0"
          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--tl-prioritize)', boxShadow: 'var(--shadow-sm)' }}
        >
          <Cloud size={24} />
        </div>
        <div className="[grid-area:content] min-w-0 [padding-inline-end:var(--space-2)]">
          <h3 className="font-medium text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Save your profile
          </h3>
          <p className="text-sm" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
            Your profile is currently saved locally on this device. Sign in to sync it to your Google Drive so you never lose it.
          </p>
        </div>
      </div>

      <button
        aria-label="Dismiss save profile prompt"
        onClick={() => setDismissed(true)}
        className="gc-touch gc-interactive [grid-area:close] self-start rounded-lg"
        style={{ color: 'var(--text-muted)' }}
      >
        <X size={16} />
      </button>

      <button
        onClick={() => signIn('google')}
        className="gc-interactive [grid-area:action] gc-touch w-full md:w-auto px-6 py-2 rounded-lg font-medium whitespace-nowrap"
        style={{
          backgroundColor: 'var(--tl-prioritize)',
          color: 'var(--bg-elevated)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Sign in with Google
      </button>
    </div>
  );
}
