import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion'; // Removed AnimatePresence
import { MenuShareCard } from '@/components/admin/MenuShareCard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminManualOrder } from '@/components/admin/AdminManualOrder';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { OrderCard } from '@/components/admin/OrderCard';
import { CustomerCRM } from '@/components/admin/CustomerCRM';

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
  Trash2,
  Image as ImageIcon,
  Loader2,
  Users,
  Settings
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


// --- MAIN COMPONENT ---

const AdminMobile: React.FC = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<'orders' | 'analytics' | 'inventory' | 'crm'>('orders');
  
  const [orderTab, setOrderTab] = useState<'active' | 'abandoned'>('active');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);

  const toggleMaintenance = async () => {
    const newValue = !isMaintenance;
    setIsMaintenance(newValue);
    await (supabase.from('store_settings') as any).update({ is_maintenance: newValue }).eq('id', 1);
    alert(`Maintenance mode is now ${newValue ? 'ON' : 'OFF'}`);
  };

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
    const { data: settings } = await (supabase.from('store_settings') as any).select('is_maintenance').eq('id', 1).single();
    if (settings) setIsMaintenance(settings.is_maintenance);
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


  // --- WHATSAPP NOTIFICATION ENGINE ---
  const notifyCustomer = async (phone: string, templateName: string, fallbackText: string) => {
    if (!phone) return;
    try {
      const response = await fetch('/api/send-utility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumbers: [phone], templateName })
      });
      
      if (!response.ok) throw new Error('API request failed');
      console.log(`WhatsApp template '${templateName}' sent successfully via API.`);
    } catch (error) {
      console.warn('API failed, falling back to wa.me link...');
      const formattedPhone = phone.replace(/[^0-9]/g, ''); 
      const waLink = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(fallbackText)}`;
      window.open(waLink, '_blank');
    }
  };

  // --- ORDER STATUS HANDLERS ---
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await (supabase.from('orders') as any).update({ status: newStatus }).eq('id', orderId);
    if (error) {
      alert("Failed to update order status in database.");
      return false;
    }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    return true;
  };

  const handleConfirmOrder = async (order: Order) => {
    if (await updateOrderStatus(String(order.id), 'confirmed')) {
      const orderIdStr = String(order.id).slice(0, 8);
      const name = order.customer_name || 'Customer';
      const msg = `Hi ${name}, your order #${orderIdStr} from The Fishy Mart is confirmed and is being prepped!`;
      await notifyCustomer(order.phone_number, 'order_confirmed', msg);
    }
  };

  const handleDispatchOrder = async (order: Order) => {
    if (await updateOrderStatus(String(order.id), 'out_for_delivery')) {
      const orderIdStr = String(order.id).slice(0, 8);
      const name = order.customer_name || 'Customer';
      const msg = `Great news ${name}! Your fresh fish order #${orderIdStr} is out for delivery.`;
      await notifyCustomer(order.phone_number, 'order_dispatched', msg);
    }
  };

  const handleCompleteOrder = async (order: Order) => {
    if (await updateOrderStatus(String(order.id), 'delivered')) {
      const orderIdStr = String(order.id).slice(0, 8);
      const msg = `Your order #${orderIdStr} has been delivered. Thank you for choosing The Fishy Mart!`;
      await notifyCustomer(order.phone_number, 'order_delivered', msg);
    }
  };

  const handleFollowUp = async (order: Order) => {
    const orderIdStr = String(order.id).slice(0, 8);
    const name = order.customer_name || 'Customer';
    const msg = `Hi ${name}, we noticed your payment for order #${orderIdStr} is pending. Let us know if you need help!`;
    await notifyCustomer(order.phone_number, 'payment_followup', msg);
  };

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

  // --- IMAGE MANAGEMENT HELPERS ---
  const handleRemoveExistingImage = (indexToRemove: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const newImages = [...editingProduct.images];
    const removedImage = newImages.splice(indexToRemove, 1)[0];
    
    setEditingProduct({ ...editingProduct, images: newImages });
    setImagesToDelete(prev => [...prev, removedImage]); 
  };

  const handleSetCoverExisting = (indexToPromote: number) => {
    if (!editingProduct || !editingProduct.images) return;
    const newImages = [...editingProduct.images];
    const [item] = newImages.splice(indexToPromote, 1);
    newImages.unshift(item); 
    setEditingProduct({ ...editingProduct, images: newImages });
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(indexToRemove, 1);
    setImageFiles(newFiles);
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
    setImagesToDelete([]);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setImageFiles([]);
    setImagesToDelete([]);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      alert("Name and Price are required.");
      return;
    }

    setIsSavingProduct(true);
    // ✅ FIX: Save this flag early, because editingProduct will be reset to null before the alert fires!
    const isUpdate = !!editingProduct.id; 

    try {
      let uploadedImages: string[] = editingProduct.images ? [...editingProduct.images] : [];
      
      if (imageFiles.length > 0) {
        const slug = slugify(editingProduct.name);
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `fish-${slug}-${Date.now()}-${i}.${ext}`;
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, file, { upsert: true });

          if (uploadError) {
            console.error("Supabase Storage Error:", uploadError);
            throw new Error(`Image Upload Failed: ${uploadError.message}`);
          }
          uploadedImages.push(fileName);
        }
      }

      if (imagesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('products')
          .remove(imagesToDelete);
          
        if (deleteError) {
          console.warn("Failed to delete old images from bucket, but continuing:", deleteError);
        }
      }

      const productPayload = {
        ...editingProduct,
        images: uploadedImages,
        imageName: uploadedImages[0] || editingProduct.imageName || 'placeholder.jpg',
      };

      if (isUpdate) {
        const { id, ...updatePayload } = productPayload; 
        const { error } = await (supabase.from('products') as any)
          .update(updatePayload)
          .eq('id', editingProduct!.id);
          
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
      alert(`Product ${isUpdate ? 'updated' : 'added'} successfully!`);

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
      <AdminLogin 
        email={email} 
        setEmail={setEmail} 
        password={password} 
        setPassword={setPassword} 
        handleLogin={handleLogin} 
        loginError={loginError} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
  {/* Added gap-2 and min-w-0 to handle tight squeezing */}
  <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
    
    {/* --- LEFT SIDE: BRAND --- */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink"> 
      <Link 
        to="/" 
        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors hidden lg:block text-gray-500 hover:text-gray-900 shrink-0"
        title="Back to Store"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      
      <div className="hidden lg:block w-px h-4 bg-gray-300 shrink-0"></div> 
      
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center shadow-sm shrink-0">
          <Fish className="w-3.5 h-3.5 text-white" />
        </div>
        {/* On very small screens, drops "The" to just say "Fishy Mart", and truncates if needed */}
        <h1 className="text-sm font-semibold text-gray-900 tracking-tight truncate">
          <span className="hidden xs:inline">The </span>Fishy Mart
        </h1>
        {/* Hide the Admin badge on mobile to save space */}
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-medium tracking-wide uppercase shrink-0">
          Admin
        </span>
      </div>
    </div>
    
    {/* --- CENTER: DESKTOP NAV --- */}
    <nav className="hidden lg:flex items-center gap-1 shrink-0">
      <button 
        onClick={() => setPage('orders')} 
        className={cn('text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200', 
          page === 'orders' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
      >
        <ShoppingBag className="w-4 h-4" /> Orders
      </button>
      <button 
        onClick={() => setPage('analytics')} 
        className={cn('text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200', 
          page === 'analytics' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
      >
        <TrendingUp className="w-4 h-4" /> Analytics
      </button>
      <button 
        onClick={() => setPage('inventory')} 
        className={cn('text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200', 
          page === 'inventory' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
      >
        <Fish className="w-4 h-4" /> Inventory
      </button>
      <button 
        onClick={() => setPage('crm')} 
        className={cn('text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200', 
          page === 'crm' ? 'bg-gray-100 text-black' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')}
      >
        <Users className="w-4 h-4" /> CRM
      </button>
    </nav>

    {/* --- RIGHT SIDE: ACTIONS --- */}
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      
      {/* Hide live badge on mobile to save space, show on tablets (md) and up */}
      <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50/50 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-medium text-gray-600 tracking-wide uppercase">System Live</span>
      </div>

      {/* Maintenance Toggle: Shows Icon + Text on Desktop, ONLY Icon on mobile */}
      <button 
        onClick={toggleMaintenance} 
        title={isMaintenance ? 'Turn Maintenance Off' : 'Turn Maintenance On'}
        className={cn('flex items-center justify-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] font-semibold transition-all uppercase tracking-wide border shrink-0', 
          isMaintenance 
            ? 'bg-amber-50 text-amber-700 border-amber-200' 
            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900')}
      >
        <Settings className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        <span className="hidden sm:inline">{isMaintenance ? 'Maint. On' : 'Maint. Off'}</span>
      </button>

      <div className="w-px h-4 bg-gray-200 hidden sm:block shrink-0"></div>

      {/* Logout Icon */}
      <button 
        onClick={handleLogout} 
        title="Sign Out"
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors shrink-0"
      >
        <LogOut className="w-4 h-4" />
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

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {orderTab === 'active' ? 'Orders' : 'Abandoned Carts'}
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{displayedOrders.length}</span>
              </h2>
              
              <button 
                onClick={() => setIsManualOrderModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#1c1c1c] text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Manual</span> Order
              </button>
            </div>

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
          <AnalyticsDashboard 
            totalRevenue={analytics.totalRevenue}
            totalOrders={analytics.totalOrders}
            pendingOrders={analytics.pendingOrders}
            activeProductsCount={products.filter(p => p.in_stock).length}
          />
        )}

        {page === 'inventory' && (
          <div className="space-y-4 max-w-4xl mx-auto">
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
        {page === 'crm' && (
          <CustomerCRM />
        )}
      </main>

      {/* ✅ REMOVED ANIMATEPRESENCE TO PREVENT REACT CRASH */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            onClick={closeProductModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
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

                {/* SMART UPLOAD AREA WITH COVER/DELETE CONTROLS */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" /> Photos
                  </label>

                  {/* Show Existing Images */}
                  {editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">CURRENT PHOTOS (1st is Cover)</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {editingProduct.images.map((img, idx) => (
                          <div key={idx} className="relative group flex-shrink-0 w-20 h-20">
                            <img 
                              src={getFullImageUrl(img)} 
                              alt={`Current ${idx}`} 
                              className={cn("w-full h-full object-cover rounded-lg shadow-sm transition-all", idx === 0 ? "border-2 border-blue-500" : "border border-gray-200")} 
                            />
                            {idx === 0 && (
                              <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm font-bold">COVER</span>
                            )}
                            
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-1 backdrop-blur-[1px]">
                              {idx !== 0 && (
                                <button onClick={() => handleSetCoverExisting(idx)} className="text-[10px] bg-white text-gray-900 px-2 py-1 rounded shadow-sm font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                  Make Cover
                                </button>
                              )}
                              <button onClick={() => handleRemoveExistingImage(idx)} className="p-1 bg-red-500 text-white rounded-full shadow-sm hover:bg-red-600 transition-colors">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show New Uploads Preview */}
                  {imageFiles.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-500 mb-1">NEW PHOTOS TO UPLOAD</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {imageFiles.map((file, idx) => (
                          <div key={idx} className="relative group flex-shrink-0 w-20 h-20">
                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-lg border border-green-300 shadow-sm" />
                            <button onClick={() => handleRemoveNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Dropzone */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative cursor-pointer min-h-[80px]">
                    <input 
                      type="file" multiple accept="image/*" 
                      onChange={(e) => e.target.files && setImageFiles(prev => [...prev, ...Array.from(e.target.files!)])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                    <p className="text-xs font-medium text-gray-600">Tap to upload more photos</p>
                  </div>

                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={handleSaveProduct}
                disabled={isSavingProduct}
                className={cn("w-full bg-[#1c1c1c] text-white font-bold h-11 rounded-xl shadow-md transition-all flex items-center justify-center gap-2", isSavingProduct && "bg-gray-400 cursor-not-allowed opacity-70")}
              >
                {isSavingProduct && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSavingProduct ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            onClick={() => setIsManualOrderModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-2xl bg-[#f4f5f7] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">New WhatsApp/Offline Order</h2>
              </div>
              <button onClick={() => setIsManualOrderModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto">
               <AdminManualOrder 
                  products={products} 
                  onClose={() => {
                    setIsManualOrderModalOpen(false);
                    loadData(); 
                  }} 
               />
            </div>
          </motion.div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={() => setPage('orders')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'orders' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><ShoppingBag className="w-5 h-5 mb-1" /> Orders</button>
          <button onClick={() => setPage('analytics')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'analytics' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><TrendingUp className="w-5 h-5 mb-1" /> Analytics</button>
          <button onClick={() => setPage('inventory')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'inventory' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><Fish className="w-5 h-5 mb-1" /> Inventory</button>
          <button onClick={() => setPage('crm')} className={cn('flex-1 flex flex-col items-center text-xs py-2 transition-colors', page === 'crm' ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-600')}><Users className="w-5 h-5 mb-1" /> CRM</button></div>
      </nav>
    </div>
  );
};

export default AdminMobile;