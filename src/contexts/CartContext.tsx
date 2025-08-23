import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { getVariationPrice, getVariationImage } from '../utils/pricing';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  variations?: (string | { label: string; price?: number; image?: string })[]; // support per-variation price and image
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
  | { type: 'SET_DIRECT_ORDER'; payload: { product: Product; selectedVariation?: string; quantity: number } };

const initialState: CartState = {
  items: [],
  total: 0,
  isDirectOrder: false
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedVariation } = action.payload;
      const cartItemId = `${product.id}-${selectedVariation || 'default'}-${Date.now()}`;
      const unitPrice = getVariationPrice(product.price, product.variations, selectedVariation);
      const resolvedImage = getVariationImage(product.image, product.variations, selectedVariation);

      const newItem: CartItem = {
        ...product,
        image: resolvedImage, // store resolved image at add time
        price: unitPrice, // ensure cart uses the unit price for the selected variation
        quantity: 1,
        selectedVariation,
        cartItemId
      };

      const newItems = [...state.items, newItem];
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isDirectOrder: false
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.cartItemId !== action.payload);
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isDirectOrder: false
      };
    }

    case 'UPDATE_QUANTITY': {
      const { cartItemId, quantity } = action.payload;
      const newItems = state.items.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter(item => item.quantity > 0);

      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isDirectOrder: state.isDirectOrder
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'SET_DIRECT_ORDER': {
      const { product, selectedVariation, quantity } = action.payload;
      const cartItemId = `${product.id}-${selectedVariation || 'default'}-${Date.now()}`;
      const unitPrice = getVariationPrice(product.price, product.variations, selectedVariation);
      const resolvedImage = getVariationImage(product.image, product.variations, selectedVariation);

      const directOrderItem: CartItem = {
        ...product,
        image: resolvedImage, // ensure unit image reflects selection
        price: unitPrice, // ensure unit price reflects selection
        quantity,
        selectedVariation,
        cartItemId
      };

      return {
        items: [directOrderItem],
        total: unitPrice * quantity,
        isDirectOrder: true
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