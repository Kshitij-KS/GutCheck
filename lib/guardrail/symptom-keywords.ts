export const EMERGENCY_KEYWORDS = [
  'chest pain', 'chest tightness', 'left arm pain', 'jaw pain',
  'shortness of breath', "can't breathe", 'difficulty breathing',
  'severe pain', 'crushing pain', 'numbness in arm', 'stroke',
  'unconscious', 'fainted', 'heart attack', 'seizure', 'blood vomit',
  'coughing blood', 'passing blood', 'severe allergic', 'anaphylaxis',
];

export const DIAGNOSTIC_KEYWORDS = [
  'diagnose',
  'do i have',
  'is this cancer',
  'what disease',
  'what condition',
];

export function checkQuickQuerySafety(input: string): {
  isSafe: boolean;
  reason?: string;
} {
  const lowerInput = input.toLowerCase();

  // 1. Check for immediate medical emergencies
  const emergencyMatch = EMERGENCY_KEYWORDS.find((kw) => lowerInput.includes(kw));
  if (emergencyMatch) {
    return {
      isSafe: false,
      reason: `Emergency keyword detected: "${emergencyMatch}". Please seek immediate medical attention or call emergency services.`,
    };
  }

  // 2. Check for diagnostic seeking
  const diagnosticMatch = DIAGNOSTIC_KEYWORDS.find((kw) => lowerInput.includes(kw));
  if (diagnosticMatch) {
    return {
      isSafe: false,
      reason: `Diagnostic query detected: "${diagnosticMatch}". GutCheck cannot diagnose conditions. Please consult a doctor.`,
    };
  }

  return { isSafe: true };
}
