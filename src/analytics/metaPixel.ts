declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

const CURRENCY = 'BDT';

function isReady() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function track(event: string, params?: Record<string, any>) {
  try {
    if (!isReady()) return;
    if (params) window.fbq!('track', event, params);
    else window.fbq!('track', event);
  } catch {}
}

export function trackPageView() {
  track('PageView');
}

export function trackViewContent(p: { id: string; name: string; category?: string; price: number }) {
  track('ViewContent', {
    content_ids: [p.id],
    content_name: p.name,
    content_type: 'product',
    content_category: p.category,
    value: p.price,
    currency: CURRENCY
  });
}

export function trackAddToCart(p: { id: string; name: string; category?: string }, unitPrice: number, selectedVariation?: string) {
  track('AddToCart', {
    content_ids: [p.id],
    content_name: selectedVariation ? `${p.name} - ${selectedVariation}` : p.name,
    content_type: 'product',
    content_category: p.category,
    value: unitPrice,
    currency: CURRENCY
  });
}

export function trackInitiateCheckout(cartItems: { id: string }[], cartTotal: number) {
  track('InitiateCheckout', {
    value: cartTotal,
    currency: CURRENCY,
    content_ids: cartItems.map(i => i.id),
    num_items: cartItems.length
  });
}

export function trackPurchase(orderId: string, purchasedItems: { id: string }[], orderTotal: number) {
  track('Purchase', {
    value: orderTotal,
    currency: CURRENCY,
    content_ids: purchasedItems.map(i => i.id),
    num_items: purchasedItems.length,
    order_id: orderId
  });
}
