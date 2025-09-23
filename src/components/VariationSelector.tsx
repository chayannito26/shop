import { useEffect, useMemo, useState } from 'react';
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

  const hasVariations = Boolean(variations && variations.length > 0);

  // Determine tier ordering based on schema or derive from variations
  const tierKeys = useMemo(() => getVariationTierKeys(variations, schema), [variations, schema]);

  // Internal partial selection state to support order-agnostic, robust selection UX
  const [partial, setPartial] = useState<Record<string, string>>({});

  // Sync internal state from external selectedVariation (e.g., when product changes or selection reset)
  useEffect(() => {
    if (!selectedVariation) {
      setPartial({});
      return;
    }
    const parsed = parseVariationTiers(selectedVariation, schema);
    // Only keep known keys
    const next: Record<string, string> = {};
    tierKeys.forEach((k) => {
      if (parsed[k]) next[k] = parsed[k] as string;
    });
    setPartial(next);
  }, [selectedVariation, schema, tierKeys]);

  // Helpers to reason about compatibility
  const parsedVariations = useMemo(() =>
    (variations ?? []).map((v) => ({
      label: typeof v === 'string' ? v : v.label,
      tiers: parseVariationTiers(typeof v === 'string' ? v : v.label, schema),
    })), [variations, schema]
  );

  const matchesSelection = (tiers: Record<string, string | undefined>, sel: Record<string, string>): boolean => {
    for (const k of Object.keys(sel)) {
      if (!sel[k]) continue;
      if (tiers[k] !== sel[k]) return false;
    }
    return true;
  };

  const compatibleVariations = (sel: Record<string, string>) =>
    parsedVariations.filter((pv) => matchesSelection(pv.tiers as Record<string, string>, sel));

  const availableValuesForKey = (key: string, sel: Record<string, string>): Set<string> => {
    const selMinusKey = { ...sel };
    delete selMinusKey[key];
    const vals = new Set<string>();
    parsedVariations.forEach((pv) => {
      if (matchesSelection(pv.tiers as Record<string, string>, selMinusKey) && pv.tiers[key]) {
        vals.add(pv.tiers[key] as string);
      }
    });
    return vals;
  };

  const isValueAvailable = (key: string, value: string, sel: Record<string, string>): boolean => {
    const selMinusKey = { ...sel };
    delete selMinusKey[key];
    return parsedVariations.some((pv) =>
      pv.tiers[key] === value && matchesSelection(pv.tiers as Record<string, string>, selMinusKey)
    );
  };

  // Resolve selection changes robustly: clicking any value either toggles it, or sets it and clears conflicts
  const applyClick = (key: string, value: string) => {
    let next: Record<string, string> = { ...partial };

    // Toggle off
    if (next[key] === value) {
      delete next[key];
    } else {
      next[key] = value;
    }

    // If the new selection yields no compatible variations, fall back to only the clicked value
    if (compatibleVariations(next).length === 0) {
      next = next[key] ? { [key]: next[key] } as Record<string, string> : {};
    }

    // Clean up conflicting selections and optionally auto-select single remaining options
    tierKeys.forEach((k) => {
      const avail = availableValuesForKey(k, next);
      // Drop if current selection is not available under current constraints
      if (next[k] && !avail.has(next[k])) {
        delete next[k];
      }
      // If nothing selected for this key and only one option remains, auto-select it
      if (!next[k] && avail.size === 1) {
        next[k] = Array.from(avail)[0];
      }
    });

    setPartial(next);

    // Only emit a final label when all tiers are selected; otherwise keep parent selection empty
    const complete = tierKeys.every((k) => Boolean(next[k]));
    if (complete) {
      onVariationChange(formatVariationLabel(next, tierKeys));
    } else if (selectedVariation) {
      // Clear parent selection to avoid pricing showing as a single price for partial selections
      onVariationChange('');
    }
  };

  // If we have multiple tiers, show multi-tier selector (order agnostic, conflict-resolving)
  if (hasVariations && tierKeys.length > 1) {
    const isComplete = tierKeys.every((key) => Boolean(partial[key]));

    return (
      <div className={`space-y-6 ${className}`}>
        {tierKeys.map((tierKey) => {
          const tierValues = getVariationTierValues(variations, tierKey, schema);
          const displayName = variationTitle(
            tierKey,
            (schema && schema.titles && schema.titles[tierKey]) ?? (tierKey.charAt(0).toUpperCase() + tierKey.slice(1)),
            productId
          );

          return (
            <div key={tierKey}>
              <h3 className="text-lg font-medium text-theme-text-primary mb-4">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tierValues.map((value) => {
                  const isSelected = partial[tierKey] === value;
                  const available = isValueAvailable(tierKey, value, partial);

                  return (
                    <button
                      key={value}
                      onClick={() => applyClick(tierKey, value)}
                      className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                        isSelected
                          ? 'border-theme-accent bg-theme-accent-light text-theme-accent ring-2 ring-theme-accent/20 shadow-theme-lg'
                          : available
                            ? 'border-theme-border hover:border-theme-border-hover text-theme-text-primary hover:bg-theme-accent-light hover:shadow-theme-md'
                            : 'border-theme-border text-theme-text-tertiary opacity-60'
                      }`}
                      title={available ? undefined : 'Adjusts other options to make this available'}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-accent/10 to-theme-accent/10 animate-pulse"></div>
                      )}
                      <span className="relative">{variationValue(productId, tierKey, value, value)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isComplete && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-sm text-green-800 dark:text-green-200">
                {t('variation.selected')} <span className="font-bold">{localizeVariationLabel(productId, formatVariationLabel(partial as Record<string, string>, tierKeys), schema)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single-tier variations
  if (!hasVariations) return null;

  const normalizedVariations = (variations ?? []).map(v =>
    typeof v === 'string' ? { label: v } : { label: v.label, price: v.price, image: v.image }
  );

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-theme-text-primary mb-4">
        {t('product.optionsLabel')}
      </h3>
      <div className="flex flex-wrap gap-3">
        {normalizedVariations.map((v) => {
          const isSelected = selectedVariation === v.label;
          return (
            <button
              key={v.label}
              onClick={() => onVariationChange(v.label)}
              className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                isSelected
                  ? 'border-theme-accent bg-theme-accent-light text-theme-accent ring-2 ring-theme-accent/20 shadow-theme-lg'
                  : 'border-theme-border hover:border-theme-border-hover text-theme-text-primary hover:bg-theme-accent-light hover:shadow-theme-md'
              }`}
              title={typeof v.price === 'number' ? `৳${v.price}` : undefined}
            >
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-theme-accent/10 to-theme-accent/10 animate-pulse"></div>
              )}
              <span className="relative">{localizeVariationLabel(productId, v.label, schema)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}