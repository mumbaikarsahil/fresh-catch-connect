import React, { useState, useMemo, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { getProducts } from '@/data/products';

// 1. ✅ FIX: Import ProductUI instead of Product
import { ProductUI } from '@/types/product'; 
import { Input } from '@/components/ui/input';

const Search = () => {
  const [query, setQuery] = useState('');
  
  // 2. ✅ FIX: Change the state type to ProductUI
  const [products, setProducts] = useState<ProductUI[]>([]); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data); // Line 21 is now happy!
      } catch (err) {
    
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    if (loading || error) return [];
    if (!query.trim()) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
        (p.category && p.category.toLowerCase().includes(lowerQuery))
    );
  }, [query, products, loading, error]);

  return (
    <ResponsiveLayout>
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sheet border-b border-border p-4 lg:relative lg:bg-transparent lg:border-none lg:p-0 lg:mb-6">
        <div className="relative lg:max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for fish, prawns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 rounded-xl h-11 lg:h-12 lg:text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="p-4 lg:p-0">
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching for "prawns" or "surmai"
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4"
            >
              {filteredProducts.map((product, index) => (
                // Line 94 is now happy!
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CartDrawer />
    </ResponsiveLayout>
  );
};

export default Search;