import { getVariationTierKeys, getVariationTierValues, parseVariationTiers, formatVariationLabel } from '../utils/pricing';
import type { VariationInput } from '../utils/pricing';
import type { VariationSchema } from '../utils/pricing';
import { useI18n } from '../i18n';

interface VariationSelectorProps {
  variations?: VariationInput[];
  selectedVariation?: string;
  onVariationChange: (variation: string) => void;
  className?: string;
  schema?: VariationSchema;
  productId?: string; // Add productId to enable special product-specific logic
}

export function VariationSelector({
  variations,
  selectedVariation,
  onVariationChange,
  className = "",
  schema,
  productId
}: VariationSelectorProps) {
  const { t, variationTitle, variationValue, localizeVariationLabel } = useI18n();

  if (!variations || variations.length === 0) return null;

  // Determine tier ordering based on the variations themselves.
  const tierKeys = getVariationTierKeys(variations, schema);
  const selectedTiers = selectedVariation ? parseVariationTiers(selectedVariation, schema) : {};

  // If we have multiple tiers, show multi-tier selector
  if (tierKeys.length > 1) {
    const isComplete = tierKeys.every(key => Boolean(selectedTiers[key]));

    return (
      <div className={`space-y-6 ${className}`}>
        {tierKeys.map((tierKey) => {
          const tierValues = getVariationTierValues(variations, tierKey, schema);
          // Prefer localized title from resources; fall back to product schema title or generated fallback
          const displayName = variationTitle(
            tierKey,
            (schema && schema.titles && schema.titles[tierKey]) ?? (tierKey.charAt(0).toUpperCase() + tierKey.slice(1)),
            productId
          );

          return (
            <div key={tierKey}>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tierValues.map((value) => {
                  const isSelected = selectedTiers[tierKey] === value;

                  // Check if this combination is available
                  // tentative tiers when testing availability

                  // For testing availability, check if any variation is compatible with the
                  // tentative selection for this tier while allowing other tiers to be cleared
                  // when they would otherwise make the combination impossible.
                  // A value is available if any variation label matches this value
                  // for this tier and is compatible with currently selected other tiers.
                  const isAvailable = variations.some(v => {
                    const label = typeof v === 'string' ? v : v.label;
                    const varTiers = parseVariationTiers(label, schema);

                    if (varTiers[tierKey] !== value) return false;

                    // Check compatibility with other currently selected tiers
                    for (const otherKey of Object.keys(selectedTiers)) {
                      if (otherKey === tierKey) continue;
                      const sel = selectedTiers[otherKey];
                      if (sel && varTiers[otherKey] && varTiers[otherKey] !== sel) return false;
                    }
                    return true;
                  });

                  return (
                    <button
                      key={value}
                      onClick={() => {
                        // Allow clicks regardless of 'isAvailable' so users can switch to
                        // combinations that require clearing other tiers. The 'isAvailable'
                        // flag is only used for styling (disabled appearance).

                        // Toggle off if clicking the selected value
                        if (isSelected) {
                          const newTiers = { ...selectedTiers };
                          delete newTiers[tierKey];
                          const newVariation = formatVariationLabel(newTiers, tierKeys);
                          onVariationChange(newVariation);
                          return;
                        }

                        // Tentative tiers with this choice
                        const tentative = { ...selectedTiers, [tierKey]: value };

                        // Special logic for notebook: if A4+Lined is being selected, auto-switch to A5+Lined
                        // because A4 only supports Blank finish, not Lined
                        if (productId === 'notebook' && tentative.size === 'A4' && tentative.finish === 'Lined') {
                          tentative.size = 'A5';
                          // Keep the Lined finish and let the page selection proceed normally
                        }

                        // For other tiers, determine compatible values given the tentative selection.
                        // If a tier has no compatible values, remove it. If it has exactly one,
                        // auto-select it (useful for notebook A4-Blank-only cases).
                        const cleaned: Record<string, string | undefined> = { ...tentative };
                        tierKeys.forEach((otherKey) => {
                          if (otherKey === tierKey) return;

                          // Gather compatible values for otherKey given current tentative selection
                          const vals = new Set<string>();
                          variations.forEach((v) => {
                            const label = typeof v === 'string' ? v : v.label;
                            const varTiers = parseVariationTiers(label, schema);

                            // Must match all keys present in tentative
                            let matches = true;
                            for (const k of Object.keys(tentative)) {
                              const tv = tentative[k as keyof typeof tentative];
                              if (!tv) continue;
                              if (varTiers[k] && varTiers[k] !== tv) {
                                matches = false;
                                break;
                              }
                              if (!varTiers[k]) {
                                matches = false;
                                break;
                              }
                            }
                            if (!matches) return;
                            if (varTiers[otherKey]) vals.add(varTiers[otherKey] as string);
                          });

                          if (vals.size === 0) {
                            // No compatible options for this otherKey -> remove it so user can reselect
                            delete cleaned[otherKey];
                          } else if (vals.size === 1) {
                            // Auto select the only compatible option
                            const only = Array.from(vals)[0];
                            cleaned[otherKey] = only;
                          } else {
                            // Multiple possibilities: if the current selection is one of them, keep it,
                            // otherwise clear to let user choose.
                            if (!cleaned[otherKey] || !vals.has(cleaned[otherKey]!)) {
                              delete cleaned[otherKey];
                            }
                          }
                        });

                        const newVariation = formatVariationLabel(cleaned as Record<string, string | undefined>, tierKeys);
                        onVariationChange(newVariation);
                      }}
                      className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                        isSelected
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20 shadow-lg shadow-red-500/20'
                          : isAvailable
                            ? 'border-zinc-300 dark:border-zinc-600 hover:border-red-400 dark:hover:border-red-500 text-zinc-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-md'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse"></div>
                      )}
                      <span className="relative">{variationValue(productId, tierKey, value, value)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Show selected combination with animation */}
        {isComplete && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('variation.selected')} <span className="font-bold">{localizeVariationLabel(productId, formatVariationLabel(selectedTiers, tierKeys), schema)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single-tier variations (original behavior) with improved styling
  const normalizedVariations = variations.map(v =>
    typeof v === 'string' ? { label: v } : { label: v.label, price: v.price, image: v.image }
  );

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">
        {t('product.optionsLabel')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {normalizedVariations.map((v) => (
          <button
            key={v.label}
            onClick={() => onVariationChange(v.label)}
            className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
              selectedVariation === v.label
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20 shadow-lg shadow-red-500/20'
                : 'border-zinc-300 dark:border-zinc-600 hover:border-red-400 dark:hover:border-red-500 text-zinc-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-md'
            }`}
            title={typeof v.price === 'number' ? `৳${v.price}` : undefined}
          >
            {selectedVariation === v.label && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse"></div>
            )}
            <span className="relative">{localizeVariationLabel(productId, v.label, schema)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}