export type VariationInput = string | { label: string; price?: number; image?: string };
type NormalizedVariation = { label: string; price?: number; image?: string };

function normalize(variations?: VariationInput[]): NormalizedVariation[] {
  if (!variations) return [];
  return variations.map(v =>
    typeof v === 'string'
      ? { label: v }
      : { label: v.label, price: v.price, image: v.image }
  );
}

function findMatch(variations: VariationInput[] | undefined, selected?: string): NormalizedVariation | undefined {
  const sel = (selected || '').trim().toLowerCase();
  if (!sel) return undefined;
  return normalize(variations).find(v => v.label.trim().toLowerCase() === sel);
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

export function getVariationImage(
  baseImage: string,
  variations?: VariationInput[],
  selectedVariation?: string
): string {
  const v = findMatch(variations, selectedVariation);
  if (v && v.image && typeof v.image === 'string' && v.image.trim().length > 0) {
    return v.image;
  }
  return baseImage;
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
