import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null); // 1. Create a Ref
  
  const quantity = getItemQuantity(product.id);
  const isSoldOut = !product.in_stock;

  // Reset state when product changes
  useEffect(() => {
    setImageError(false);
    setIsImageLoading(true);
  }, [product.imageName]);

  // 2. The Fix: Check if image is already loaded from cache
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoading(false);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, type: 'spring', stiffness: 100 }}
      className={cn("relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200", 
        isSoldOut && "opacity-70"
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        
        {/* Loading Skeleton */}
        {isImageLoading && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse z-10"></div>
        )}
        
        {/* Main Image */}
        <AnimatePresence mode="wait">
          {!imageError ? (
            <motion.img
              ref={imgRef} // 3. Attach the Ref here
              key="product-image"
              // TIP: Moving images to the 'public' folder is better than linking to /src
              src={`/src/assets/${product.imageName}`} 
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: isImageLoading ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setImageError(true);
                setIsImageLoading(false);
              }}
            />
          ) : (
            <motion.div 
              key="placeholder"
              className="w-full h-full flex items-center justify-center bg-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-gray-400 text-sm text-center p-4">
                <div className="text-lg mb-1">🍣</div>
                <div>Image not available</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20"> {/* Added z-20 so it sits above skeleton */}
          <AnimatePresence>
            {isSoldOut && (
              <motion.span 
                className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                Sold Out
              </motion.span>
            )}
            {product.low_stock && !isSoldOut && (
              <motion.span 
                className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                Low Stock
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* ... (Rest of your component remains the same) ... */}
        <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-0.5">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-2 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-secondary">₹{product.price}</span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>

          <div className="flex-shrink-0">
            {quantity === 0 ? (
              <button
                onClick={() => addToCart(product)}
                disabled={isSoldOut}
                className={cn(
                  "flex items-center justify-center bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-full transition-colors",
                  isSoldOut 
                    ? "bg-gray-300 cursor-not-allowed" 
                    : "hover:bg-primary/90 active:scale-95"
                )}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center bg-gray-100 rounded-md h-8"
              >
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-gray-200 rounded-l-md transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-semibold text-sm tabular-nums text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="w-8 h-full flex items-center justify-center text-gray-600 hover:text-green-500 hover:bg-gray-200 rounded-r-md transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}