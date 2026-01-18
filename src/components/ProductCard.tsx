import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const isSoldOut = !product.inStock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn("product-card", isSoldOut && "card-sold-out")}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isSoldOut && (
            <span className="badge-sold-out">Sold Out</span>
          )}
          {product.lowStock && !isSoldOut && (
            <span className="badge-low-stock">Low Stock</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-card-foreground text-sm leading-tight mb-0.5">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs mb-2 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          {/* Price */}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-secondary">₹{product.price}</span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>

          {/* Add/Quantity Controls */}
          {quantity === 0 ? (
            <button
              onClick={() => addToCart(product)}
              disabled={isSoldOut}
              className="btn-add-cart text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </button>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="qty-btn"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="qty-btn"
              >
                <Plus className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
