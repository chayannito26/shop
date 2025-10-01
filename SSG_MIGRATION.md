# SPA to SSG Migration Summary

This document summarizes the migration from a Single Page Application (SPA) to Static Site Generation (SSG).

## What Changed

### Before (SPA)
- Single `index.html` with client-side routing via `react-router-dom`
- All pages rendered on the client after initial load
- 404.html redirected to index.html with path encoded in query param
- Navigation handled by React Router's `<Link>` and `useNavigate()`

### After (SSG)
- Separate `.html` file for each page (13 total)
- Each page has its own entry point and bundle
- Standard HTML `<a>` tags for navigation
- Proper 404.html error page

## Generated Pages

The build now generates these static HTML files:

1. `index.html` - Home page
2. `cart.html` - Shopping cart
3. `checkout.html` - Checkout page
4. `product/drop_tshirt.html` - Product page
5. `product/hoodie.html` - Product page
6. `product/mug.html` - Product page
7. `product/totebag.html` - Product page
8. `product/notebook.html` - Product page
9. `product/pen.html` - Product page
10. `product/bottle.html` - Product page
11. `product/phonecover.html` - Product page
12. `product/sticker.html` - Product page
13. `404.html` - Error page

## Technical Implementation

### New Scripts
- `scripts/generate-pages.ts` - Generates HTML entry points for all pages before build
- `npm run generate:pages` - Runs the page generation script

### New Entry Points
- `src/entries/home.tsx` - Entry for home page
- `src/entries/cart.tsx` - Entry for cart page
- `src/entries/checkout.tsx` - Entry for checkout page
- `src/entries/product.tsx` - Entry for product pages

### Removed Components
- `src/App.tsx` - Old SPA root component
- `src/main.tsx` - Old SPA entry point
- `src/components/ScrollToTop.tsx` - SPA-specific scroll restoration
- `src/analytics/MetaPixelRouteListener.tsx` - SPA route change tracking

### Removed Dependencies
- `react-router-dom` - No longer needed for static pages

### Modified Files
- `vite.config.ts` - Configured for multi-page build
- `index.html` - Removed SPA redirect script
- `public/404.html` - Now a proper 404 page instead of SPA redirect
- All page components - Replaced router navigation with standard links
- `package.json` - Added `generate:pages` script to build pipeline

## Navigation Changes

### Links
```tsx
// Before (SPA)
<Link to="/cart">Cart</Link>

// After (SSG)
<a href="/cart.html">Cart</a>
```

### Programmatic Navigation
```tsx
// Before (SPA)
navigate('/checkout');

// After (SSG)
window.location.href = '/checkout.html';
```

### URL Parameters
```tsx
// Before (SPA)
const [searchParams] = useSearchParams();
const category = searchParams.get('category');

// After (SSG)
const params = new URLSearchParams(window.location.search);
const category = params.get('category');
```

### Route Parameters
```tsx
// Before (SPA)
const { id } = useParams();

// After (SSG)
const path = window.location.pathname;
const match = path.match(/\/product\/([^/.]+)/);
const id = match ? match[1] : null;
```

## Build Process

1. `npm run generate:catalog` - Generates product catalog CSV
2. `npm run generate:pages` - Generates HTML entry points for all pages
3. `vite build` - Builds all pages with Vite's multi-page mode

## Benefits

1. **Better SEO** - Each page is a complete HTML document that search engines can index
2. **Faster Initial Load** - No need to load router or parse routes
3. **Simpler Deployment** - No special server configuration needed
4. **Better Cache Control** - Each page can be cached independently
5. **Improved Performance** - No client-side routing overhead

## Remaining Considerations

- The site still requires JavaScript for interactivity (cart, checkout, etc.)
- Meta Pixel tracking still works on each page load
- All existing features (cart, i18n, dark mode) continue to work
- URLs now include `.html` extension (can be removed with server rewrite rules)
