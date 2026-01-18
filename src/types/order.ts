import { Product } from './product';

// 1. Match the status values to what you might use in the App/DB
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageName: string;
}

export interface Order {
  // CHANGED: id is 'number' to match your supabase.ts 'int8' definition
  id?: number; 
  
  user_id?: string;
  
  // Frontend keeps this strictly typed as OrderItem[] for safety
  // (Even though Supabase sees it as 'any'/'json')
  items: OrderItem[]; 
  
  total_amount: number;
  delivery_address: string;
  status: OrderStatus;
  phone_number: string;
  customer_name: string;
  
  created_at?: string;
  updated_at?: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  customer_name: string;
  // Added status optional so you can set initial status if needed
  status?: OrderStatus; 
}