import React from 'react';
import { MapPin } from 'lucide-react';
import logo from '@/assets/logo.jpg';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sheet border-b border-border">
      <div className="flex items-center justify-between px-4 h-[var(--header-height)]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img 
            src={logo} 
            alt="The Fishy Mart" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-secondary leading-tight">The Fishy Mart</span>
            <span className="text-[10px] text-primary font-medium">#FishKhaoOnlyFresh</span>
          </div>
        </div>

        {/* Location */}
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3 text-primary" />
          <span>Mumbai</span>
        </button>
      </div>
    </header>
  );
}
