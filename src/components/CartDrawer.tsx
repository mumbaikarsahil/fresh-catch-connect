import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { WHATSAPP_NUMBER } from '@/data/products';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    totalAmount,
    clearCart,
  } = useCart();
  const [address, setAddress] = useState('');

  const generateWhatsAppLink = () => {
    const itemsList = items
      .map((item) => `• ${item.product.name} (${item.quantity} ${item.product.unit}) - ₹${item.product.price * item.quantity}`)
      .join('\n');

    const message = encodeURIComponent(
      `Hello! I want to order:\n\n${itemsList}\n\n*Total: ₹${totalAmount}*\n\nDelivery Address: ${address || 'Not provided'}`
    );

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleCheckout = () => {
    window.open(generateWhatsAppLink(), '_blank');
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] lg:max-w-lg mx-auto"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
          >
            <div className="bg-card rounded-t-3xl shadow-sheet max-h-[85vh] flex flex-col">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 rounded-full bg-border" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                <h2 className="text-lg font-bold text-card-foreground">Your Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Add some fresh fish!</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 bg-muted/50 rounded-xl p-3"
                    >
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-card-foreground truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.product.price}/{item.product.unit}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="qty-btn !w-6 !h-6"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-5 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="qty-btn !w-6 !h-6"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-semibold text-sm">
                            ₹{item.product.price * item.quantity}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="self-start p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-border p-4 space-y-3">
                  {/* Address Input */}
                  <Input
                    placeholder="Enter delivery address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl"
                  />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-2xl font-bold text-secondary">₹{totalAmount}</span>
                  </div>

                  {/* WhatsApp Checkout */}
                  <button onClick={handleCheckout} className="btn-whatsapp w-full">
                    <MessageCircle className="w-5 h-5" />
                    Order via WhatsApp
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
