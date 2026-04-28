// constants/markers.ts
// Standard blood marker definitions and normal ranges

export interface MarkerDefinition {
  id: string;
  displayName: string;
  standardRange: string;
  unit: string;
  category: 'metabolic' | 'lipid' | 'thyroid' | 'liver' | 'kidney' | 'blood' | 'vitamin' | 'hormone';
}

export const BLOOD_MARKER_DEFINITIONS: MarkerDefinition[] = [
  // Metabolic
  { id: 'blood_glucose_fasting', displayName: 'Fasting Blood Glucose', standardRange: '70–99 mg/dL', unit: 'mg/dL', category: 'metabolic' },
  { id: 'blood_glucose_random', displayName: 'Random Blood Glucose', standardRange: '<140 mg/dL', unit: 'mg/dL', category: 'metabolic' },
  { id: 'hba1c', displayName: 'HbA1c', standardRange: '<5.7%', unit: '%', category: 'metabolic' },
  { id: 'insulin_fasting', displayName: 'Fasting Insulin', standardRange: '2–20 μIU/mL', unit: 'μIU/mL', category: 'metabolic' },
  { id: 'uric_acid', displayName: 'Uric Acid', standardRange: 'M: 3.5–7.2, F: 2.6–6.0 mg/dL', unit: 'mg/dL', category: 'metabolic' },

  // Lipid Panel
  { id: 'total_cholesterol', displayName: 'Total Cholesterol', standardRange: '<200 mg/dL', unit: 'mg/dL', category: 'lipid' },
  { id: 'ldl', displayName: 'LDL Cholesterol', standardRange: '<100 mg/dL', unit: 'mg/dL', category: 'lipid' },
  { id: 'hdl', displayName: 'HDL Cholesterol', standardRange: 'M: >40, F: >50 mg/dL', unit: 'mg/dL', category: 'lipid' },
  { id: 'triglycerides', displayName: 'Triglycerides', standardRange: '<150 mg/dL', unit: 'mg/dL', category: 'lipid' },
  { id: 'vldl', displayName: 'VLDL Cholesterol', standardRange: '5–40 mg/dL', unit: 'mg/dL', category: 'lipid' },

  // Thyroid
  { id: 'tsh', displayName: 'TSH', standardRange: '0.4–4.0 mIU/L', unit: 'mIU/L', category: 'thyroid' },
  { id: 't3', displayName: 'T3 (Triiodothyronine)', standardRange: '80–200 ng/dL', unit: 'ng/dL', category: 'thyroid' },
  { id: 't4', displayName: 'T4 (Thyroxine)', standardRange: '5.1–14.1 μg/dL', unit: 'μg/dL', category: 'thyroid' },

  // Liver
  { id: 'sgot_ast', displayName: 'SGOT/AST', standardRange: '10–40 U/L', unit: 'U/L', category: 'liver' },
  { id: 'sgpt_alt', displayName: 'SGPT/ALT', standardRange: '7–56 U/L', unit: 'U/L', category: 'liver' },
  { id: 'alkaline_phosphatase', displayName: 'Alkaline Phosphatase', standardRange: '44–147 U/L', unit: 'U/L', category: 'liver' },
  { id: 'total_bilirubin', displayName: 'Total Bilirubin', standardRange: '0.1–1.2 mg/dL', unit: 'mg/dL', category: 'liver' },
  { id: 'albumin', displayName: 'Albumin', standardRange: '3.5–5.0 g/dL', unit: 'g/dL', category: 'liver' },

  // Kidney
  { id: 'serum_creatinine', displayName: 'Serum Creatinine', standardRange: 'M: 0.7–1.3, F: 0.5–1.1 mg/dL', unit: 'mg/dL', category: 'kidney' },
  { id: 'bun', displayName: 'Blood Urea Nitrogen', standardRange: '7–20 mg/dL', unit: 'mg/dL', category: 'kidney' },
  { id: 'egfr', displayName: 'eGFR', standardRange: '>60 mL/min/1.73m²', unit: 'mL/min/1.73m²', category: 'kidney' },
  { id: 'uric_acid_kidney', displayName: 'Uric Acid', standardRange: 'M: 3.5–7.2, F: 2.6–6.0 mg/dL', unit: 'mg/dL', category: 'kidney' },

  // Electrolytes
  { id: 'sodium', displayName: 'Sodium', standardRange: '136–145 mEq/L', unit: 'mEq/L', category: 'metabolic' },
  { id: 'potassium', displayName: 'Potassium', standardRange: '3.5–5.0 mEq/L', unit: 'mEq/L', category: 'metabolic' },
  { id: 'calcium', displayName: 'Calcium', standardRange: '8.5–10.5 mg/dL', unit: 'mg/dL', category: 'metabolic' },

  // Complete Blood Count
  { id: 'hemoglobin', displayName: 'Hemoglobin', standardRange: 'M: 13.5–17.5, F: 12–15.5 g/dL', unit: 'g/dL', category: 'blood' },
  { id: 'platelet_count', displayName: 'Platelet Count', standardRange: '150–400 ×10³/μL', unit: '×10³/μL', category: 'blood' },
  { id: 'wbc', displayName: 'WBC Count', standardRange: '4.5–11.0 ×10³/μL', unit: '×10³/μL', category: 'blood' },
  { id: 'rbc', displayName: 'RBC Count', standardRange: 'M: 4.5–5.9, F: 4.1–5.1 ×10⁶/μL', unit: '×10⁶/μL', category: 'blood' },
  { id: 'hematocrit', displayName: 'Hematocrit', standardRange: 'M: 40–54%, F: 36–48%', unit: '%', category: 'blood' },

  // Vitamins & Minerals
  { id: 'vitamin_d', displayName: 'Vitamin D (25-OH)', standardRange: '30–100 ng/mL', unit: 'ng/mL', category: 'vitamin' },
  { id: 'vitamin_b12', displayName: 'Vitamin B12', standardRange: '200–900 pg/mL', unit: 'pg/mL', category: 'vitamin' },
  { id: 'ferritin', displayName: 'Ferritin', standardRange: 'M: 20–500, F: 20–200 ng/mL', unit: 'ng/mL', category: 'vitamin' },
  { id: 'serum_iron', displayName: 'Serum Iron', standardRange: '60–170 μg/dL', unit: 'μg/dL', category: 'vitamin' },
  { id: 'folate', displayName: 'Folate', standardRange: '>5.4 ng/mL', unit: 'ng/mL', category: 'vitamin' },

  // Hormones
  { id: 'cortisol', displayName: 'Cortisol (AM)', standardRange: '6–23 μg/dL', unit: 'μg/dL', category: 'hormone' },
  { id: 'testosterone', displayName: 'Testosterone', standardRange: 'M: 270–1070 ng/dL', unit: 'ng/dL', category: 'hormone' },

  // Inflammation
  { id: 'crp', displayName: 'C-Reactive Protein (hs-CRP)', standardRange: '<3.0 mg/L', unit: 'mg/L', category: 'metabolic' },
  { id: 'esr', displayName: 'ESR', standardRange: 'M: 0–15, F: 0–20 mm/hr', unit: 'mm/hr', category: 'blood' },
];

export const MARKER_ID_ALIASES: Record<string, string[]> = {
  blood_glucose_fasting: ['fasting glucose', 'fbg', 'fbs', 'blood sugar fasting', 'glucose fasting'],
  hba1c: ['hba1c', 'a1c', 'glycated hemoglobin', 'hemoglobin a1c'],
  total_cholesterol: ['cholesterol', 'total cholesterol', 'tc'],
  ldl: ['ldl', 'ldl-c', 'ldl cholesterol', 'low density lipoprotein'],
  hdl: ['hdl', 'hdl-c', 'hdl cholesterol', 'high density lipoprotein'],
  triglycerides: ['triglycerides', 'tg', 'trigs'],
  tsh: ['tsh', 'thyroid stimulating hormone'],
  sgot_ast: ['sgot', 'ast', 'aspartate aminotransferase'],
  sgpt_alt: ['sgpt', 'alt', 'alanine aminotransferase'],
  serum_creatinine: ['creatinine', 'serum creatinine', 's.creatinine'],
  hemoglobin: ['hemoglobin', 'hb', 'hgb', 'haemoglobin'],
  platelet_count: ['platelets', 'plt', 'platelet count', 'thrombocytes'],
  vitamin_d: ['vitamin d', 'vit d', '25-oh vitamin d', '25-hydroxyvitamin d', 'vitamin d3'],
  vitamin_b12: ['vitamin b12', 'vit b12', 'cobalamin', 'b12'],
  uric_acid: ['uric acid', 'serum uric acid', 'sua'],
  sodium: ['sodium', 'na', 'serum sodium'],
  potassium: ['potassium', 'k', 'serum potassium'],
};
