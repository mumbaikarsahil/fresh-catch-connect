import { createClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string | null;  // <--- Ensure this exists
          customer_name: string | null;
          phone_number: string;
          delivery_address: string;   // <--- Ensure this matches DB
          items: any;                 // Generic 'any' for JSON
          total_amount: number;
          status: string;
          user_id: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          customer_name: string;
          phone_number: string;
          delivery_address: string;
          items: any;
          total_amount: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          user_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          customer_name?: string;
          phone_number?: string;
          delivery_address?: string;
          items?: any;
          total_amount?: number;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          user_id?: string | null;
          updated_at?: string;
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
        };
      };
    };
  };
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);