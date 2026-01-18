import { Database, supabase } from '@/lib/supabase'; // Import from your typed file
import { CreateOrderData, Order, OrderStatus } from '@/types/order';

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Prepare the payload
  const dbPayload = {
    delivery_address: orderData.delivery_address,
    phone_number: orderData.phone_number,
    total_amount: orderData.total_amount,
    customer_name: orderData.customer_name,
    status: orderData.status || 'pending',
    items: orderData.items, // We will cast this in the insert call below
    user_id: user?.id || null,
  };

  // 2. Insert with explicit 'any' cast to silence strict TypeScript errors
  const { data, error } = await supabase
    .from('orders')
    .insert([dbPayload] as any) // <--- FIX: This removes the red line
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data as unknown as Order;
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

  return data as unknown as Order[];
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order> => {
  const { data, error } = await (supabase as any)
    .from('orders')
    .update({
      status: status as string,
      updated_at: new Date().toISOString()
    })
    .eq('id', parseInt(orderId))
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error(error.message);
  }

  return data as Order;
};