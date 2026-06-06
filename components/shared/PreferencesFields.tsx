'use client';

// components/shared/PreferencesFields.tsx
// Store-connected, optional personalization: location + dietary + allergies.
// Reused in onboarding (collapsible) and the profile page.

import { useGutCheckStore } from '@/store/gutcheck.store';
import { ChipSelect } from '@/components/shared/ChipSelect';

export const DIET_PRESETS = ['Vegetarian', 'Vegan', 'Jain', 'Eggetarian', 'No beef', 'No pork'];
export const ALLERGY_PRESETS = ['Peanuts', 'Tree nuts', 'Dairy / Lactose', 'Gluten', 'Soy', 'Shellfish', 'Eggs'];
export const LOCATION_PRESETS = ['Bengal', 'North India', 'South India', 'West India', 'Kerala'];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-medium uppercase tracking-[0.12em] mb-2"
      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}
    >
      {children}
    </p>
  );
}

export function PreferencesFields() {
  const location = useGutCheckStore((s) => s.location);
  const setLocation = useGutCheckStore((s) => s.setLocation);
  const dietaryPreferences = useGutCheckStore((s) => s.dietaryPreferences);
  const setDietaryPreferences = useGutCheckStore((s) => s.setDietaryPreferences);
  const allergies = useGutCheckStore((s) => s.allergies);
  const setAllergies = useGutCheckStore((s) => s.setAllergies);

  return (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <FieldLabel>Location (for seasonal &amp; regional tips)</FieldLabel>
        <input
          type="text"
          value={location ?? ''}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Kolkata, Bengal"
          aria-label="Your location"
          className="gc-input min-h-10 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {LOCATION_PRESETS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className="px-2.5 py-1 rounded-full text-xs transition-colors"
              style={{
                fontFamily: 'var(--font-body)',
                backgroundColor: location === loc ? 'var(--tl-moderate-bg)' : 'var(--bg-secondary)',
                color: location === loc ? 'var(--tl-moderate)' : 'var(--text-secondary)',
                border: `1px solid ${location === loc ? 'var(--tl-moderate)' : 'var(--border-strong)'}`,
              }}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary preferences */}
      <div>
        <FieldLabel>Dietary preferences</FieldLabel>
        <ChipSelect
          ariaLabel="Dietary preferences"
          options={DIET_PRESETS}
          value={dietaryPreferences}
          onChange={setDietaryPreferences}
          color="var(--tl-prioritize)"
          bg="var(--tl-prioritize-bg)"
        />
      </div>

      {/* Allergies */}
      <div>
        <FieldLabel>Allergies (always treated as strict avoid)</FieldLabel>
        <ChipSelect
          ariaLabel="Allergies"
          options={ALLERGY_PRESETS}
          value={allergies}
          onChange={setAllergies}
          allowCustom
          customPlaceholder="Add another allergy…"
          color="var(--tl-avoid)"
          bg="var(--tl-avoid-bg)"
        />
      </div>
    </div>
  );
}
