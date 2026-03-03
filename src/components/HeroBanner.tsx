import React from 'react';
import { motion } from 'framer-motion';

export function HeroBanner() {
  // 1. Replace these with your actual Supabase public storage URLs
  const bannerVersion = "holi-update";
  const desktopImageUrl = "https://tnwmnsdfdjbeifqssxuu.supabase.co/storage/v1/object/public/banners/hero-desktop.jpg";
  const mobileImageUrl = "https://tnwmnsdfdjbeifqssxuu.supabase.co/storage/v1/object/public/banners/hero-mobile.jpg";

  // 2. Cache Buster
  // Browsers cache images. If you overwrite the image in Supabase, users might still see the old one.
  // Appending today's date forces the browser to fetch the new image once a day, 
  // without wasting your Supabase bandwidth on every single page load.
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-4 lg:mx-0 mt-4 lg:mt-0 rounded-2xl lg:rounded-3xl overflow-hidden relative shadow-lg"
    >
      {/* The <picture> tag is the secret sauce here. 
        It natively handles serving the desktop image to laptops 
        and the mobile image to phones without needing React state.
      */}
      <picture>
        {/* Desktop Image (Shows on screens 1024px and wider) */}
        <source 
          media="(min-width: 1024px)" 
          srcSet={`${desktopImageUrl}?v=${today}`} 
        />
        
        {/* Mobile Image (Default fallback for smaller screens) */}
        <img 
          src={`${mobileImageUrl}?v=${today}`}
          alt="Fresh Catch Special Offer"
          className="w-full h-[250px] lg:h-[400px] object-cover object-center"
        />
      </picture>
    </motion.div>
  );
}