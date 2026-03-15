// src/components/admin/OrderCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, CheckCircle, CheckSquare, Bike, MessageCircle } from 'lucide-react';
import { Order, OrderItem } from '@/types/order';
import { cn } from '@/lib/utils';

// --- ORDER CARD ---
export function OrderCard({ 
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
      case 'same_day_2hr': return 'Today, within 2 Hours ⏱️';
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
      {/* Header Info */}
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

      {/* ✅ UPGRADED DELIVERY TIME BOX */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-3 rounded-lg mb-3 shadow-sm">
        <div className="bg-blue-100 p-1.5 rounded-md mt-0.5">
          <Clock className="w-4 h-4 text-blue-700" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wide">Expected Delivery</p>
          <p className="text-sm font-bold text-blue-800 mt-0.5">
            {getDeliveryTimeLabel((order as any).delivery_preference)}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-gray-50 rounded-lg p-2 mb-3 text-sm space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-gray-600">
            <span>
                {item.quantity_kg ? `${item.quantity_kg} kg` : `${item.quantity} x`} {item.name}
            </span>
            <span className="font-medium">₹{item.price * (item.quantity_kg || item.quantity)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-200 mt-2 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>₹{order.total_amount}</span>
        </div>
      </div>

      {/* Contact & Address */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Package className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MessageCircle className="w-3 h-3 flex-shrink-0" />
          <a href={`tel:${order.phone_number}`} className="underline hover:text-blue-600 transition-colors">{order.phone_number}</a>
        </div>
      </div>

      {/* Action Buttons */}
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