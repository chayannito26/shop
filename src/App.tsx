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

function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <CouponProvider>
          <Router>
            {/* Track SPA route changes */}
            <MetaPixelRouteListener />
            {/* First-visit language prompt */}
            <LanguagePrompt />
            <div className="App">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
              </Routes>
            </div>
          </Router>
        </CouponProvider>
      </CartProvider>
    </I18nProvider>
  );
}

export default App;