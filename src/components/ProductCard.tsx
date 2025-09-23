// React namespace not required with JSX transform; keep imports minimal
import { Link } from 'react-router-dom';
import { Product } from '../contexts/CartContext';
import { getMinMaxPrice } from '../utils/pricing';
import { useI18n } from '../i18n';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { min, max } = getMinMaxPrice(product.price, product.variations);
  const priceLabel = min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  const { categoryLabel } = useI18n();
  const [imageLoaded, setImageLoaded] = useState(false);

  // product.image can be string or string[]; prefer first element
  const primaryImage = Array.isArray(product.image) ? product.image[0] ?? '' : product.image ?? '';

  return (
    <div className="group relative h-full">
      <Link to={`/product/${product.id}`}>
        <div className="bg-theme-bg-secondary rounded-2xl shadow-theme-lg overflow-hidden transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-theme-lg border border-theme-border h-full flex flex-col">

          {/* Image Container with Loading State */}
          <div className="relative aspect-square w-full overflow-hidden bg-theme-bg-tertiary">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-theme-bg-tertiary animate-pulse"></div>
            )}
            <img
              src={primaryImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                // Fallback for broken images
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVDMTA4LjU3OSA3NSA3NSAxMDguNTc5IDc1IDE1MFMxMDguNTc5IDIyNSAxNTAgMjI1UzIyNSAxOTEuNDIxIDIyNSAxNTBTMTkxLjQyMSA3NSAxNTAgNzVaTTE1MCAyMDBDMTMwLjExOCAyMDAgMTE0IDE3My44ODIgMTE0IDE1NVMxMzAuMTE4IDExMCAxNTAgMTEwUzE4NiAxMzAuMTE4IDE4NiAxNTBTMTY5Ljg4MiAyMDAgMTUwIDIwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                setImageLoaded(true);
              }}
            />

            {/* Sale Badge (if applicable) */}
            {min !== max && (
              <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold transition-opacity duration-300">
                From ৳{min}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex-1 flex flex-col">
            <div className="mb-3 flex-1">
              <h3 className="text-lg font-semibold text-theme-text-primary mb-2 line-clamp-2 group-hover:text-theme-accent transition-colors duration-300">
                {product.name}
              </h3>
              <p className="text-sm text-theme-text-tertiary uppercase tracking-wide font-medium transition-colors duration-300">
                {categoryLabel(product.category)}
              </p>
            </div>

            <div className="mt-auto">
              <p className="text-xl font-bold text-theme-accent transition-colors duration-300">{priceLabel}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}