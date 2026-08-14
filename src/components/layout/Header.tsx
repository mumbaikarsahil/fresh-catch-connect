import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';

export function Header() {
  // State to hold the location name and loading status
  const [locationName, setLocationName] = useState<string>('Mumbai'); // Fallback city
  const [isLocating, setIsLocating] = useState<boolean>(true);

  useEffect(() => {
    const fetchLocation = async () => {
      // Check if the browser supports geolocation
      if (!navigator.geolocation) {
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Using a free reverse geocoding API to get the city name from coordinates
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            // Grab the most specific location data available (locality, city, or state)
            const city = data.locality || data.city || data.principalSubdivision || 'Mumbai';
            setLocationName(city);
          } catch (error) {
            console.error("Error fetching location name:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          // If the user denies permission or there's an error, it defaults to Mumbai
          console.warn("Geolocation error:", error.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    };

    fetchLocation();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm overflow-hidden">
      
      {/* Crisp, Premium Tricolor Strip at the Absolute Top Edge */}
      <div className="absolute top-0 left-0 right-0 h-1 flex">
        <div className="h-full flex-1 bg-[#FF671F]"></div>
        <div className="h-full flex-1 bg-white relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#06038D]"></div>
        </div>
        <div className="h-full flex-1 bg-[#046A38]"></div>
      </div>

      {/* Extremely Soft, Elegant Background Wash */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-green-600/5 z-0 pointer-events-none"></div>

      <div className="relative z-10 flex items-center justify-between px-4 h-[var(--header-height)]">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="shrink-0 relative">
            <img 
              src={logo} 
              alt="The Fishy Mart" 
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {/* Subtle Ashoka Chakra accent badge on the logo */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full border border-[#06038D] bg-white flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#06038D]"></div>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <span className="text-sm font-black text-slate-800 leading-tight">
              The Fishy Mart
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <span className="text-[#FF671F]">Happy</span>
              <span className="text-[#06038D]">Independence</span>
              <span className="text-[#046A38]">Day 🇮🇳</span>
            </span>
          </div>
        </div>

        {/* Soft Glassmorphism Location Pill */}
        <button className="flex items-center gap-1.5 text-xs text-slate-700 bg-white/80 backdrop-blur-sm border border-slate-200/60 px-3 py-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-slate-50 hover:border-slate-300 transition-all max-w-[120px]">
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 text-[#FF671F] animate-spin shrink-0" />
          ) : (
            <MapPin className="w-3.5 h-3.5 text-[#FF671F] shrink-0" />
          )}
          <span className="truncate font-bold">
            {isLocating ? 'Locating...' : locationName}
          </span>
        </button>
      </div>
    </header> 
  );
}