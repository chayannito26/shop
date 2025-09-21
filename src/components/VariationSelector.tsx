import React from 'react';
import { getUniqueColors, getUniqueSizes, parseVariationTiers, formatVariationLabel, getVariationByTiers } from '../utils/pricing';
import type { VariationInput } from '../utils/pricing';

interface VariationSelectorProps {
  variations?: VariationInput[];
  selectedVariation?: string;
  onVariationChange: (variation: string) => void;
  className?: string;
}

export function VariationSelector({ 
  variations, 
  selectedVariation, 
  onVariationChange, 
  className = "" 
}: VariationSelectorProps) {
  if (!variations || variations.length === 0) return null;

  const colors = getUniqueColors(variations);
  const sizes = getUniqueSizes(variations);
  const selectedTiers = selectedVariation ? parseVariationTiers(selectedVariation) : {};

  // If we have both colors and sizes, show multi-tier selector
  if (colors.length > 0 && sizes.length > 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Color Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Color
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const isSelected = selectedTiers.color === color;
              const isAvailable = sizes.some(size => 
                getVariationByTiers(variations, color, size) !== undefined
              );
              
              return (
                <button
                  key={color}
                  onClick={() => {
                    if (isAvailable) {
                      // If size is already selected, combine them
                      const newVariation = formatVariationLabel({ 
                        color, 
                        size: selectedTiers.size 
                      });
                      onVariationChange(newVariation);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                    isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20 shadow-lg shadow-red-500/20'
                      : isAvailable
                        ? 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-md'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse"></div>
                  )}
                  <span className="relative">{color}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Size
          </h3>
          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const isSelected = selectedTiers.size === size;
              const isAvailable = colors.some(color => 
                getVariationByTiers(variations, color, size) !== undefined
              );
              
              return (
                <button
                  key={size}
                  onClick={() => {
                    if (isAvailable) {
                      // If color is already selected, combine them
                      const newVariation = formatVariationLabel({ 
                        color: selectedTiers.color, 
                        size 
                      });
                      onVariationChange(newVariation);
                    }
                  }}
                  disabled={!isAvailable}
                  className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium min-w-[4rem] transform hover:scale-105 ${
                    isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20 shadow-lg shadow-red-500/20'
                      : isAvailable
                        ? 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-md'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse"></div>
                  )}
                  <span className="relative">{size}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Show selected combination with animation */}
        {selectedTiers.color && selectedTiers.size && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Selected: <span className="font-bold">{selectedTiers.color} - {selectedTiers.size}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single-tier variations (original behavior) with improved styling
  const normalizedVariations = variations.map(v => 
    typeof v === 'string' ? { label: v } : { label: v.label, price: v.price, image: v.image }
  );

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Options
      </h3>
      <div className="flex flex-wrap gap-3">
        {normalizedVariations.map((v) => (
          <button
            key={v.label}
            onClick={() => onVariationChange(v.label)}
            className={`relative px-6 py-3 border rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
              selectedVariation === v.label
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20 shadow-lg shadow-red-500/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10 hover:shadow-md'
            }`}
            title={typeof v.price === 'number' ? `৳${v.price}` : undefined}
          >
            {selectedVariation === v.label && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 animate-pulse"></div>
            )}
            <span className="relative">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}