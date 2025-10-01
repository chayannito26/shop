import React, { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { trackSearch } from '../analytics/metaPixel';
import { useI18n } from '../i18n';
import { SEOHead } from '../components/SEO/SEOHead';
import { generateCollectionPageJsonLd, generateWebPageJsonLd } from '../components/SEO/jsonLdHelpers';

export function Home() {
  // Get search params from window location
  const getSearchParam = (key: string) => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };

  const { t, categoryLabel, localizeProduct } = useI18n();

  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category))).sort(),
    []
  );

  const counts = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Read and validate category from URL (?category=...)
  useEffect(() => {
    const raw = getSearchParam('category');
    if (!raw) {
      setSelectedCategory(null);
      return;
    }
    const normalized = raw.trim().toLowerCase();
    const match = categories.find(c => c.toLowerCase() === normalized) || null;
    setSelectedCategory(match);

    if (match) {
      // Track category filter as a "Search" event
      trackSearch(match, match);
    }
  }, [categories]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const toggleCategory = (cat: string | null) => {
    const newSelection = selectedCategory === cat ? null : cat;
    setSelectedCategory(newSelection);

    const url = new URL(window.location.href);
    if (newSelection) {
      url.searchParams.set('category', newSelection);
    } else {
      url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url.toString());
    // Note: trackSearch is called from the effect above when the URL param changes
  };

  // Generate SEO data
  const pageTitle = selectedCategory 
    ? `${categoryLabel(selectedCategory)} - Chayannito 26 Official Merchandise`
    : 'Chayannito 26 Official Merchandise Store';
  
  const pageDescription = selectedCategory
    ? `Shop premium ${categoryLabel(selectedCategory).toLowerCase()} from Chayannito 26. High-quality merchandise with fast shipping and secure checkout.`
    : 'Shop official Chayannito 26 merch: premium t‑shirts, caps, hoodies, mugs, stickers and more. Fast shipping, secure checkout, limited drops.';

  const breadcrumbs = selectedCategory ? [
    { name: 'Home', url: '/' },
    { name: categoryLabel(selectedCategory), url: `/?category=${selectedCategory}` }
  ] : [];

  const keywords = selectedCategory 
    ? [`${selectedCategory}`, `Chayannito 26 ${selectedCategory}`, `batch 26 ${selectedCategory}`]
    : ['merchandise', 'apparel', 'accessories', 'premium quality', 'limited edition'];

  // JSON-LD structured data
  const collectionJsonLd = generateCollectionPageJsonLd(filteredProducts);
  const webPageJsonLd = generateWebPageJsonLd(pageTitle, pageDescription, selectedCategory ? `/?category=${selectedCategory}` : '/');

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonical={selectedCategory ? `/?category=${selectedCategory}` : '/'}
        type="website"
        keywords={keywords}
        breadcrumbs={breadcrumbs}
        jsonLd={[collectionJsonLd, webPageJsonLd]}
      />
      <div className="min-h-screen bg-theme-bg-primary transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 dark:from-red-700 dark:to-red-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('home.hero.title')}</h1>
          <p className="text-xl md:text-2xl mb-8">{t('home.hero.subtitle')}</p>
          <p className="text-lg opacity-90">
            {t('home.hero.tagline')}
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-theme-text-primary mb-4">{t('home.sections.products.title')}</h2>
          <p className="text-theme-text-secondary">
            {t('home.sections.products.subtitle')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            type="button"
            onClick={() => toggleCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              selectedCategory === null
                ? 'bg-red-600 text-white'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
            }`}
          >
            {t('home.filter.all')} ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
              }`}
            >
              {categoryLabel(category)} ({counts[category] ?? 0})
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center text-zinc-600 dark:text-zinc-300">
            <p className="mb-4">{t('home.filter.noneFound')}</p>
            <button
              type="button"
              onClick={() => toggleCategory(null)}
              className="px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
            >
              {t('home.filter.clear')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={localizeProduct(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}