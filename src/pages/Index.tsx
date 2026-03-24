import React, { useEffect, useState } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/data/products';
import { ProductUI } from '@/types/product'; 
import { useCart } from '@/context/CartContext'; 
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Fish, MapPin, Phone, Mail } from 'lucide-react';

const Index = () => {
  const [products, setProducts] = useState<ProductUI[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { items } = useCart(); 
  const hasItemsInCart = items && items.length > 0;

  // WhatsApp Configuration
  const WHATSAPP_NUMBER = "919082165743"; 
  const WHATSAPP_MESSAGE = "Hi! I'm interested in today's fresh catches.";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        
        // ✅ NEW: Strictly filter out any products that have been soft-deleted
        const activeProducts = data.filter((product: any) => product.is_deleted !== true);
        
        setProducts(activeProducts);
      } catch (err) {
        
        setError('Unable to load the menu.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const WhatsAppFloatingButton = () => {
    const { items } = useCart(); 
    const hasItemsInCart = items && items.length > 0;

    return (
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed z-[60] right-4 md:right-8 group transition-all duration-300",
          hasItemsInCart 
            ? "bottom-[160px] md:bottom-8" 
            : "bottom-[80px] md:bottom-8"  
        )}
        aria-label="Contact us on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20 duration-1000"></span>
        <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full shadow-lg shadow-green-500/30 transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95">
          <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-9 md:h-9 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.374-5.03c0-5.445 4.431-9.87 9.873-9.87 2.636 0 5.115 1.026 6.98 2.888a9.82 9.82 0 012.89 6.981c.002 5.445-4.428 9.87-9.87 9.87" />
          </svg>
        </div>
      </a>
    );
  };
  
  if (loading) {
    return (
      <ResponsiveLayout>
        <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/50">
          <Header />
        </div>

        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none overflow-hidden bg-white/40 backdrop-blur-[3px]">
          <motion.div
            animate={{ 
              x: ['-100vw', '100vw'], 
              y: [0, -25, 0, 25, 0] 
            }}
            transition={{ 
              x: { duration: 2.5, repeat: Infinity, ease: "linear" },
              y: { duration: 1.25, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute text-primary drop-shadow-[0_10px_20px_rgba(5,131,242,0.4)]"
          >
            <Fish className="w-24 h-24 md:w-32 md:h-32" fill="currentColor" strokeWidth={1} />
          </motion.div>

          <motion.div 
            animate={{ opacity: [0.6, 1, 0.6], y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="mt-32 bg-white/90 backdrop-blur-md shadow-xl border border-gray-100 px-6 py-3 rounded-full z-10"
          >
            <p className="font-extrabold text-primary text-sm md:text-base tracking-wide">
              Reeling in fresh catches...
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 w-full pt-4 md:pt-6 lg:pt-8 px-4 lg:px-8">
          <div className="w-full h-48 md:h-[280px] lg:h-[350px] bg-gray-200/60 animate-pulse rounded-2xl md:rounded-[2rem]" />
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16 pb-32 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4">
            <div className="space-y-4">
              <div className="h-8 md:h-10 w-48 md:w-64 bg-gray-200/80 animate-pulse rounded-xl" />
              <div className="h-4 md:h-5 w-72 md:w-96 bg-gray-100 animate-pulse rounded-lg" />
            </div>
            <div className="h-8 w-32 bg-gray-100 animate-pulse rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-x-8 md:gap-y-10 lg:gap-x-10 lg:gap-y-12">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex flex-col gap-3 h-full">
                <div className="aspect-[4/3] md:aspect-square w-full bg-gray-100 animate-pulse rounded-xl" />
                <div className="space-y-2 mt-2">
                  <div className="h-4 w-3/4 bg-gray-200/80 animate-pulse rounded flex-shrink-0" />
                  <div className="h-3 w-1/2 bg-gray-100 animate-pulse rounded flex-shrink-0" />
                </div>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                  <div className="h-5 w-16 bg-gray-200/80 animate-pulse rounded" />
                  <div className="h-8 w-8 md:w-20 bg-gray-100 animate-pulse rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </ResponsiveLayout>
    );
  }

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

  if (products.length === 0) {
    return (
      <ResponsiveLayout>
        <div className="pt-4 md:pt-6 lg:pt-8 px-4 lg:px-8">
          <HeroBanner />
        </div>
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
      
      <div className="pt-4 md:pt-6 lg:pt-8 px-0 md:px-4 lg:px-8">
        <HeroBanner />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16 pb-24 md:pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-2">
          <div>
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

      {/* --- UPGRADED FOOTER SECTION --- */}
      
      {/* 1. Desktop Footer */}
      <footer className="w-full bg-[#f8f9fa] border-t border-gray-200 mt-auto hidden md:block pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Fish className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">The Fishy Mart</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Premium quality, sustainably sourced seafood delivered fresh from the docks directly to your kitchen. Cleaned, cut, and ready to cook.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Customer Service</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="/contact" className="hover:text-blue-600 transition-colors">Contact us</a></li>
                <li><a href="/about" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="https://wa.me/919082165743?text=Hello!%20I%20have%20a%20query%20for%20you." className="hover:text-blue-600 transition-colors">Contact via WhatsApp</a></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Get in Touch</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>Shop no 25, Prakash Thorat Marg, nr. Railway station, Sahadeep Colony, 9<br/>Chembur West, Ramabai Colony, Chembur, Mumbai, Maharashtra 40008</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:+${WHATSAPP_NUMBER}`} className="hover:text-blue-600 transition-colors">+91 90821 65743</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href="https://wa.me/919082165743?text=Hi%20Support" className="hover:text-blue-600 transition-colors">Help via WhatsApp</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Biillo Badge */}
          <div className="border-t border-gray-200 pt-6 flex flex-col items-center justify-center gap-2">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} The Fishy Mart. All rights reserved.
            </p>
            
            {/* VERY SMALL Powered By Badge */}
            <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
              <a href="https://www.biillo.com" className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Powered by</span>
                <span className="text-xs font-bold text-gray-800 tracking-wide">BIILLO</span>
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* 2. Mobile Footer */}
      <footer className="w-full bg-[#f8f9fa] border-t border-gray-200 mt-12 md:hidden pt-8 pb-32">
        <div className="px-6 flex flex-col items-center text-center space-y-6">
          
          <div className="flex flex-col items-center gap-2">
            <Fish className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">The Fishy Mart</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[250px]">
              Premium quality, sustainably sourced seafood delivered fresh to your kitchen.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm text-gray-600">
            <a href={`tel:+${WHATSAPP_NUMBER}`} className="flex items-center gap-2 font-medium">
              <Phone className="w-4 h-4" /> +91 90821 65743
            </a>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Returns</a>
            </div>
          </div>

          <div className="w-16 h-[1px] bg-gray-200"></div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] text-gray-400">
              &copy; {new Date().getFullYear()} The Fishy Mart.
            </p>
            {/* VERY SMALL Powered By Badge for Mobile */}
            <div className="flex items-center justify-center gap-1 opacity-50 mt-1">
              <a href="https://www.biillo.com" className="flex items-center gap-1">
                <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">Powered by</span>
                <span className="text-[10px] font-bold text-gray-800 tracking-wide">BIILLO</span>
              </a>
            </div>
          </div>

        </div>
      </footer>
      {/* --------------------------- */}

      <WhatsAppFloatingButton />
    </ResponsiveLayout>
  );
};

export default Index;