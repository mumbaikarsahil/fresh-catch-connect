export type ProductUnit = 'kg' | 'plate' | '500g' | 'piece';
export type ProductCategory = 'fish' | 'prawns' | 'crab' | 'other';

export interface ProductBase {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description: string;
  price: number;
  unit: ProductUnit;
  imageName: string;
  category: ProductCategory;
  in_stock: boolean;
  low_stock: boolean;
}

// For API responses (matches Supabase schema)
export interface Product extends Omit<ProductBase, 'imageName' | 'in_stock' | 'low_stock'> {
  imageName: string;
  in_stock: boolean;
  low_stock: boolean;
}

// For frontend usage (camelCase)
export interface ProductUI extends Omit<ProductBase, 'imageName' | 'in_stock' | 'low_stock' | 'created_at' | 'updated_at'> {
  imageName: string;
  imageUrl: string;
  inStock: boolean;
  lowStock: boolean;
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

// Helper type for creating/updating products
export type ProductFormData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
