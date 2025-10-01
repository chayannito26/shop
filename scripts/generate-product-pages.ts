import fs from 'fs';
import path from 'path';
import { products } from '../src/data/products';

type Product = Record<string, unknown>;

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function firstImage(product: Product): string | null {
  if (product.thumbnail) return product.thumbnail;
  const img = product.image;
  if (!img) return null;
  if (Array.isArray(img)) return img[0] ?? null;
  return img;
}

function makeHtml(product: Product, siteBase = '') {
  const slug = String((product as any).id || '');
  const title = String((product as any).name || slug);
  const description = String((product as any).description || '');
  const image = firstImage(product as any) || '/image.jpg';
  const url = `${siteBase}/product/${slug}/`;

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description: description,
    image: Array.isArray((product as any).image) ? (product as any).image : [image],
    sku: slug,
    url,
  };

  if (typeof (product as any).price !== 'undefined') {
    const price = (product as any).price;
    const comingSoon = !!(product as any).comingSoon;
    jsonLd.offers = {
      '@type': 'Offer',
      price: String(price),
      // Default currency is USD — change if your store uses another currency
      priceCurrency: 'USD',
      availability: comingSoon ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
    };
  }

  const jsonLdString = JSON.stringify(jsonLd);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />

    <!-- Open Graph / Social -->
    <meta property="og:type" content="product" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <script type="application/ld+json">${jsonLdString}</script>

    <!-- Minimal styling so the static preview looks reasonable -->
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:2rem}</style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <p><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="max-width:420px;width:100%;height:auto"/></p>
    <p><a href="/product/${encodeURIComponent(slug)}/">Open product in the shop</a></p>
    <p><small>This is a pre-rendered product page generated at build time for crawlers and social cards.</small></p>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function writeProductPage(product: Product) {
  const slug = product.id;
  if (!slug) return;
  const outDir = path.join(process.cwd(), 'public', 'products', slug);
  ensureDir(outDir);
  const html = makeHtml(product);
  const outPath = path.join(outDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('Wrote', outPath);
}

function main() {
  if (!products || !Array.isArray(products)) {
    console.error('No products found or unexpected shape in ../src/data/products');
    process.exit(1);
  }

  for (const p of products) {
    try {
      writeProductPage(p);
    } catch (err) {
      console.error('Failed to write product page for', p && p.id, err);
    }
  }
}

main();
