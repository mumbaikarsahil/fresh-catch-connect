import { Product } from '@/types/product';

import surmai from '@/assets/fish-surmai.jpg';
import prawns from '@/assets/fish-prawns.jpg';
import pomfret from '@/assets/fish-pomfret.jpg';
import rawas from '@/assets/fish-rawas.jpg';
import rohu from '@/assets/fish-rohu.jpg';
import bangda from '@/assets/fish-bangda.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Surmai (King Fish)',
    description: 'Fresh curry cut pieces, perfect for fry or curry',
    price: 800,
    unit: 'kg',
    imageUrl: surmai,
    category: 'fish',
    inStock: true,
    lowStock: false,
  },
  {
    id: '2',
    name: 'Jumbo Prawns',
    description: 'Deveined jumbo prawns, ready to cook',
    price: 650,
    unit: '500g',
    imageUrl: prawns,
    category: 'prawns',
    inStock: true,
    lowStock: true,
  },
  {
    id: '3',
    name: 'Black Pomfret',
    description: 'Whole cleaned fish, ideal for tawa fry',
    price: 700,
    unit: 'kg',
    imageUrl: pomfret,
    category: 'fish',
    inStock: true,
    lowStock: false,
  },
  {
    id: '4',
    name: 'Rawas (Indian Salmon)',
    description: 'Boneless steaks, rich in Omega-3',
    price: 750,
    unit: 'kg',
    imageUrl: rawas,
    category: 'fish',
    inStock: true,
    lowStock: false,
  },
  {
    id: '5',
    name: 'Rohu Fish',
    description: 'Fresh curry cut, traditional Bengali favorite',
    price: 280,
    unit: 'kg',
    imageUrl: rohu,
    category: 'fish',
    inStock: false,
    lowStock: false,
  },
  {
    id: '6',
    name: 'Bangda (Mackerel)',
    description: 'Whole fish, perfect for rava fry',
    price: 200,
    unit: 'kg',
    imageUrl: bangda,
    category: 'fish',
    inStock: true,
    lowStock: false,
  },
];

export const WHATSAPP_NUMBER = '919082165743';
