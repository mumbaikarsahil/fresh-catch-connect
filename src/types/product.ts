export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'kg' | 'plate' | '500g' | 'piece';
  imageUrl: string;
  category: 'fish' | 'prawns' | 'crab' | 'other';
  inStock: boolean;
  lowStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
