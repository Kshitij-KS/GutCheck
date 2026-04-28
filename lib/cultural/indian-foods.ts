// lib/cultural/indian-foods.ts
// Comprehensive mapping: colloquial Indian food names → ingredients + cooking method + nutritional profile
// Minimum 20 entries, designed to scale to 100+

import type { IndianFoodEntry } from '@/types';

export const INDIAN_FOOD_MAP: Record<string, IndianFoodEntry> = {
  phuchka: {
    aliases: ['pani puri', 'golgappa', 'puchka', 'pani puri', 'gol gappe'],
    primaryIngredients: ['semolina shell (maida/rava)', 'tamarind water', 'potato', 'chickpea', 'spices', 'mint'],
    cookingMethod: 'deep-fried shell, raw filling',
    keyNutrientFlags: ['refined_carbs', 'high_gi', 'tamarind_ok_for_most', 'flag_ldl_for_shell'],
    region: 'pan-india',
    notes: 'Shell is deep-fried — flag for LDL/cardiac profiles. Filling is mostly vegetable-based — generally safe. Tamarind water has some anti-inflammatory properties.',
  },

  telebhaja: {
    aliases: ['tel bhaja', 'telebhaja', 'tel-bhaja'],
    primaryIngredients: ['varies (vegetables, fish, etc.)', 'besan or maida batter', 'mustard oil (deep fried)'],
    cookingMethod: 'deep-fried in mustard oil',
    keyNutrientFlags: ['high_saturated_fat', 'refined_carbs', 'high_gi', 'flag_ldl', 'flag_cardiac'],
    region: 'bengal',
    notes: 'Generic term for any Bengali deep-fried item. ALWAYS flag for LDL and cardiac profiles. Despite mustard oil being relatively heart-healthy when used raw, deep frying degrades its benefits.',
  },

  aloo_posto: {
    aliases: ['alu posto', 'aloo posto', 'alur posto'],
    primaryIngredients: ['potato', 'poppy seeds (posto)', 'mustard oil', 'green chili', 'onion'],
    cookingMethod: 'sauteed/dry curry',
    keyNutrientFlags: ['high_gi_potato', 'poppy_seeds_high_omega6', 'mustard_oil_moderate', 'flag_diabetic'],
    region: 'bengal',
    notes: 'Generally well-tolerated. High GI from potato — caution for diabetic profiles. Poppy seeds are nutritious but calorie-dense. Mustard oil used raw here is heart-healthy.',
  },

  macher_jhol: {
    aliases: ['maacher jhol', 'fish curry bengali', 'macher jhal', 'maach er jhol'],
    primaryIngredients: ['fresh river fish (rohu, katla, or hilsa/ilish)', 'mustard oil', 'turmeric', 'cumin', 'ginger', 'potato', 'eggplant'],
    cookingMethod: 'light curry in mustard oil',
    keyNutrientFlags: ['high_omega3_hilsa', 'lean_protein', 'anti_inflammatory_turmeric', 'prioritize_ldl', 'prioritize_cardiac'],
    region: 'bengal',
    notes: 'One of the most health-profile-friendly Bengali dishes. High omega-3 (especially when made with hilsa/ilish). Actively benefits LDL. Light cooking preserves nutrients. Suitable for almost all profiles.',
  },

  shorshe_ilish: {
    aliases: ['shorshe ilish', 'hilsa in mustard', 'ilish macher sorshe', 'hilsa mustard curry'],
    primaryIngredients: ['hilsa fish (ilish)', 'mustard paste (shorshe)', 'mustard oil', 'green chili', 'turmeric'],
    cookingMethod: 'steamed or light curry',
    keyNutrientFlags: ['highest_omega3_bengali', 'lean_protein', 'anti_inflammatory', 'prioritize_ldl', 'prioritize_cardiac', 'prioritize_inflammatory'],
    region: 'bengal',
    notes: 'The highest omega-3 Bengali dish. Hilsa is one of the richest sources of omega-3 fatty acids available. Actively reduces LDL and benefits cardiac health. Strongly recommended when LDL or triglycerides are elevated.',
  },

  chingri_malaikari: {
    aliases: ['chingri malai curry', 'prawn malaikari', 'chingrir malaikari'],
    primaryIngredients: ['tiger prawns (chingri)', 'coconut milk', 'onion', 'ginger-garlic', 'spices'],
    cookingMethod: 'curry in coconut milk',
    keyNutrientFlags: ['moderate_cholesterol_prawns', 'coconut_milk_saturated_fat', 'flag_ldl_moderate'],
    region: 'bengal',
    notes: 'Prawns are moderate in cholesterol but high in lean protein. Coconut milk adds saturated fat — moderate for LDL-elevated profiles. Generally safe in small portions.',
  },

  daab_coconut_water: {
    aliases: ['daab', 'coconut water', 'nariyal pani', 'dab', 'tender coconut'],
    primaryIngredients: ['coconut water'],
    cookingMethod: 'raw/natural',
    keyNutrientFlags: ['natural_electrolytes', 'low_gi', 'potassium_source', 'flag_kidney_disease'],
    region: 'pan-india',
    notes: 'Excellent seasonal hydration. Natural electrolytes far superior to packaged sports drinks. CRITICAL FLAG: High potassium — avoid for kidney disease/elevated creatinine profiles. Otherwise strongly recommended, especially in summer.',
  },

  lebu_jol: {
    aliases: ['nimbu pani', 'lemon water', 'shikanji', 'lebu jol', 'lemon squash', 'lemonade'],
    primaryIngredients: ['lemon', 'water', 'black salt (kala namak)', 'cumin powder', 'sugar (optional)'],
    cookingMethod: 'mixed drink',
    keyNutrientFlags: ['vitamin_c', 'electrolytes', 'low_gi_if_no_sugar', 'digestive_aid'],
    region: 'pan-india',
    notes: 'Excellent summer hydration. ALWAYS recommend without sugar for diabetic profiles. With black salt for digestive benefits. Superior to packaged fruit juices for all profiles.',
  },

  kochuri: {
    aliases: ['kochuri', 'kachori', 'koraishutir kochuri', 'dal kochuri'],
    primaryIngredients: ['maida (refined flour)', 'dal filling (usually chana or matar)', 'oil (deep fried)'],
    cookingMethod: 'deep-fried',
    keyNutrientFlags: ['refined_carbs', 'high_gi', 'deep_fried', 'flag_ldl', 'flag_diabetic'],
    region: 'bengal',
    notes: 'Deep-fried refined flour bread. High GI, high saturated fat from frying. Flag for both diabetic and LDL-elevated profiles. The dal filling has some protein but it is outweighed by the fried maida shell.',
  },

  luchi: {
    aliases: ['luchi', 'poori bengali', 'maida poori'],
    primaryIngredients: ['maida (refined flour)', 'oil (deep fried)', 'salt'],
    cookingMethod: 'deep-fried',
    keyNutrientFlags: ['refined_carbs', 'high_gi', 'deep_fried', 'flag_ldl', 'flag_diabetic'],
    region: 'bengal',
    notes: 'Bengali version of puri — deep-fried refined flour bread. High GI. Flag for diabetic and cardiac profiles. Suggest whole wheat atta roti as a swap.',
  },

  dal: {
    aliases: ['dal', 'daal', 'lentil soup', 'masoor dal', 'moong dal', 'chana dal', 'toor dal', 'urad dal'],
    primaryIngredients: ['lentils', 'water', 'tempered with cumin/mustard seeds', 'turmeric', 'asafoetida'],
    cookingMethod: 'boiled/simmered, tadka (tempering)',
    keyNutrientFlags: ['high_plant_protein', 'high_fiber', 'low_gi', 'prioritize_most_profiles'],
    region: 'pan-india',
    notes: 'Generally beneficial for almost all profiles. High plant protein, high fiber, moderate GI. EXCEPTION: Masoor dal (red lentils) and rajma are moderate-purine — caution for high uric acid. Moong dal is the safest option across all profiles.',
  },

  chaas: {
    aliases: ['buttermilk', 'chaas', 'lassi thin', 'mattha', 'tak'],
    primaryIngredients: ['dahi (curd)', 'water', 'salt', 'cumin', 'ginger (optional)'],
    cookingMethod: 'blended/stirred',
    keyNutrientFlags: ['probiotic', 'low_fat', 'digestive_aid', 'low_gi', 'prioritize_most_profiles'],
    region: 'pan-india',
    notes: 'Excellent probiotic drink. Low in fat, highly digestive. Recommended for almost all profiles. Prefer salted chaas over sweetened lassi for diabetic profiles. Excellent post-meal digestive aid.',
  },

  sabudana: {
    aliases: ['sabudana', 'tapioca', 'sago', 'sabudana khichdi', 'sabudana vada'],
    primaryIngredients: ['tapioca pearls', 'peanuts', 'potato', 'ghee/oil'],
    cookingMethod: 'soaked and sauteed',
    keyNutrientFlags: ['high_gi', 'high_carbs', 'flag_diabetic', 'no_gluten'],
    region: 'pan-india',
    notes: 'High GI starchy food. FLAG for diabetic profiles — sabudana vada/khichdi causes rapid glucose spike. Often consumed during fasting — caution for diabetics even then. Gluten-free, which is its only advantage for specific profiles.',
  },

  makhana: {
    aliases: ['fox nuts', 'makhana', 'lotus seeds', 'phool makhana', 'foxnuts'],
    primaryIngredients: ['fox nuts (Euryale ferox seeds)', 'minimal oil (when roasted)'],
    cookingMethod: 'roasted or air-popped',
    keyNutrientFlags: ['low_gi', 'low_calorie', 'low_fat', 'high_protein_relative', 'prioritize_snack', 'prioritize_diabetic'],
    region: 'pan-india',
    notes: 'Excellent low-GI snack for almost all profiles. Ideal for diabetic, cardiac, and weight-conscious profiles. Roasted makhana is far superior to packaged biscuits or chips. High in magnesium and potassium — mild caution for severe kidney disease.',
  },

  vada_pav: {
    aliases: ['vada pav', 'vadapav', 'vada-pav', 'bombay burger'],
    primaryIngredients: ['batata vada (deep fried potato in besan batter)', 'pav (refined bread)', 'chutneys', 'green chili'],
    cookingMethod: 'deep-fried + processed bread',
    keyNutrientFlags: ['high_gi', 'deep_fried', 'refined_carbs', 'high_sodium', 'flag_ldl', 'flag_diabetic', 'flag_cardiac'],
    region: 'maharashtra',
    notes: 'Double flag: deep-fried potato patty IN refined flour batter, served in maida pav. High GI, high saturated fat. Flag for both diabetic and LDL-elevated profiles. One of the higher-risk street foods for multiple health markers.',
  },

  idli: {
    aliases: ['idli', 'idly', 'steamed idli', 'rice idli'],
    primaryIngredients: ['parboiled rice', 'urad dal (black gram)', 'salt'],
    cookingMethod: 'fermented batter, steam-cooked',
    keyNutrientFlags: ['fermented', 'low_fat', 'moderate_gi', 'easy_digest', 'safe_most_profiles'],
    region: 'south_india',
    notes: 'Fermented food — excellent for gut health. Low in fat. Steamed, not fried. Generally safe for almost all profiles. Moderate GI — one of the safer options for diabetic profiles when combined with sambar (lentil-based).',
  },

  dosa: {
    aliases: ['dosa', 'dosai', 'plain dosa', 'masala dosa', 'rava dosa', 'set dosa'],
    primaryIngredients: ['parboiled rice', 'urad dal', 'oil (minimal for plain)'],
    cookingMethod: 'fermented batter, griddle-cooked with minimal oil',
    keyNutrientFlags: ['fermented', 'moderate_gi', 'flag_masala_variant', 'flag_rava_dosa_moderate'],
    region: 'south_india',
    notes: 'Plain dosa: fermented, moderate GI, generally safe. VARIANTS: Masala dosa adds potato (flag diabetic); Rava dosa uses semolina (higher GI). Served with sambar (excellent) and coconut chutney (moderate for LDL — use in moderation).',
  },

  biryani: {
    aliases: ['biryani', 'biriyani', 'hyderabadi biryani', 'kolkata biryani', 'lucknowi biryani', 'dum biryani'],
    primaryIngredients: ['basmati rice', 'meat/vegetables', 'ghee', 'spices', 'fried onions (birista)', 'saffron'],
    cookingMethod: 'dum cooking (slow-cooked under pressure)',
    keyNutrientFlags: ['high_gi_white_rice', 'high_sodium', 'high_calorie_ghee', 'flag_diabetic', 'flag_cardiac_large_portion', 'moderate_most_profiles'],
    region: 'pan-india',
    notes: 'High GI from white rice. Significant sodium. Ghee adds saturated fat. Flag for diabetic and cardiac profiles at full portions. Suggest: half portion, extra raita on the side (probiotic), avoid fried onions if LDL elevated.',
  },

  rajma: {
    aliases: ['rajma', 'kidney beans', 'rajma chawal', 'red kidney beans'],
    primaryIngredients: ['kidney beans (rajma)', 'onion-tomato gravy', 'spices'],
    cookingMethod: 'boiled then simmered in gravy',
    keyNutrientFlags: ['high_plant_protein', 'high_fiber', 'moderate_gi', 'flag_kidney_potassium', 'moderate_uric_acid'],
    region: 'north_india',
    notes: 'Excellent plant protein source. High fiber, moderate GI. FLAG: Moderate-high potassium — avoid or limit for kidney disease (elevated creatinine). Also moderate-purine — some caution for very high uric acid.',
  },

  chole: {
    aliases: ['chole', 'chana', 'chickpea curry', 'chana masala', 'pindi chole'],
    primaryIngredients: ['chickpeas', 'tomato-onion base', 'spices', 'tea/tamarind for dark color'],
    cookingMethod: 'pressure-cooked then simmered',
    keyNutrientFlags: ['high_fiber', 'high_plant_protein', 'moderate_gi', 'safe_most_profiles'],
    region: 'north_india',
    notes: 'High fiber, high plant protein, moderate GI. Generally safe and beneficial for most profiles. Excellent alternative to meat protein. Mild purine content — acceptable for most uric acid profiles.',
  },

  paneer: {
    aliases: ['paneer', 'cottage cheese', 'indian cheese', 'paneer tikka', 'shahi paneer', 'palak paneer'],
    primaryIngredients: ['whole milk', 'acid (lemon juice or vinegar)'],
    cookingMethod: 'coagulated milk, pressed',
    keyNutrientFlags: ['high_protein', 'high_calcium', 'moderate_saturated_fat', 'flag_ldl_full_fat', 'moderate_ldl'],
    region: 'pan-india',
    notes: 'Good protein and calcium source. CAUTION: Made from full-fat milk — moderate saturated fat. Flag for LDL-elevated profiles — recommend limiting to 100g/day. Lower-fat paneer or tofu is a better swap for high LDL.',
  },

  nimbu_pani: {
    aliases: ['nimbu pani', 'lemon water', 'lemonade india', 'shikanji', 'limonada'],
    primaryIngredients: ['lemon juice', 'water', 'sugar or jaggery', 'salt', 'cumin'],
    cookingMethod: 'mixed drink',
    keyNutrientFlags: ['vitamin_c', 'electrolytes', 'digestive_aid'],
    region: 'pan-india',
    notes: 'See lebu_jol. Excellent hydration. Recommend without sugar or with minimal jaggery for diabetic profiles. Superior to cold drinks and packaged juices for all profiles.',
  },

  // Additional entries for 100+ scale

  sambar: {
    aliases: ['sambar', 'sambhar', 'dal sambar', 'south indian lentil soup'],
    primaryIngredients: ['toor dal', 'tamarind', 'tomato', 'vegetables', 'sambar masala', 'mustard seeds'],
    cookingMethod: 'boiled and tempered',
    keyNutrientFlags: ['high_fiber', 'high_plant_protein', 'anti_inflammatory_tamarind', 'low_gi', 'prioritize_most_profiles'],
    region: 'south_india',
    notes: 'Excellent choice for almost all profiles. High fiber from dal + vegetables. Tamarind has anti-inflammatory properties. Low GI. Ideal companion to idli and dosa for balanced meal.',
  },

  rasam: {
    aliases: ['rasam', 'pepper water', 'saaru', 'chaaru'],
    primaryIngredients: ['tamarind', 'tomato', 'pepper', 'cumin', 'mustard seeds', 'curry leaves'],
    cookingMethod: 'boiled/simmered',
    keyNutrientFlags: ['low_calorie', 'digestive_aid', 'anti_inflammatory_pepper', 'prioritize_digestion'],
    region: 'south_india',
    notes: 'Extremely low calorie. Excellent digestive aid. Pepper is anti-inflammatory. Generally recommended for all profiles. Good post-meal digestive drink.',
  },

  poha: {
    aliases: ['poha', 'pohe', 'flattened rice', 'beaten rice', 'aval'],
    primaryIngredients: ['flattened rice (chivda)', 'onion', 'mustard seeds', 'turmeric', 'peanuts', 'lemon'],
    cookingMethod: 'tempered/sauteed',
    keyNutrientFlags: ['moderate_gi', 'iron_source', 'easy_digest', 'safe_most_profiles'],
    region: 'maharashtra',
    notes: 'Moderate GI. Easy to digest. Good iron source (especially when combined with lemon/vitamin C). Peanuts add protein and fat. Generally safe for most profiles.',
  },

  khichdi: {
    aliases: ['khichdi', 'khichuri', 'dal khichdi', 'sabudana khichdi'],
    primaryIngredients: ['rice', 'moong dal', 'ghee', 'cumin', 'turmeric'],
    cookingMethod: 'pressure-cooked together',
    keyNutrientFlags: ['moderate_gi', 'complete_protein', 'easy_digest', 'convalescence_food'],
    region: 'pan-india',
    notes: 'Rice + moong dal together forms near-complete protein. Easy to digest — excellent for recovery, gut issues. Moderate GI. Add a teaspoon of ghee for fat-soluble vitamin absorption. Generally safe for most profiles.',
  },

  dhokla: {
    aliases: ['dhokla', 'khaman dhokla', 'steamed besan cake'],
    primaryIngredients: ['chickpea flour (besan)', 'curd', 'lemon', 'baking soda', 'tempering: mustard, curry leaves'],
    cookingMethod: 'fermented/steamed',
    keyNutrientFlags: ['fermented', 'low_fat', 'high_plant_protein', 'low_gi', 'prioritize_most_profiles'],
    region: 'gujarat',
    notes: 'Fermented besan — excellent probiotic benefit. Steamed, not fried. High plant protein from chickpea flour. Low GI. One of the best Indian snack options for most health profiles.',
  },
};

/**
 * Look up an Indian food by name or alias.
 * Returns the food entry or null if not found.
 */
export function lookupIndianFood(input: string): IndianFoodEntry | null {
  const lower = input.toLowerCase().trim();

  // Direct key match
  if (INDIAN_FOOD_MAP[lower]) return INDIAN_FOOD_MAP[lower] ?? null;

  // Alias match
  for (const entry of Object.values(INDIAN_FOOD_MAP)) {
    if (entry.aliases.some((alias) => lower.includes(alias) || alias.includes(lower))) {
      return entry;
    }
  }

  return null;
}
