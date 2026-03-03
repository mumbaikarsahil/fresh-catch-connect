import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { DesktopSidebar } from './DesktopSidebar';
import { FloatingCartBar } from '../FloatingCartBar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  hideFloatingCart?: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

function MobileNavItem({ icon, label, isActive, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all relative group",
        isActive ? "text-primary" : "text-muted-foreground hover:text-gray-600"
      )}
    >
      <div className="relative">
        <div className={cn("transition-transform duration-200", isActive && "-translate-y-0.5")}>
          {icon}
        </div>
        
        {/* Badge Notification */}
        {badge && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center border-2 border-white"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </div>
      
      <span className={cn(
        "text-[10px] font-medium transition-opacity",
        isActive ? "opacity-100 font-semibold" : "opacity-80"
      )}>
        {label}
      </span>
      
      {/* Active Indicator Dot */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute top-0 w-8 h-1 rounded-b-lg bg-primary/80"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}

export function ResponsiveLayout({ 
  children, 
  showBottomNav = true,
  hideFloatingCart = false 
}: ResponsiveLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsCartOpen } = useCart();

  // ✅ ADDED: Check if we are currently on the profile page
  const isProfilePage = location.pathname === '/profile';
  
  // ✅ ADDED: Combine the manual prop with the automatic route check
  const shouldHideCart = hideFloatingCart || isProfilePage;

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', path: '/search' },
    { icon: <User className="w-5 h-5" />, label: 'More', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/cart') {
      setIsCartOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex text-gray-900 font-sans">
      {/* Desktop Sidebar (Left) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main
          className={cn(
            "flex-1 w-full mx-auto",
            // Mobile adjustments
            showBottomNav && "pb-[calc(var(--bottom-nav-height)+2rem)] lg:pb-0", 
            // Desktop constraints
            "lg:max-w-none"
          )}
          style={{ 
            paddingTop: 'var(--safe-area-top)', 
            '--bottom-nav-height': '60px',
            '--safe-area-bottom': 'env(safe-area-inset-bottom)'
          } as React.CSSProperties}
        >
          {children}
        </main>

        {/* --- Mobile Bottom Navigation Elements --- */}
        {showBottomNav && (
          <>
            {/* 1. Floating Cart Bar (Now properly hides on Profile) */}
            {!shouldHideCart && <FloatingCartBar />}

            {/* 2. Bottom Tab Bar */}
            <nav
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.03)]"
              style={{ paddingBottom: 'var(--safe-area-bottom)' }}
            >
              <div className="flex items-center h-[60px] max-w-md mx-auto px-2">
                {navItems.map((item) => (
                  <MobileNavItem
                    key={item.path}
                    {...item}
                    isActive={location.pathname === item.path}
                    onClick={() => handleNavClick(item.path)}
                  />
                ))}
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}