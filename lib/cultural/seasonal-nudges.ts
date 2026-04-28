// lib/cultural/seasonal-nudges.ts
// Date + location aware seasonal wellness nudges
// Respects health profile restrictions (e.g., no coconut water for kidney disease)

import type { HealthProfile } from '@/types';
import { BENGALI_REGIONAL_MARKERS } from '@/constants/regional-foods';

/**
 * Returns a contextual seasonal nudge based on date, user location, and health profile.
 * Returns null if no relevant nudge for the current context.
 */
export function getSeasonalNudge(
  date: Date,
  location: string,
  profile: HealthProfile
): string | null {
  const month = date.getMonth(); // 0-indexed (0=Jan, 11=Dec)
  const lower = location.toLowerCase();

  const isBengal = BENGALI_REGIONAL_MARKERS.some((marker) => lower.includes(marker));
  const isNorthIndia = ['punjab', 'haryana', 'delhi', 'rajasthan', 'uttar pradesh', 'up'].some(
    (m) => lower.includes(m)
  );
  const isKerala = ['kerala', 'kochi', 'trivandrum', 'calicut', 'kozhikode'].some((m) =>
    lower.includes(m)
  );

  // Check if kidney markers are elevated (affects coconut water recommendation)
  const hasKidneyIssue = profile.markers.some(
    (m) =>
      (m.id === 'serum_creatinine' || m.id === 'creatinine') &&
      (m.status === 'ELEVATED' || m.status === 'CRITICAL')
  );

  // Check if diabetic profile (affects seasonal food recommendations)
  const isDiabeticProfile = profile.markers.some(
    (m) =>
      (m.id === 'hba1c' || m.id === 'blood_glucose_fasting') &&
      (m.status === 'ELEVATED' || m.status === 'CRITICAL' || m.status === 'BORDERLINE')
  );

  // ─── Bengal Seasonal Logic ───────────────────────────────────────────────────

  // April–June: Bengali summer heat
  if (month >= 3 && month <= 5 && isBengal) {
    if (hasKidneyIssue) {
      return "The summer heat in Bengal calls for extra hydration — but given your kidney markers, stick to plain water and low-potassium options. Nimbu pani (lemon water) without sugar is excellent. Skip coconut water (daab) for now.";
    }

    return "It's peak summer in Bengal right now. A glass of Daab (coconut water) or Lebu Jol (lemon water with black salt) in the afternoon will replenish your electrolytes far better than plain water or cold drinks. Avoid sugary sherbet.";
  }

  // November–January: Winter in Bengal — heavier foods season
  if ((month >= 10 || month <= 1) && isBengal) {
    if (isDiabeticProfile) {
      return "Winter in Bengal means nolen gur (date-palm jaggery) and pithes — enjoy them very mindfully. A small taste is part of the season, but the natural sugar still impacts blood glucose. Pair any sweet with protein to buffer the effect.";
    }
    return "Winter in Bengal means nolen gur and pithes — enjoy them mindfully. Date-palm jaggery is lower-GI than refined white sugar and has trace minerals. A small portion as an occasional treat fits well within mindful eating.";
  }

  // February–March: Spring in Bengal (Holi season)
  if (month >= 1 && month <= 2 && isBengal) {
    return "Spring is Holi season — thandai, gujiya, and festival sweets are everywhere. Enjoy the celebration while keeping portions in check. Balance each festive meal with extra water and a short walk afterward.";
  }

  // ─── North India Seasonal Logic ───────────────────────────────────────────────

  // November–February: North India winter — sarson ka saag season
  if ((month >= 10 || month <= 1) && isNorthIndia) {
    return "It's sarson ka saag season in North India — one of the most nutritious seasonal meals available. Sarson (mustard greens) is rich in iron, folate, and vitamin K. Pair with makki ki roti (maize flour) for a complete, warming meal that benefits most health profiles.";
  }

  // April–June: North India summer heat
  if (month >= 3 && month <= 5 && isNorthIndia) {
    return "North Indian summers are intense. Prioritize cooling foods: nimbu pani, lassi (without excess sugar), aam panna, and thandai (in moderation). Avoid heavy fried foods in peak heat — digestion slows in high temperatures.";
  }

  // ─── Kerala Seasonal Logic ────────────────────────────────────────────────────

  // June–September: Kerala monsoon
  if (month >= 5 && month <= 8 && isKerala) {
    return "Kerala's monsoon season brings higher risk of waterborne infections. Avoid raw street food and pre-cut fruits from vendors. Stick to freshly cooked, hot meals. Kanji (rice porridge) with pickle is a traditional monsoon comfort food that's gentle on digestion.";
  }

  // ─── Pan-India Summer Hydration ───────────────────────────────────────────────

  // April–June: General India summer hydration nudge
  if (month >= 3 && month <= 5) {
    if (hasKidneyIssue) {
      return "Indian summers mean high dehydration risk — especially important to monitor given your kidney markers. Aim for 3+ liters of water daily, distributed throughout the day. Avoid caffeinated drinks and alcohol which dehydrate further.";
    }
    return "Summer heat across India calls for active hydration. Water is best, followed by nimbu pani (without sugar), chaas, or tender coconut water. Reduce caffeine and avoid packaged fruit juices — their sugar content outweighs hydration benefits.";
  }

  return null;
}
