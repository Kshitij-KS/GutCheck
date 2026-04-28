// constants/critical-thresholds.ts
// Deterministic safety thresholds — no AI required

export const CRITICAL_THRESHOLDS = {
  blood_glucose_fasting: { max: 300, unit: 'mg/dL' },
  hba1c:                 { max: 12.0, unit: '%' },
  total_cholesterol:     { max: 350, unit: 'mg/dL' },
  ldl:                   { max: 250, unit: 'mg/dL' },
  triglycerides:         { max: 500, unit: 'mg/dL' },
  uric_acid:             { max: 12.0, unit: 'mg/dL' },
  platelet_count:        { min: 20, unit: '×10³/μL' },
  hemoglobin:            { min: 5.0, unit: 'g/dL' },
  serum_creatinine:      { max: 8.0, unit: 'mg/dL' },
  sgot_ast:              { max: 500, unit: 'U/L' },
  sgpt_alt:              { max: 500, unit: 'U/L' },
  sodium:                { min: 120, max: 160, unit: 'mEq/L' },
  potassium:             { min: 2.5, max: 7.0, unit: 'mEq/L' },
  tsh:                   { max: 50, unit: 'mIU/L' },
} as const;

export const STANDARD_REDIRECT =
  "One or more values in your report require clinical evaluation before dietary guidance is appropriate. Please share this report with your healthcare provider.";

// ─── Emergency Symptom Keywords ───────────────────────────────────────────────
// Checked CLIENT-SIDE before any API call in Quick-Query input

export const EMERGENCY_SYMPTOM_KEYWORDS: string[] = [
  'chest pain', 'chest tightness', 'left arm pain', 'jaw pain',
  'shortness of breath', "can't breathe", 'difficulty breathing',
  'severe pain', 'crushing pain', 'numbness in arm', 'stroke',
  'unconscious', 'fainted', 'heart attack', 'seizure', 'blood vomit',
  'coughing blood', 'passing blood', 'severe allergic', 'anaphylaxis',
];

export const EMERGENCY_RESPONSE =
  "This sounds like it may be a medical emergency. Please call emergency services (112 in India) immediately. GutCheck is not equipped to help with acute symptoms.";

// ─── Special Population Detection ─────────────────────────────────────────────

export const PREGNANCY_KEYWORDS: string[] = [
  'pregnant', 'pregnancy', 'trimester', 'expecting', 'antenatal', 'prenatal', 'gestational',
];

export const PEDIATRIC_AGE_THRESHOLD = 18;

export const PREGNANCY_REDIRECT =
  "GutCheck's current guidance is calibrated for non-pregnant adults. For dietary advice during pregnancy, please consult your OB/GYN or a registered dietitian.";

export const PEDIATRIC_REDIRECT =
  "GutCheck's current guidance is calibrated for adults. For children's dietary guidance, please consult a pediatrician.";
