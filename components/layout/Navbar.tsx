'use client';

// components/layout/Navbar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/scan', label: 'Scan Menu' },
  { href: '/grocery', label: 'Groceries' },
  { href: '/chef-card', label: "Chef's Card" },
  { href: '/history', label: 'History' },
  { href: '/profile', label: 'Profile' },
];

export function Navbar() {
  const pathname = usePathname();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('gc-nav-open');
      closeBtnRef.current?.focus();
    } else {
      document.body.classList.remove('gc-nav-open');
    }
    return () => document.body.classList.remove('gc-nav-open');
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <nav
      className="sticky top-0 z-50 border-b gc-safe-top"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={isOnboarded ? '/dashboard' : '/'}
          className="flex items-center gap-2 min-w-0"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}
        >
          GutCheck
        </Link>

        {isOnboarded && (
          <>
            <div className="hidden md:flex items-center gap-1 flex-wrap justify-end">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--tl-prioritize-bg)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="md:hidden">
              <button
                type="button"
                aria-expanded={mobileOpen ? 'true' : 'false'}
                aria-controls={mobileOpen ? 'gc-mobile-nav' : undefined}
                onClick={() => setMobileOpen((o) => !o)}
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg -mr-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
                <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {isOnboarded && mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] md:hidden bg-[rgba(28,26,23,0.35)] border-0 cursor-pointer p-0"
              style={{ top: 0 }}
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              id="gc-mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Main navigation"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-full max-w-sm md:hidden flex flex-col shadow-2xl border-l"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
                paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
              }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Menu</span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center min-h-12 px-4 rounded-lg text-base font-medium transition-colors"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                        backgroundColor: isActive ? 'var(--tl-prioritize-bg)' : 'transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
