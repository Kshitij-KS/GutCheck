// lib/cultural/fasting-patterns.ts
// Indian cultural fasting pattern intelligence
// Ekadashi, Ramadan Iftar, Navratri, Karva Chauth

import type { FastingInfo } from '@/types';

export const FASTING_PATTERNS: Record<string, FastingInfo> = {
  ekadashi: {
    pattern: 'bi-monthly Hindu fast (11th day of lunar fortnight)',
    windowDescription: 'Sunrise to next day sunrise — no grains, no beans. Some observe waterless fast.',
    breakingAdvice: 'Break fast with protein + fat before sweets. Prioritize: chaas, makhana, fruits BEFORE any sweet. Avoid direct sugar on empty stomach. Eat slowly — digestive enzymes are reduced after a full fast.',
    suitableBreakingFoods: [
      'chaas (buttermilk) — probiotic, gentle start',
      'makhana — low GI, easy to digest',
      'fresh fruit — natural sugars with fiber',
      'dry fruits (dates, raisins) in moderation',
      'sabudana in moderation (caution diabetics)',
      'kuttu roti (buckwheat) — grain-free, moderate GI',
    ],
    avoidAtBreaking: [
      'direct white sugar or mithai on empty stomach (glucose spike)',
      'heavy fried items first (overwhelms sluggish digestion)',
      'very large portions — start small after long fasts',
    ],
  },

  ramadan_iftar: {
    pattern: 'month-long daily fast (Ramadan) — no food or water sunrise to sunset',
    windowDescription: 'Complete abstention from food and water from Fajr (pre-dawn) to Maghrib (sunset).',
    breakingAdvice: 'Break fast with dates + water first (Sunnah practice and clinically sound — dates provide quick glucose with fiber to buffer the spike). Then protein BEFORE carbs to prevent blood glucose spike. Avoid heavy fried foods (pakoras, samosas) immediately — they overwhelm digestion. Hydrate steadily over the evening.',
    suitableBreakingFoods: [
      'dates (2–3) + plain water — traditional and clinically optimal',
      'soup or light broth — gentle stomach rehydration',
      'grilled or roasted protein (chicken, fish, eggs)',
      'chaas or dahi (curd) — probiotic',
      'then complex carbs: brown rice, roti, dal',
    ],
    avoidAtBreaking: [
      'fried items immediately on empty stomach (pakoras, samosas, spring rolls)',
      'sugary sherbet or juice as the first item — causes glucose spike',
      'heavy biryani immediately — too rich for fasted digestion',
      'carbonated drinks — cause bloating and acid reflux',
    ],
  },

  navratri: {
    pattern: '9-day Hindu festival fast — two major periods per year (Chaitra and Sharad)',
    windowDescription: 'No grains (no wheat, rice, dal), no onion, no garlic, no non-vegetarian. Permitted: fruits, milk, sendha namak (rock salt), certain flours (kuttu, singhara, rajgira, sama).',
    breakingAdvice: 'Profile-dependent. For diabetic users: AVOID excessive sabudana and potato (both high GI) — these are common Navratri foods but spike blood sugar. Prefer kuttu roti with curd. For cardiac profiles: minimize ghee-heavy prasad, prefer fruit-based meals.',
    suitableBreakingFoods: [
      'kuttu roti (buckwheat) with curd — moderate GI, good protein',
      'sama rice (barnyard millet) — lower GI than regular rice',
      'fruits — apples, bananas (moderate), papaya',
      'milk and milk products — dahi, paneer (moderate for LDL)',
      'makhana — excellent fasting snack, low GI',
      'singhara (water chestnut) flour dishes',
    ],
    avoidAtBreaking: [],
  },

  karva_chauth: {
    pattern: 'one-day Hindu fast (married women, for husband\'s long life) — no food or water from sunrise to moonrise',
    windowDescription: 'Single day complete fast. Breaking occurs after moonrise, typically with husband offering water first.',
    breakingAdvice: 'Start breaking with water, then light easily digestible foods. After a waterless day, the digestive system needs gentle reintroduction. Avoid heavy, oily foods immediately. For diabetic profiles: this waterless fast is high-risk — please consult a doctor about modified fasting.',
    suitableBreakingFoods: [
      'water first — slowly, in small sips',
      'fruit juice (fresh, without sugar) — gentle glucose restoration',
      'fresh fruit',
      'chaas or nimbu pani (without sugar)',
      'light dal or khichdi after water is settled',
    ],
    avoidAtBreaking: [
      'heavy meals immediately — digestive system is shocked after waterless fast',
      'very sweet items first — sudden glucose surge after low glucose all day',
      'fried or very spicy foods',
    ],
  },
};

// Keywords to detect fasting context in Quick-Query input
export const FASTING_DETECTION_KEYWORDS: Record<string, string[]> = {
  ekadashi: ['ekadashi', 'ekadasi', 'vrat', 'upvas'],
  ramadan_iftar: ['iftar', 'ramadan', 'ramzan', 'sehri', 'roza'],
  navratri: ['navratri', 'navratre', 'navaratri', 'vrat navratri'],
  karva_chauth: ['karva chauth', 'karwa chauth', 'karva', 'karwa'],
};

/**
 * Detect fasting pattern from Quick-Query input text.
 */
export function detectFastingPattern(input: string): FastingInfo | null {
  const lower = input.toLowerCase();

  for (const [patternKey, keywords] of Object.entries(FASTING_DETECTION_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return FASTING_PATTERNS[patternKey] ?? null;
    }
  }

  return null;
}
