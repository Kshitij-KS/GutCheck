import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GutCheck — AI-Powered Clinical Menu Intelligence',
  description:
    'Upload your blood test report, get a personalized food profile, and instantly decode any restaurant menu through your clinical lens. Powered by Gemini 2.5 Pro.',
  keywords: ['blood report', 'menu analysis', 'health', 'diet', 'nutrition', 'AI', 'clinical'],
  openGraph: {
    title: 'GutCheck — Clinical Menu Intelligence',
    description: 'Your blood report. Every menu. Instantly decoded.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-slate-950 text-slate-200 antialiased min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
