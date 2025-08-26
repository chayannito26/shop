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
import { useI18n } from '../i18n';

export function Checkout() {
  const { state: cartState, dispatch: cartDispatch } = useCart();
  const { appliedCoupon, discount, removeCoupon } = useCoupon();
  const { t, productName } = useI18n();
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

  // OCR state
  const [ocrImageUrl, setOcrImageUrl] = useState<string | null>(null);
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);

  // Ensure Tesseract is available; if not, load from CDN dynamically
  const ensureTesseract = async (): Promise<any> => {
    // @ts-ignore
    if ((window as any).Tesseract) return (window as any).Tesseract;
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Tesseract'));
      document.head.appendChild(script);
    });
    // @ts-ignore
    return (window as any).Tesseract;
  };

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
          return t('checkout.validation.phoneInvalid');
        }
        break;
      case 'bkashTransactionId':
        // Validates a 10-character alphanumeric bKash transaction ID
        if (!/^[a-zA-Z0-9]{10}$/.test(value)) {
          return t('checkout.validation.bkashInvalid');
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

  // Extract 10-character alphanumeric Transaction ID using regex
  const extractTransactionId = (text: string): string | null => {
    // Commonly bKash shows a 10-char alphanumeric like TX1234ABCD or similar
    const match = text.match(/[A-Za-z0-9]{10}/);
    return match ? match[0] : null;
  };

  const handleOcrFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    // Cleanup previous object URL if present
  setOcrImageUrl((prev: string | null) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setOcrInProgress(true);
    setOcrProgress(0);
    setOcrMessage(t('checkout.bkash.ocr.detecting'));

    try {
      const Tesseract = await ensureTesseract();

      const { data } = await Tesseract.recognize(url, 'eng', {
        logger: (m: any) => {
          if (m.status === 'recognizing text' && m.progress != null) {
            const percent = Math.round(m.progress * 100);
            setOcrProgress(percent);
            setOcrMessage(t('checkout.bkash.ocr.progress', { percent: String(percent) }));
          }
        }
      });

      const text: string = data?.text || '';
      const id = extractTransactionId(text);
      if (id) {
        // Autofill and validate
        const value = id.toUpperCase();
        setFormData((prev: typeof formData) => ({ ...prev, bkashTransactionId: value }));
        const err = validateField('bkashTransactionId', value);
        setErrors((prev: typeof errors) => ({ ...prev, bkashTransactionId: err }));
        setOcrMessage(t('checkout.bkash.ocr.found', { id: value }));
      } else {
        setOcrMessage(t('checkout.bkash.ocr.notFound'));
      }
    } catch (err) {
      console.error('OCR error', err);
      setOcrMessage(t('checkout.bkash.ocr.notFound'));
    } finally {
      setOcrInProgress(false);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (ocrImageUrl) URL.revokeObjectURL(ocrImageUrl);
    };
  }, [ocrImageUrl]);

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
      cartDispatch({ type: 'FINALIZE_DIRECT_ORDER' });
      removeCoupon();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variationLabel = (item: any) => {
    if (item.id === 'phonecover') return t('cart.variation.model');
    if (item.category === 'clothing') return t('cart.variation.size');
    return t('cart.variation.option');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('checkout.placed.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('checkout.placed.instruction')}
          </p>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkout.placed.orderId')}</p>
            <p className="font-mono text-lg text-gray-900 dark:text-white">{orderId}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
            >
              {t('checkout.placed.continue')}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('checkout.placed.viewCart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('checkout.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('checkout.form.title')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-medium mb-1 transition-colors text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                  {t('checkout.form.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                  autoComplete="name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="roll" className="block text-sm font-medium mb-1 transition-colors text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                    {t('checkout.form.roll')}
                  </label>
                  <input
                    id="roll"
                    type="text"
                    name="roll"
                    value={formData.roll}
                    onChange={handleInputChange}
                    required
                    autoComplete="off"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="group">
                  <label htmlFor="department" className="block text-sm font-medium mb-1 transition-colors text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                    {t('checkout.form.department')}
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">{t('checkout.form.selectDepartment')}</option>
                    <option value="Science">{t('checkout.form.dept.science')}</option>
                    <option value="Arts">{t('checkout.form.dept.arts')}</option>
                    <option value="Commerce">{t('checkout.form.dept.commerce')}</option>
                  </select>
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="phone"
                  className={`block text-sm font-medium mb-1 transition-colors ${
                    errors.phone
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400'
                  }`}
                >
                  {t('checkout.form.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  autoComplete="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? 'err-phone' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.phone && <p id="err-phone" className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium mb-1 transition-colors text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                  {t('checkout.form.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Payment Instructions */}
              <div className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg p-4 mt-6">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-pink-600 dark:text-pink-400 mr-2" />
                  <h3 className="font-bold text-pink-800 dark:text-pink-200">{t('checkout.payment.title')}</h3>
                </div>
                <div className="text-sm text-pink-700 dark:text-pink-300 space-y-1">
                  <p><strong>{t('checkout.payment.step1')}</strong> {t('checkout.payment.step1Text', { number: '01534723318' })}</p>
                  <p><strong>{t('checkout.payment.step2')}</strong> {t('checkout.payment.step2Text', { amount: String(cartState.total - discount) })}</p>
                  <p><strong>{t('checkout.payment.step3')}</strong> {t('checkout.payment.step3Text')}</p>
                  <p><strong>{t('checkout.payment.step4')}</strong> {t('checkout.payment.step4Text')}</p>
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="bkashTransactionId"
                  className={`block text-sm font-medium mb-1 transition-colors ${
                    errors.bkashTransactionId
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400'
                  }`}
                >
                  {t('checkout.bkash.label')}
                </label>
                <input
                  id="bkashTransactionId"
                  type="text"
                  name="bkashTransactionId"
                  value={formData.bkashTransactionId}
                  onChange={handleInputChange}
                  required
                  placeholder={t('checkout.bkash.placeholder')}
                  aria-invalid={!!errors.bkashTransactionId}
                  aria-describedby={errors.bkashTransactionId ? 'err-bkash' : undefined}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {errors.bkashTransactionId && <p id="err-bkash" className="text-xs text-red-500 mt-1">{errors.bkashTransactionId}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('checkout.bkash.help')}</p>

                {/* OCR Upload Helper */}
                <div className="mt-3 p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/40">
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{t('checkout.bkash.ocr.orUpload')}</p>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={handleOcrFileChange} />
                      {ocrImageUrl ? t('checkout.bkash.ocr.changeBtn') : t('checkout.bkash.ocr.uploadBtn')}
                    </label>
                    {ocrInProgress && (
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className="h-2 bg-pink-600 dark:bg-pink-500" style={{ width: `${ocrProgress}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{ocrMessage}</p>
                      </div>
                    )}
                  </div>

                  {ocrImageUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={ocrImageUrl} alt="Uploaded screenshot" className="h-16 w-28 object-cover rounded border border-gray-200 dark:border-gray-600" />
                      {!ocrInProgress && ocrMessage && (
                        <div>
                          <p className="text-xs text-gray-700 dark:text-gray-200">{ocrMessage}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t('checkout.bkash.ocr.tip')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !!errors.phone || !!errors.bkashTransactionId}
                className="w-full bg-blue-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/20 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('cart.summary.title')}</h2>

            <div className="space-y-4 mb-6">
              {cartState.items.map((item) => (
                <div key={item.cartItemId} className="flex items-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {productName(item.id, item.name)}
                    </h3>
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
                <span className="text-gray-900 dark:text-white">{t('cart.summary.total')}</span>
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
                <strong>{t('checkout.note.title')}</strong> {t('checkout.note.text')}
              </p>
              {cartState.isDirectOrder && (
                <p className="text-sm text-green-800 dark:text-green-200 mt-2">
                  <strong> {/* keep bold */}</strong> {t('checkout.note.express')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}