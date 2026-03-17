// src/components/admin/AnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, Clock, Fish, Download, FileText, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/types/order';
import { supabase } from '@/lib/supabase'; // ✅ IMPORT SUPABASE

// Local StatCard Component
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 shadow-sm border border-gray-200 bg-white">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

interface AnalyticsProps {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  activeProductsCount: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ 
  totalRevenue, totalOrders, pendingOrders, activeProductsCount 
}) => {

  // ✅ NEW: Local state specifically for the Sales Ledger
  const [salesOrders, setSalesOrders] = useState<Order[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  // ✅ NEW: Fetch logic for ALL PAID ORDERS
  useEffect(() => {
    const fetchPaidOrders = async () => {
      setIsLoadingSales(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('payment_status', 'paid') // Only fetch paid sales
          .order('created_at', { ascending: false }); // Newest first

        if (error) throw error;
        
        setSalesOrders(data || []);
      } catch (err) {
        console.error("Failed to load paid orders:", err);
      } finally {
        setIsLoadingSales(false);
      }
    };

    fetchPaidOrders();
  }, []);

  // --- CSV DOWNLOAD LOGIC ---
  const downloadSalesCSV = () => {
    if (salesOrders.length === 0) return;

    // Define headers
    const headers = ["Order ID", "Date", "Customer Name", "Phone", "Items Ordered", "Delivery Fee", "Total Amount", "Payment Status", "Order Status"];
    
    // Map data to rows using the newly fetched salesOrders
    const csvRows = salesOrders.map(o => {
      const itemsSummary = Array.isArray(o.items) 
        ? o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(' | ')
        : 'N/A';
        
      return [
        `"${String(o.id).substring(0, 8)}"`,
        `"${new Date(o.created_at).toLocaleString('en-GB')}"`,
        `"${(o.customer_name || 'Guest').replace(/"/g, '""')}"`, 
        `"${o.phone_number || ''}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        `"${(o as any).delivery_fee || 0}"`,
        `"${o.total_amount}"`,
        `"${o.payment_status?.toUpperCase() || 'PENDING'}"`,
        `"${o.status?.toUpperCase() || 'UNKNOWN'}"`
      ].join(',');
    });

    // Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* 1. TOP STATS GRID */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Analytics Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard icon={IndianRupee} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-blue-50 text-blue-600" />
          <StatCard icon={ShoppingBag} label="Orders" value={`${totalOrders}`} color="bg-purple-50 text-purple-600" />
          <StatCard icon={Clock} label="Pending" value={`${pendingOrders}`} color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={Fish} label="Active Items" value={`${activeProductsCount}`} color="bg-green-50 text-green-600" />
        </div>
      </div>

      {/* 2. SALES LEDGER SECTION */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-700" /> Sales Ledger
            </h2>
            <p className="text-sm text-gray-500 mt-1">View and export your paid order history.</p>
          </div>
          
          <button 
            onClick={downloadSalesCSV}
            disabled={salesOrders.length === 0 || isLoadingSales}
            className="flex items-center justify-center gap-2 bg-[#1c1c1c] text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" /> Export Sales CSV
          </button>
        </div>
      </div>

      {/* 3. RESPONSIVE SALES DATA */}
      {isLoadingSales ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : salesOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No sales data available yet.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: Data Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <tr className="border-b border-gray-200">
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono text-sm text-gray-600">
                        #{String(order.id).substring(0, 8)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-sm">{order.customer_name || 'Guest'}</div>
                        <div className="text-xs text-gray-500">{order.phone_number}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                          {order.payment_status || 'PAID'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900">
                        ₹{order.total_amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VIEW: Card List */}
          <div className="md:hidden flex flex-col gap-4">
            {salesOrders.map(order => (
              <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{order.customer_name || 'Guest'}</h3>
                    <p className="text-xs font-mono text-gray-500">#{String(order.id).substring(0, 8)}</p>
                  </div>
                  <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                    {order.payment_status || 'PAID'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </div>
                  <span className="font-extrabold text-gray-900">₹{order.total_amount}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};