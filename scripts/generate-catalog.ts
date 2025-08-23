/* Generates CSV feed for Meta Commerce Manager from src/data/products.ts
   Output: public/catalog/products.csv
   Usage:
     - SITE_URL can be overridden via env; default below
*/
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { products } from '../src/data/products';
import { getVariationPrice, getVariationImage, getNormalizedVariations } from '../src/utils/pricing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = process.env.SITE_URL || 'https://shop.chayannito26.com'; // TODO: set your live domain
const BRAND = 'Chayannito 26';

// Required fields for FB (Meta) feed
type Row = {
  id: string;
  title: string;
  description: string;
  availability: 'in stock' | 'out of stock' | 'preorder';
  condition: 'new' | 'refurbished' | 'used';
  price: string; // e.g., "350 BDT"
  link: string;
  image_link: string;
  brand: string;
  item_group_id?: string;
  size?: string;
};

function esc(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: Row[]): string {
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'item_group_id',
    'size',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.title,
        r.description,
        r.availability,
        r.condition,
        r.price,
        r.link,
        r.image_link,
        r.brand,
        r.item_group_id ?? '',
        r.size ?? '',
      ].map(esc).join(',')
    );
  }
  return lines.join('\n');
}

function buildRows(): Row[] {
  const rows: Row[] = [];

  for (const p of products) {
    const variations = getNormalizedVariations(p.variations);

    // If product has variations, emit a row per variation; else single row.
    if (variations.length > 0) {
      for (const v of variations) {
        const varLabel = v.label.trim();
        const unitPrice = getVariationPrice(p.price, p.variations, varLabel);
        const image = getVariationImage(p.image, p.variations, varLabel);

        const id = `${p.id}-${varLabel.replace(/\s+/g, '-').toLowerCase()}`;
        const title = `${p.name} - ${varLabel}`;
        const link = `${SITE_URL}/product/${p.id}`;
        rows.push({
          id,
          title,
          description: p.description,
          availability: 'in stock',
          condition: 'new',
          price: `${unitPrice} BDT`,
          link,
          image_link: image,
          brand: BRAND,
          item_group_id: p.id,
          size: varLabel,
        });
      }
    } else {
      const id = p.id;
      const link = `${SITE_URL}/product/${p.id}`;
      rows.push({
        id,
        title: p.name,
        description: p.description,
        availability: 'in stock',
        condition: 'new',
        price: `${p.price} BDT`,
        link,
        image_link: p.image,
        brand: BRAND,
        item_group_id: p.id,
      });
    }
  }

  return rows;
}

function main() {
  const outPath = `${__dirname}/../public/catalog/products.csv`;
  mkdirSync(dirname(outPath), { recursive: true });
  const rows = buildRows();
  const csv = toCsv(rows);
  writeFileSync(outPath, csv, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Generated ${rows.length} rows -> public/catalog/products.csv`);
}

main();