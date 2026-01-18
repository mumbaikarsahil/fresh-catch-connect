import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/HeroBanner';
import { ProductCard } from '@/components/ProductCard';
import { CartDrawer } from '@/components/CartDrawer';
import { products } from '@/data/products';

const Index = () => {
  return (
    <MobileLayout>
      <Header />
      <HeroBanner />

      {/* Category Title */}
      <div className="px-4 mt-6 mb-3">
        <h2 className="text-lg font-bold text-foreground">Today's Menu</h2>
        <p className="text-sm text-muted-foreground">Fresh catches available now</p>
      </div>

      {/* Product Grid */}
      <div className="px-4 pb-6 grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </MobileLayout>
  );
};

export default Index;
