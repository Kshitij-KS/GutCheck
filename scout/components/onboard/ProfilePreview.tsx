'use client';

// components/onboard/ProfilePreview.tsx

import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import type { HealthProfile } from '@/types';
import { getMarkerStatusColor } from '@/lib/utils';

interface ProfilePreviewProps {
  profile: HealthProfile;
  onConfirm: () => void;
}

export function ProfilePreview({ profile, onConfirm }: ProfilePreviewProps) {
  const nonOptimalMarkers = profile.markers.filter((m) => m.status !== 'OPTIMAL');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Success header */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <CheckCircle className="h-6 w-6 text-emerald-400 flex-shrink-0" />
        <div>
          <p className="font-semibold text-white">Analysis Complete</p>
          <p className="text-sm text-slate-400">
            Found {profile.markers.length} markers · {nonOptimalMarkers.length} require dietary attention
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4">
        <p className="text-sm text-slate-300 leading-relaxed">{profile.overallSummary}</p>
      </div>

      {/* Primary concerns */}
      {profile.primaryConcerns.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">Primary Concerns</h3>
          <div className="flex flex-wrap gap-2">
            {profile.primaryConcerns.map((concern) => (
              <span
                key={concern}
                className="flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 text-sm text-orange-300"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {concern}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Markers preview */}
      {nonOptimalMarkers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-400 uppercase tracking-wide">
            Markers Requiring Attention
          </h3>
          <div className="space-y-2">
            {nonOptimalMarkers.slice(0, 4).map((marker) => {
              const colors = getMarkerStatusColor(marker.status);
              return (
                <div
                  key={marker.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${colors.dot}`} />
                    <div>
                      <p className={`text-sm font-medium ${colors.text}`}>{marker.name}</p>
                      <p className="text-xs text-slate-500">{marker.value} {marker.unit}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {marker.status}
                  </span>
                </div>
              );
            })}
            {nonOptimalMarkers.length > 4 && (
              <p className="text-center text-sm text-slate-500">
                +{nonOptimalMarkers.length - 4} more markers
              </p>
            )}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-start gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-600" />
        <p>Your profile is stored only on this device. Nothing is sent to external servers except during analysis.</p>
      </div>

      {/* Confirm button */}
      <button
        onClick={onConfirm}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-4 text-base font-semibold text-white hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/25"
      >
        Save Profile & Start Scanning
        <ArrowRight className="h-5 w-5" />
      </button>
    </motion.div>
  );
}
