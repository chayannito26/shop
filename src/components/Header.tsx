import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../i18n';

export function Header() {
  const { state } = useCart();
  const { lang, toggleLang, t } = useI18n();
  const itemCount = state.isDirectOrder ? 0 : state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="./logo.png" alt="Chayannito 26 logo" className="h-8 w-8 rounded object-cover" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('header.title')}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300">{t('header.subtitle')}</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {t('header.nav.home')}
            </Link>
            <Link to="/cart" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              {t('header.nav.cart')}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
              title={lang === 'en' ? t('header.switch.toBengali') : t('header.switch.toEnglish')}
            >
              {lang === 'en' ? t('header.switch.toBengali') : t('header.switch.toEnglish')}
            </button>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}