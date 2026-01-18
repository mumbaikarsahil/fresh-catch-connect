import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { DesktopSidebar } from './DesktopSidebar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
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
        "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors relative",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-2 bg-accent text-accent-foreground text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary"
        />
      )}
    </button>
  );
}

export function ResponsiveLayout({ children, showBottomNav = true }: ResponsiveLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', path: '/search' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Cart', path: '/cart' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/cart') {
      setIsCartOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-ocean-gradient flex">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main
          className={cn(
            "flex-1 w-full mx-auto bg-background/50 backdrop-blur-sm",
            "lg:bg-transparent lg:backdrop-blur-none lg:max-w-none",
            showBottomNav && "pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] lg:pb-0"
          )}
          style={{ paddingTop: 'var(--safe-area-top)' }}
        >
          <div className="lg:max-w-6xl lg:mx-auto lg:p-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {showBottomNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sheet border-t border-border z-50 lg:hidden"
            style={{ paddingBottom: 'var(--safe-area-bottom)' }}
          >
            <div className="max-w-[430px] mx-auto flex items-center h-[var(--bottom-nav-height)]">
              {navItems.map((item) => (
                <MobileNavItem
                  key={item.path}
                  {...item}
                  isActive={location.pathname === item.path}
                  onClick={() => handleNavClick(item.path)}
                  badge={item.path === '/cart' ? totalItems : undefined}
                />
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
