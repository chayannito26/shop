import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  brand?: string;
  category?: string;
  sku?: string;
  gtin?: string;
  mpn?: string;
  productCondition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;
  noIndex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  jsonLd?: object[];
}

const DEFAULT_IMAGE = 'https://shop.chayannito26.com/image.jpg';
const SITE_NAME = 'Chayannito 26 Official Merchandise Store';
const BASE_URL = 'https://shop.chayannito26.com';
const DEFAULT_DESCRIPTION = 'Shop official Chayannito 26 merch: premium t‑shirts, caps, hoodies, mugs, stickers and more. Fast shipping, secure checkout, limited drops.';

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  imageAlt,
  type = 'website',
  price,
  currency = 'BDT',
  availability = 'InStock',
  brand = 'Chayannito 26',
  category,
  sku,
  gtin,
  mpn,
  productCondition = 'NewCondition',
  keywords = [],
  author = 'Chayannito 26',
  publishedTime,
  modifiedTime,
  robots = 'index, follow',
  noIndex = false,
  breadcrumbs = [],
  jsonLd = []
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  
  // Default keywords
  const defaultKeywords = [
    'Chayannito 26',
    'Chayannito 26 merch',
    'official merchandise',
    'batch 26',
    'apparel',
    'accessories',
    'shop',
    'store'
  ];
  
  const allKeywords = [...defaultKeywords, ...keywords].join(', ');

  // Generate breadcrumb JSON-LD
  const breadcrumbJsonLd = breadcrumbs.length > 0 ? [{
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': `${BASE_URL}${crumb.url}`
    }))
  }] : [];

  // Organization JSON-LD
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Chayannito 26',
    'url': BASE_URL,
    'logo': `${BASE_URL}/logo.png`,
    'description': 'Official merchandise store for Chayannito 26 batch',
    'sameAs': [
      // Add social media links here when available
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'availableLanguage': ['English', 'Bengali']
    }
  };

  // Website JSON-LD
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': SITE_NAME,
    'url': BASE_URL,
    'description': DEFAULT_DESCRIPTION,
    'inLanguage': ['en', 'bn'],
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${BASE_URL}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Combine all JSON-LD
  const allJsonLd = [
    organizationJsonLd,
    websiteJsonLd,
    ...breadcrumbJsonLd,
    ...jsonLd
  ];

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : robots} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph meta tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={imageAlt || title || 'Chayannito 26 merchandise'} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="bn_BD" />

      {/* Twitter Card meta tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={imageAlt || title || 'Chayannito 26 merchandise'} />

      {/* Product-specific meta tags */}
      {type === 'product' && (
        <>
          <meta property="product:brand" content={brand} />
          <meta property="product:availability" content={availability} />
          <meta property="product:condition" content={productCondition} />
          <meta property="product:price:amount" content={price?.toString()} />
          <meta property="product:price:currency" content={currency} />
          {category && <meta property="product:category" content={category} />}
          {sku && <meta property="product:retailer_item_id" content={sku} />}
          {gtin && <meta property="product:gtin" content={gtin} />}
          {mpn && <meta property="product:mpn" content={mpn} />}
        </>
      )}

      {/* Article-specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:author" content={author} />
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
        </>
      )}

      {/* Additional SEO meta tags */}
      <meta name="theme-color" content="#DC2626" />
      <meta name="msapplication-TileColor" content="#DC2626" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Chayannito 26 Store" />
      <meta name="application-name" content="Chayannito 26 Store" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Rich Snippets and Schema.org JSON-LD */}
      {allJsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema, null, 2)}
        </script>
      ))}
    </Helmet>
  );
};