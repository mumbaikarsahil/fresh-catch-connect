import React, { useEffect, useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/data/products';
import { ProductUI } from '@/types/product'; 

const Index = () => {
  const [products, setProducts] = useState<ProductUI[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WhatsApp Configuration
  const WHATSAPP_NUMBER = "919082165743"; 
  const WHATSAPP_MESSAGE = "Hi! I'm interested in today's fresh catches.";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
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

  // --- 1. WhatsApp FAB (Fixed Mobile Overlap & Enhanced Desktop Position) ---
  const WhatsAppFloatingButton = () => (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noopener noreferrer"
      // ✅ CHANGED: bottom-32 for mobile (above cart), md:bottom-8 for desktop corner
      className="fixed z-[60] bottom-32 right-4 md:bottom-8 md:right-8 group"
      aria-label="Contact us on WhatsApp"
    >
      <span className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20 duration-1000"></span>
      <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full shadow-lg shadow-green-500/30 transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95">
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 md:w-9 md:h-9 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.374-5.03c0-5.445 4.431-9.87 9.873-9.87 2.636 0 5.115 1.026 6.98 2.888a9.82 9.82 0 012.89 6.981c.002 5.445-4.428 9.87-9.87 9.87" />
        </svg>
      </div>
    </a>
  );

  // --- 2. Loader ---
  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="lg:hidden">
          <Header />
        </div>
        <div className="w-full h-64 md:h-96 bg-gray-100 animate-pulse rounded-none md:rounded-b-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="h-8 w-48 bg-gray-100 animate-pulse rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] w-full bg-gray-100 animate-pulse rounded-2xl" />
                <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // --- 3. Error State ---
  if (error) {
    return (
      <ResponsiveLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
             <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{error}</h3>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full">
            Retry
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  // --- 4. Empty State ---
  if (products.length === 0) {
    return (
      <ResponsiveLayout>
        <HeroBanner />
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
           <h3 className="text-lg font-medium">Sold Out</h3>
           <p className="text-gray-500">Check back tomorrow!</p>
        </div>
        <WhatsAppFloatingButton />
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300">
        <Header />
      </div>
      
      <HeroBanner />

      {/* ✅ ENHANCED: Added lg:px-12 for better Desktop breathing room */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16 pb-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-2">
          <div>
            {/* ✅ ENHANCED: Increased Desktop Font Size (md:text-4xl) */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Today's Menu
            </h2>
            <p className="mt-2 text-sm md:text-lg text-gray-500 font-normal max-w-2xl">
              Fresh catches sourced directly from the ocean, cleaned and delivered to your kitchen.
            </p>
          </div>
          
          <span className="inline-flex self-start md:self-auto items-center px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold bg-blue-50 text-blue-700 shadow-sm border border-blue-100">
            {products.length} items available
          </span>
        </div>

        {/* ✅ ENHANCED: Increased grid gaps for Desktop (lg:gap-x-10 lg:gap-y-12) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="group animate-in fade-in duration-700 slide-in-from-bottom-4 fill-mode-backwards"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </main>

      <WhatsAppFloatingButton />
    </ResponsiveLayout>
  );
};

export default Index;