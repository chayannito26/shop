import React, { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { useSearchParams } from 'react-router-dom';
import { trackSearch } from '../analytics/metaPixel';
import { useI18n } from '../i18n';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
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
    const raw = searchParams.get('category');
    if (!raw) {
      setSelectedCategory(null);
      return;
    }
    const normalized = raw.trim().toLowerCase();
    const match = categories.find(c => c.toLowerCase() === normalized) || null;
    setSelectedCategory(match);

    // Strip invalid category params
    if (!match) {
      const sp = new URLSearchParams(searchParams);
      sp.delete('category');
      setSearchParams(sp, { replace: true });
    } else {
      // Track category filter as a "Search" event
      trackSearch(match, match);
    }
  }, [searchParams, categories, setSearchParams]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const toggleCategory = (cat: string | null) => {
    const newSelection = selectedCategory === cat ? null : cat;
    setSelectedCategory(newSelection);

    const sp = new URLSearchParams(searchParams);
    if (newSelection) {
      sp.set('category', newSelection);
    } else {
      sp.delete('category');
    }
    setSearchParams(sp);
    // Note: trackSearch is called from the effect above when the URL param changes
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
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
  );
}