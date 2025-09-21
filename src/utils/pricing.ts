export type VariationInput =
  | string
  | { label: string; price?: number; image?: string | string[] };
type NormalizedVariation = { label: string; price?: number; image?: string | string[] };

// Multi-tier variation support
export interface VariationTier {
  color?: string;
  size?: string;
  [key: string]: string | undefined;
}

export function parseVariationTiers(label: string): VariationTier {
  // Parse variations like "White-L", "Black-M", etc.
  const parts = label.split('-');
  if (parts.length === 2) {
    return { color: parts[0], size: parts[1] };
  }
  // For single tier variations, treat as size if it's a size, otherwise as color
  const sizePattern = /^(XS|S|M|L|XL|XXL|XXXL|\d+)$/i;
  if (sizePattern.test(label)) {
    return { size: label };
  }
  return { color: label };
}

export function formatVariationLabel(tiers: VariationTier): string {
  const parts = [];
  if (tiers.color) parts.push(tiers.color);
  if (tiers.size) parts.push(tiers.size);
  return parts.join('-');
}

export function getUniqueColors(variations?: VariationInput[]): string[] {
  if (!variations) return [];
  const colors = new Set<string>();
  variations.forEach(v => {
    const label = typeof v === 'string' ? v : v.label;
    const tiers = parseVariationTiers(label);
    if (tiers.color) colors.add(tiers.color);
  });
  return Array.from(colors).sort();
}

export function getUniqueSizes(variations?: VariationInput[]): string[] {
  if (!variations) return [];
  const sizes = new Set<string>();
  variations.forEach(v => {
    const label = typeof v === 'string' ? v : v.label;
    const tiers = parseVariationTiers(label);
    if (tiers.size) sizes.add(tiers.size);
  });
  // Sort sizes in logical order
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  return Array.from(sizes).sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a);
    const bIndex = sizeOrder.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function getVariationByTiers(variations?: VariationInput[], color?: string, size?: string): NormalizedVariation | undefined {
  if (!variations) return undefined;
  const targetLabel = formatVariationLabel({ color, size });
  return normalize(variations).find(v => v.label === targetLabel);
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
