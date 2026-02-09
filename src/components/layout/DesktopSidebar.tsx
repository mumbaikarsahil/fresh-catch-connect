import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Fish } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpg';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}

function SidebarNavItem({ icon, label, isActive, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 relative group",
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <span className="font-medium">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeSidebarNav"
          className="absolute left-0 w-1 h-8 rounded-r-full bg-accent"
        />
      )}
    </button>
  );
}

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', path: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', path: '/search' },
    { icon: <ShoppingCart className="w-5 h-5" />, label: 'Cart', path: '/cart' },
    { icon: <User className="w-5 h-5" />, label: 'more', path: '/profile' },
  ];

  const handleNavClick = (path: string) => {
    if (path === '/cart') {
      setIsCartOpen(true);
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="The Fishy Mart"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
          />
          <div>
            <h1 className="font-bold text-lg text-card-foreground">The Fishy Mart</h1>
            <p className="text-xs text-primary">#FishKhaoOnlyFresh</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.path}
            {...item}
            isActive={location.pathname === item.path}
            onClick={() => handleNavClick(item.path)}
            badge={item.path === '/cart' ? totalItems : undefined}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Fish className="w-4 h-4" />
          <span>Fresh fish, always</span>
        </div>
      </div>
    </aside>
  );
}
