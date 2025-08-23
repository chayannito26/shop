import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enable/disable the internal bought-at rate panel from console:
//   __showRates()  -> shows the panel (sets localStorage flag)
//   __hideRates()  -> hides the panel
if (typeof window !== 'undefined') {
  (window as any).__showRates = () => {
    try {
      localStorage.setItem('SHOW_BULK_RATES', '1');
      console.log('[dev] Bulk rate indicator enabled');
    } catch {}
  };
  (window as any).__hideRates = () => {
    try {
      localStorage.removeItem('SHOW_BULK_RATES');
      console.log('[dev] Bulk rate indicator disabled');
    } catch {}
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
