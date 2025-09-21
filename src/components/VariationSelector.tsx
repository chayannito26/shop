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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Color
          </h3>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
                    isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20'
                      : isAvailable
                        ? 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size Selection */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Size
          </h3>
          <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium min-w-[3rem] ${
                    isSelected
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20'
                      : isAvailable
                        ? 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10'
                        : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Show selected combination if both are selected */}
        {selectedTiers.color && selectedTiers.size && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Selected: <span className="font-semibold">{selectedTiers.color} - {selectedTiers.size}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Single-tier variations (original behavior)
  const normalizedVariations = variations.map(v => 
    typeof v === 'string' ? { label: v } : { label: v.label, price: v.price, image: v.image }
  );

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
        Options
      </h3>
      <div className="flex flex-wrap gap-2">
        {normalizedVariations.map((v) => (
          <button
            key={v.label}
            onClick={() => onVariationChange(v.label)}
            className={`px-4 py-2 border rounded-lg transition-all duration-200 font-medium ${
              selectedVariation === v.label
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 ring-2 ring-red-500/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-red-400 dark:hover:border-red-500 text-gray-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-900/10'
            }`}
            title={typeof v.price === 'number' ? `৳${v.price}` : undefined}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}