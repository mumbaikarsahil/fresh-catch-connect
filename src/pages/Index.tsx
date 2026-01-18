import React, { useEffect, useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/data/products';
import { Product } from '@/types/product';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulating a slight delay for smooth transition feel if needed
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Unable to load the menu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // --- 1. Modern Skeleton Loader (Prevents Layout Shift) ---
  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="lg:hidden">
          <Header />
        </div>
        {/* Skeleton Hero */}
        <div className="w-full h-64 md:h-96 bg-gray-100 animate-pulse rounded-none md:rounded-b-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-8 w-48 bg-gray-100 animate-pulse rounded mb-2" />
          <div className="h-4 w-64 bg-gray-50 animate-pulse rounded mb-8" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[4/5] w-full bg-gray-100 animate-pulse rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-1/4 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // --- 2. Polished Error State (Friendly, not alarming) ---
  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">{error}</h3>
          <p className="mt-2 text-gray-500 max-w-sm">
            We encountered a temporary issue loading the fresh catches. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  // --- 3. Clean Empty State ---
  if (products.length === 0) {
    return (
      <ResponsiveLayout>
        <HeroBanner />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Sold Out</h3>
          <p className="mt-2 text-gray-500">We're all out of fresh catches for today. Check back tomorrow!</p>
        </div>
      </ResponsiveLayout>
    );
  }

  // --- 4. Main Layout (The "Big App" Feel) ---
  return (
    <ResponsiveLayout>
      {/* Mobile Header - Conserved Logic */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <Header />
      </div>
      
      <HeroBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Today's Menu
            </h2>
            <p className="mt-2 text-base text-gray-500 font-normal">
              Fresh catches sourced directly from the ocean.
            </p>
          </div>
          
          {/* Subtle item count badge often seen in e-commerce */}
          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            {products.length} items available
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 xl:gap-x-8">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="group animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-backwards"
              style={{ animationDelay: `${index * 50}ms` }} // Staggered entrance animation
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </main>
    </ResponsiveLayout>
  );
};

export default Index;