import { supabase } from '@/lib/supabase'; 
import { CreateOrderData, Order, OrderStatus } from '@/types/order';

export const createOrder = async (orderData: CreateOrderData): Promise<Order | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Prepare payload
  const dbPayload = {
    user_id: user?.id || null,
    items: orderData.items, 
    total_amount: orderData.total_amount,
    delivery_address: orderData.delivery_address,
    phone_number: orderData.phone_number,
    customer_name: orderData.customer_name,
    status: orderData.status || 'pending', 
    // ✅ ADDED: Pass the payment fields if they exist
    payment_id: orderData.payment_id || null,
    payment_status: orderData.payment_status || 'pending'
  };

  // 2. Insert call
  // ✅ FIX: Cast the supabase query to 'any' to remove the Line 22 red line
  const { data, error } = await (supabase.from('orders') as any)
    .insert(dbPayload)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data as Order;
};

export const getUserOrders = async (): Promise<Order[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data as Order[];
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  // ✅ FIX: Cast the supabase query to 'any' to remove the Line 62 red line
  const { data, error } = await (supabase.from('orders') as any)
    .update({ status }) 
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data as Order;
};