import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Product } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { dispatch } = useCart();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();

    dispatch({
      type: 'SET_DIRECT_ORDER',
      payload: {
        product,
        quantity: 1
      }
    });

    navigate('/checkout');
  };

  return (
    <div className="group relative">
      <Link to={`/product/${product.id}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
            <img
              src={product.image}
              alt={product.name}
              className="h-64 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
            />
          </div>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{product.name}</h3>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">৳{product.price}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{product.category}</p>
          </div>
        </div>
      </Link>

      {/* Buy Now Button Overlay */}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleBuyNow}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm shadow-lg"
        >
          <Zap className="h-4 w-4" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}