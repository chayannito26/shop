import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, Tag, Trash2, Clock } from 'lucide-react';
import { useCoupon } from '../contexts/CouponContext';
import { useI18n } from '../i18n';

export function CouponInput() {
  const { appliedCoupon, isLoading, error, success, applyCoupon, removeCoupon } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('');
  const { t } = useI18n();

  useEffect(() => {
    if (appliedCoupon?.expiryDate) {
      const compute = () => {
        const exp = new Date(appliedCoupon.expiryDate!).getTime();
        const now = Date.now();
        const diff = exp - now;
        if (isNaN(exp) || diff <= 0) return setExpiresIn('expired');

        const DAY = 24 * 60 * 60 * 1000;
        const HOUR = 60 * 60 * 1000;
        const MIN = 60 * 1000;

        const days = Math.floor(diff / DAY);
        if (days >= 1) return setExpiresIn(`${days} day${days > 1 ? 's' : ''}`);

        const hours = Math.floor(diff / HOUR);
        if (hours >= 1) return setExpiresIn(`${hours} hour${hours > 1 ? 's' : ''}`);

        const mins = Math.floor(diff / MIN);
        return setExpiresIn(`${mins} minute${mins !== 1 ? 's' : ''}`);
      };

      compute();
      const timer = setInterval(compute, 60_000);
      return () => clearInterval(timer);
    } else {
      setExpiresIn('');
    }
  }, [appliedCoupon?.expiryDate]);

  useEffect(() => {
    if (appliedCoupon) {
      setCouponCode(appliedCoupon.code);
    } else {
      setCouponCode('');
    }
  }, [appliedCoupon]);

  const handleApply = () => {
    applyCoupon(couponCode);
  };

  const handleRemove = () => {
    removeCoupon();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!appliedCoupon) {
        handleApply();
      }
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <div className="relative flex-grow">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('coupon.placeholder')}
            disabled={!!appliedCoupon || isLoading}
            className="w-full pl-10 pr-24 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800"
          />
          {!appliedCoupon && (
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('coupon.apply')}
            </button>
          )}
        </div>
        {appliedCoupon && (
          <button
            onClick={handleRemove}
            className="ml-2 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title={t('coupon.removeTitle')}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {appliedCoupon?.expiryDate && expiresIn && expiresIn !== 'expired' && (
        <div className="flex items-center mt-1 text-xs text-gray-600 dark:text-gray-400">
          <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          <span>{t('coupon.expiresIn', { time: expiresIn })}</span>
        </div>
      )}
    </div>
  );
}
