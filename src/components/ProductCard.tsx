import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 group-hover:scale-105">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="h-64 w-full object-cover object-center group-hover:opacity-75 transition-opacity"
          />
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">{product.name}</h3>
          <p className="text-lg font-bold text-blue-600">৳{product.price}</p>
          <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}</p>
        </div>
      </div>
    </Link>
  );
}