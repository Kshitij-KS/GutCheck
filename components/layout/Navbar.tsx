'use client';

// components/layout/Navbar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGutCheckStore } from '@/store/gutcheck.store';

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

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={isOnboarded ? '/dashboard' : '/'}
          className="flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)' }}
        >
          GutCheck
        </Link>

        {/* Nav Links — only show when onboarded */}
        {isOnboarded && (
          <div className="hidden md:flex items-center gap-1">
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
  );
}
