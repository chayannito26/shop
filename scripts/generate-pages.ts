/* Generate HTML entry points for SSG */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');

// Base HTML template for all pages
function generatePageHTML(pageName: string, entryPath: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chayannito 26 Official Merchandise Store</title>
    <meta name="theme-color" content="#DC2626">
    
    <!-- Static app manifest / platform tags -->
    <meta name="msapplication-TileImage" content="/logo.png">
    <meta name="msapplication-config" content="/browserconfig.xml">
    
    <!-- Preconnect to external domains for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://www.facebook.com">
    <link rel="preconnect" href="https://www.clarity.ms">
    
    <!-- DNS Prefetch -->
    <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
    <link rel="dns-prefetch" href="//firebase.googleapis.com">
    
    <!-- Tesseract.js for in-browser OCR -->
    <script src="https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js" defer></script>
    
    <!-- Meta Pixel Code -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '1110583841135761');
      fbq('track', 'PageView');
    </script>
    
    <!-- Microsoft Clarity -->
    <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "t8pyyzw6dy");
    </script>
  </head>
  <body>
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1110583841135761&ev=PageView&noscript=1"
    /></noscript>
    <div id="root"></div>
    <script type="module" src="${entryPath}"></script>
  </body>
</html>
`;
}

function main() {
  // Generate cart.html
  writeFileSync(
    resolve(root, 'cart.html'),
    generatePageHTML('cart', '/src/entries/cart.tsx')
  );
  console.log('Generated cart.html');

  // Generate checkout.html
  writeFileSync(
    resolve(root, 'checkout.html'),
    generatePageHTML('checkout', '/src/entries/checkout.tsx')
  );
  console.log('Generated checkout.html');

  // Generate product pages
  mkdirSync(resolve(root, 'product'), { recursive: true });
  for (const product of products) {
    const htmlPath = resolve(root, 'product', `${product.id}.html`);
    writeFileSync(
      htmlPath,
      generatePageHTML(`product-${product.id}`, '/src/entries/product.tsx')
    );
    console.log(`Generated product/${product.id}.html`);
  }

  console.log(`\nTotal pages generated: ${2 + products.length}`);
}

main();
