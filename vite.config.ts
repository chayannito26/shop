import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Get all product HTML files
const productDir = resolve(__dirname, 'product');
let productPages: Record<string, string> = {};
try {
  const productFiles = readdirSync(productDir).filter(f => f.endsWith('.html'));
  productPages = Object.fromEntries(
    productFiles.map(file => [
      `product/${file.replace('.html', '')}`,
      resolve(productDir, file)
    ])
  );
} catch {
  // product directory may not exist yet
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        cart: resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        ...productPages,
      },
    },
  },
});
