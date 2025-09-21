import React from 'react';
import { getVariationTierKeys, getVariationTierValues, parseVariationTiers, formatVariationLabel, getVariationByTiers } from '../utils/pricing';
import type { VariationInput, VariationTier } from '../utils/pricing';

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

  const tierKeys = getVariationTierKeys(variations);
  const selectedTiers = selectedVariation ? parseVariationTiers(selectedVariation) : {};

  // If we have multiple tiers, show multi-tier selector
  if (tierKeys.length > 1) {
    const isComplete = tierKeys.every(key => selectedTiers[key]);
    
    return (
      <div className={`space-y-6 ${className}`}>
        {tierKeys.map((tierKey) => {
          const tierValues = getVariationTierValues(variations, tierKey);
          const displayName = tierKey.charAt(0).toUpperCase() + tierKey.slice(1);
          
          return (
            <div key={tierKey}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {displayName}
              </h3>
              <div className="flex flex-wrap gap-3">
                {tierValues.map((value) => {
                  const isSelected = selectedTiers[tierKey] === value;
                  
                  // Check if this combination is available
                  const testTiers = { ...selectedTiers, [tierKey]: value };
                  
                  // For testing availability, check if any variation is compatible
                  const isAvailable = variations.some(v => {
                    const label = typeof v === 'string' ? v : v.label;
                    const varTiers = parseVariationTiers(label);
                    
                    // Check if this variation has the value we're testing for this tier
                    if (varTiers[tierKey] !== value) return false;
                    
                    // Check if this variation is compatible with already selected tiers
                    return Object.keys(selectedTiers).every(selectedKey => {
                      const selectedValue = selectedTiers[selectedKey];
                      return !selectedValue || varTiers[selectedKey] === selectedValue;
                    });
                  });
                  
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        if (isAvailable) {
                          const newTiers = { ...selectedTiers, [tierKey]: value };
                          const newVariation = formatVariationLabel(newTiers);
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
                      <span className="relative">{value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Show selected combination with animation */}
        {isComplete && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
              <p className="text-sm text-green-800 dark:text-green-200">
                Selected: <span className="font-bold">{Object.values(selectedTiers).join(' - ')}</span>
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