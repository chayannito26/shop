import { Product } from '../contexts/CartContext';

export const products: Product[] = [
  {
    id: 'tshirt',
    name: 'Chayannito 26 T-Shirt',
  price: 299,
    image: [
      'https://shop.chayannito26.com/images/tshirt.jpg'
    ],
    thumbnail: 'https://shop.chayannito26.com/images/tshirt.webp',
    description: 'Premium cotton t-shirt with Chayannito 26 batch design. Perfect for representing your batch pride.',
    category: 'clothing',
    comingSoon: true,
  variationSchema: { keys: ['color', 'size'], titles: { color: 'Color', size: 'Size' } },
    variations: [
      // White variations
  { label: 'White-S', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-white.jpg', 'https://shop.chayannito26.com/images/tshirt-white-back.jpg'] },
  { label: 'White-M', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-white.jpg', 'https://shop.chayannito26.com/images/tshirt-white-back.jpg'] },
  { label: 'White-L', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-white.jpg', 'https://shop.chayannito26.com/images/tshirt-white-back.jpg'] },
  { label: 'White-XL', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-white.jpg', 'https://shop.chayannito26.com/images/tshirt-white-back.jpg'] },
  { label: 'White-XXL', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-white.jpg', 'https://shop.chayannito26.com/images/tshirt-white-back.jpg'] },
      // Black variations
  { label: 'Black-S', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-black.jpg', 'https://shop.chayannito26.com/images/tshirt-black-back.jpg'] },
  { label: 'Black-M', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-black.jpg', 'https://shop.chayannito26.com/images/tshirt-black-back.jpg'] },
  { label: 'Black-L', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-black.jpg', 'https://shop.chayannito26.com/images/tshirt-black-back.jpg'] },
  { label: 'Black-XL', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-black.jpg', 'https://shop.chayannito26.com/images/tshirt-black-back.jpg'] },
  { label: 'Black-XXL', price: 299, image: ['https://shop.chayannito26.com/images/tshirt-black.jpg', 'https://shop.chayannito26.com/images/tshirt-black-back.jpg'] }
    ]
  },
    {
    id: 'drop_tshirt',
    name: 'Chayannito 26 Drop Shoulder T-Shirt',
  price: 449,
    // replace images with provided drop images only
    image: [
      'https://shop.chayannito26.com/images/drop_white_1.jpg',
      'https://shop.chayannito26.com/images/drop_black_1.jpg',
      'https://shop.chayannito26.com/images/drop_black_2.jpg',
      'https://shop.chayannito26.com/images/drop_black_white.jpg'
    ],
    thumbnail: 'https://shop.chayannito26.com/images/drop_white_1.avif',
    description: 'Premium cotton drop shouldert-shirt with Chayannito 26 batch design. Perfect for representing your batch pride.',
    category: 'clothing',
  variationSchema: { keys: ['color', 'size'], titles: { color: 'Color', size: 'Size' } },
    variations: [
      // variations should not contain any images because product-level images were specified by user and must be the only images
  { label: 'White-S', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_white_1.jpg']},
  { label: 'White-M', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_white_1.jpg']},
  { label: 'White-L', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_white_1.jpg']},
  { label: 'White-XL', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_white_1.jpg']},
  { label: 'White-XXL', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_white_1.jpg']},
      // Black variations
  { label: 'Black-S', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_black_1.jpg', 'https://shop.chayannito26.com/images/drop_black_2.jpg']},
  { label: 'Black-M', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_black_1.jpg', 'https://shop.chayannito26.com/images/drop_black_2.jpg']},
  { label: 'Black-L', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_black_1.jpg', 'https://shop.chayannito26.com/images/drop_black_2.jpg']},
  { label: 'Black-XL', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_black_1.jpg', 'https://shop.chayannito26.com/images/drop_black_2.jpg']},
  { label: 'Black-XXL', price: 449 , 'image': ['https://shop.chayannito26.com/images/drop_black_1.jpg', 'https://shop.chayannito26.com/images/drop_black_2.jpg']}
    ]
  },
  {
    id: 'hoodie',
    name: 'Chayannito 26 Hoodie',
  comingSoon: true,
  price: 699,
    image: [
      'https://shop.chayannito26.com/images/hoodie.jpg'
    ],
    thumbnail: 'https://shop.chayannito26.com/images/hoodie.webp',
    description: 'Cozy hoodie with embroidered Chayannito 26 logo. Stay warm while showing your batch spirit.',
    category: 'clothing',
  variationSchema: { keys: ['color', 'size'], titles: { color: 'Color', size: 'Size' } },
    variations: [
      // variations should not include images when product-level images are specified in user's list
  { label: 'White-S', price: 699 },
  { label: 'White-M', price: 699 },
  { label: 'White-L', price: 699 },
  { label: 'White-XL', price: 699 },
  { label: 'White-XXL', price: 699 },
      // Black variations
  { label: 'Black-S', price: 699 },
  { label: 'Black-M', price: 699 },
  { label: 'Black-L', price: 699 },
  { label: 'Black-XL', price: 699 },
  { label: 'Black-XXL', price: 699 }
    ]
  },
  {
    id: 'mug',
    name: 'Chayannito 26 Ceramic Mug',
  price: 299,
  image: ['https://shop.chayannito26.com/images/mug_1.jpg','https://shop.chayannito26.com/images/mug_2.jpg'],
    thumbnail: 'https://shop.chayannito26.com/images/mug_1.webp',
    description: 'High-quality ceramic mug with Chayannito 26 design. Perfect for your morning coffee or tea.',
    category: 'accessories'
  },
  {
    id: 'totebag',
    name: 'Chayannito 26 Tote Bag',
  price: 299,
    image: ['https://shop.chayannito26.com/images/tote_white_1.jpg','https://shop.chayannito26.com/images/tote_white_3.jpg','https://shop.chayannito26.com/images/tote_black_1.jpg','https://shop.chayannito26.com/images/tote_black_3.jpg'],
    thumbnail: 'https://shop.chayannito26.com/images/tote_white_1.webp',
    description: 'Durable canvas tote bag with stylish Chayannito 26 print. Eco-friendly and practical.',
    category: 'accessories',
    variations: [
  { label: 'White', price: 299 , 'image': ['https://shop.chayannito26.com/images/tote_white_1.jpg', 'https://shop.chayannito26.com/images/tote_white_2.jpg', 'https://shop.chayannito26.com/images/tote_white_3.jpg', 'https://shop.chayannito26.com/images/tote_white_4.jpg']},
  { label: 'Black', price: 299 , 'image': ['https://shop.chayannito26.com/images/tote_black_1.jpg', 'https://shop.chayannito26.com/images/tote_black_2.jpg', 'https://shop.chayannito26.com/images/tote_black_3.jpg', 'https://shop.chayannito26.com/images/tote_black_4.jpg']},
    ]
  },
  // {
  //   id: 'keychain',
  //   name: 'Chayannito 26 Keychain',
  //   price: 100,
  //   image: 'https://shop.chayannito26.com/images/keychain.jpg',
  //   description: 'Metal keychain with engraved Chayannito 26 logo. A perfect small memento.',
  //   category: 'accessories'
  // },
  {
    id: 'notebook',
    name: 'Chayannito 26 Notebook',
  price: 189,
    image: ['https://shop.chayannito26.com/images/notebook_1.jpg', 'https://shop.chayannito26.com/images/notebook_2.jpg','https://shop.chayannito26.com/images/notebook_3.jpg', 'https://shop.chayannito26.com/images/notebook_lined.jpg'],
    thumbnail: 'https://shop.chayannito26.com/images/notebook_1.webp',
    description: 'Premium notebooks in A4 and A5 sizes with durable 300 gsm Ambush card cover. A4 comes with 150 or 300 blank pages (70 gsm). A5 comes with 160 pages (blank or lined, 100 gsm). Note: Page count is calculated double-sided.',
    category: 'stationery',
    variationSchema: { keys: ['size', 'finish', 'pages'], titles: { size: 'Size', finish: 'Finish', pages: 'Pages' } },
    variations: [
      // A4 variations
  { label: 'A4-Blank-150', price: 249, image: ['https://shop.chayannito26.com/images/notebook_a4.jpg', 'https://shop.chayannito26.com/images/notebook_blank.jpg', 'https://shop.chayannito26.com/images/notebook_2.jpg', 'https://shop.chayannito26.com/images/notebook_3.jpg'] },
  { label: 'A4-Blank-300', price: 399, image: ['https://shop.chayannito26.com/images/notebook_a4.jpg', 'https://shop.chayannito26.com/images/notebook_blank.jpg', 'https://shop.chayannito26.com/images/notebook_2.jpg', 'https://shop.chayannito26.com/images/notebook_3.jpg'] },
      // A5 variations (note: A4-Lined is not available, only A5 has lined options)
  { label: 'A5-Lined-160', price: 249, image: ['https://shop.chayannito26.com/images/notebook_a5.jpg', 'https://shop.chayannito26.com/images/notebook_lined.jpg', 'https://shop.chayannito26.com/images/notebook_2.jpg', 'https://shop.chayannito26.com/images/notebook_3.jpg'] },
  { label: 'A5-Blank-160', price: 249, image: ['https://shop.chayannito26.com/images/notebook_a5.jpg', 'https://shop.chayannito26.com/images/notebook_blank.jpg', 'https://shop.chayannito26.com/images/notebook_2.jpg', 'https://shop.chayannito26.com/images/notebook_3.jpg'] },
    ]
  },
  {
    id: 'pen',
    name: 'Chayannito 26 Cap',
  comingSoon: true,
  price: 149,
    image: ['https://shop.chayannito26.com/images/cap.jpg'],
    thumbnail: 'https://shop.chayannito26.com/images/cap.webp',
    description: 'A high quality cap with Chayannito 26 branding on the front. ',
    category: 'clothing',
    variations: [
  { label: 'Black', price: 299 },
  { label: 'White', price: 299 },
    ]
  },
  // {
  //   id: 'badge',
  //   name: 'Chayannito 26 Badge',
  //   price: 80,
  //   image: 'https://shop.chayannito26.com/images/badge.jpg',
  //   description: 'Collectible metal badge with Chayannito 26 emblem. Perfect for bags, jackets, or display.',
  //   category: 'accessories',
  //   // Demo: per-unit pricing tiers
  //   unitsSold: 120,
  //   bulkRates: [
  //     { units: 100, unitPrice: 2.8 },
  //     { units: 200, unitPrice: 2.25 },
  //     { units: 300, unitPrice: 1.83 },
  //     { units: 500, unitPrice: 1.5 },
  //     { units: 1000, unitPrice: 1.29 }
  //   ]
  // },
  {
    id: 'bottle',
    name: 'Chayannito 26 Water Bottle',
  price: 399,
    image: ['https://shop.chayannito26.com/images/bottle_1.jpg','https://shop.chayannito26.com/images/bottle_2.jpg','https://shop.chayannito26.com/images/bottle_3.jpg','https://shop.chayannito26.com/images/bottle_4.jpg','https://shop.chayannito26.com/images/bottle_5.jpg'],
    thumbnail: 'https://shop.chayannito26.com/images/bottle_1.avif',
    description: 'Collectible metal bottle with Chayannito 26 emblem.',
    category: 'accessories'
  },
  // {
  //   id: 'lanyard',
  //   name: 'Chayannito 26 ID Card Lanyard',
  //   price: 100,
  //   image: 'https://shop.chayannito26.com/images/lanyard.jpg',
  //   description: 'Durable lanyard with Chayannito 26 branding. Perfect for holding your ID card or keys.',
  //   category: 'accessories'
  // },
  {
    id: 'phonecover',
    name: 'Chayannito 26 Phone Cover',
  price: 299,
  thumbnail: 'https://shop.chayannito26.com/images/cover_1.avif',
    image: ['https://shop.chayannito26.com/images/cover_1.jpg', 'https://shop.chayannito26.com/images/cover_2.jpg', 'https://shop.chayannito26.com/images/cover_3.jpg'],
    description: 'Durable phone cover with Chayannito 26 design. Protect your phone in style.',
    category: 'accessories'
  },
  {
    id: 'sticker',
    name: 'Chayannito 26 Sticker',
  price: 9,
    image: 'https://shop.chayannito26.com/images/sticker.jpg',
    description: 'Vinyl sticker with Chayannito 26 logo. Perfect for laptops, water bottles, and more.',
    category: 'accessories',
    // Demo: total-price tiers (exact amount totals)
    unitsSold: 240,
    comingSoon: true,
    variationSchema: { keys: ['size'], titles: { size: 'Size' } },
    // Size-based variations: 1in, 1.5in, 2in, 2.5in, 3in with incremental prices
    variations: [
      { label: '1in', price: 5, image: ['https://shop.chayannito26.com/images/sticker.jpg'] },
      { label: '1.5in', price: 8, image: ['https://shop.chayannito26.com/images/sticker.jpg'] },
      { label: '2in', price: 10, image: ['https://shop.chayannito26.com/images/sticker.jpg'] },
      { label: '2.5in', price: 15, image: ['https://shop.chayannito26.com/images/sticker.jpg'] },
      { label: '3in', price: 20, image: ['https://shop.chayannito26.com/images/sticker.jpg'] }
    ],
  },
  // {
  //   id: 'wristband',
  //   name: 'Chayannito 26 Wrist Band',
  // price: 59,
  //   image: 'https://shop.chayannito26.com/images/wristband.jpg',
  //   description: 'Silicone wrist band with Chayannito 26 branding. Comfortable, durable, and everyday wearable.',
  //   category: 'accessories',
  //   variations: [
  // { label: 'Black', price: 59, image: ['https://shop.chayannito26.com/images/wristband.jpg'] },
  // { label: 'White', price: 59, image: ['https://shop.chayannito26.com/images/wristband.jpg'] }
  //   ]
  // }
];