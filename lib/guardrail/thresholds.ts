// lib/guardrail/thresholds.ts
// DETERMINISTIC guardrail — runs BEFORE any AI call, zero API usage
// If ANY marker breaches CRITICAL_THRESHOLDS → return passed: false immediately
// The pipeline STOPS here — Agent 3 never runs

import { CRITICAL_THRESHOLDS, STANDARD_REDIRECT } from '@/constants/critical-thresholds';
import type { BloodMarker, GuardrailResult, CriticalMarkerFlag } from '@/types';

// Marker ID aliases for threshold matching — maps extracted IDs to threshold keys
const THRESHOLD_ID_MAP: Record<string, keyof typeof CRITICAL_THRESHOLDS> = {
  blood_glucose_fasting: 'blood_glucose_fasting',
  fasting_glucose: 'blood_glucose_fasting',
  fbg: 'blood_glucose_fasting',
  fbs: 'blood_glucose_fasting',
  hba1c: 'hba1c',
  a1c: 'hba1c',
  total_cholesterol: 'total_cholesterol',
  cholesterol: 'total_cholesterol',
  ldl: 'ldl',
  ldl_cholesterol: 'ldl',
  triglycerides: 'triglycerides',
  tg: 'triglycerides',
  uric_acid: 'uric_acid',
  platelet_count: 'platelet_count',
  plt: 'platelet_count',
  hemoglobin: 'hemoglobin',
  hb: 'hemoglobin',
  serum_creatinine: 'serum_creatinine',
  creatinine: 'serum_creatinine',
  sgot_ast: 'sgot_ast',
  sgot: 'sgot_ast',
  ast: 'sgot_ast',
  sgpt_alt: 'sgpt_alt',
  sgpt: 'sgpt_alt',
  alt: 'sgpt_alt',
  sodium: 'sodium',
  potassium: 'potassium',
  tsh: 'tsh',
};

/**
 * Deterministic guardrail check.
 * Runs synchronously with ZERO external API calls.
 * Must be called BEFORE any AI agent.
 */
export function runDeterministicGuardrail(markers: BloodMarker[]): GuardrailResult {
  const criticalMarkers: CriticalMarkerFlag[] = [];

  for (const marker of markers) {
    const thresholdKey = THRESHOLD_ID_MAP[marker.id.toLowerCase()];
    if (!thresholdKey) continue;

    const threshold = CRITICAL_THRESHOLDS[thresholdKey];
    const value = marker.numericValue;

    if ('max' in threshold && threshold.max !== undefined && value > threshold.max) {
      criticalMarkers.push({
        markerId: marker.id,
        markerName: marker.name,
        value,
        threshold: `max ${threshold.max} ${threshold.unit}`,
        direction: 'above',
      });
    }

    if ('min' in threshold && threshold.min !== undefined && value < threshold.min) {
      criticalMarkers.push({
        markerId: marker.id,
        markerName: marker.name,
        value,
        threshold: `min ${threshold.min} ${threshold.unit}`,
        direction: 'below',
      });
    }
  }

  if (criticalMarkers.length > 0) {
    return {
      passed: false,
      criticalMarkers,
      emergencySymptomDetected: false,
      specialPopulationDetected: 'none',
      redirectMessage: STANDARD_REDIRECT,
    };
  }

  return {
    passed: true,
    criticalMarkers: [],
    emergencySymptomDetected: false,
    specialPopulationDetected: 'none',
    redirectMessage: null,
  };
}
