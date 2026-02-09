import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// 1. Change Import to ProductUI
import { ProductUI } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductUI; // <--- ✅ Fixed Type
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const quantity = getItemQuantity(product.id);
  
  // 2. Update Field Access (camelCase)
  const isSoldOut = !product.inStock; 
  
  // 3. Use the pre-calculated URL (No need to manually add '/')
  const imagePath = product.imageUrl; 

  // Reset loading state when image changes
  useEffect(() => {
    setImageError(false);
    setIsImageLoading(true);
  }, [imagePath]);

  // Vercel/Caching Fix
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoading(false);
    }
  }, []);

  // ✅ NEW: Handle clicking anywhere on the card
  const handleCardClick = () => {
    if (!isSoldOut && quantity === 0) {
      addToCart(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={handleCardClick} // ✅ ADDED: Card click handler
      className={cn(
        "group relative bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300", 
        !isSoldOut && quantity === 0 && "cursor-pointer", // ✅ ADDED: Pointer cursor for clickable state
        isSoldOut && "opacity-75 grayscale cursor-not-allowed"
      )}
    >
      <div className="relative">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 rounded-t-xl">
          
          {/* Skeleton */}
          {isImageLoading && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
          )}

          {/* Image */}
          <AnimatePresence mode="wait">
            {!imageError ? (
              <motion.img
                ref={imgRef}
                key={product.id}
                src={imagePath} // ✅ Uses full URL now
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: isImageLoading ? 0 : 1 }}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsImageLoading(false);
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                <span className="text-2xl mb-1">🥘</span>
                <span className="text-xs">No Image</span>
              </div>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            {isSoldOut ? (
              <span className="bg-gray-900/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm">
                SOLD OUT
              </span>
            ) : product.lowStock ? ( // ✅ camelCase
                <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm">
                 FEW LEFT
              </span>
            ) : null}
          </div>
        </div>

        {/* THE BUTTON */}
        {/* ✅ ADDED: e.stopPropagation() prevents the card click from firing when interacting with the buttons */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 w-28 h-9 filter drop-shadow-md"
        >
           {quantity === 0 ? (
             <button
               onClick={() => addToCart(product)}
               disabled={isSoldOut}
               className={cn(
                 "w-full h-full bg-white text-green-600 font-extrabold text-sm uppercase rounded-lg border border-gray-200 flex items-center justify-center transition-transform active:scale-95 hover:bg-gray-50",
                 isSoldOut && "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
               )}
             >
               ADD
             </button>
           ) : (
             <div className="w-full h-full bg-white text-green-700 rounded-lg border border-green-600 flex items-center justify-between overflow-hidden">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-full flex items-center justify-center hover:bg-green-50 active:bg-green-100 transition-colors"
                >
                  <Minus className="w-4 h-4 font-bold" strokeWidth={3} />
                </button>
                
                <span className="flex-1 text-center font-bold text-sm bg-white">
                  {quantity}
                </span>
                
                <button
                   onClick={() => updateQuantity(product.id, quantity + 1)}
                   className="w-8 h-full flex items-center justify-center hover:bg-green-50 active:bg-green-100 transition-colors"
                >
                   <Plus className="w-4 h-4 font-bold" strokeWidth={3} />
                </button>
             </div>
           )}
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-4 pt-8 flex flex-col flex-grow text-center">
        
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="mt-auto pt-2 border-t border-dashed border-gray-100">
           <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-semibold text-gray-900">₹{product.price}</span>
              <span className="text-xs text-gray-400 font-medium">/ {product.unit}</span>
           </div>
        </div>

      </div>
    </motion.div>
  );
}