'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileText, Shield, Sparkles, ChefHat, Activity } from 'lucide-react';

export function WebLanding() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <section className="relative px-4 py-24 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-4xl"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium mb-6">
            Privacy-First Clinical AI
          </span>
          <h1 
            className="text-5xl md:text-7xl leading-tight mb-6"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 400 }}
          >
            Know your body.<br />
            <span className="italic" style={{ color: 'var(--tl-prioritize)' }}>Trust your meals.</span>
          </h1>
          <p 
            className="text-xl md:text-2xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Upload your blood report once. Get everyday, India-aware food wisdom — for every meal, every menu, without your data ever leaving your device.
          </p>
          <button
            onClick={() => router.push('/onboard')}
            className="gc-btn-primary px-8 py-4 text-lg rounded-full hover:scale-105 transition-transform"
            style={{ backgroundColor: 'var(--tl-prioritize)', color: '#fff' }}
          >
            Upload Your Report
          </button>
        </motion.div>
      </section>

      {/* Value Props */}
      <section className="px-4 py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield size={32} />}
            title="Clean Slate Privacy"
            desc="Your medical data never hits our servers. All extraction and caching happens locally on your device."
          />
          <FeatureCard 
            icon={<ChefHat size={32} />}
            title="Restaurant Ready"
            desc="Scan any menu or generate a polite 'Chef's Card' to hand to restaurant staff with your strict dietary needs."
          />
          <FeatureCard 
            icon={<Activity size={32} />}
            title="Clinical Grade"
            desc="Deterministic safety guardrails intercept critical markers instantly, preventing dangerous AI hallucinations."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 py-24 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl mb-12" style={{ fontFamily: 'var(--font-display)' }}>
          How GutCheck Works
        </h2>
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <Step num="1" title="Upload" desc="Drop your PDF or take a photo of your lab report." />
          <div className="w-1 h-8 md:w-8 md:h-1 bg-[var(--border)]" />
          <Step num="2" title="Analyze" desc="Our localized AI builds your custom nutritional profile." />
          <div className="w-1 h-8 md:w-8 md:h-1 bg-[var(--border)]" />
          <Step num="3" title="Scan" desc="Scan menus or grocery lists to see what is safe for you." />
        </div>
        <div className="mt-16">
          <button
            onClick={() => router.push('/onboard')}
            className="gc-btn-secondary px-8 py-3 rounded-full"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="gc-card p-8 flex flex-col items-center text-center">
      <div className="mb-4 p-4 rounded-full bg-[var(--bg-primary)] text-[var(--accent)]">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-3" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-[var(--text-secondary)] leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center max-w-xs">
      <div className="w-12 h-12 rounded-full bg-[var(--tl-prioritize)] text-white flex items-center justify-center text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        {num}
      </div>
      <h4 className="text-lg font-medium mb-2">{title}</h4>
      <p className="text-sm text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}
