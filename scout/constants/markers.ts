// constants/markers.ts

export interface MarkerReference {
  id: string;
  name: string;
  normalRange: string;
  unit: string;
  description: string;
}

export const KNOWN_MARKERS: MarkerReference[] = [
  {
    id: 'hba1c',
    name: 'HbA1c',
    normalRange: 'Below 5.7%',
    unit: '%',
    description: 'Average blood glucose over 3 months',
  },
  {
    id: 'fasting_glucose',
    name: 'Fasting Glucose',
    normalRange: '70–99 mg/dL',
    unit: 'mg/dL',
    description: 'Blood sugar after 8+ hours of fasting',
  },
  {
    id: 'total_cholesterol',
    name: 'Total Cholesterol',
    normalRange: 'Below 200 mg/dL',
    unit: 'mg/dL',
    description: 'Overall cholesterol level',
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    normalRange: 'Below 130 mg/dL',
    unit: 'mg/dL',
    description: '"Bad" cholesterol — atherosclerosis risk',
  },
  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    normalRange: 'Above 40 mg/dL (men), Above 50 mg/dL (women)',
    unit: 'mg/dL',
    description: '"Good" cholesterol — protective',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    normalRange: 'Below 150 mg/dL',
    unit: 'mg/dL',
    description: 'Blood fat linked to diet and metabolic syndrome',
  },
  {
    id: 'uric_acid',
    name: 'Uric Acid',
    normalRange: '3.5–7.0 mg/dL',
    unit: 'mg/dL',
    description: 'Elevated levels cause gout and kidney stones',
  },
  {
    id: 'creatinine',
    name: 'Creatinine',
    normalRange: '0.7–1.3 mg/dL',
    unit: 'mg/dL',
    description: 'Kidney function marker',
  },
  {
    id: 'tsh',
    name: 'TSH',
    normalRange: '0.4–4.0 mIU/L',
    unit: 'mIU/L',
    description: 'Thyroid stimulating hormone — thyroid function',
  },
  {
    id: 'vitamin_d',
    name: 'Vitamin D (25-OH)',
    normalRange: '30–100 ng/mL',
    unit: 'ng/mL',
    description: 'Essential for calcium absorption and immunity',
  },
  {
    id: 'vitamin_b12',
    name: 'Vitamin B12',
    normalRange: '200–900 pg/mL',
    unit: 'pg/mL',
    description: 'Critical for nerve function and red blood cells',
  },
  {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    normalRange: '13.5–17.5 g/dL (men), 12.0–15.5 g/dL (women)',
    unit: 'g/dL',
    description: 'Oxygen-carrying protein in red blood cells',
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    normalRange: '12–300 ng/mL',
    unit: 'ng/mL',
    description: 'Iron storage marker',
  },
  {
    id: 'sgpt',
    name: 'SGPT (ALT)',
    normalRange: '7–56 U/L',
    unit: 'U/L',
    description: 'Liver enzyme — elevated in liver damage',
  },
  {
    id: 'sgot',
    name: 'SGOT (AST)',
    normalRange: '10–40 U/L',
    unit: 'U/L',
    description: 'Liver and heart enzyme',
  },
];
