import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { CartProvider } from '../contexts/CartContext';
import { CouponProvider } from '../contexts/CouponContext';
import { ModalProvider } from '../contexts/ModalContext';
import { I18nProvider, LanguagePrompt } from '../i18n';
import { Header } from '../components/Header';
import { Cart } from '../pages/Cart';
import '../index.css';
import { useI18n } from '../i18n';

// Wrapper to apply .font-bn when Bengali is selected
function FontBnWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  return <div className={lang === 'bn' ? 'font-bn' : ''}>{children}</div>;
}

function App() {
  return (
    <HelmetProvider>
      <I18nProvider>
        <CartProvider>
          <CouponProvider>
            <ModalProvider>
              <LanguagePrompt />
              <FontBnWrapper>
                <div className="App">
                  <Header />
                  <Cart />
                </div>
              </FontBnWrapper>
            </ModalProvider>
          </CouponProvider>
        </CartProvider>
      </I18nProvider>
    </HelmetProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
