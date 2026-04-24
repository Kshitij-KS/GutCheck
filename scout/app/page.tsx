'use client';

// app/page.tsx — Landing Page

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Upload,
  User,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Brain,
  ChevronRight,
} from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Blood Report',
    description:
      'Share your PDF or image blood test report. GutCheck reads every marker — HbA1c, LDL, uric acid, thyroid, and more.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: User,
    step: '02',
    title: 'Get Your Food Profile',
    description:
      'Gemini generates a personalized food rules profile from your markers — specific to your degree of abnormality.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Search,
    step: '03',
    title: 'Scan Any Menu',
    description:
      'Paste any restaurant menu. GutCheck runs a two-pass clinical analysis and ranks every dish for your specific health profile.',
    color: 'from-emerald-500 to-teal-600',
  },
];

const features = [
  {
    icon: Brain,
    title: 'Gemini 2.5 Pro Intelligence',
    description: 'Powered by Google\'s most capable free-tier model with 1M token context — handles any blood report or menu.',
  },
  {
    icon: ShieldCheck,
    title: 'Security First',
    description: 'Prompt injection detection, input sanitization, and response validation run before every AI call.',
  },
  {
    icon: Zap,
    title: 'Two-Pass Efficiency',
    description: 'Menu extraction compresses dish lists first, then clinical scoring runs on lean data — fast and token-efficient.',
  },
  {
    icon: Activity,
    title: 'Indian Cuisine Aware',
    description: 'Food rules include dal, roti, sabzi, ghee, paneer and context-aware guidance for Indian restaurant menus.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);

  useEffect(() => {
    if (isOnboarded) {
      router.replace('/gutcheck');
    }
  }, [isOnboarded, router]);

  return (
    <div className="relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-sm text-emerald-400">
            <Activity className="h-3.5 w-3.5" />
            Powered by Gemini 2.5 Pro · Free Tier
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            Your blood report.{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Every menu.
            </span>{' '}
            Instantly decoded.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            GutCheck reads your blood test report, builds a personalized clinical food profile, and
            analyzes any restaurant menu through that lens — in real time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/onboard"
              id="get-started-cta"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-2xl shadow-emerald-500/30"
            >
              Upload Your Blood Report
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-slate-700 px-8 py-4 text-base font-medium text-slate-300 hover:bg-slate-800/50 transition-all"
            >
              See How It Works
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>

          {/* Trust indicator */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="h-4 w-4" />
            Your profile lives on your device. Nothing stored on our servers.
          </div>
        </motion.div>

        {/* Demo stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 mx-auto max-w-3xl"
        >
          {[
            { value: '20+', label: 'Blood Markers' },
            { value: '2-Pass', label: 'Menu Analysis' },
            { value: '100%', label: 'Client-Side Storage' },
            { value: '₹0', label: 'Operating Cost' },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">How GutCheck Works</h2>
          <p className="mt-4 text-slate-400">Three steps from blood report to personalized menu guidance</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
              >
                <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="absolute top-6 right-6 text-4xl font-black text-slate-800">
                  {step.step}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Built for Production</h2>
          <p className="mt-4 text-slate-400">Not a hackathon shortcut — every decision reflects real-world clinical thinking</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800">
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-3xl px-4 py-20 sm:px-6 text-center">
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-12">
          <h2 className="text-3xl font-bold text-white">Ready to scan your next meal?</h2>
          <p className="mt-4 text-slate-400">Upload your blood report once. Use GutCheck everywhere.</p>
          <Link
            href="/onboard"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-semibold text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
