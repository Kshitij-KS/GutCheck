'use client';

// app/chef-card/page.tsx

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { ChefCard } from '@/components/chef-card/ChefCard';

export default function ChefCardPage() {
  const router = useRouter();
  const { isOnboarded, healthProfile } = useGutCheckStore();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  if (!healthProfile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Chef&apos;s card
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Share this with a restaurant, family cook, or host so they can serve you well.
        </p>
      </div>
      <ChefCard rules={healthProfile.consolidatedRules} content={healthProfile.chefCardContent} />
    </div>
  );
}
