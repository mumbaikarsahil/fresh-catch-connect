import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { products } from '@/data/products';

const Index = () => {
  return (
    <ResponsiveLayout>
      {/* Mobile Header - hidden on desktop */}
      <div className="lg:hidden">
        <Header />
      </div>
      
      <HeroBanner />

      {/* Category Title */}
      <div className="px-4 lg:px-0 mt-6 mb-3">
        <h2 className="text-lg lg:text-2xl font-bold text-foreground">Today's Menu</h2>
        <p className="text-sm text-muted-foreground">Fresh catches available now</p>
      </div>

      {/* Product Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="px-4 lg:px-0 pb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </ResponsiveLayout>
  );
};

export default Index;
