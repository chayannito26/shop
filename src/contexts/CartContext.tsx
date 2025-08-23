import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { getVariationPrice, getVariationImage } from '../utils/pricing';
import type { BulkRate } from '../utils/pricing';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  variations?: (string | { label: string; price?: number; image?: string })[]; // support per-variation price and image
  // New: internal procurement tiers (optional)
  unitsSold?: number;                // manually edited in products.ts
  bulkRates?: BulkRate[];            // supports total-price or per-unit-price tiers
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariation?: string;
  cartItemId: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  isDirectOrder: boolean; // track direct "Buy Now" orders
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedVariation?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DIRECT_ORDER'; payload: { product: Product; selectedVariation?: string; quantity: number } }
  | { type: 'SQUASH_DUPLICATES' }; // NEW

// Stable key helpers
function normalizeVariationLabel(v?: string): string {
  const s = (v ?? '').trim();
  return s.length ? s.toLowerCase() : 'default';
}
function makeKey(productId: string, selectedVariation?: string): string {
  return `${productId}::${normalizeVariationLabel(selectedVariation)}`;
}

const initialState: CartState = {
  items: [],
  total: 0,
  isDirectOrder: false
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedVariation } = action.payload;
      const key = makeKey(product.id, selectedVariation);
      const unitPrice = getVariationPrice(product.price, product.variations, selectedVariation);
      const resolvedImage = getVariationImage(product.image, product.variations, selectedVariation);

      // Find existing line with same product + normalized variation
      const idx = state.items.findIndex(
        (it) => makeKey(it.id, it.selectedVariation) === key
      );

      let newItems: CartItem[];
      if (idx >= 0) {
        // Increase quantity of existing line
        newItems = state.items.map((it, i) =>
          i === idx ? { ...it, quantity: it.quantity + 1 } : it
        );
      } else {
        // Create a new line with deterministic cartItemId
        const newItem: CartItem = {
          ...product,
          image: resolvedImage,
          price: unitPrice,
          quantity: 1,
          selectedVariation,
          cartItemId: key
        };
        newItems = [...state.items, newItem];
      }

      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isDirectOrder: false
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.cartItemId !== action.payload);
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isDirectOrder: false
      };
    }

    case 'UPDATE_QUANTITY': {
      const { cartItemId, quantity } = action.payload;
      const newItems = state.items
        .map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter(item => item.quantity > 0);

      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isDirectOrder: state.isDirectOrder
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'SET_DIRECT_ORDER': {
      const { product, selectedVariation, quantity } = action.payload;
      const key = makeKey(product.id, selectedVariation);
      const unitPrice = getVariationPrice(product.price, product.variations, selectedVariation);
      const resolvedImage = getVariationImage(product.image, product.variations, selectedVariation);

      const directOrderItem: CartItem = {
        ...product,
        image: resolvedImage,
        price: unitPrice,
        quantity,
        selectedVariation,
        cartItemId: key
      };

      return {
        items: [directOrderItem],
        total: unitPrice * quantity,
        isDirectOrder: true
      };
    }

    case 'SQUASH_DUPLICATES': {
      if (state.items.length <= 1) return state;

      // Group by stable key and sum quantities
      const byKey = new Map<string, CartItem>();
      for (const it of state.items) {
        const key = makeKey(it.id, it.selectedVariation);
        const existing = byKey.get(key);
        if (!existing) {
          // Ensure deterministic id going forward
          byKey.set(key, { ...it, cartItemId: key });
        } else {
          byKey.set(key, { ...existing, quantity: existing.quantity + it.quantity });
        }
      }
      const squashed = Array.from(byKey.values());

      // Keep isDirectOrder intact; recompute total
      return {
        items: squashed,
        total: squashed.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isDirectOrder: state.isDirectOrder && squashed.length === 1
      };
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}