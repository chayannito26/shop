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
    currency: CURRENCY,
    contents: [
      {
        id: p.id,
        quantity: 1,
        item_price: unitPrice
      }
    ]
  });
}

// New: Search
export function trackSearch(searchString: string, category?: string) {
  track('Search', {
    search_string: searchString,
    content_category: category
  });
}

// New: CustomizeProduct (e.g., size/option/model selected)
export function trackCustomizeProduct(
  p: { id: string; name: string; category?: string },
  selectedOption: string,
  unitPrice?: number
) {
  track('CustomizeProduct', {
    content_ids: [p.id],
    content_name: `${p.name} - ${selectedOption}`,
    content_type: 'product',
    content_category: p.category,
    ...(typeof unitPrice === 'number' ? { value: unitPrice, currency: CURRENCY } : {})
  });
}

type UserData = {
  name?: string;
  phone?: string;
  email?: string;
  country?: string; // default to Bangladesh when building params
};

function buildUserParams(user?: UserData) {
  if (!user) return {};
  return {
    customer_name: user.name || undefined,
    customer_phone: user.phone || undefined,
    customer_email: user.email || undefined,
    customer_country: user.country || 'Bangladesh',
  };
}

// Updated: include contents + accurate num_items
export function trackInitiateCheckout(
  cartItems: { id: string; quantity?: number; price?: number }[],
  cartTotal: number,
  user?: UserData
) {
  const contents = cartItems.map(i => ({
    id: i.id,
    quantity: i.quantity ?? 1,
    ...(typeof i.price === 'number' ? { item_price: i.price } : {})
  }));
  const numItems = cartItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  track('InitiateCheckout', {
    value: cartTotal,
    currency: CURRENCY,
    content_type: 'product',
    content_ids: cartItems.map(i => i.id),
    contents,
    num_items: numItems,
    ...buildUserParams(user)
  });
}

// Updated: accept items and include contents/content_ids
export function trackAddPaymentInfo(
  totalPayable: number,
  items: { id: string; quantity?: number; price?: number }[] = [],
  user?: UserData,
  paymentMethod?: string
) {
  const contents = items.map(i => ({
    id: i.id,
    quantity: i.quantity ?? 1,
    ...(typeof i.price === 'number' ? { item_price: i.price } : {})
  }));
  track('AddPaymentInfo', {
    value: totalPayable,
    currency: CURRENCY,
    payment_method: paymentMethod || 'unknown',
    content_type: 'product',
    content_ids: items.map(i => i.id),
    contents,
    ...buildUserParams(user)
  });
}

// Updated: include contents + accurate num_items
export function trackPurchase(
  orderId: string,
  purchasedItems: { id: string; quantity?: number; price?: number }[],
  orderTotal: number,
  user?: UserData
) {
  const contents = purchasedItems.map(i => ({
    id: i.id,
    quantity: i.quantity ?? 1,
    ...(typeof i.price === 'number' ? { item_price: i.price } : {})
  }));
  const numItems = purchasedItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  track('Purchase', {
    value: orderTotal,
    currency: CURRENCY,
    content_type: 'product',
    content_ids: purchasedItems.map(i => i.id),
    contents,
    num_items: numItems,
    order_id: orderId,
    ...buildUserParams(user)
  });
}
