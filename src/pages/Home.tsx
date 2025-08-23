import React, { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { useSearchParams } from 'react-router-dom';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Chayannito 26</h1>
          <p className="text-xl md:text-2xl mb-8">Official Merchandise Store</p>
          <p className="text-lg opacity-90">
            Represent your batch with pride! High-quality merchandise designed for Chayannito 26.
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Products</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Discover our collection of premium merchandise designed exclusively for Chayannito 26
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
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            All ({products.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800'
              }`}
            >
              {category} ({counts[category] ?? 0})
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p className="mb-4">No products found for the selected category.</p>
            <button
              type="button"
              onClick={() => toggleCategory(null)}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}