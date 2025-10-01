import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useI18n } from '../i18n';

export function Header() {
  const { state } = useCart();
  const { lang, toggleLang, t } = useI18n();
  const itemCount = state.isDirectOrder ? 0 : state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-theme-bg-secondary shadow-theme-lg sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a href="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Chayannito 26 logo" className="h-8 w-8 rounded object-cover" />
            <div>
              <h1 className="text-xl font-bold text-theme-text-primary">{t('header.title')}</h1>
              <p className="text-xs text-theme-text-secondary">{t('header.subtitle')}</p>
            </div>
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-theme-text-secondary hover:text-theme-accent transition-colors">
              {t('header.nav.home')}
            </a>
            <a href="/cart.html" className="text-theme-text-secondary hover:text-theme-accent transition-colors">
              {t('header.nav.cart')}
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Language toggle */}
            <button
              type="button"
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-md border border-theme-border text-sm text-theme-text-primary hover:bg-theme-bg-tertiary transition-colors"
              title={lang === 'en' ? t('header.switch.toBengali') : t('header.switch.toEnglish')}
            >
              {lang === 'en' ? t('header.switch.toBengali') : t('header.switch.toEnglish')}
            </button>

            <a
              href="/cart.html"
              className="relative p-2 text-theme-text-secondary hover:text-theme-accent transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-theme-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}