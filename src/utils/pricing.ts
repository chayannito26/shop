export type VariationInput =
  | string
  | { label: string; price?: number; image?: string | string[] };
type NormalizedVariation = { label: string; price?: number; image?: string | string[] };

// Multi-tier variation support
export interface VariationTier {
  [key: string]: string | undefined;
}

export type VariationSchema = {
  // Keys define the ordered tier keys (first entry corresponds to first token in label)
  keys: string[];
  // Optional human-friendly titles for each tier key
  titles?: Record<string, string>;
};

/**
 * Parse a variation label into a key->value map. When a schema is provided the
 * schema.keys are used as the tier names (by position). When no schema is
 * provided we fall back to the previous heuristics for backwards compatibility.
 */
export function parseVariationTiers(label: string, schema?: VariationSchema): VariationTier {
  const parts = label.split('-').map(p => p.trim()).filter(Boolean);
  if (schema && schema.keys && schema.keys.length > 0) {
    const result: VariationTier = {};
    parts.forEach((part, idx) => {
      const key = schema.keys[idx] ?? `tier${idx + 1}`;
      result[key] = part;
    });
    return result;
  }

  // Backwards-compatible heuristics
  if (parts.length === 1) {
    const sizePattern = /^(XS|S|M|L|XL|XXL|XXXL|\d+|A\d+)$/i;
    const colorPattern = /^(white|black|red|blue|green|yellow|purple|pink|orange|gray|grey|brown)$/i;

    const single = parts[0];
    if (sizePattern.test(single)) return { size: single };
    if (colorPattern.test(single)) return { color: single };
    return { option: single };
  }

  if (parts.length === 2) {
    const [first, second] = parts;
    const sizePattern = /^(XS|S|M|L|XL|XXL|XXXL|\d+|A\d+)$/i;
    const colorPattern = /^(white|black|red|blue|green|yellow|purple|pink|orange|gray|grey|brown)$/i;
    const firstIsSize = sizePattern.test(first);
    const secondIsSize = sizePattern.test(second);
    const firstIsColor = colorPattern.test(first);
    const secondIsColor = colorPattern.test(second);
    if (firstIsColor && secondIsSize) return { color: first, size: second };
    if (firstIsSize && secondIsColor) return { size: first, color: second };
    return { primary: first, secondary: second };
  }

  // Multiple parts -> numbered tiers
  const result: VariationTier = {};
  parts.forEach((part, index) => {
    result[`tier${index + 1}`] = part;
  });
  return result;
}

export function formatVariationLabel(tiers: VariationTier, order?: string[]): string {
  if (!tiers) return '';
  if (order && order.length > 0) {
    const parts: string[] = [];
    order.forEach((k) => {
      const v = tiers[k];
      if (v) parts.push(v);
    });
    return parts.join('-');
  }
  const parts = Object.values(tiers).filter(Boolean);
  return parts.join('-');
}

export function getVariationTierKeys(variations?: VariationInput[], schema?: VariationSchema): string[] {
  if (!variations) return [];
  if (schema && schema.keys && schema.keys.length > 0) return [...schema.keys];

  const tierKeys = new Set<string>();
  variations.forEach(v => {
    const label = typeof v === 'string' ? v : v.label;
    const tiers = parseVariationTiers(label);
    Object.keys(tiers).forEach(key => tierKeys.add(key));
  });

  // Preserve insertion order and return as array
  return Array.from(tierKeys);
}

export function getVariationTierValues(variations?: VariationInput[], tierKey?: string, schema?: VariationSchema): string[] {
  if (!variations || !tierKey) return [];

  const values = new Set<string>();
  variations.forEach(v => {
    const label = typeof v === 'string' ? v : v.label;
    const tiers = parseVariationTiers(label, schema);
    if (tiers[tierKey]) values.add(tiers[tierKey] as string);
  });
  
  // Sort values intelligently
  const sorted = Array.from(values).sort((a, b) => {
    // For sizes, use specific order
    if (tierKey === 'size') {
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const aIndex = sizeOrder.indexOf(a);
      const bIndex = sizeOrder.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }
    
    // For colors, use common color order
    if (tierKey === 'color') {
      const colorOrder = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'orange', 'gray', 'grey', 'brown'];
      const aIndex = colorOrder.indexOf(a.toLowerCase());
      const bIndex = colorOrder.indexOf(b.toLowerCase());
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
    }
    
    return a.localeCompare(b);
  });
  
  return sorted;
}

export function getVariationByTiers(variations?: VariationInput[], selectedTiers?: VariationTier): NormalizedVariation | undefined {
  if (!variations || !selectedTiers) return undefined;
  // Determine an ordered view of keys from the variations themselves so that
  // the formatted label matches the stored labels. Use derived keys order.
  const tierKeys = getVariationTierKeys(variations);
  const targetLabel = formatVariationLabel(selectedTiers, tierKeys);
  return normalize(variations).find(v => v.label === targetLabel);
}

// Legacy functions for backward compatibility
export function getUniqueColors(variations?: VariationInput[]): string[] {
  return getVariationTierValues(variations, 'color');
}

export function getUniqueSizes(variations?: VariationInput[]): string[] {
  return getVariationTierValues(variations, 'size');
}

function normalize(variations?: VariationInput[]): NormalizedVariation[] {
  if (!variations) return [];
  return variations.map((v) =>
    typeof v === 'string' ? { label: v } : { label: v.label, price: v.price, image: v.image }
  );
}

function findMatch(
  variations: VariationInput[] | undefined,
  selected?: string
): NormalizedVariation | undefined {
  const sel = (selected || '').trim().toLowerCase();
  if (!sel) return undefined;
  return normalize(variations).find((v) => v.label.trim().toLowerCase() === sel);
}

export function getVariationPrice(basePrice: number, variations?: VariationInput[], selectedVariation?: string): number {
  const v = findMatch(variations, selectedVariation);
  if (v && typeof v.price === 'number' && Number.isFinite(v.price) && v.price >= 0) {
    return v.price;
  }
  return basePrice;
}

export function getMinMaxPrice(basePrice: number, variations?: VariationInput[]): { min: number; max: number } {
  const norms = normalize(variations);
  if (norms.length === 0) return { min: basePrice, max: basePrice };
  const prices = norms.map(v => (typeof v.price === 'number' && Number.isFinite(v.price) && v.price >= 0) ? v.price : basePrice);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max };
}

export function getNormalizedVariations(variations?: VariationInput[]): NormalizedVariation[] {
  return normalize(variations);
}

/**
 * Return an array of images for a product/variation in display order.
 * Accepts a base image (string or array) and optional variation images
 * (string or array). The priority is: variation.images -> baseImage array -> baseImage string.
 * Returns an empty array when nothing valid is found.
 */
export function getProductImages(
  baseImage: string | string[],
  variations?: VariationInput[],
  selectedVariation?: string
): string[] {
  const v = findMatch(variations, selectedVariation);
  if (v && v.image) {
    if (Array.isArray(v.image)) return v.image.filter(Boolean);
    if (typeof v.image === 'string' && v.image.trim().length > 0) return [v.image];
  }

  if (Array.isArray(baseImage)) return baseImage.filter(Boolean);
  if (typeof baseImage === 'string' && baseImage.trim().length > 0) return [baseImage];
  return [];
}

export function getVariationImage(
  baseImage: string | string[],
  variations?: VariationInput[],
  selectedVariation?: string
): string {
  const imgs = getProductImages(baseImage, variations, selectedVariation);
  return imgs.length > 0 ? imgs[0] : '';
}

// Bulk tier support: either specify totalPrice for exactly 'units' pcs,
// or specify unitPrice for 'units' pcs. Both systems are supported.
export type BulkRate = {
  units: number;
  totalPrice?: number; // e.g., 100 pcs => 280 Tk (total)
  unitPrice?: number;  // e.g., 100 pcs => 2.8 Tk per unit
};

// Pick the best tier for a given 'unitsSold'.
// Priority: exact match -> greatest tier <= unitsSold -> smallest tier (fallback).
export function pickActiveBulkRate(
  rates?: BulkRate[],
  unitsSold?: number
): BulkRate | undefined {
  if (!rates || rates.length === 0 || typeof unitsSold !== 'number') return undefined;
  const sorted = [...rates].sort((a, b) => a.units - b.units);
  const exact = sorted.find(r => r.units === unitsSold);
  if (exact) return exact;
  const lower = sorted.filter(r => r.units <= unitsSold);
  if (lower.length > 0) return lower[lower.length - 1];
  return sorted[0];
}

// Compute per-unit cost for the current active tier.
// If the tier uses totalPrice, divide by units; if unitPrice provided, use directly.
export function getBulkUnitCost(
  rates?: BulkRate[],
  unitsSold?: number
): number | null {
  const tier = pickActiveBulkRate(rates, unitsSold);
  if (!tier) return null;
  const unit = typeof tier.unitPrice === 'number'
    ? tier.unitPrice
    : (typeof tier.totalPrice === 'number' && tier.units > 0
        ? tier.totalPrice / tier.units
        : NaN);
  if (!Number.isFinite(unit)) return null;
  // round to 2 decimals for display
  return Math.round(unit * 100) / 100;
}
