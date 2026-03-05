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
        <button className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full hover:bg-muted/80 transition-colors max-w-[120px]">
          {isLocating ? (
            <Loader2 className="w-3 h-3 text-primary animate-spin shrink-0" />
          ) : (
            <MapPin className="w-3 h-3 text-primary shrink-0" />
          )}
          <span className="truncate font-medium">
            {isLocating ? 'Locating...' : locationName}
          </span>
        </button>
      </div>
    </header>
  );
}