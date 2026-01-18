import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function HeroBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-4 mt-4 rounded-2xl bg-primary-gradient p-5 text-primary-foreground overflow-hidden relative"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider opacity-90">
            Fresh Not Frozen
          </span>
        </div>
        <h2 className="text-xl font-bold mb-1">Today's Fresh Catch</h2>
        <p className="text-sm opacity-90 mb-3">
          Farm fresh fish delivered to your doorstep across Mumbai
        </p>
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold">
          🐟 Free delivery above ₹500
        </div>
      </div>
    </motion.div>
  );
}
