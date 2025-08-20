import { Product } from '../contexts/CartContext';

export const products: Product[] = [
  {
    id: 'tshirt',
    name: 'Chayannito 26 T-Shirt',
    price: 350,
    image: './images/tshirt.jpg',
    description: 'Premium cotton t-shirt with Chayannito 26 batch design. Perfect for representing your batch pride.',
    category: 'clothing',
    variations: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'hoodie',
    name: 'Chayannito 26 Hoodie',
    price: 700,
    image: './images/hoodie.jpg',
    description: 'Cozy hoodie with embroidered Chayannito 26 logo. Stay warm while showing your batch spirit.',
    category: 'clothing',
    variations: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'mug',
    name: 'Chayannito 26 Ceramic Mug',
    price: 300,
    image: './images/mug.jpg',
    description: 'High-quality ceramic mug with Chayannito 26 design. Perfect for your morning coffee or tea.',
    category: 'accessories'
  },
  {
    id: 'totebag',
    name: 'Chayannito 26 Tote Bag',
    price: 200,
    image: './images/totebag.jpg',
    description: 'Durable canvas tote bag with stylish Chayannito 26 print. Eco-friendly and practical.',
    category: 'accessories'
  },
  {
    id: 'keychain',
    name: 'Chayannito 26 Keychain',
    price: 50,
    image: './images/keychain.jpg',
    description: 'Metal keychain with engraved Chayannito 26 logo. A perfect small memento.',
    category: 'accessories'
  },
  {
    id: 'notebook',
    name: 'Chayannito 26 Notebook',
    price: 250,
    image: './images/notebook.jpg',
    description: 'Premium quality notebook with Chayannito 26 cover design. Perfect for notes and journaling.',
    category: 'stationery',
    variations: ['Diary', 'Notebook']
  },
  {
    id: 'pen',
    name: 'Chayannito 26 Pen Set',
    price: 150,
    image: './images/pen.jpg',
    description: 'Set of 3 premium ballpoint pens with Chayannito 26 branding.',
    category: 'stationery'
  },
  {
    id: 'marker',
    name: 'Basic Marker',
    price: 20,
    image: './images/marker.webp',
    description: 'A marker. Perfect for signing.',
    category: 'stationery',
    variations: ['Red', 'Blue', 'Black', 'Green']
  },
  {
    id: 'badge',
    name: 'Chayannito 26 Badge',
    price: 80,
    image: './images/badge.jpg',
    description: 'Collectible metal badge with Chayannito 26 emblem. Perfect for bags, jackets, or display.',
    category: 'accessories'
  }
];