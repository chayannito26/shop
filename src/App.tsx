import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { CouponProvider } from './contexts/CouponContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { MetaPixelRouteListener } from './analytics/MetaPixelRouteListener';
import { I18nProvider, LanguagePrompt } from './i18n';
import { ModalProvider } from './contexts/ModalContext';

function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <CouponProvider>
          <ModalProvider>
            <Router>
              {/* Track SPA route changes */}
              <MetaPixelRouteListener />
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
  );
}

// Wrapper to apply .font-bn when Bengali is selected
import { useI18n } from './i18n';
function FontBnWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  return <div className={lang === 'bn' ? 'font-bn' : ''}>{children}</div>;
}

export default App;