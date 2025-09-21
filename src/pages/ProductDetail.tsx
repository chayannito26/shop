import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Zap } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { products } from '../data/products';
import { getMinMaxPrice, getVariationPrice, getProductImages } from '../utils/pricing';
import { getBulkUnitCost, pickActiveBulkRate } from '../utils/pricing';
import { trackViewContent, trackAddToCart, trackCustomizeProduct } from '../analytics/metaPixel';
import { useI18n } from '../i18n';
import { useModal } from '../contexts/ModalContext';
import { VariationSelector } from '../components/VariationSelector';
import { ImageZoom } from '../components/ImageZoom';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t, productName, productDescription, categoryLabel } = useI18n();
  const { showAlert } = useModal();

  const product = products.find(p => p.id === id);
  // Derived values and memoized helpers must be declared unconditionally
  const unitPrice = product ? getVariationPrice(product.price, product.variations, selectedVariation) : 0;
  const { min, max } = product ? getMinMaxPrice(product.price, product.variations) : { min: 0, max: 0 };
  const images = useMemo(() => {
    if (!product) return [] as string[];
    return getProductImages(product.image, product.variations, selectedVariation);
  }, [product, selectedVariation]);

  const displayImage = useMemo(() => (images.length > 0 ? images[0] : ''), [images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Keep activeImageIndex in sync with images array changes (e.g., variation selected)
  const serializedImages = images.join('|');
  useEffect(() => {
    setActiveImageIndex(0);
  }, [serializedImages]);

  // Note: No default selection for notebook - user should choose all variation tiers

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

  useEffect(() => {
    if (!product) return;
    // ViewContent once when the product page loads
    trackViewContent({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price
    });
  }, [product]); // run once per product view

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('product.notFound')}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            {t('product.returnHome')}
          </button>
        </div>
      </div>
    );
  }

  // (derived values are declared earlier to keep hooks stable)

  const handleAddToCart = () => {
    if (product?.variations && product.variations.length > 0 && product.id !== 'phonecover' && !selectedVariation) {
      showAlert(t('product.validation.selectVariation'));
      return;
    }
    if (product?.id === 'phonecover' && !selectedVariation) {
      showAlert(t('product.validation.enterPhoneModel'));
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
  showAlert(t('product.validation.selectVariation'));
      return;
    }
    if (product?.id === 'phonecover' && !selectedVariation) {
  showAlert(t('product.validation.enterPhoneModel'));
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
          {t('product.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image with Zoom */}
          <div>
            {displayImage ? (
              <ImageZoom
                images={images}
                activeIndex={activeImageIndex}
                onImageChange={setActiveImageIndex}
                alt={product.name}
              />
            ) : (
              <div className="aspect-square w-full rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">No image available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {productName(product.id, product.name)}
            </h1>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">
              ৳{selectedVariation ? unitPrice : (min === max ? min : `${min} - ${max}`)}
            </p>

            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm font-medium capitalize">
                {categoryLabel(product.category)}
              </span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              {productDescription(product.id, product.description)}
            </p>

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
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{t('product.phoneModel.label')}</h3>
                <input
                  type="text"
                  placeholder={t('product.phoneModel.placeholder')}
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 mt-1">{t('product.phoneModel.help')}</p>
              </div>
            ) : (
              product.variations && (
                <VariationSelector
                  variations={product.variations}
                  selectedVariation={selectedVariation}
                  onVariationChange={(variation) => {
                    setSelectedVariation(variation);
                    const priceForV = getVariationPrice(product.price, product.variations, variation);
                    trackCustomizeProduct(
                      { id: product.id, name: product.name, category: product.category },
                      variation,
                      priceForV
                    );
                  }}
                  schema={product.variationSchema}
                  productId={product.id}
                  className="mb-6"
                />
              )
            )}

            {/* Enhanced Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('product.quantity')}</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-400 dark:hover:border-red-500 transition-all duration-200 text-xl font-bold text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  −
                </button>
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 min-w-[80px] text-center">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{quantity}</span>
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-400 dark:hover:border-red-500 transition-all duration-200 text-xl font-bold text-gray-900 dark:text-white transform hover:scale-105 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                <Zap className="h-5 w-5 group-hover:animate-pulse" />
                <span>{t('product.buyNow')} - ৳{unitPrice * quantity}</span>
              </button>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                <ShoppingCart className="h-5 w-5 group-hover:animate-bounce" />
                <span>{t('product.addToCart')}</span>
              </button>
            </div>

            {/* 'No money' Help Button (localized) */}
            <div className="mt-4">
              <button
                onClick={() =>
                  showAlert(
                    t('product.noMoney.message', { name: productName(product.id, product.name) }),
                    { title: t('product.noMoney.title'), primaryLabel: t('product.noMoney.button') }
                  )
                }
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {t('product.noMoney.button')}
              </button>
            </div>

            {/* Success Message */}
            {showSuccess && (
             <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                {t('product.addedToCart')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}