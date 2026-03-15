import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { MessageCircle, Wrench, ShoppingBag, PhoneCall, AlertCircle } from 'lucide-react';

const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/`;
const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BUCKET_URL}${path}`;

export default function MaintenancePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Replace with actual 91+Number
  const CLIENT_WHATSAPP_NUMBER = "919082165743"; 

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await (supabase.from('products') as any)
          .select('*')
          .eq('in_stock', true)
          .neq('is_deleted', true)
          .order('name');
          
        if (data) setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleWhatsAppOrder = (productName: string) => {
    const message = encodeURIComponent(`Hi, I would like to order: ${productName}. Is it available today?`);
    window.open(`https://wa.me/${CLIENT_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pb-20">
      {/* 1. Sticky Glass Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-center">
          <h1 className="font-extrabold text-xl text-gray-900 tracking-tight">The Fishy Mart</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* 2. Compact Maintenance Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 relative overflow-hidden shadow-sm flex items-center gap-4">
          {/* Faded Background Icon */}
          <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
            <Wrench className="w-32 h-32" />
          </div>
          
          {/* Warning Icon Box */}
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center rotate-3 shadow-sm border border-amber-200 flex-shrink-0 z-10 hidden sm:flex">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          
          {/* Text Content */}
          <div className="relative z-10 flex-1">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-1 tracking-tight">
              App Upgrades in Progress
            </h2>
            <p className="text-gray-600 text-sm leading-snug">
              Online checkout is temporarily paused. <strong className="text-gray-900">We are still accepting orders via WhatsApp!</strong>
            </p>
          </div>
        </div>

        {/* 3. Menu Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-1">
             <ShoppingBag className="w-5 h-5 text-gray-800" />
             <h3 className="font-bold text-lg text-gray-900">Today's Fresh Menu</h3>
          </div>
          
          {isLoading ? (
            /* Loading Skeletons */
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
                  <div className="flex-1 py-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">Checking today's stock...</p>
            </div>
          ) : (
            /* Product Cards Grid/List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {products.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => handleWhatsAppOrder(p.name)}
                  className="group bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#25D366]/30 transition-all cursor-pointer flex items-center justify-between"
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3">
                    {/* Slightly smaller image to keep the card compact */}
                    <img 
                      src={getFullImageUrl(p.images?.[0] || p.imageName)} 
                      alt={p.name} 
                      className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-100 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col justify-center">
                      <h4 className="font-bold text-gray-900 text-sm md:text-base mb-1 line-clamp-1">{p.name}</h4>
                      <p className="text-xs md:text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-md inline-flex w-fit border border-gray-100">
                        ₹{p.price} <span className="text-gray-400 font-normal ml-1">/ {p.unit}</span>
                      </p>
                    </div>
                  </div>
                  
                  {/* ✅ WhatsApp Action Button with Text */}
                  <div className="bg-[#25D366]/10 text-[#25D366] px-3 md:px-4 py-2 rounded-full group-hover:bg-[#25D366] group-hover:text-white transition-colors ml-2 flex-shrink-0 flex items-center gap-1.5 md:gap-2">
                    <span className="font-bold text-xs md:text-sm">Order</span>
                    <MessageCircle className="w-4 h-4 md:w-4 md:h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 4. Support Footer */}
      <footer className="mt-10 mb-6 text-center px-4">
        <p className="text-sm text-gray-500 mb-2">Need immediate assistance?</p>
        <a 
          href={`tel:+${CLIENT_WHATSAPP_NUMBER}`}
          className="inline-flex items-center gap-2 text-gray-700 font-medium hover:text-black transition-colors"
        >
          <PhoneCall className="w-4 h-4" /> Call us at +{CLIENT_WHATSAPP_NUMBER.slice(0, 2)} {CLIENT_WHATSAPP_NUMBER.slice(2)}
        </a>
      </footer>
    </div>
  );
}