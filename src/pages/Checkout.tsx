import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, runTransaction } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCoupon } from '../contexts/CouponContext';
import { db } from '../firebase/config';
import { CouponInput } from '../components/CouponInput';
import { trackInitiateCheckout, trackPurchase, trackAddPaymentInfo } from '../analytics/metaPixel';

export function Checkout() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { appliedCoupon, discount, removeCoupon } = useCoupon();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const initiatedRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    department: '',
    phone: '',
    email: '', // optional email
    bkashTransactionId: ''
  });

  const [errors, setErrors] = useState({
    phone: '',
    bkashTransactionId: ''
  });

  useEffect(() => {
    if (initiatedRef.current) return;
    if (orderPlaced) return; // don't track if already placed (post-confirmation view)
    if (cartState.items.length === 0) return;
    const cartTotal = cartState.total - discount;
    trackInitiateCheckout(
      cartState.items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
      cartTotal,
      {
        name: formData.name || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        country: 'Bangladesh'
      }
    );
    initiatedRef.current = true;
  }, [cartState.items, cartState.total, discount, orderPlaced, formData.name, formData.phone, formData.email]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'phone':
        // Validates 11-digit Bangladeshi phone numbers (e.g., 01xxxxxxxxx)
        if (!/^01[3-9]\d{8}$/.test(value)) {
          return 'Invalid phone number format. Must be 11 digits.';
        }
        break;
      case 'bkashTransactionId':
        // Validates a 10-character alphanumeric bKash transaction ID
        if (!/^[a-zA-Z0-9]{10}$/.test(value)) {
          return 'Invalid Transaction ID format. Must be 10 characters.';
        }
        break;
      default:
        break;
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (name === 'phone' || name === 'bkashTransactionId') {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform final validation on all fields before submitting
    const phoneError = validateField('phone', formData.phone);
    const bkashError = validateField('bkashTransactionId', formData.bkashTransactionId);

    if (phoneError || bkashError) {
      setErrors({
        phone: phoneError,
        bkashTransactionId: bkashError
      });
      return; // Stop submission if there are errors
    }

    setIsSubmitting(true);

    try {
      const newOrderId = uuidv4();

      // Track AddPaymentInfo (bKash) just before we create the order
      trackAddPaymentInfo(
        cartState.total - discount,
        cartState.items.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
        {
          name: formData.name || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          country: 'Bangladesh'
        },
        'bKash'
      );

      const orderData = {
        orderId: newOrderId,
        items: cartState.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          description: item.description,
          category: item.category,
          quantity: item.quantity,
          cartItemId: item.cartItemId,
          ...(item.selectedVariation && { selectedVariation: item.selectedVariation })
        })),
        total: cartState.total,
        discount: discount,
        finalTotal: cartState.total - discount,
        ...(appliedCoupon && {
          appliedCoupon: {
            code: appliedCoupon.code,
            discountValue: discount
          }
        }),
        customerInfo: formData,
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      await addDoc(collection(db, 'orders'), orderData);

      // If a coupon was used, increment its usedCount atomically
      if (appliedCoupon) {
        const couponRef = doc(db, 'coupons', appliedCoupon.id);
        await runTransaction(db, async (transaction) => {
          const couponDoc = await transaction.get(couponRef);
          if (!couponDoc.exists()) {
            throw "Coupon document does not exist!";
          }
          const newUsedCount = (couponDoc.data().usedCount || 0) + 1;
          transaction.update(couponRef, { usedCount: newUsedCount });
        });
      }

      // Meta Pixel: Purchase (after successful confirmation) with user data
      trackPurchase(
        newOrderId,
        orderData.items.map((i: any) => ({ id: i.id, quantity: i.quantity, price: i.price })),
        orderData.finalTotal,
        {
          name: formData.name || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          country: 'Bangladesh'
        }
      );

      setOrderId(newOrderId);
      setOrderPlaced(true);
      cartDispatch({ type: 'CLEAR_CART' });
      removeCoupon();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variationLabel = (item: any) => {
    if (item.id === 'phonecover') return 'Model';
    if (item.category === 'clothing') return 'Size';
    return 'Option';
  };

  if (cartState.items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Your order has been received and will be processed soon. Take a screenshot of your Order ID for future reference.
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
            <p className="font-mono text-lg text-gray-900 dark:text-white">{orderId}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Information</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    name="roll"
                    value={formData.roll}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    <option value="Science">Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Payment Instructions */}
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mt-6">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-pink-600 dark:text-pink-400 mr-2" />
                  <h3 className="font-bold text-pink-800 dark:text-pink-200">bKash Payment Instructions</h3>
                </div>
                <div className="text-sm text-pink-700 dark:text-pink-300 space-y-1">
                  <p><strong>Step 1:</strong> Send money to: <span className="font-mono bg-pink-100 dark:bg-pink-800 px-2 py-1 rounded">01534723318</span></p>
                  <p><strong>Step 2:</strong> Amount: <span className="font-bold">৳{cartState.total - discount}</span></p>
                  <p><strong>Step 3:</strong> Copy the transaction ID from bKash and paste it below</p>
                  <p><strong>Step 4:</strong> Complete this form</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  bKash Transaction ID *
                </label>
                <input
                  type="text"
                  name="bkashTransactionId"
                  value={formData.bkashTransactionId}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., BH12345678"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.bkashTransactionId && <p className="text-xs text-red-500 mt-1">{errors.bkashTransactionId}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please ensure the transaction ID is correct before submitting
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!errors.phone || !!errors.bkashTransactionId}
                className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                    {item.selectedVariation && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{variationLabel(item)}: {item.selectedVariation}</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-blue-600 dark:text-blue-400">৳{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-blue-600 dark:text-blue-400">৳{cartState.total - discount}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Original Price</span>
                  <span className="text-gray-600 dark:text-gray-400 line-through">৳{cartState.total}</span>
                </div>
              )}
            </div>

            {/* Coupon input for direct Buy Now flow */}
            <div className="mt-6">
              <CouponInput />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Your order will be processed after payment verification.
                You will be contacted within 24 hours for order confirmation and delivery details.
              </p>
              {cartState.isDirectOrder && (
                <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                  <strong>Express Order:</strong> This is a direct purchase - no cart items will be affected.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}