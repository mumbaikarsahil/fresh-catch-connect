import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const FloatingCartButton = () => {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-6 z-50"
      onClick={() => navigate('/cart')}
    >
      <div className="bg-primary text-primary-foreground rounded-full p-4 shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <div className="font-medium">
            ₹{totalAmount.toFixed(2)}
          </div>
          <div className="ml-2 font-semibold">
            View Cart
          </div>
        </div>
      </div>
    </motion.div>
  );
};
