import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const FloatingCartBar = () => {
  const { totalItems, totalAmount } = useCart();
  const navigate = useNavigate();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none"
      >
        <div className="bg-card border rounded-lg shadow-lg p-3 pointer-events-auto mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-primary/10 text-primary rounded-full p-2 mr-3">
                <span className="font-bold text-sm">{totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">₹{totalAmount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">added to cart</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/cart')}
              className="gap-2 font-medium"
              size="sm"
            >
              View Cart
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
