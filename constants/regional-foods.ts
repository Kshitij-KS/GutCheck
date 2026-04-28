// constants/regional-foods.ts
// Regional food constants used by cultural intelligence modules

export const BENGALI_REGIONAL_MARKERS = [
  'bengal', 'kolkata', 'calcutta', 'khardaha', 'howrah', 'durgapur',
  'siliguri', 'asansol', 'bardhaman', 'malda', 'jalpaiguri',
] as const;

export const SOUTH_INDIA_MARKERS = [
  'tamil', 'kerala', 'karnataka', 'telangana', 'andhra',
  'chennai', 'bangalore', 'hyderabad', 'kochi', 'trivandrum',
] as const;

export const NORTH_INDIA_MARKERS = [
  'punjab', 'haryana', 'rajasthan', 'uttar pradesh', 'up',
  'delhi', 'chandigarh', 'jaipur', 'lucknow', 'agra',
] as const;

export const MAHARASHTRA_MARKERS = [
  'maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik',
] as const;

export const GUJARAT_MARKERS = [
  'gujarat', 'ahmedabad', 'surat', 'vadodara',
] as const;

// Synonyms for regional ingredient normalization (used in offline fallback)
export const INGREDIENT_SYNONYMS: Record<string, string[]> = {
  maida: ['refined flour', 'all-purpose flour', 'plain flour', 'white flour', 'ap flour'],
  atta: ['whole wheat flour', 'whole wheat atta', 'wheat flour', 'atta flour'],
  jowar: ['sorghum', 'jowar flour', 'sorghum flour'],
  bajra: ['pearl millet', 'bajra flour', 'millet flour'],
  ragi: ['finger millet', 'nachni', 'ragi flour'],
  besan: ['chickpea flour', 'gram flour', 'chana dal flour'],
  'mustard oil': ['sarson ka tel', 'shorshe tel', 'mustard oil'],
  ghee: ['clarified butter', 'desi ghee'],
  jaggery: ['gud', 'gur', 'palm sugar', 'raw sugar'],
  'coconut oil': ['nariyal tel', 'coconut oil'],
  sugar: ['white sugar', 'refined sugar', 'sucrose', 'table sugar'],
  rice: ['chawal', 'bhat', 'white rice', 'steamed rice'],
  'brown rice': ['brown rice', 'unpolished rice', 'red rice'],
  dal: ['lentils', 'lentil', 'daal', 'pulses'],
  paneer: ['cottage cheese', 'indian cottage cheese'],
  curd: ['yogurt', 'dahi', 'yoghurt'],
  chaas: ['buttermilk', 'lassi', 'mattha'],
};
