'use client';

// components/grocery/RecentAudits.tsx
// Collapsed-by-default list of saved grocery audits. Reopen / delete / clear.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, History, Trash2, X } from 'lucide-react';
import { useGutCheckStore } from '@/store/gutcheck.store';
import { toast } from '@/store/ui.store';
import { formatDate } from '@/lib/utils';
import { GroceryAuditResults } from '@/components/grocery/GroceryAuditResults';
import type { GroceryAuditResult } from '@/types';

export function RecentAudits() {
  const groceryHistory = useGutCheckStore((s) => s.groceryHistory);
  const removeGroceryResult = useGutCheckStore((s) => s.removeGroceryResult);
  const clearGroceryHistory = useGutCheckStore((s) => s.clearGroceryHistory);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (groceryHistory.length === 0) return null;

  return (
    <div className="mt-8">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-2"
      >
        <span className="flex items-center gap-2">
          <History size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
            Recent audits
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {groceryHistory.length}
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {groceryHistory.map((audit) => (
                <RecentAuditRow
                  key={audit.timestamp}
                  audit={audit}
                  isExpanded={expanded === audit.timestamp}
                  onToggle={() => setExpanded((e) => (e === audit.timestamp ? null : audit.timestamp))}
                  onDelete={() => {
                    removeGroceryResult(audit.timestamp);
                    toast.info('Audit removed');
                  }}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  clearGroceryHistory();
                  toast.info('Cleared audit history');
                }}
                className="flex items-center gap-1.5 text-xs mt-1"
                style={{ color: 'var(--tl-avoid)', fontFamily: 'var(--font-body)' }}
              >
                <Trash2 size={12} />
                Clear all
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecentAuditRow({
  audit,
  isExpanded,
  onToggle,
  onDelete,
}: {
  audit: GroceryAuditResult;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="gc-card p-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onToggle} className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
            {audit.items.length} {audit.items.length === 1 ? 'item' : 'items'} audited
          </p>
          <p className="text-xs mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {formatDate(audit.timestamp)}
          </p>
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete this audit"
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          <X size={14} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <GroceryAuditResults result={audit} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
