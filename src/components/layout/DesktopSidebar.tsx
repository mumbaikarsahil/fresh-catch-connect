import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Fish, ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
  isCollapsed: boolean;
}

function SidebarNavItem({ icon, label, isActive, onClick, badge, isCollapsed }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center w-full rounded-2xl transition-all duration-300 relative group",
        isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-4",
        isActive 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
      title={isCollapsed ? label : undefined}
    >
      <div className="relative flex-shrink-0">
        <div className={cn("transition-transform duration-200", isActive && !isCollapsed && "scale-110")}>
          {icon}
        </div>
        
        {badge && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-card"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="font-semibold whitespace-nowrap overflow-hidden text-sm"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {isActive && !isCollapsed && (
        <motion.div
          layoutId="activeSidebarNav"
          className="absolute left-0 w-1 h-8 rounded-r-full bg-accent"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);
  const [locationName, setLocationName] = useState<string>('Mumbai'); 
  const [isLocating, setIsLocating] = useState<boolean>(true);

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', path: '/search' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/cart') {
      setIsCartOpen(true);
    } else {
      navigate(path);
    }
  };

  // 1. Simulate initial sidebar skeleton loading to match the main app
  useEffect(() => {
    const timer = setTimeout(() => setIsSidebarLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 2. Auto-fetch Location Logic
  useEffect(() => {
    const fetchLocation = async () => {
      if (!navigator.geolocation) {
        setIsLocating(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            const city = data.locality || data.city || data.principalSubdivision || 'Mumbai';
            setLocationName(city);
          } catch (error) {
            console.error("Error fetching location name:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
      );
    };

    fetchLocation();
  }, []);


  // --- ✅ THE SKELETON RENDER ---
  if (isSidebarLoading) {
    return (
      <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? '90px' : '280px' }}
        className="hidden lg:flex flex-col bg-card/90 backdrop-blur-xl border border-border/50 h-[calc(100vh-2rem)] sticky top-4 left-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] m-4 z-50 flex-shrink-0 p-4"
      >
        <div className="flex items-center gap-4 p-2 mb-6 border-b border-border/50 pb-8">
          <div className="w-12 h-12 rounded-full bg-gray-200/60 animate-pulse flex-shrink-0" />
          {!isCollapsed && (
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200/80 rounded-md w-3/4 animate-pulse" />
              <div className="h-2 bg-gray-100 rounded-md w-1/2 animate-pulse" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-4 px-2 mt-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={cn("flex items-center gap-4", isCollapsed && "justify-center")}>
              <div className="w-8 h-8 rounded-lg bg-gray-200/60 animate-pulse flex-shrink-0" />
              {!isCollapsed && <div className="h-4 bg-gray-100 rounded-md w-24 animate-pulse" />}
            </div>
          ))}
        </div>
      </motion.aside>
    );
  }

  // --- ✅ THE ACTUAL SIDEBAR RENDER ---
  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? '90px' : '280px',
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col bg-card/90 backdrop-blur-xl border border-border/50 h-[calc(100vh-2rem)] sticky top-4 left-4 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] m-4 z-50 flex-shrink-0"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 rounded-full p-1.5 shadow-md z-10 hover:scale-110 transition-all"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Header & Location Area */}
      <div className={cn("p-6 flex flex-col border-b border-border/50 transition-all duration-300", isCollapsed ? "items-center px-4" : "items-start")}>
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-4 w-full">
          <img
            src={logo}
            alt="The Fishy Mart"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 flex-shrink-0 bg-white shadow-sm"
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="font-extrabold text-lg text-card-foreground tracking-tight">The Fishy Mart</h1>
                <p className="text-[10px] font-bold text-primary uppercase tracking-wider">#FishKhaoOnlyFresh</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ NEW: Location Widget */}
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="expanded-location"
              initial={{ opacity: 0, height: 0, marginTop: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginTop: 20 }} 
              exit={{ opacity: 0, height: 0, marginTop: 0 }} 
              className="w-full overflow-hidden"
            >
              {isLocating ? (
                // Location Fetching Skeleton
                <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl animate-pulse border border-gray-100">
                  <div className="w-4 h-4 bg-gray-300/80 rounded-full shrink-0" />
                  <div className="h-3 w-24 bg-gray-300/80 rounded-full" />
                </div>
              ) : (
                // Actual Location Value
                <button className="flex items-center gap-2 px-3 py-2.5 bg-muted/30 hover:bg-muted text-muted-foreground rounded-xl transition-colors w-full border border-gray-100 shadow-sm group">
                  <MapPin className="w-4 h-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold truncate text-gray-700">{locationName}</span>
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="collapsed-location"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="mt-6" 
              title={isLocating ? "Locating..." : locationName}
            >
              {isLocating ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-primary hover:scale-110 transition-transform cursor-pointer" />
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
            badge={item.path === '/cart' ? totalItems : undefined}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Footer Area */}
      <div className={cn("p-4 border-t border-border/50 flex items-center mb-2 transition-all duration-300", isCollapsed ? "justify-center" : "gap-3")}>
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Fish className="w-5 h-5" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-card-foreground">Stay Fresh</p>
              <p className="text-xs text-muted-foreground font-medium">Catch of the day</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}