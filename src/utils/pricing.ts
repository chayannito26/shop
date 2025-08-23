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
