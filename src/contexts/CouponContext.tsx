import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useCart, CartItem } from './CartContext';

export interface Coupon {
  id: string; // Firestore document ID
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'all' | 'category' | 'product';
  scopeValue?: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string; // ISO date string
  usageLimit?: number;
  usedCount: number;
}

interface CouponState {
  appliedCoupon: Coupon | null;
  discount: number;
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

interface CouponContextType extends CouponState {
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => void;
}

const CouponContext = createContext<CouponContextType | null>(null);

function calculateDiscount(items: CartItem[], coupon: Coupon | null): number {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (!coupon) {
    return 0;
  }

  let eligibleTotal = 0;
  if (coupon.scope === 'all') {
    eligibleTotal = total;
  } else if (coupon.scope === 'category') {
    eligibleTotal = items
      .filter(item => item.category === coupon.scopeValue)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  } else if (coupon.scope === 'product') {
    eligibleTotal = items
      .filter(item => item.id === coupon.scopeValue)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  let discount = 0;
  if (coupon.type === 'fixed') {
    discount = Math.min(coupon.value, eligibleTotal);
  } else if (coupon.type === 'percentage') {
    discount = eligibleTotal * (coupon.value / 100);
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  }

  return Math.round(discount);
}

export function CouponProvider({ children }: { children: ReactNode }) {
  const { state: cartState } = useCart();
  const [state, setState] = useState<CouponState>({
    appliedCoupon: null,
    discount: 0,
    isLoading: false,
    error: null,
    success: null,
  });

  // Recalculate discount if cart changes
  useEffect(() => {
    if (state.appliedCoupon) {
      const newDiscount = calculateDiscount(cartState.items, state.appliedCoupon);
      setState(s => ({ ...s, discount: newDiscount }));
    }
  }, [cartState.items, state.appliedCoupon]);

  const applyCoupon = useCallback(async (couponCode: string) => {
    if (!couponCode.trim()) {
      setState(s => ({ ...s, error: 'Please enter a coupon code.' }));
      return;
    }

    setState(s => ({ ...s, isLoading: true, error: null, success: null }));

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setState(s => ({ ...s, isLoading: false, error: 'Invalid coupon code.' }));
        return;
      }

      const couponDoc = querySnapshot.docs[0];
      const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

      if (!coupon.isActive) {
        setState(s => ({ ...s, isLoading: false, error: 'This coupon is no longer active.' }));
      } else if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        setState(s => ({ ...s, isLoading: false, error: 'This coupon has expired.' }));
      } else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        setState(s => ({ ...s, isLoading: false, error: 'This coupon has reached its usage limit.' }));
      } else if (coupon.minOrderAmount && cartState.total < coupon.minOrderAmount) {
        setState(s => ({ ...s, isLoading: false, error: `This coupon requires a minimum order of ৳${coupon.minOrderAmount}.` }));
      } else {
        const discount = calculateDiscount(cartState.items, coupon);
        setState({
          appliedCoupon: coupon,
          discount,
          isLoading: false,
          error: null,
          success: 'Coupon applied successfully!',
        });
      }
    } catch (err) {
      console.error("Error fetching coupon:", err);
      setState(s => ({ ...s, isLoading: false, error: 'Could not validate coupon. Please try again.' }));
    }
  }, [cartState.items, cartState.total]);

  const removeCoupon = useCallback(() => {
    setState({
      appliedCoupon: null,
      discount: 0,
      isLoading: false,
      error: null,
      success: null,
    });
  }, []);

  return (
    <CouponContext.Provider value={{ ...state, applyCoupon, removeCoupon }}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
}
