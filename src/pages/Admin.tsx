import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Fish,
  ShoppingBag,
  IndianRupee,
  Clock,
  ArrowLeft,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Package,
  TrendingUp,
  MessageCircle,
  Lock,
  LogOut,
  User,
  AlertCircle,
  Calendar,
  Bike, // Icon for delivery
  CheckSquare // Icon for complete
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/order';

// --- COMPONENTS ---

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 shadow-card border border-border">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-lg font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}

// --- UPDATED ORDER CARD ---
function OrderCard({ 
  order, 
  onConfirm, 
  onDispatch, // New Handler
  onComplete, // New Handler
  onFollowUp 
}: { 
  order: Order; 
  onConfirm: (o: Order) => void; 
  onDispatch: (o: Order) => void;
  onComplete: (o: Order) => void;
  onFollowUp: (o: Order) => void; 
}) {
  const items = (order.items || []) as OrderItem[];

  // Helper to get Status Badge Color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'confirmed': return 'Kitchen Ready';
      case 'out_for_delivery': return 'On the Way';
      case 'delivered': return 'Delivered';
      default: return 'Pending';
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900">#{order.id.slice(0, 8)}</h3>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', getStatusColor(order.status))}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 mt-1">{order.customer_name || 'Guest Customer'}</p>
        </div>
        <p className="text-xs text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-2 mb-3 text-sm space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-gray-600">
            <span>
                {item.quantity_kg ? `${item.quantity_kg} kg` : `${item.quantity} x`} {item.name}
            </span>
            <span>₹{item.price * (item.quantity_kg || item.quantity)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>₹{order.total_amount}</span>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <MapPinIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <PhoneIcon className="w-3 h-3 flex-shrink-0" />
          <a href={`tel:${order.phone_number}`} className="underline">{order.phone_number}</a>
        </div>
      </div>

      {/* --- DYNAMIC BUTTON LOGIC --- */}
      {order.status === 'delivered' ? (
        <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-2 rounded-lg text-sm font-medium cursor-default">
          <CheckCircle className="w-4 h-4" />
          Order Completed
        </button>
      ) : order.status === 'out_for_delivery' ? (
        <button 
          onClick={() => onComplete(order)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <CheckSquare className="w-4 h-4" />
          Mark as Delivered
        </button>
      ) : order.status === 'confirmed' ? (
        <button 
          onClick={() => onDispatch(order)}
          className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
        >
          <Bike className="w-4 h-4" />
          Dispatch & Notify Rider
        </button>
      ) : order.payment_status === 'paid' ? (
        <button
          onClick={() => onConfirm(order)}
          className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Confirm & WhatsApp
        </button>
      ) : (
        <button
          onClick={() => onFollowUp(order)}
          className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Follow Up (No Payment)
        </button>
      )}
    </motion.div>
  );
}

const MapPinIcon = Package; 
const PhoneIcon = Package; 

// --- MAIN COMPONENT ---

const AdminMobile: React.FC = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- APP STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<'orders' | 'analytics' | 'inventory'>('orders');
  
  const [orderTab, setOrderTab] = useState<'active' | 'abandoned'>('active');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  // --- CHECK AUTHENTICATION ON LOAD ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  // --- LOGIN FUNCTION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
    }
  };

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- DATA LOADING & REALTIME SUBSCRIPTION ---
  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const { data: productData, error: prodError } = await supabase.from('products').select('*').order('name');
        if (prodError) throw prodError;
        if (mounted && productData) setProducts(productData);

        const { data: orderData, error: orderError } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (orderError) throw orderError;
        if (mounted && orderData) setOrders(orderData as unknown as Order[]);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    // REALTIME SUBSCRIPTION
    const subscription = supabase
      .channel('admin-dashboard-changes')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new as unknown as Order, ...prev]);
          } 
          else if (payload.eventType === 'UPDATE') {
            setOrders((prev) => prev.map((order) => 
              order.id === payload.new.id ? (payload.new as unknown as Order) : order
            ));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

  // ---- Analytics Logic ----
  const analytics = useMemo(() => {
    const totalOrders = orders.filter(o => o.payment_status === 'paid').length; 
    const totalRevenue = orders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' && o.payment_status === 'paid').length;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDay = last7Days.map(date => {
      const dayRevenue = orders
        .filter(o => o.created_at?.startsWith(date) && o.payment_status === 'paid')
        .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      return {
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        amount: dayRevenue
      };
    });

    return { totalOrders, totalRevenue, pendingOrders, revenueByDay };
  }, [orders]);

  // ---- FILTER LOGIC (DATE + TABS) ---
  const displayedOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).getTime();

    const dateFiltered = orders.filter(o => {
      const orderTime = new Date(o.created_at).getTime();
      if (dateFilter === 'today') return orderTime >= startOfToday;
      if (dateFilter === 'yesterday') return orderTime >= startOfYesterday;
      if (dateFilter === 'week') return orderTime >= startOfWeek;
      return true; 
    });

    if (orderTab === 'active') {
      // Show everything that is NOT abandoned
      return dateFiltered.filter(o => o.payment_status === 'paid' || o.status !== 'pending');
    } else {
      return dateFiltered.filter(o => o.status === 'pending' && o.payment_status !== 'paid');
    }
  }, [orders, dateFilter, orderTab]);


  // ----------------------------------------------------
  // ACTION 1: CONFIRM ORDER (Deduct Stock & Whatsapp)
  // ----------------------------------------------------
  const handleConfirmOrder = async (order: Order) => {
    try {
      // 1. DEDUCT STOCK
      for (const item of (order.items as OrderItem[])) {
        const { data: product, error: fetchError } = await (supabase.from('products') as any)
          .select('id, stock_kg, stock_quantity, unit')
          .eq('id', item.productId)
          .single();

        if (fetchError || !product) continue;

        if (product.unit === 'kg' && item.quantity_kg) {
          const newStockKg = (product.stock_kg || 0) - item.quantity_kg;
          await (supabase.from('products') as any).update({ stock_kg: Math.max(0, newStockKg) }).eq('id', product.id);
        } else {
          const newStockQty = (product.stock_quantity || 0) - item.quantity;
          await (supabase.from('products') as any).update({ stock_quantity: Math.max(0, newStockQty) }).eq('id', product.id);
        }
      }

      // 2. UPDATE STATUS
      const { error } = await (supabase.from('orders') as any).update({ status: 'confirmed' }).eq('id', order.id);
      if (error) throw error;
      
      // 3. WHATSAPP MSG
      const itemsList = (order.items as OrderItem[]).map(i => `   🐟 ${i.quantity_kg ? `${i.quantity_kg}kg` : `${i.quantity} x`} *${i.name}*`).join('\n');
      const message = `*🐟 The Fishy Mart - Order Confirmed!* \n--------------------------------\nHi *${order.customer_name}*! 👋\nThanks for choosing us! We've received your order and are getting your fresh catch ready. 🌊\n\n*🧾 Order Summary (ID #${order.id.slice(0, 6)}):*\n${itemsList}\n\n*💰 Total Paid:* ₹${order.total_amount}\n*📍 Delivering to:* ${order.delivery_address.split(',')[0]}...\n\n_⚠️ Note: Final weight may vary slightly after cleaning._\n\n🚀 We will notify you when our rider picks up your order!\nNeed help? Just reply to this chat.`;

      const whatsappUrl = new URL('https://api.whatsapp.com/send');
      whatsappUrl.searchParams.set('phone', order.phone_number.replace(/\D/g, ''));
      whatsappUrl.searchParams.set('text', message);
      window.open(whatsappUrl.toString(), '_blank');

    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // ACTION 2: DISPATCH ORDER (Status -> Out for Delivery)
  // ----------------------------------------------------
  const handleDispatchOrder = async (order: Order) => {
    try {
      const { error } = await (supabase.from('orders') as any).update({ status: 'out_for_delivery' }).eq('id', order.id);
      if (error) throw error;

      // WHATSAPP MSG FOR DISPATCH
      const message = `*🚚 Order Out for Delivery!*\n\nHi *${order.customer_name}*, good news! \n\nYour fresh fish order (#${order.id.slice(0,6)}) has been dispatched and is on its way to you. 🏍️💨\n\nPlease keep your phone handy for the rider.\n\nEnjoy your meal! 🐟💙\n- The Fishy Mart`;

      const whatsappUrl = new URL('https://api.whatsapp.com/send');
      whatsappUrl.searchParams.set('phone', order.phone_number.replace(/\D/g, ''));
      whatsappUrl.searchParams.set('text', message);
      window.open(whatsappUrl.toString(), '_blank');

    } catch (err: any) {
      alert('Error dispatching: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // ACTION 3: COMPLETE ORDER (Status -> Delivered)
  // ----------------------------------------------------
  const handleCompleteOrder = async (order: Order) => {
    try {
      const { error } = await (supabase.from('orders') as any).update({ status: 'delivered' }).eq('id', order.id);
      if (error) throw error;
      alert("Order marked as Delivered! ✅");
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // ACTION 4: FOLLOW UP (For Abandoned Carts)
  // ----------------------------------------------------
  const handleFollowUp = (order: Order) => {
    const itemsList = (order.items as OrderItem[]).map(i => i.name).join(', ');
    const message = `Hello ${order.customer_name}! 👋\n\nWe noticed you left some fresh items (${itemsList}) in your cart at *The Fishy Mart*.\n\nDid you face any issues with the payment? Let us know and we can help you complete the order via UPI! 🐟💳`;
    
    const whatsappUrl = new URL('https://api.whatsapp.com/send');
    whatsappUrl.searchParams.set('phone', order.phone_number.replace(/\D/g, ''));
    whatsappUrl.searchParams.set('text', message);
    window.open(whatsappUrl.toString(), '_blank');
  };

  // ---- Inventory Logic ----
  const handleToggleStock = async (product: Product) => {
     const newStatus = !product.in_stock;
     setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: newStatus } : p));
    const { error } = await (supabase.from('products') as any).update({ in_stock: newStatus }).eq('id', product.id);
     if(error) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock: !newStatus } : p));
     }
  };

  const handleUpdateStockKg = async (id: string, newKg: number) => {
     setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_kg: newKg } : p));
  };


  if (authLoading) return <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 pl-10 bg-gray-50 border-none rounded-xl text-sm mt-1" placeholder="admin@fishymart.com" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 pl-10 bg-gray-50 border-none rounded-xl text-sm mt-1" placeholder="••••••••" required />
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-[#1c1c1c] text-white font-bold h-11 rounded-xl shadow-lg mt-6">Access Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-24">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden lg:block"><ArrowLeft className="w-5 h-5 text-gray-600" /></Link>
            <div><h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1><p className="text-xs text-gray-500">Manage orders & inventory</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span className="text-xs font-medium text-green-700 hidden sm:inline">Live</span></div>
            <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {page === 'orders' && (
          <div className="space-y-4">
            <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                <button onClick={() => setOrderTab('active')} className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", orderTab === 'active' ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-gray-50")}>
                    <CheckCircle className="w-4 h-4" /> Active
                </button>
                <button onClick={() => setOrderTab('abandoned')} className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", orderTab === 'abandoned' ? "bg-red-50 text-red-600 shadow-sm border border-red-100" : "text-gray-500 hover:bg-gray-50")}>
                    <AlertCircle className="w-4 h-4" /> Abandoned
                </button>
            </div>

            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4" /><span className="font-medium">Filter Date:</span></div>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="bg-white text-sm border-gray-300 rounded-md py-1 pl-2 pr-6 focus:ring-black focus:border-black">
                    <option value="today">Today Only</option>
                    <option value="yesterday">Since Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            <div className="flex items-center justify-between"><h2 className="text-lg font-bold flex items-center gap-2">{orderTab === 'active' ? 'Orders' : 'Abandoned Carts'}<span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{displayedOrders.length}</span></h2></div>

            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
            ) : displayedOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300"><ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500 font-medium">No {orderTab} orders for this period</p><button onClick={() => setDateFilter('all')} className="mt-2 text-sm text-blue-600 hover:underline">View All Time</button></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {displayedOrders.map(o => (
                  <OrderCard 
                    key={o.id} 
                    order={o} 
                    onConfirm={handleConfirmOrder} 
                    onDispatch={handleDispatchOrder} // Pass dispatch handler
                    onComplete={handleCompleteOrder} // Pass complete handler
                    onFollowUp={handleFollowUp} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS & INVENTORY SECTIONS REMAIN UNCHANGED FOR BREVITY */}
        {/* They work perfectly as they were in the previous code */}
        {page === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Analytics</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={IndianRupee} label="Revenue" value={`₹${analytics.totalRevenue.toLocaleString()}`} color="bg-blue-50 text-blue-600" />
              <StatCard icon={ShoppingBag} label="Orders" value={`${analytics.totalOrders}`} color="bg-purple-50 text-purple-600" />
              <StatCard icon={Clock} label="Pending" value={`${analytics.pendingOrders}`} color="bg-yellow-50 text-yellow-600" />
              <StatCard icon={Fish} label="Active" value={`${products.filter(p => p.in_stock).length}`} color="bg-green-50 text-green-600" />
            </div>
          </div>
        )}

        {page === 'inventory' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Inventory</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {products.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`/${p.imageName}`} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt={p.name} />
                    <div><p className="font-medium text-sm text-gray-900">{p.name}</p><p className="text-xs text-gray-500">₹{p.price}/{p.unit}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleToggleStock(p)} className={cn('p-2 rounded-lg transition-all', p.in_stock ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50')}>
                      {p.in_stock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-gray-50">
                        <input type="number" className="w-10 bg-transparent text-sm text-center outline-none" value={p.stock_kg || ''} onChange={(e) => { const val = e.target.value; const num = val === '' ? 0 : parseFloat(val); handleUpdateStockKg(p.id, num); }} />
                        <span className="text-[10px] text-gray-400">kg</span>
                    </div>
                    <button onClick={async () => { try { const { error } = await (supabase.from('products') as any).update({ stock_kg: p.stock_kg }).eq('id', p.id); if (error) throw error; alert('Stock Updated Successfully! ✅'); } catch (err: any) { alert('Failed: ' + err.message); } }} className="text-xs px-3 py-1 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => setPage('orders')} className={cn('flex-1 flex flex-col items-center text-xs py-2', page === 'orders' ? 'text-black font-bold' : 'text-gray-400')}><ShoppingBag className="w-5 h-5 mb-1" /> Orders</button>
          <button onClick={() => setPage('analytics')} className={cn('flex-1 flex flex-col items-center text-xs py-2', page === 'analytics' ? 'text-black font-bold' : 'text-gray-400')}><TrendingUp className="w-5 h-5 mb-1" /> Analytics</button>
          <button onClick={() => setPage('inventory')} className={cn('flex-1 flex flex-col items-center text-xs py-2', page === 'inventory' ? 'text-black font-bold' : 'text-gray-400')}><Fish className="w-5 h-5 mb-1" /> Inventory</button>
        </div>
      </nav>
    </div>
  );
};

export default AdminMobile;