'use client';

// components/layout/Navbar.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, User, Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGutCheckStore } from '@/store/gutcheck.store';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/gutcheck', label: 'GutCheck', icon: Search },
];

export function Navbar() {
  const pathname = usePathname();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            GutCheck
          </span>
          <span className="hidden sm:block text-xs text-slate-400 font-normal mt-0.5">
            Clinical Menu Intelligence
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            const isLocked = (href === '/profile' || href === '/gutcheck') && !isOnboarded;

            return (
              <Link
                key={href}
                href={isLocked ? '/onboard' : href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200',
                  isLocked && 'opacity-50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            );
          })}

          {!isOnboarded && (
            <Link
              href="/onboard"
              className="ml-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
