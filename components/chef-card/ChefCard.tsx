'use client';

import { useRef } from 'react';
import { Clipboard, Printer } from 'lucide-react';
import type { ChefCardContent, ConsolidatedRules } from '@/types';

interface ChefCardProps {
  rules: ConsolidatedRules;
  content?: ChefCardContent;
  userName?: string;
}

export function ChefCard({ rules, content, userName }: ChefCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const title = content?.title ?? (userName ? `${userName}'s food card` : 'My food card');
  const intro = content?.intro ?? 'I have some dietary preferences I would appreciate your help with:';
  const strictAvoid = content?.strictAvoidList ?? rules.strictAvoid;
  const moderate = content?.moderateList ?? rules.moderate;
  const prioritize = rules.prioritize;
  const notes = [content?.allergyNotes, content?.additionalNote].filter((note): note is string => Boolean(note));

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const text = [
      title,
      intro,
      strictAvoid.length > 0 ? `Please avoid: ${strictAvoid.join(', ')}` : null,
      moderate.length > 0 ? `Best in moderation: ${moderate.join(', ')}` : null,
      notes.length > 0 ? `Notes: ${notes.join(' ')}` : null,
    ].filter(Boolean).join('\n');
    await navigator.clipboard?.writeText(text);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row no-print">
        <button
          type="button"
          onClick={handlePrint}
          className="gc-btn-secondary flex items-center justify-center gap-2"
        >
          <Printer size={14} />
          Print this card
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="gc-btn-secondary flex items-center justify-center gap-2"
        >
          <Clipboard size={14} />
          Copy text
        </button>
      </div>

      <div
        ref={cardRef}
        className="gc-card p-8 max-w-lg print:shadow-none"
        id="chef-card-print"
        style={{ border: '1.5px solid var(--border-strong)' }}
      >
        <div className="mb-6 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2
            className="text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', fontWeight: 500 }}
          >
            {title}
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}
          >
            {intro}
          </p>
        </div>

        {prioritize.length > 0 && (
          <ChefCardSection
            label="I eat best with"
            color="var(--tl-prioritize)"
            background="var(--tl-prioritize-bg)"
            items={prioritize.slice(0, 10)}
          />
        )}

        {moderate.length > 0 && (
          <ChefCardSection
            label="I eat mindfully with"
            color="var(--tl-moderate)"
            background="var(--tl-moderate-bg)"
            items={moderate.slice(0, 8)}
          />
        )}

        {strictAvoid.length > 0 && (
          <ChefCardSection
            label="Please keep out of my meal"
            color="var(--tl-avoid)"
            background="var(--tl-avoid-bg)"
            items={strictAvoid.slice(0, 8)}
          />
        )}

        {rules.cuisineGuidance && (
          <div
            className="mt-4 p-4 rounded-xl text-sm leading-relaxed border-t pt-4"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {rules.cuisineGuidance}
          </div>
        )}

        {notes.length > 0 && (
          <div
            className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {notes.join(' ')}
          </div>
        )}
      </div>
    </div>
  );
}

function ChefCardSection({
  label,
  color,
  background,
  items,
}: {
  label: string;
  color: string;
  background: string;
  items: string[];
}) {
  return (
    <div className="mb-5">
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color, fontFamily: 'var(--font-body)' }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="px-2.5 py-1 rounded-full text-sm"
            style={{
              backgroundColor: background,
              color,
              fontFamily: 'var(--font-body)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
