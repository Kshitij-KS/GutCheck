'use client';

// components/layout/Navbar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  X,
  MoreHorizontal,
  LayoutDashboard,
  ScanLine,
  ShoppingBasket,
  ChefHat,
  History,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { motion, AnimatePresence } from 'framer-motion';

// Single source of navigation destinations across every breakpoint.
// An `icon` is attached for the mobile bottom bar; the list itself is not
// duplicated anywhere — desktop, bottom bar, and the sheet all read from here.
type NavLink = { href: string; label: string; icon: LucideIcon };

const NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'Scan Menu', icon: ScanLine },
  { href: '/grocery', label: 'Groceries', icon: ShoppingBasket },
  { href: '/chef-card', label: "Chef's Card", icon: ChefHat },
  { href: '/history', label: 'History', icon: History },
  { href: '/profile', label: 'Profile', icon: User },
];

// The bottom bar shows the most-used destinations directly; the remainder
// live behind the "More" control in the slide-out sheet. Together they keep
// all six destinations reachable on mobile (req 11.5).
const PRIMARY_COUNT = 4;
const PRIMARY_LINKS = NAV_LINKS.slice(0, PRIMARY_COUNT);
const OVERFLOW_LINKS = NAV_LINKS.slice(PRIMARY_COUNT);

export function Navbar() {
  const pathname = usePathname();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useFocusTrap<HTMLElement>(mobileOpen);

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

  const overflowActive = OVERFLOW_LINKS.some((link) => link.href === pathname);

  return (
    <>
      {/* ── Persistent top bar (tablet / desktop). Structure unchanged. ────── */}
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
          )}
        </div>
      </nav>

      {/* ── Thumb-zone bottom navigation bar (mobile only). ─────────────────── */}
      {isOnboarded && (
        <nav
          aria-label="Primary"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(8px)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <ul className="flex items-stretch justify-around px-1">
            {PRIMARY_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <li key={link.href} className="flex-1">
                  <Link
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className="gc-touch gc-interactive w-full flex flex-col gap-0.5 py-1.5 rounded-lg"
                    style={{
                      fontFamily: 'var(--font-body)',
                      color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <Icon size={22} strokeWidth={2} aria-hidden="true" />
                    <span style={{ fontSize: '0.6875rem', lineHeight: 1, fontWeight: 500 }}>{link.label}</span>
                  </Link>
                </li>
              );
            })}

            <li className="flex-1">
              <button
                type="button"
                aria-expanded={mobileOpen ? 'true' : 'false'}
                aria-controls={mobileOpen ? 'gc-mobile-nav' : undefined}
                aria-haspopup="dialog"
                onClick={() => setMobileOpen(true)}
                className="gc-touch gc-interactive w-full flex flex-col gap-0.5 py-1.5 rounded-lg"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: mobileOpen || overflowActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <MoreHorizontal size={22} strokeWidth={2} aria-hidden="true" />
                <span style={{ fontSize: '0.6875rem', lineHeight: 1, fontWeight: 500 }}>More</span>
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* ── Slide-out sheet for overflow destinations (mobile only). ────────── */}
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
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
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
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', color: 'var(--text-primary)' }}>More</span>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="gc-touch rounded-lg"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {OVERFLOW_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className="flex items-center gap-3 min-h-12 px-4 rounded-lg text-base font-medium transition-colors"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                        backgroundColor: isActive ? 'var(--tl-prioritize-bg)' : 'transparent',
                      }}
                    >
                      <Icon size={20} strokeWidth={2} aria-hidden="true" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
