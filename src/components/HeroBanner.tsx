import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-4 lg:mx-0 mt-4 lg:mt-0 rounded-2xl lg:rounded-3xl bg-primary-gradient p-5 lg:p-8 text-primary-foreground overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-8 -top-8 w-32 h-32 lg:w-48 lg:h-48 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 lg:w-36 lg:h-36 bg-white/20 rounded-full blur-xl" />
      </div>

      {/* --- HUMAN MODEL IMAGE ADDED HERE --- */}
      {/* Positioned bottom-right, scaled to look like they are standing inside the banner */}
      <div className="absolute bottom-0 right-0 h-[110%] w-1/2 lg:w-5/12 z-0 pointer-events-none flex items-end justify-end">
        <img 
          src="/model.png" /* Replace 'human-model.png' with your actual filename */
          alt="Delivery partner"
          className="h-full w-auto object-contain object-bottom drop-shadow-2xl"
        />
      </div>

      {/* Content Container (z-10 ensures text stays above the image if they overlap) */}
      <div className="relative z-10 lg:w-2/3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="text-xs lg:text-sm font-medium uppercase tracking-wider opacity-90">
            Fresh Not Frozen
          </span>
        </div>
        
        <h2 className="text-xl lg:text-3xl font-bold mb-1">
          Today's Fresh Catch
        </h2>
        
        <p className="text-sm lg:text-base opacity-90 mb-4 lg:mb-6 max-w-xs lg:max-w-sm">
          Fresh fish at your doorstep
        </p>

        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-semibold shadow-lg">
          🐟 Free delivery above ₹500
        </div>
      </div>
    </motion.div>
  );
}