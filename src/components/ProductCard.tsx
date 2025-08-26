// React namespace not required with JSX transform; keep imports minimal
import { Link } from 'react-router-dom';
import { Product } from '../contexts/CartContext';
import { getMinMaxPrice } from '../utils/pricing';
import { useI18n } from '../i18n';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { min, max } = getMinMaxPrice(product.price, product.variations);
  const priceLabel = min === max ? `৳${min}` : `৳${min} - ৳${max}`;
  const { categoryLabel } = useI18n();

  // product.image can be string or string[]; prefer first element
  const primaryImage = Array.isArray(product.image) ? product.image[0] ?? '' : product.image ?? '';

  return (
    <div className="group">
      <Link to={`/product/${product.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{priceLabel}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
              {categoryLabel(product.category)}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}