import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GutCheck — Know your body. Trust your meals.',
  description:
    'GutCheck translates your blood report into everyday food wisdom. Privacy-first, India-aware guidance — your profile stays on your device; scans are processed securely and are not used to train public models. Not medical advice.',
  keywords: ['blood report', 'nutrition', 'diet', 'wellness', 'health', 'India', 'food guidance', 'privacy'],
  openGraph: {
    title: 'GutCheck — Know your body. Trust your meals.',
    description: 'GutCheck translates your blood report into everyday food wisdom.',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GutCheck',
  },
};

export const viewport = {
  width: 'device-width' as const,
  initialScale: 1,
  themeColor: '#5A7A5A',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <body
        style={{
          fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
