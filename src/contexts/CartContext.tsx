import React, { createContext, useContext, useReducer, ReactNode, useEffect, useRef } from 'react';
import { getVariationPrice, getVariationImage } from '../utils/pricing';
import type { BulkRate } from '../utils/pricing';
import { Cart as PersistedCart } from '../persistence/shopState';
import type { CartItem as PersistCartItem } from '../persistence/shopState';
import { products } from '../data/products';

export interface Product {
  id: string;
  name: string;
  price: number;
  // Support multiple images per product. UI will pick the first suitable image for thumbnails/line-items.
  image: string | string[];
  description: string;
  category: string;
  variations?: (string | { label: string; price?: number; image?: string | string[] })[]; // support per-variation price and image(s)
  // Optional schema that defines ordered variation tiers and human titles
  variationSchema?: { keys: string[]; titles?: Record<string, string> };
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
  backupItems: CartItem[] | null; // NEW: snapshot original cart for Buy Now
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedVariation?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DIRECT_ORDER'; payload: { product: Product; selectedVariation?: string; quantity: number } }
  | { type: 'SQUASH_DUPLICATES' }
  | { type: 'FINALIZE_DIRECT_ORDER' }
  | { type: 'REPLACE'; payload: CartState };

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
  isDirectOrder: false,
  backupItems: null
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedVariation } = action.payload;
      const key = makeKey(product.id, selectedVariation);
      const unitPrice = getVariationPrice(product.price, product.variations, selectedVariation);
      // Ensure line-item image is a single string (first image)
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
        isDirectOrder: false,
        backupItems: null
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.cartItemId !== action.payload);
      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        isDirectOrder: false,
        backupItems: null
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
        isDirectOrder: state.isDirectOrder,
        backupItems: state.backupItems
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

      // Preserve the original cart once (if not already in direct order mode)
      const backup = state.isDirectOrder ? state.backupItems : state.items;

      return {
        items: [directOrderItem],
        total: unitPrice * quantity,
        isDirectOrder: true,
        backupItems: backup ?? []
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
        isDirectOrder: state.isDirectOrder && squashed.length === 1,
        backupItems: state.backupItems
      };
    }

    case 'FINALIZE_DIRECT_ORDER': {
      // If this was a Buy Now flow, restore the previous cart; otherwise clear
      if (state.isDirectOrder && state.backupItems) {
        const restored = state.backupItems;
        return {
          items: restored,
          total: restored.reduce((sum, item) => sum + item.price * item.quantity, 0),
          isDirectOrder: false,
          backupItems: null
        };
      }
      return initialState;
    }

    case 'REPLACE': {
      return action.payload;
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
  const lastWriteRef = useRef<number>(0);
  const isWritingRef = useRef(false);

  // Map persisted cart items to our CartItem shape
  function mapPersistedToCartState(persisted: ReturnType<typeof PersistedCart.get>): CartState {
    const items = (persisted.items || []).map((it) => {
      const prod = products.find((p) => p.id === it.id);
      const selectedVariation = it.sku ?? (it.attrs && (it.attrs['variation'] as string)) ?? undefined;
      const baseProduct: Product = prod ?? ({ id: it.id, name: it.id, price: it.price ?? 0, image: '', description: '', category: '' });
      const unitPrice = typeof it.price === 'number' && Number.isFinite(it.price) ? it.price : getVariationPrice(baseProduct.price, baseProduct.variations, selectedVariation);
      const resolvedImage = getVariationImage(baseProduct.image, baseProduct.variations, selectedVariation);
      const cartItemId = makeKey(baseProduct.id, selectedVariation);
      return {
        ...baseProduct,
        image: resolvedImage,
        price: unitPrice,
        quantity: Math.max(1, Math.floor(it.qty || 1)),
        selectedVariation,
        cartItemId,
      } as CartItem;
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items, total, isDirectOrder: false, backupItems: null };
  }

  // Hydrate once and subscribe to persisted changes (cross-tab)
  useEffect(() => {
    const hydratedRef = { current: false } as { current: boolean };

    const unsub = PersistedCart.subscribe((next) => {
      // ignore updates originating from our own write operations
      if (isWritingRef.current) return;
      // ignore updates older than our last write to reduce race conditions
      if (next.updatedAt && next.updatedAt <= lastWriteRef.current) return;
      const mapped = mapPersistedToCartState(next);
      dispatch({ type: 'REPLACE', payload: mapped });
      // mark that we've hydrated from persisted store at least once
      if (!hydratedRef.current) hydratedRef.current = true;
    });

    return unsub;
  }, []);

  // Persist local cart changes back to persisted store
  useEffect(() => {
    try {
      // Don't persist cart when we're in a direct "Buy Now" flow. The reducer keeps a backup in memory.
      if (state.isDirectOrder) return;

      // Ensure we don't write the persisted store before the initial hydration completes.
      // The subscribe callback will set a hydrated flag on first emission.
      // If we haven't hydrated yet, skip writes to avoid overwriting server/local persisted state with the empty initial reducer.
      // We detect hydration by checking whether PersistedCart.subscribe has emitted; use a small helper: read current persisted value and compare timestamps.
      const current = PersistedCart.get();
      // If the persisted store has items or an updatedAt in the past, consider hydrated; otherwise, if it's empty and we haven't had a dispatched REPLACE yet, skip.
      // We use lastWriteRef to infer whether hydration has occurred: if lastWriteRef is zero and persisted store has items, allow write later after subscription runs.
      if (lastWriteRef.current === 0 && (!current.items || current.items.length === 0)) {
        // likely initial mount and persisted store is non-informative; skip writing now to avoid clobbering a concurrent tab's data
        return;
      }

      const mapped: PersistCartItem[] = state.items.map((it: CartItem) => ({
        id: it.id,
        sku: it.selectedVariation ?? undefined,
        qty: it.quantity,
        price: it.price,
        attrs: undefined,
      }));

      // Mark that we're performing writes so subscription ignores the resulting events
  isWritingRef.current = true;
  lastWriteRef.current = Date.now();
  // single atomic replace to avoid cross-tab races
  PersistedCart.replaceItems(mapped);
  isWritingRef.current = false;
    } catch {
      // ignore
      isWritingRef.current = false;
    }
  }, [state.items, state.total, state.isDirectOrder, state.backupItems]);

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