import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Search } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId || 'Unknown';

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={true}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Thank you for your purchase. Your fresh catch is being prepared and will be delivered during your selected time slot.
        </p>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm w-full max-w-sm mb-8">
          <p className="text-sm text-gray-500 mb-1">Order Reference ID</p>
          <p className="font-mono font-bold text-gray-900">#{orderId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Replace the previous two-button flex container with this: */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button 
            // ✅ CHANGED: Now passing the orderId in the state
            onClick={() => navigate('/track', { state: { orderId } })}
            className="flex-1 bg-white border-2 border-gray-200 text-gray-900 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Search className="w-5 h-5" />
            Track Order
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex-1 bg-[#1c1c1c] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors shadow-md"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </ResponsiveLayout>
  );
}