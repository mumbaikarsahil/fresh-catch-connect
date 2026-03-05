import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CartItem } from '@/types/product';
import { CreateOrderData, Order } from '@/types/order';
import { createOrder } from '@/services/orderService';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  submitOrder: (orderData: Omit<CreateOrderData, 'items' | 'total_amount'>) => Promise<Order>;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  isSubmitting: boolean;
  setIsCartOpen: (open: boolean) => void;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const newItems = existing
        ? prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prev, { product, quantity: 1 }];
      
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  // Calculate derived values first
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const submitOrder = useCallback(
    async (orderData: Omit<CreateOrderData, 'items' | 'total_amount'>) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setError(null);

      try {
        const orderItems = items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit,
          imageName: `/assets/${item.product.imageName}`
        }));

        const order: CreateOrderData = {
          ...orderData,
          items: orderItems,
          total_amount: totalAmount
        };

        const createdOrder = await createOrder(order);
        clearCart();
        return createdOrder;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit order';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [items, totalAmount, clearCart, isSubmitting]
  );

  const getItemQuantity = useCallback(
    (productId: string) => {
      const item = items.find((item) => item.product.id === productId);
      return item?.quantity || 0;
    },
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        submitOrder,
        getItemQuantity,
        totalItems,
        totalAmount,
        isCartOpen,
        isSubmitting,
        error,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
