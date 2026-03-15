import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ ADDED useLocation
import { ArrowLeft, Search, Package, Phone, Clock, CheckCircle2, Truck } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function TrackOrder() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ ADDED
  
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ✅ ADDED: Auto-fetch if an orderId was passed from the Success screen
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const passedOrderId = location.state?.orderId;
    if (passedOrderId) {
      fetchOrderById(passedOrderId);
    }
  }, [location.state]);

  // ✅ ADDED: New function to fetch a single order by ID
  const fetchOrderById = async (id: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrders(data ? [data] : []);
    } catch (err) {
      console.error(err);
      alert("Failed to load your specific order.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) return alert("Please enter a valid 10-digit phone number");

    setIsLoading(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('phone_number', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    if (s === 'pending') return { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    if (s === 'confirmed' || s === 'paid') return { label: 'Order Confirmed', color: 'bg-blue-100 text-blue-800', icon: Package };
    if (s === 'out_for_delivery') return { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: Truck };
    if (s === 'delivered') return { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
    return { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
  };

  return (
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={true}>
      <div className="min-h-screen bg-[#f4f5f7] pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Search Box */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Enter your Mobile Number</h2>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input 
                  type="tel" 
                  placeholder="10-digit mobile number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl w-full text-lg"
                />
              </div>
              <button 
                type="submit"
                disabled={phone.length !== 10 || isLoading}
                className="bg-[#1c1c1c] text-white px-6 rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? 'Searching...' : <Search className="w-5 h-5" />}
              </button>
            </form>
          </div>

          {/* Results List */}
          {hasSearched && !isLoading && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No orders found for this number.</p>
                </div>
              ) : (
                orders.map((order) => {
                  const statusInfo = getStatusDisplay(order.status);
                  const StatusIcon = statusInfo.icon;
                  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  });

                  return (
                    <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs text-gray-500 font-mono mb-1">ID: #{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="font-semibold text-gray-900">{orderDate}</p>
                        </div>
                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5", statusInfo.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </div>
                      
                      <div className="border-t border-b border-gray-50 py-4 my-4 space-y-2">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="font-medium text-gray-900">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-500 text-sm">Total Paid</span>
                        <span className="font-extrabold text-lg text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}