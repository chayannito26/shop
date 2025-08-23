import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';
import { getMinMaxPrice, getVariationPrice, getNormalizedVariations, getVariationImage } from '../utils/pricing';
import { getBulkUnitCost, pickActiveBulkRate } from '../utils/pricing';
import { trackViewContent, trackAddToCart, trackCustomizeProduct } from '../analytics/metaPixel';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const product = products.find(p => p.id === id);

  useEffect(() => {
    if (!product) return;
    // ViewContent once when the product page loads
    trackViewContent({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price
    });
  }, [product?.id]); // run once per product view

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Normalized variations and pricing
  const variations = getNormalizedVariations(product?.variations);
  const unitPrice = product ? getVariationPrice(product.price, product.variations, selectedVariation) : 0;
  const { min, max } = product ? getMinMaxPrice(product.price, product.variations) : { min: 0, max: 0 };
  const displayImage = useMemo(
    () => (product ? getVariationImage(product.image, product.variations, selectedVariation) : ''),
    [product, selectedVariation]
  );

  // Developer-only visibility for the internal “bought-at” panel:
  const showBoughtRates = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname || '';
    const isLocal =
      host === 'localhost' ||
      host.startsWith('127.') ||
      host.startsWith('192.');
    const unlocked = localStorage.getItem('SHOW_BULK_RATES') === '1';
    return isLocal || unlocked;
  }, []);

  const currentUnitCost = useMemo(() => {
    if (!product) return null;
    return getBulkUnitCost(product.bulkRates, product.unitsSold);
  }, [product]);

  const activeTier = useMemo(() => {
    if (!product) return undefined;
    return pickActiveBulkRate(product.bulkRates, product.unitsSold);
  }, [product]);

  const handleAddToCart = () => {
    if (product?.variations && product.variations.length > 0 && product.id !== 'phonecover' && !selectedVariation) {
      alert('Please select a size/variation');
      return;
    }
    if (product?.id === 'phonecover' && !selectedVariation) {
      alert('Please enter your phone model (e.g., iPhone 12, Samsung A12)');
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        product,
        selectedVariation: selectedVariation || undefined
      }
    });

    // Meta Pixel: AddToCart (one per click)
    trackAddToCart(
      { id: product.id, name: product.name, category: product.category },
      unitPrice,
      selectedVariation || undefined
    );

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleBuyNow = () => {
    if (product?.variations && product.variations.length > 0 && product.id !== 'phonecover' && !selectedVariation) {
      alert('Please select a size/variation');
      return;
    }
    if (product?.id === 'phonecover' && !selectedVariation) {
      alert('Please enter your phone model (e.g., iPhone 12, Samsung A12)');
      return;
    }

    dispatch({
      type: 'SET_DIRECT_ORDER',
      payload: {
        product,
        selectedVariation: selectedVariation || undefined,
        quantity
      }
    });

    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
            <img
              src={displayImage}
              alt={product.name}
              className="h-96 w-full object-cover object-center"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">
              ৳{selectedVariation ? unitPrice : (min === max ? min : `${min} - ${max}`)}
            </p>

            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium capitalize">
                {product.category}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">{product.description}</p>

            {/* Internal: Bought-at (procurement) rate panel */}
            {showBoughtRates && product.bulkRates && product.bulkRates.length > 0 && (
              <div className="mb-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 bg-gray-50/60 dark:bg-gray-800/60">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Bought-at rate (internal)
                  </h3>
                  <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    Dev-only
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  Units sold: <span className="font-semibold">{product.unitsSold ?? 0}</span>
                  {currentUnitCost !== null && (
                    <>
                      {' '}• Current unit cost:{' '}
                      <span className="font-semibold">৳{currentUnitCost}</span>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.bulkRates
                    .slice()
                    .sort((a, b) => a.units - b.units)
                    .map((r) => {
                      const perUnit =
                        typeof r.unitPrice === 'number'
                          ? r.unitPrice
                          : (typeof r.totalPrice === 'number' && r.units > 0
                              ? Math.round((r.totalPrice / r.units) * 100) / 100
                              : undefined);
                      const total =
                        typeof r.totalPrice === 'number'
                          ? r.totalPrice
                          : (typeof r.unitPrice === 'number'
                              ? Math.round(r.unitPrice * r.units * 100) / 100
                              : undefined);
                      const isActive = activeTier && activeTier.units === r.units;
                      return (
                        <div
                          key={r.units}
                          className={`rounded border p-2 text-xs ${
                            isActive
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                          }`}
                          title={isActive ? 'Active tier' : undefined}
                        >
                          <div className="font-medium text-gray-800 dark:text-gray-100">
                            {r.units} pcs
                          </div>
                          <div className="text-gray-600 dark:text-gray-300">
                            {total !== undefined && <>Total: ৳{total}</>}{' '}
                            {perUnit !== undefined && <>({`৳${perUnit}`} ea)</>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Variations OR Phone Model input */}
            {product.id === 'phonecover' ? (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Phone Model:</h3>
                <input
                  type="text"
                  placeholder="e.g., iPhone 12, Samsung Galaxy A12"
                  value={selectedVariation}
                  onChange={(e) => setSelectedVariation(e.target.value)}
                  onBlur={() => {
                    if (selectedVariation.trim()) {
                      trackCustomizeProduct(
                        { id: product.id, name: product.name, category: product.category },
                        selectedVariation.trim(),
                        product.price
                      );
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Please provide exact model for a proper fit.</p>
              </div>
            ) : (
              product.variations && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    {product.category === 'clothing' ? 'Size' : 'Options'}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {variations.map((v) => (
                      <button
                        key={v.label}
                        onClick={() => {
                          setSelectedVariation(v.label);
                          const priceForV = getVariationPrice(product.price, product.variations, v.label);
                          trackCustomizeProduct(
                            { id: product.id, name: product.name, category: product.category },
                            v.label,
                            priceForV
                          );
                        }}
                        className={`px-4 py-2 border rounded-md transition-colors ${
                          selectedVariation === v.label
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                        }`}
                        title={typeof v.price === 'number' ? `৳${v.price}` : `৳${product.price}`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Quantity:</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                >
                  -
                </button>
                <span className="text-xl font-medium px-4 text-gray-900 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-green-600 dark:bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Buy Now - ৳{unitPrice * quantity}</span>
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
             <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                Product added to cart successfully!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}