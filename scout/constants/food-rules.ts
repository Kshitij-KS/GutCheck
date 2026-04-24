// constants/food-rules.ts

export interface ConditionFoodTemplate {
  condition: string;
  strictAvoid: string[];
  moderate: string[];
  prioritize: string[];
  indianContext: string;
}

export const FOOD_RULE_TEMPLATES: ConditionFoodTemplate[] = [
  {
    condition: 'Pre-diabetes / Insulin Resistance',
    strictAvoid: ['white rice', 'maida', 'sugary drinks', 'mithai', 'packaged snacks', 'white bread'],
    moderate: ['whole wheat roti', 'oats', 'banana', 'fruit juice', 'potato'],
    prioritize: ['dal', 'leafy greens', 'methi', 'bitter gourd', 'nuts', 'cinnamon', 'legumes'],
    indianContext: 'Choose dal-sabzi over rice dishes. Opt for millet rotis (bajra, jowar). Avoid biryani and sweetened lassi.',
  },
  {
    condition: 'High LDL Cholesterol',
    strictAvoid: ['red meat', 'ghee in large quantity', 'coconut oil', 'full-fat dairy in excess', 'fried foods'],
    moderate: ['paneer', 'egg yolk', 'coconut', 'shrimp'],
    prioritize: ['fatty fish', 'walnuts', 'flaxseed', 'olive oil', 'amla', 'garlic', 'oats'],
    indianContext: 'Use minimal ghee. Choose tandoori or grilled over fried. Avoid butter chicken and cream-based curries.',
  },
  {
    condition: 'Elevated Uric Acid / Gout Risk',
    strictAvoid: ['red meat', 'mutton', 'organ meats', 'alcohol', 'high-fructose drinks', 'anchovies'],
    moderate: ['chicken', 'lentils in large quantity', 'mushroom', 'spinach'],
    prioritize: ['water (3L/day)', 'cherries', 'low-fat dairy', 'coffee', 'vitamin C foods'],
    indianContext: 'Avoid keema, mutton biryani, and organ meat preparations. Dal in moderate quantity is acceptable.',
  },
  {
    condition: 'High Triglycerides',
    strictAvoid: ['alcohol', 'sugary drinks', 'refined carbohydrates', 'sweets', 'maida-based foods'],
    moderate: ['fruit juice', 'honey', 'whole grains'],
    prioritize: ['omega-3 rich fish', 'nuts', 'seeds', 'leafy greens', 'fiber-rich foods'],
    indianContext: 'Avoid halwa, jalebi, and sweet beverages. Choose grilled fish over fried preparations.',
  },
  {
    condition: 'Low Vitamin D',
    strictAvoid: [],
    moderate: [],
    prioritize: ['fatty fish', 'egg yolk', 'fortified foods', 'mushrooms exposed to sunlight', 'milk'],
    indianContext: 'Morning sun exposure is important. Include egg bhurji and fish-based preparations.',
  },
  {
    condition: 'Low Vitamin B12',
    strictAvoid: [],
    moderate: [],
    prioritize: ['eggs', 'dairy products', 'fish', 'chicken', 'fortified cereals'],
    indianContext: 'Vegetarians should focus on dairy, paneer, and curd. Consider B12 supplementation.',
  },
  {
    condition: 'Anemia / Low Hemoglobin',
    strictAvoid: ['tea/coffee with meals (inhibits iron absorption)', 'calcium supplements with iron-rich foods'],
    moderate: ['dairy with iron-rich meals'],
    prioritize: ['spinach', 'methi', 'rajma', 'chana', 'sesame seeds', 'jaggery', 'pomegranate', 'vitamin C foods'],
    indianContext: 'Pair iron-rich dal and sabzi with lemon juice. Avoid tea immediately after meals.',
  },
];
