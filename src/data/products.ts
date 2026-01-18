import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

const localProducts: Product[] = [
  {
    id: '1',
    name: 'Surmai (King Fish)',
    description: 'Fresh curry cut pieces, perfect for fry or curry',
    price: 800,
    unit: 'kg',
    imageName: 'fish-surmai.jpg',
    category: 'fish',
    in_stock: true,
    low_stock: false,
  },
  // ... other products
];

export async function getProducts(): Promise<Product[]> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;
    return products || localProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return localProducts;
  }
}

export const WHATSAPP_NUMBER = '919082165743';