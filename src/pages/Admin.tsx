import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  ExternalLink,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '@/data/products';
import { Product } from '@/types/product';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { Order, OrderItem } from '@/types/order'; // Ensure you have this type defined

// --- Components ---

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-5 shadow-card border border-border">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

function OrderCard({ order, onConfirm }: { order: Order; onConfirm: (order: Order) => void }) {
  const items = order.items as unknown as OrderItem[]; // Cast JSON to OrderItem[]
  
  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">#{order.id}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
              order.status === 'confirmed' ? "bg-green-100 text-green-700" :
              order.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-600"
            )}>
              {order.status}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 mt-1">{order.customer_name || 'Guest Customer'}</p>
        </div>
        <p className="text-xs text-gray-400">{new Date(order.created_at!).toLocaleDateString()}</p>
      </div>

      {/* Order Items Summary */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-gray-600">
            <span>{item.quantity}x {item.name}</span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="border-t border-dashed border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>₹{order.total_amount}</span>
        </div>
      </div>

      {/* Customer Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span>{order.phone_number}</span>
        </div>
      </div>

      {/* Action Buttons */}
      {order.status !== 'confirmed' ? (
        <button
          onClick={() => onConfirm(order)}
          className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Confirm & WhatsApp
        </button>
      ) : (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-lg text-sm font-medium cursor-default"
        >
          <CheckCircle className="w-4 h-4" />
          Order Confirmed
        </button>
      )}
    </motion.div>
  );
}

// --- Main Admin Component ---

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data (Products & Orders)
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Fetch Products
        const productData = await getProducts();
        setProducts(productData);

        // Fetch Orders
        const { data: orderData, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(orderData as unknown as Order[]);

      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Optional: Real-time subscription for new orders
    const subscription = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, 
        (payload) => {
          setOrders(prev => [payload.new as unknown as Order, ...prev]);
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  // 2. Calculate Real Analytics
  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    
    // Simple revenue by day calculation (last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDay = last7Days.map(date => {
        const dayRevenue = orders
            .filter(o => o.created_at?.startsWith(date))
            .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
        return { 
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }), 
            amount: dayRevenue 
        };
    });

    return { totalOrders, totalRevenue, pendingOrders, revenueByDay };
  }, [orders]);

  // 3. Handle Order Confirmation & WhatsApp
  const handleConfirmOrder = async (order: Order) => {
    try {
      // A. Update Status in Supabase
      const { error } = await (supabase as any)
        .from('orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      // B. Update Local State
      setOrders(prev => prev.map(o => 
        o.id === order.id 
          ? { 
              ...o, 
              status: 'confirmed',
              updated_at: new Date().toISOString() 
            } 
          : o
      ));

      // C. Construct WhatsApp Message
      const itemsList = (order.items as unknown as OrderItem[])
        .map(i => `• ${i.quantity}x ${i.name}`)
        .join('\n');
      
      const message = `*Order Confirmed!* ✅\n\nHello ${order.customer_name}, your order #${order.id} has been accepted.\n\n*Order Details:*\n${itemsList}\n\n*Total Amount:* ₹${order.total_amount}\n\nWe will update you when your fresh catch is out for delivery! 🛵`;
      
      // D. Redirect to WhatsApp
      const whatsappUrl = `https://wa.me/${order.phone_number.replace(/\D/g,'')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

    } catch (err) {
      console.error('Failed to confirm order:', err);
      alert('Failed to update order status');
    }
  };

  // Inventory Handlers (Mocked for now, connect to DB if needed)
  const handleToggleStock = (productId: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, in_stock: !p.in_stock } : p));
  };
  
  const handlePriceChange = (productId: string, price: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, price } : p));
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Manage orders & inventory</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs font-medium text-green-700">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
        
        {/* 1. Analytics Section */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={`₹${analytics.totalRevenue.toLocaleString()}`}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={ShoppingBag}
              label="Total Orders"
              value={analytics.totalOrders.toString()}
              color="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={analytics.pendingOrders.toString()}
              color="bg-yellow-50 text-yellow-600"
            />
             <StatCard
              icon={Fish}
              label="Products Active"
              value={products.filter(p => p.in_stock).length.toString()}
              color="bg-green-50 text-green-600"
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 2. Order Management (Takes up 2 columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Recent Orders
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{orders.length}</span>
              </h2>
              {/* Optional Search */}
              <div className="hidden md:flex items-center bg-white border rounded-lg px-3 py-1.5 w-64">
                 <Search className="w-4 h-4 text-gray-400 mr-2" />
                 <input type="text" placeholder="Search orders..." className="text-sm outline-none w-full" />
              </div>
            </div>

            {isLoading ? (
               <div className="flex justify-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
               </div>
            ) : orders.length === 0 ? (
               <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
                 <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-500 font-medium">No orders yet</p>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onConfirm={handleConfirmOrder} />
                ))}
              </div>
            )}
          </div>

          {/* 3. Inventory Management (Takes up 1 column on side) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Quick Inventory</h2>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {products.map((product) => (
                <div key={product.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <img src={`/src/assets/${product.imageName}`} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">₹{product.price}/{product.unit}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleStock(product.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      product.in_stock ? "text-green-600 bg-green-50 hover:bg-green-100" : "text-red-500 bg-red-50 hover:bg-red-100"
                    )}
                  >
                    {product.in_stock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              ))}
            </div>
             <p className="text-xs text-center text-gray-400 mt-4">
                Inventory changes here are currently local-only. Connect backend update API to persist.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Admin;