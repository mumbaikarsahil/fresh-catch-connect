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
  pincode?: string;
  delivery_fee?: number;
  phone_number: string;
  customer_name: string;
  status: OrderStatus; 
  created_at?: string;
  updated_at?: string;
  payment_id?: string | null;
  payment_status?: string;
  // ✅ ADDED: delivery_preference to match the database schema
  delivery_preference?: string; 
}

export interface CreateOrderData {
  customer_name: string;
  phone_number: string;
  delivery_address: string;
  pincode?: string;
  delivery_fee?: number;
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
  payment_id?: string | null;
  payment_status?: string;
}

// ✅ ADDED: A new type for your store settings to use in CartPage and Admin Dashboard
export interface StoreSettings {
  id: number;
  is_maintenance: boolean;
  same_day_enabled: boolean;
  next_day_enabled: boolean;
}