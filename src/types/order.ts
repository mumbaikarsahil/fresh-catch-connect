import { Product } from './product';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;        
  quantity_kg?: number;    
  unit: string;
  imageName: string;
}

export interface Order {
  id: string; 
  user_id?: string | null;
  items: OrderItem[]; 
  total_amount: number;
  delivery_address: string;
  phone_number: string;
  customer_name: string;
  status: OrderStatus; 
  created_at?: string;
  updated_at?: string;
  // ✅ ADDED: The new payment fields so TypeScript accepts them
  payment_id?: string | null;
  payment_status?: string;
}

export interface CreateOrderData {
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  delivery_preference: string;
  total_amount: number;
  status?: OrderStatus; 
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    quantity_kg?: number; 
    imageName: string;
    unit: string; 
  }[];
  // ✅ ADDED: Allow passing payment info when creating an order
  payment_id?: string | null;
  payment_status?: string;
}