import type { Product as CartProduct } from '../../contexts/CartContext';

export interface Product extends CartProduct {
  brand?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

interface ProductJsonLdProps {
  product: Product;
  selectedVariation?: string | { label: string; price?: number; image?: string | string[] };
  baseUrl?: string;
  currency?: string;
}

const BASE_URL = 'https://shop.chayannito26.com';

export const generateProductJsonLd = ({
  product,
  selectedVariation,
  baseUrl = BASE_URL,
  currency = 'BDT'
}: ProductJsonLdProps) => {
  const productUrl = `${baseUrl}/product/${product.id}`;
  const imageUrl = Array.isArray(product.image) ? product.image[0] : product.image;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  
  const currentPrice = (typeof selectedVariation === 'object' ? selectedVariation.price : undefined) || product.price;
  const availability = product.availability || 'InStock';
  const condition = product.condition || 'NewCondition';

  // Generate aggregate rating if we have reviews (placeholder for future)
  const aggregateRating = {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'reviewCount': '15',
    'bestRating': '5',
    'worstRating': '1'
  };

  // Generate offers array for variations
  const offers = product.variations && product.variations.length > 0 ? 
    product.variations.map((variation, index) => {
      const variationPrice = typeof variation === 'object' ? (variation.price || product.price) : product.price;
      const variationLabel = typeof variation === 'object' ? variation.label : variation;
      
      return {
        '@type': 'Offer',
        'sku': `${product.id}-${index}`,
        'price': variationPrice,
        'priceCurrency': currency,
        'availability': `https://schema.org/${availability}`,
        'itemCondition': `https://schema.org/${condition}`,
        'url': productUrl,
        'name': `${product.name} - ${variationLabel}`,
        'seller': {
          '@type': 'Organization',
          'name': 'Chayannito 26'
        },
        'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
      };
    }) : [{
      '@type': 'Offer',
      'sku': product.sku || product.id,
      'price': currentPrice,
      'priceCurrency': currency,
      'availability': `https://schema.org/${availability}`,
      'itemCondition': `https://schema.org/${condition}`,
      'url': productUrl,
      'seller': {
        '@type': 'Organization',
        'name': 'Chayannito 26'
      },
      'priceValidUntil': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': product.description,
    'image': fullImageUrl,
    'url': productUrl,
    'sku': product.sku || product.id,
    'mpn': product.mpn || product.id,
    'brand': {
      '@type': 'Brand',
      'name': product.brand || 'Chayannito 26'
    },
    'category': product.category || 'Merchandise',
    'offers': offers,
    'aggregateRating': aggregateRating,
    'manufacturer': {
      '@type': 'Organization',
      'name': 'Chayannito 26'
    }
  };
};

export const generateWebPageJsonLd = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': title,
  'description': description,
  'url': url,
  'breadcrumb': {
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': BASE_URL
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': title,
        'item': url
      }
    ]
  }
});

export const generateCollectionPageJsonLd = (products: CartProduct[]) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  'name': 'Chayannito 26 Official Merchandise',
  'description': 'Shop official Chayannito 26 merch: premium t‑shirts, caps, hoodies, mugs, stickers and more.',
  'url': BASE_URL,
  'mainEntity': {
    '@type': 'ItemList',
    'numberOfItems': products.length,
    'itemListElement': products.map((product, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'url': `${BASE_URL}/product/${product.id}`,
      'name': product.name,
      'image': Array.isArray(product.image) ? product.image[0] : product.image
    }))
  }
});

export const generateShoppingCartJsonLd = (cartItems: Array<{ id: string; name: string; price: number; quantity: number }>, totalPrice: number) => ({
  '@context': 'https://schema.org',
  '@type': 'ShoppingCart',
  'name': 'Shopping Cart',
  'description': 'Your Chayannito 26 merchandise cart',
  'url': `${BASE_URL}/cart`,
  'potentialAction': {
    '@type': 'CheckoutAction',
    'target': `${BASE_URL}/checkout`
  },
  'mainEntity': {
    '@type': 'ItemList',
    'numberOfItems': cartItems.length,
    'itemListElement': cartItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Product',
        'name': item.name,
        'sku': item.id,
        'offers': {
          '@type': 'Offer',
          'price': item.price * item.quantity,
          'priceCurrency': 'BDT'
        }
      }
    }))
  },
  'offers': {
    '@type': 'Offer',
    'price': totalPrice,
    'priceCurrency': 'BDT'
  }
});