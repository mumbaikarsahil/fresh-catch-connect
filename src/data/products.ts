import { supabase } from '@/lib/supabase';
import { Product, ProductUI } from '@/types/product';

// 1. Updated Mock Data
const localProducts: Product[] = [
  {
    id: '1',
    name: 'Surmai (King Fish)',
    description: 'Fresh curry cut pieces, perfect for fry or curry',
    price: 800,
    unit: 'kg',
    imageName: 'fish-surmai.jpg', // Ensure this file exists in public/images/products/
    category: 'fish',
    in_stock: true,
    low_stock: false,
    stock_kg: 5,
    stock_quantity: 10,
    cleaning_loss_percent: 35 
  },
  // ... other products
];

// Helper: Transforms DB Data -> Frontend Data (Local Assets)
const transformProduct = (product: Product): ProductUI => {
  return {
    ...product,
    // Map snake_case to camelCase
    inStock: product.in_stock,
    lowStock: product.low_stock,
    
    // ✅ FIXED: Point to local public folder
    // If your DB says "fish.jpg", this becomes "/images/products/fish.jpg"
    imageUrl: `/${product.imageName}`, 
  };
};

export async function getProducts(): Promise<ProductUI[]> {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    if (products) {
      return products.map(transformProduct);
    }

    return localProducts.map(transformProduct);

  } catch (error) {
    console.error('Error fetching products:', error);
    return localProducts.map(transformProduct);
  }
}

export const WHATSAPP_NUMBER = '919082165743';