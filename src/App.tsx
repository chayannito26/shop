import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from './contexts/CartContext';
import { CouponProvider } from './contexts/CouponContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MetaPixelRouteListener } from './analytics/MetaPixelRouteListener';
import { ScrollToTop } from './components/ScrollToTop';
import { I18nProvider, LanguagePrompt } from './i18n';
import { ModalProvider } from './contexts/ModalContext';

function App() {
  return (
    <HelmetProvider>
      <I18nProvider>
        <CartProvider>
          <CouponProvider>
            <ModalProvider>
              <Router>
                {/* Track SPA route changes */}
                <MetaPixelRouteListener />
                {/* Ensure navigation resets scroll position to top */}
                <ScrollToTop />
                {/* First-visit language prompt */}
                <LanguagePrompt />
                <FontBnWrapper>
                  <div className="App">
                    <Header />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                    </Routes>
                  </div>
                </FontBnWrapper>
              </Router>
            </ModalProvider>
          </CouponProvider>
        </CartProvider>
      </I18nProvider>
    </HelmetProvider>
  );
}

// Wrapper to apply .font-bn when Bengali is selected
import { useI18n } from './i18n';
function FontBnWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  return <div className={lang === 'bn' ? 'font-bn' : ''}>{children}</div>;
}

export default App;