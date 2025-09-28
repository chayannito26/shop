import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import fetch from 'node-fetch';

// Use dynamic import for sharp so repository doesn't fail when dependency missing
let sharp: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sharp = await import('sharp');
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('`sharp` is not installed. Please run `npm install -D sharp` and re-run this script.');
  process.exit(1);
}

import { products } from '../src/data/products';
import { getProductImages } from '../src/utils/pricing';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUT_DIR = join(__dirname, '../public/images');
mkdirSync(OUT_DIR, { recursive: true });

function asLocalPath(url: string): string | null {
  // If URL looks like a local public path, convert to workspace file path
  // Examples in data use https://shop.chayannito26.com/images/..., we also check public/images and images_original
  try {
    const u = new URL(url);
    const p = u.pathname.replace(/^\//, '');
    const local1 = join(__dirname, '..', p); // public/images/...
    if (existsSync(local1)) return local1;
  } catch {
    // not a valid absolute URL, maybe already a relative/local path
    const tryLocal = join(__dirname, '..', url);
    if (existsSync(tryLocal)) return tryLocal;
  }
  // Try images_original folder
  const name = basename(url);
  const orig = join(__dirname, '..', 'images_original', name);
  if (existsSync(orig)) return orig;
  return null;
}

async function fetchImage(url: string): Promise<Buffer> {
  const local = asLocalPath(url);
  if (local) return readFileSync(local);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

function outNameForProduct(p: any): string {
  if (p.thumbnail) {
    try {
      const u = new URL(p.thumbnail);
      return basename(u.pathname).replace(/\.[^.]+$/, '') + '.webp';
    } catch {
      return basename(String(p.thumbnail)).replace(/\.[^.]+$/, '') + '.webp';
    }
  }
  return `${p.id}_thumb.webp`;
}

async function processOne(p: any) {
  const imgs = getProductImages(p.image, p.variations);
  if (!imgs || imgs.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(`Skipping ${p.id} — no source images`);
    return { id: p.id, status: 'skipped', reason: 'no-source' };
  }

  const src = imgs[0];
  try {
    const buf = await fetchImage(src);
    const outName = outNameForProduct(p);
    const outPath = join(OUT_DIR, outName);
    // Resize to fit within 400x400 preserving aspect ratio, pad to exactly 400x400 with transparent background, convert to webp
    const pipeline = sharp.default ? sharp.default(buf) : sharp(buf);
    const meta = await pipeline.metadata();
    const resized = pipeline
      .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 80 });
    const outBuf = await resized.toBuffer();
    writeFileSync(outPath, outBuf);
    // eslint-disable-next-line no-console
    console.log(`Wrote ${outPath} (${meta.width}x${meta.height})`);
    return { id: p.id, status: 'ok', out: outPath };
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error(`Failed ${p.id}: ${err.message}`);
    return { id: p.id, status: 'error', reason: String(err) };
  }
}

async function main() {
  const results: any[] = [];
  for (const p of products) {
    // mark in-progress in todo list? we will just process
    // eslint-disable-next-line no-await-in-loop
    const r = await processOne(p);
    results.push(r);
  }

  const ok = results.filter(r => r.status === 'ok').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const err = results.filter(r => r.status === 'error').length;
  // eslint-disable-next-line no-console
  console.log(`Done — ${ok} written, ${skipped} skipped, ${err} errors`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
