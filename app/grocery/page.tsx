'use client';

// app/grocery/page.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { useGroceryScan } from '@/hooks/useGroceryScan';
import { GroceryAuditResults } from '@/components/grocery/GroceryAuditResults';
import { LoadingOrb } from '@/components/shared/LoadingOrb';

export default function GroceryPage() {
  const router = useRouter();
  const isOnboarded = useGutCheckStore((s) => s.isOnboarded);
  const [groceryList, setGroceryList] = useState('');
  const { state, audit, reset } = useGroceryScan();

  useEffect(() => {
    if (!isOnboarded) router.replace('/');
  }, [isOnboarded, router]);

  const EXAMPLE_LIST = `Amul butter
Aashirvaad atta (whole wheat)
Britannia Marie biscuits
Saffola Gold oil
Fortune fortified soya chunks
Haldiram's bhujia sev
Horlicks
Tropicana orange juice
Daawat basmati rice`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
        >
          Grocery auditor
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Paste your grocery list — items, brands, or product names — and get profile-matched guidance.
        </p>
      </div>

      {/* Input */}
      {state.status !== 'complete' && (
        <div className="space-y-4">
          <textarea
            value={groceryList}
            onChange={(e) => setGroceryList(e.target.value)}
            placeholder={`One item per line:\n${EXAMPLE_LIST}`}
            className="gc-input gc-textarea"
            rows={10}
          />
          <div className="flex gap-3">
            <button
              onClick={() => void audit(groceryList)}
              disabled={!groceryList.trim() || state.status === 'scanning'}
              className="gc-btn-primary flex-1 disabled:opacity-50"
            >
              {state.status === 'scanning' ? 'Auditing...' : 'Audit my list'}
            </button>
            {groceryList === '' && (
              <button
                onClick={() => setGroceryList(EXAMPLE_LIST)}
                className="gc-btn-secondary text-sm"
              >
                Try example
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {state.status === 'scanning' && (
        <div className="mt-8">
          <LoadingOrb messages={['Reading your grocery list...', 'Checking brand ingredients...', 'Finding better alternatives...']} />
        </div>
      )}

      {/* Error */}
      {state.status === 'error' && (
        <div className="mt-6 gc-card p-4">
          <p style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
            {state.message}
          </p>
        </div>
      )}

      {/* Results */}
      {state.status === 'complete' && (
        <div className="space-y-6">
          <GroceryAuditResults result={state.result} />
          <button onClick={reset} className="gc-btn-secondary w-full">
            Audit another list
          </button>
        </div>
      )}
    </div>
  );
}
