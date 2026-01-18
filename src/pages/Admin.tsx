import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Fish, 
  Package, 
  TrendingUp, 
  ArrowLeft,
  Save,
  ToggleLeft,
  ToggleRight,
  IndianRupee,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { products as initialProducts } from '@/data/products';
import { Product } from '@/types/product';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Mock analytics data
const mockAnalytics = {
  weeklyRevenue: 24500,
  totalOrders: 47,
  topProducts: [
    { name: 'Surmai', orders: 18 },
    { name: 'Prawns', orders: 14 },
    { name: 'Pomfret', orders: 9 },
  ],
  revenueByDay: [
    { day: 'Mon', amount: 3200 },
    { day: 'Tue', amount: 4100 },
    { day: 'Wed', amount: 2800 },
    { day: 'Thu', amount: 5200 },
    { day: 'Fri', amount: 4500 },
    { day: 'Sat', amount: 3100 },
    { day: 'Sun', amount: 1600 },
  ],
};

function AdminProductRow({ 
  product, 
  onToggleStock, 
  onPriceChange 
}: { 
  product: Product; 
  onToggleStock: () => void;
  onPriceChange: (price: number) => void;
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [tempPrice, setTempPrice] = useState(product.price.toString());

  const handlePriceSave = () => {
    const newPrice = parseInt(tempPrice, 10);
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceChange(newPrice);
    }
    setEditingPrice(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card rounded-xl p-4 shadow-card border border-border",
        !product.inStock && "opacity-60"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Product Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-16 h-16 rounded-lg object-cover"
        />

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          {product.lowStock && product.inStock && (
            <div className="flex items-center gap-1 text-amber-500 text-xs mt-1">
              <AlertTriangle className="w-3 h-3" />
              Low Stock
            </div>
          )}
        </div>

        {/* Price Edit */}
        <div className="flex items-center gap-2">
          {editingPrice ? (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">₹</span>
              <Input
                type="number"
                value={tempPrice}
                onChange={(e) => setTempPrice(e.target.value)}
                className="w-20 h-8 text-sm"
                autoFocus
                onBlur={handlePriceSave}
                onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
              />
              <button
                onClick={handlePriceSave}
                className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingPrice(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <IndianRupee className="w-4 h-4" />
              <span className="font-semibold">{product.price}</span>
              <span className="text-xs text-muted-foreground">/{product.unit}</span>
            </button>
          )}
        </div>

        {/* Stock Toggle */}
        <button
          onClick={onToggleStock}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            product.inStock 
              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" 
              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          )}
        >
          {product.inStock ? (
            <>
              <ToggleRight className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">In Stock</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Out</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string; 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-5 shadow-card border border-border"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function SimpleBarChart({ data }: { data: { day: string; amount: number }[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="flex items-end justify-between gap-2 h-32">
      {data.map((item, index) => (
        <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.amount / maxAmount) * 100}%` }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="w-full bg-primary-gradient rounded-t-md min-h-[4px]"
          />
          <span className="text-xs text-muted-foreground">{item.day}</span>
        </div>
      ))}
    </div>
  );
}

const Admin = () => {
  const [productList, setProductList] = useState<Product[]>(initialProducts);

  const handleToggleStock = (productId: string) => {
    setProductList((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inStock: !p.inStock } : p
      )
    );
  };

  const handlePriceChange = (productId: string, newPrice: number) => {
    setProductList((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: newPrice } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-ocean-gradient">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sheet border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-card-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your inventory</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">This Week's Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={IndianRupee}
              label="Revenue"
              value={`₹${mockAnalytics.weeklyRevenue.toLocaleString()}`}
              color="bg-primary/10 text-primary"
            />
            <StatCard
              icon={ShoppingBag}
              label="Orders"
              value={mockAnalytics.totalOrders.toString()}
              color="bg-green-500/10 text-green-600"
            />
            <StatCard
              icon={Fish}
              label="Products"
              value={productList.length.toString()}
              color="bg-secondary/10 text-secondary"
            />
            <StatCard
              icon={Package}
              label="In Stock"
              value={productList.filter(p => p.inStock).length.toString()}
              color="bg-amber-500/10 text-amber-600"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">Daily Revenue</h3>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <SimpleBarChart data={mockAnalytics.revenueByDay} />
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-5 shadow-card border border-border"
          >
            <h3 className="font-semibold text-card-foreground mb-4">Top Selling</h3>
            <div className="space-y-3">
              {mockAnalytics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-3">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 && "bg-yellow-500/20 text-yellow-600",
                    index === 1 && "bg-gray-400/20 text-gray-600",
                    index === 2 && "bg-amber-600/20 text-amber-700"
                  )}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-card-foreground">{product.name}</span>
                  <span className="text-muted-foreground text-sm">{product.orders} orders</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Inventory Management */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Inventory Management</h2>
          <div className="space-y-3">
            {productList.map((product) => (
              <AdminProductRow
                key={product.id}
                product={product}
                onToggleStock={() => handleToggleStock(product.id)}
                onPriceChange={(price) => handlePriceChange(product.id, price)}
              />
            ))}
          </div>
        </section>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground pb-6">
          Note: Changes are saved locally. Enable backend for persistent storage.
        </p>
      </main>
    </div>
  );
};

export default Admin;
