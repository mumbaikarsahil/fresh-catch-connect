import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuShareCard } from '@/components/admin/MenuShareCard';
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
  Bike, 
  CheckSquare,
  Edit2, 
  Plus,  
  X,     
  Upload,
  Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Order, OrderItem } from '@/types/order';

// --- HELPERS ---
const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/`;
const getFullImageUrl = (path: string) => path?.startsWith('http') ? path : `${BUCKET_URL}${path}`;

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

// --- ORDER CARD ---
function OrderCard({ 
  order, 
  onConfirm, 
  onDispatch, 
  onComplete, 
  onFollowUp 
}: { 
  order: Order; 
  onConfirm: (o: Order) => void; 
  onDispatch: (o: Order) => void;
  onComplete: (o: Order) => void;
  onFollowUp: (o: Order) => void; 
}) {
  const items = (order.items || []) as OrderItem[];

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

  const getDeliveryTimeLabel = (prefId: string | undefined | null) => {
    if (!prefId) return 'ASAP / Standard';
    switch(prefId) {
      case 'same_day_2hr': return 'Today, within 2 Hours';
      case 'same_day_evening': return 'Today, 4:00 PM - 7:00 PM';
      case 'same_day_1_to_2': return 'Today, 1:00 PM - 2:00 PM';
      case 'same_day_evening_6_7': return 'Today, 6:00 PM - 7:00 PM';
      case 'same_day_4_to_9': return 'Today, 4:00 PM - 9:00 PM';
      case 'next_day_morning': return 'Tomorrow, 8:00 AM - 10:00 AM';
      case 'next_day_morning_8_9': return 'Tomorrow, 8:00 AM - 9:00 AM';
      case 'next_day_afternoon': return 'Tomorrow, 12:00 PM - 2:00 PM';
      case 'next_day_evening': return 'Tomorrow, 5:00 PM - 8:00 PM';
      case 'next_day': return 'Next Day Delivery';
      default: return prefId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col h-full">
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
        <p className="text-xs text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</p>
      </div>

      <div className="flex items-start gap-2 text-xs font-bold text-blue-800 bg-blue-50/80 border border-blue-100 p-2.5 rounded-lg mb-3">
        <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span>Slot: {getDeliveryTimeLabel((order as any).delivery_preference)}</span>
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

      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Package className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Package className="w-3 h-3 flex-shrink-0" />
          <a href={`tel:${order.phone_number}`} className="underline">{order.phone_number}</a>
        </div>
      </div>

      <div className="mt-auto">
        {order.status === 'delivered' ? (
          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-500 py-2.5 rounded-lg text-sm font-medium cursor-default">
            <CheckCircle className="w-4 h-4" /> Order Completed
          </button>
        ) : order.status === 'out_for_delivery' ? (
          <button 
            onClick={() => onComplete(order)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Mark as Delivered
          </button>
        ) : order.status === 'confirmed' ? (
          <button 
            onClick={() => onDispatch(order)}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
          >
            <Bike className="w-4 h-4" /> Dispatch & Notify
          </button>
        ) : order.payment_status === 'paid' ? (
          <button
            onClick={() => onConfirm(order)}
            className="w-full flex items-center justify-center gap-2 bg-[#1c1c1c] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors shadow-md"
          >
            <CheckCircle className="w-4 h-4" /> Confirm & WhatsApp
          </button>
        ) : (
          <button
            onClick={() => onFollowUp(order)}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Follow Up (No Payment)
          </button>
        )}
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---

const AdminMobile: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<'orders' | 'analytics' | 'inventory'>('orders');
  
  const [orderTab, setOrderTab] = useState<'active' | 'abandoned'>('active');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const { data: productData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .neq('is_deleted', true) 
        .order('name');
        
      if (prodError) throw prodError;
      if (productData) setProducts(productData);

      const { data: orderData, error: orderError } = await supabase.from('orders').select('*, delivery_preference').order('created_at', { ascending: false });
      if (orderError) throw orderError;
      if (orderData) setOrders(orderData as unknown as Order[]);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();

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
      subscription.unsubscribe();
    };
  }, [isAuthenticated]);

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
      return dateFiltered.filter(o => o.payment_status === 'paid' || o.status !== 'pending');
    } else {
      return dateFiltered.filter(o => o.status === 'pending' && o.payment_status !== 'paid');
    }
  }, [orders, dateFilter, orderTab]);


  const handleConfirmOrder = async (order: Order) => {};
  const handleDispatchOrder = async (order: Order) => {};
  const handleCompleteOrder = async (order: Order) => {};
  const handleFollowUp = (order: Order) => {};

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

  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${product.name}"? This will hide it from the store.`
    );
    if (!confirmDelete) return;

    setProducts(prev => prev.filter(p => p.id !== product.id));

    try {
      const { error } = await (supabase.from('products') as any)
        .update({ is_deleted: true, in_stock: false })
        .eq('id', product.id);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product: " + err.message);
      loadData(); 
    }
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        name: '', price: 0, description: '', 
        category: 'fresh-water' as any, 
        unit: 'kg' as any,              
        stock_kg: 0, stock_quantity: 0, cleaning_loss_percent: 35,
        in_stock: true, low_stock: false, images: []
      });
    }
    setImageFiles([]);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setImageFiles([]);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      alert("Name and Price are required.");
      return;
    }

    setIsSavingProduct(true);
    try {
      // 1. Keep the existing images so we don't accidentally delete them
      let uploadedImages: string[] = editingProduct.images ? [...editingProduct.images] : [];
      
      // 2. Find out what number we should start counting from
      let existingImageCount = uploadedImages.length; 

      if (imageFiles.length > 0) {
        const slug = slugify(editingProduct.name);

        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          
          // 3. Generate the exact sequential number (e.g., if 1 exists, next is 2)
          const nextSerialNumber = existingImageCount + i + 1; 
          
          // Format: fish-surmai-slice-1.jpg, fish-surmai-slice-2.jpg, etc.
          const fileName = `fish-${slug}-${nextSerialNumber}.${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file, { upsert: true });

          if (uploadError) {
            console.error("Supabase Storage Error:", uploadError);
            throw new Error(`Image Upload Failed: ${uploadError.message}`);
          }
          
          // 4. Append the new filename to the array instead of overwriting it
          uploadedImages.push(fileName);
        }
      }

      const productPayload = {
        ...editingProduct,
        images: uploadedImages,
        imageName: uploadedImages[0] || editingProduct.imageName || 'placeholder.jpg',
      };

      if (editingProduct.id) {
        const { id, ...updatePayload } = productPayload; 
        
        const { error } = await (supabase.from('products') as any)
          .update(updatePayload)
          .eq('id', editingProduct.id);
          
        if (error) throw error;
      } else {
        const insertPayload = {
          ...productPayload,
          id: crypto.randomUUID() 
        };
        
        const { error } = await (supabase.from('products') as any).insert([insertPayload]);
        if (error) throw error;
      }

      await loadData(); 
      closeProductModal();
      alert(`Product ${editingProduct.id ? 'updated' : 'added'} successfully!`);

    } catch (err: any) {
      console.error("Error saving product:", err);
      alert(err.message || "Failed to save product.");
    } finally {
      setIsSavingProduct(false);
    }
  };
  // --- RENDER ---

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
    <div className="min-h-screen bg-[#f4f5f7] pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-full hover:bg-gray-100 transition-colors hidden lg:block">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 hidden md:block">Manage orders & inventory</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-12">
            <button 
              onClick={() => setPage('orders')} 
              className={cn('text-sm font-bold flex items-center gap-2 px-2 py-5 transition-all border-b-2', page === 'orders' ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-900')}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>
            <button 
              onClick={() => setPage('analytics')} 
              className={cn('text-sm font-bold flex items-center gap-2 px-2 py-5 transition-all border-b-2', page === 'analytics' ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-900')}
            >
              <TrendingUp className="w-4 h-4" /> Analytics
            </button>
            <button 
              onClick={() => setPage('inventory')} 
              className={cn('text-sm font-bold flex items-center gap-2 px-2 py-5 transition-all border-b-2', page === 'inventory' ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-gray-900')}
            >
              <Fish className="w-4 h-4" /> Inventory
            </button>
          </nav>

          <div className="flex items-center gap-4 ml-auto lg:ml-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-green-700 hidden sm:inline">Live</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6 lg:mt-6">
        {page === 'orders' && (
          <div className="space-y-4 max-w-4xl mx-auto">
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
              <div className="grid md:grid-cols-2 gap-4 items-stretch">
                {displayedOrders.map(o => (
                  <OrderCard 
                    key={o.id} 
                    order={o} 
                    onConfirm={handleConfirmOrder} 
                    onDispatch={handleDispatchOrder}
                    onComplete={handleCompleteOrder}
                    onFollowUp={handleFollowUp} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {page === 'analytics' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <h2 className="text-lg font-bold">Analytics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard icon={IndianRupee} label="Revenue" value={`₹${analytics.totalRevenue.toLocaleString()}`} color="bg-blue-50 text-blue-600" />
              <StatCard icon={ShoppingBag} label="Orders" value={`${analytics.totalOrders}`} color="bg-purple-50 text-purple-600" />
              <StatCard icon={Clock} label="Pending" value={`${analytics.pendingOrders}`} color="bg-yellow-50 text-yellow-600" />
              <StatCard icon={Fish} label="Active" value={`${products.filter(p => p.in_stock).length}`} color="bg-green-50 text-green-600" />
            </div>
          </div>
        )}

        {page === 'inventory' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* ✅ NEW MARKETING COMPONENT HERE */}
            <MenuShareCard products={products} />

            <div className="flex justify-between items-center">
               <h2 className="text-lg font-bold">Inventory Management</h2>
               <button 
                 onClick={() => openProductModal()}
                 className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
               >
                 <Plus className="w-4 h-4" /> Add Product
               </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {products.map(p => (
                <div key={p.id} className="p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={getFullImageUrl(p.images?.[0] || p.imageName)} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border" alt={p.name} />
                    <div>
                      <p className="font-medium text-sm md:text-base text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">₹{p.price}/{p.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-15 md:ml-0">
                    <button onClick={() => handleToggleStock(p)} className={cn('p-2 rounded-lg transition-all', p.in_stock ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50')}>
                      {p.in_stock ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-1 border rounded-md px-2 py-1 bg-gray-50">
                        <input type="number" className="w-12 bg-transparent text-sm text-center outline-none" value={p.stock_kg || ''} onChange={(e) => { const val = e.target.value; const num = val === '' ? 0 : parseFloat(val); handleUpdateStockKg(p.id, num); }} />
                        <span className="text-[10px] text-gray-400">kg</span>
                    </div>
                    <button onClick={async () => { try { const { error } = await (supabase.from('products') as any).update({ stock_kg: p.stock_kg }).eq('id', p.id); if (error) throw error; alert('Stock Updated Successfully! ✅'); } catch (err: any) { alert('Failed: ' + err.message); } }} className="text-xs px-3 py-1.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Save</button>
                    
                    <button 
                      onClick={() => openProductModal(p)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-2"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteProduct(p)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isProductModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeProductModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={closeProductModal} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Product Name</label>
                    <input type="text" className="w-full mt-1 border rounded-lg p-2.5 text-sm outline-none focus:border-black" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} placeholder="e.g. Surmai Slice" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Price (₹)</label>
                    <input type="number" className="w-full mt-1 border rounded-lg p-2.5 text-sm outline-none focus:border-black" value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Unit</label>
                    <select className="w-full mt-1 border rounded-lg p-2.5 text-sm outline-none focus:border-black bg-white" value={editingProduct.unit} onChange={e => setEditingProduct({...editingProduct, unit: e.target.value as any})}>
                      <option value="kg">kg</option>
                      <option value="pc">pc</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase">Description</label>
                    <textarea className="w-full mt-1 border rounded-lg p-2.5 text-sm outline-none focus:border-black" rows={2} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} placeholder="Freshly caught..." />
                  </div>

                  {/* ✅ SMART UPLOAD AREA: Z-Index Fix & Visual Previews */}
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-gray-600 uppercase mb-2 block">Photos</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative cursor-pointer min-h-[100px]">
                      <input 
                        type="file" multiple accept="image/*" 
                        onChange={(e) => e.target.files && setImageFiles(Array.from(e.target.files))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Tap to upload photos</p>
                    </div>

                    {/* ✅ PREVIEW RENDERER: Let the user actually see what they selected */}
                    {imageFiles.length > 0 ? (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {imageFiles.map((file, idx) => (
                          <img key={idx} src={URL.createObjectURL(file)} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0" />
                        ))}
                      </div>
                    ) : editingProduct.images && editingProduct.images.length > 0 ? (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {editingProduct.images.map((img, idx) => (
                          <img key={idx} src={getFullImageUrl(img)} alt="Current" className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm flex-shrink-0" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={handleSaveProduct}
                  disabled={isSavingProduct}
                  className={cn("w-full bg-[#1c1c1c] text-white font-bold h-11 rounded-xl shadow-md transition-all", isSavingProduct && "bg-gray-400 cursor-not-allowed opacity-70")}
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => setPage('orders')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'orders' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><ShoppingBag className="w-5 h-5 mb-1" /> Orders</button>
          <button onClick={() => setPage('analytics')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'analytics' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><TrendingUp className="w-5 h-5 mb-1" /> Analytics</button>
          <button onClick={() => setPage('inventory')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'inventory' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><Fish className="w-5 h-5 mb-1" /> Inventory</button>
        </div>
      </nav>
    </div>
  );
};

export default AdminMobile;