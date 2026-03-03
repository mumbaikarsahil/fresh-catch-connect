import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductUI } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

// IMPORTANT: Replace [YOUR_PROJECT_ID] with your actual Supabase project ID!
// In ProductCard.tsx, change the BUCKET_URL to this:
const BUCKET_URL = "/supabase-proxy/storage/v1/object/public/products/";
interface ProductCardProps {
  product: ProductUI;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  // Modal & Slider State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const quantity = getItemQuantity(product.id);
  const isSoldOut = !product.inStock; 

  // Helper function to convert filenames to full URLs
  const getFullUrl = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BUCKET_URL}${path}`;
  };

  const rawBaseImage = product.images?.length > 0 ? product.images[0] : product.imageUrl;
  const imagePath = getFullUrl(rawBaseImage);
  
  const galleryImages = product.images?.length > 0 
    ? product.images.map(img => getFullUrl(img)) 
    : [imagePath];

  useEffect(() => {
    setImageError(false);
    setIsImageLoading(true);
  }, [imagePath]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setIsImageLoading(false);
    }
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // ✅ Opens the modal WITHOUT adding (for clicking the product image)
  const handleCardClick = () => {
    setCurrentImageIndex(0);
    setIsModalOpen(true);
  };

  // ✅ Opens the modal AND adds 1 unit to cart immediately
  const handleAddAndOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(0);
    if (quantity === 0 && !isSoldOut) {
      addToCart(product);
    }
    setIsModalOpen(true);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  // ✅ Reusable Quantity Component (Just the +/- buttons)
  const QuantityControl = () => (
    <div className="w-full h-full bg-white text-green-700 rounded-lg border border-green-600 flex items-center justify-between overflow-hidden shadow-sm">
      <button
        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, quantity - 1); }}
        className="w-9 h-full flex items-center justify-center hover:bg-green-50 active:bg-green-100 transition-colors"
      >
        <Minus className="w-4 h-4 font-bold" strokeWidth={3} />
      </button>
      <span className="flex-1 text-center font-bold text-sm bg-white">
        {quantity}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, quantity + 1); }}
        className="w-9 h-full flex items-center justify-center hover:bg-green-50 active:bg-green-100 transition-colors"
      >
        <Plus className="w-4 h-4 font-bold" strokeWidth={3} />
      </button>
    </div>
  );

  return (
    <>
      {/* --- ORIGINAL PRODUCT CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={handleCardClick}
        className={cn(
          "group relative bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full cursor-pointer",
          "hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300", 
          isSoldOut && "opacity-75 grayscale cursor-not-allowed"
        )}
      >
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 rounded-t-xl">
            {isImageLoading && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
            )}

            <AnimatePresence mode="wait">
              {!imageError ? (
                <motion.img
                  ref={imgRef}
                  key={product.id}
                  src={imagePath}
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
              ) : product.lowStock ? (
                  <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-md shadow-sm">
                   FEW LEFT
                </span>
              ) : null}
            </div>
          </div>

          {/* MAIN CARD ADD BUTTON */}
          <div onClick={(e) => e.stopPropagation()} className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30 w-28 h-10 drop-shadow-md">
            {quantity === 0 ? (
              <button
                onClick={handleAddAndOpenModal}
                disabled={isSoldOut}
                className={cn(
                  "w-full h-full bg-white text-green-600 font-extrabold text-sm uppercase rounded-lg border border-gray-200 flex items-center justify-center transition-transform active:scale-95 hover:bg-gray-50",
                  isSoldOut && "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                )}
              >
                ADD
              </button>
            ) : (
              <QuantityControl />
            )}
          </div>
        </div>

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

      {/* --- QUICK VIEW MODAL (Swiggy/Zomato Style) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            {/* Dark Overlay Background */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-white sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto z-10 flex flex-col shadow-2xl"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-800 hover:bg-gray-100 shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Carousel Area */}
              <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-50">
                <img 
                  src={galleryImages[currentImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Carousel Controls */}
                {galleryImages.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow hover:bg-white">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full shadow hover:bg-white">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {galleryImages.map((_, i) => (
                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === currentImageIndex ? "bg-white w-3" : "bg-white/50")} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Details Section */}
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h2>
                    <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                    <span className="ml-2 inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                      Per {product.unit}
                    </span>
                  </div>
                  
                  {/* Show Quantity Controls at the top of the modal if item is added */}
                  {quantity > 0 && (
                    <div className="w-24 h-9">
                      <QuantityControl />
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-gray-100" />

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Details</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* ✅ Sticky Add/Done Footer inside Modal */}
                <div className="mt-4 pt-4 pb-2 sticky bottom-0 bg-white border-t border-gray-50">
                   <button
                     onClick={() => {
                       // If they somehow got here without adding, add it now.
                       if (quantity === 0 && !isSoldOut) addToCart(product);
                       // Then collapse the modal.
                       setIsModalOpen(false);
                     }}
                     className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-[15px] flex items-center justify-center hover:bg-green-700 active:scale-95 transition-transform shadow-md"
                   >
                     {quantity === 0 ? "Add Item to Cart" : `Done • ${quantity} Added`}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}