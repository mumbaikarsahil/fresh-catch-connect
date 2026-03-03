export type ProductUnit = 'kg' | 'plate' | '500g' | 'piece';
export type ProductCategory = 'fish' | 'prawns' | 'crab' | 'other';

// 1. The Base Logic
export interface ProductBase {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: ProductUnit;
  imageName: string;
  category: ProductCategory;
  stock_quantity: number;      // ✅ Matches DB default 0
  stock_kg: number;            // ✅ Matches DB (Raw Weight)
  cleaning_loss_percent: number; // ✅ Matches DB default 35
  images?: string[]; // ✅ ADD THIS LINE
}

// 2. The Database Shape (What Supabase returns)
// snake_case keys to match SQL columns exactly
export interface Product extends ProductBase {
  created_at?: string;
  updated_at?: string;
  in_stock: boolean;     // DB column is in_stock
  low_stock: boolean;    // DB column is low_stock
}

// 3. The Frontend Shape (What your React components use)
// camelCase keys for cleaner JavaScript usage
export interface ProductUI extends ProductBase {
  imageUrl: string;      // Generated URL (signed url from bucket)
  inStock: boolean;      // Mapped from in_stock
  lowStock: boolean;     // Mapped from low_stock
}

export interface CartItem {
  product: ProductUI;
  quantity: number;
}

export interface ProductsResponse {
  data: Product[];
  error: Error | null;
  count: number | null;
}

export interface ProductsFilters {
  category?: ProductCategory;
  inStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;