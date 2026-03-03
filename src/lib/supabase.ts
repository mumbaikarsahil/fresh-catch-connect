import { createClient } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Functions: {
      confirm_order_and_deduct_stock: {
        Args: { order_id: string; };
        Returns: void;
      };
    };
    Tables: {
      orders: {
        Row: {
          id: string; 
          created_at: string;
          updated_at: string | null;
          customer_name: string;
          phone_number: string;
          delivery_address: string;
          items: Json; 
          total_amount: number;
          status: string; 
          user_id: string | null;
          payment_id: string | null;
          payment_status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_name: string;
          phone_number: string;
          delivery_address: string;
          items: Json;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          user_id?: string | null;
          updated_at?: string;
          payment_id?: string | null;
          payment_status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_name?: string;
          phone_number?: string;
          delivery_address?: string;
          items?: Json;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          user_id?: string | null;
          updated_at?: string;
          payment_id?: string | null;
          payment_status?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          description: string | null;
          imageName: string;
          unit: string;
          in_stock: boolean;
          low_stock: boolean;
          category: string | null;
          // ✅ THESE WERE MISSING CAUSING YOUR ERROR
          stock_kg: number; 
          stock_quantity: number;
          cleaning_loss_percent: number; 
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          description?: string | null;
          imageName: string;
          unit: string;
          in_stock?: boolean;
          low_stock?: boolean;
          category?: string | null;
          stock_kg?: number;
          stock_quantity?: number;
          cleaning_loss_percent?: number;
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          description?: string | null;
          imageName?: string;
          unit?: string;
          in_stock?: boolean;
          low_stock?: boolean;
          category?: string | null;
          stock_kg?: number;
          stock_quantity?: number;
          cleaning_loss_percent?: number;
        };
      };
    };
  };
};

// Notice we use 'let' instead of 'const' here so we can modify it
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 1. Clean up any accidental quotes or spaces from the .env file
supabaseUrl = supabaseUrl.replace(/['"]/g, '').trim();

// 2. If it is NOT a full web link (meaning it's our proxy), build the full URL
if (!supabaseUrl.startsWith('http')) {
  // Make sure it has a leading slash even if you forgot it in the .env
  const safePath = supabaseUrl.startsWith('/') ? supabaseUrl : `/${supabaseUrl}`;
  supabaseUrl = `${window.location.origin}${safePath}`;
}

// 3. Initialize Supabase safely
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);