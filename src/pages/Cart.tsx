import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCoupon } from '../contexts/CouponContext';
import { CouponInput } from '../components/CouponInput';

export function Cart() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { appliedCoupon, discount } = useCoupon();

  // One-time normalization to squash any historical duplicates
  React.useEffect(() => {
    cartDispatch({ type: 'SQUASH_DUPLICATES' as any });
  }, [cartDispatch]);

  const updateQuantity = (cartItemId: string, quantity: number) => {
    cartDispatch({
      type: 'UPDATE_QUANTITY',
      payload: { cartItemId, quantity }
    });
  };

  const removeItem = (cartItemId: string) => {
    cartDispatch({
      type: 'REMOVE_ITEM',
      payload: cartItemId
    });
  };

  const variationLabel = (item: any) => {
    if (item.id === 'phonecover') return 'Model';
    if (item.category === 'clothing') return 'Size';
    return 'Option';
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Add some awesome Chayannito 26 merchandise!</p>
          <Link
            to="/"
            className="bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6">
              {cartState.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center py-6 border-b last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 object-cover rounded-lg"
                  />

                  <div className="flex-1 ml-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{variationLabel(item)}: {item.selectedVariation}</p>
                    )}
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">৳{item.price}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="text-lg font-medium px-3 text-gray-900 dark:text-white">{item.quantity}</span>

                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => removeItem(item.cartItemId)}
                      className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>৳{cartState.total}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
              </div>

              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-blue-600 dark:text-blue-400">৳{cartState.total - discount}</span>
                </div>
              </div>

              <div className="mt-6">
                <CouponInput />
              </div>

              <Link
                to="/checkout"
                className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors mt-6 block text-center"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/"
                className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-3 block text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}