import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CreateOrderData } from '@/types/order';
import { Input } from '@/components/ui/input';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { cn } from '@/lib/utils';
import { createOrder } from '@/services/orderService';
import { supabase } from '@/lib/supabase';

// Declare Razorpay on window to avoid TS errors
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, clearCart } = useCart();
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false); // UX Feedback state
  

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- Auto-Fetch Logic using Supabase ---
  const fetchCustomerData = useCallback(async (phoneNumber: string) => {
    setIsLoadingDetails(true);
    try {
      // Query the orders table for the most recent order with this phone number
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, delivery_address')
        .eq('phone_number', phoneNumber)
        // Order by created_at descending to get the most recent order first
        .order('created_at', { ascending: false })
        // Limit to 1 because we only need the latest details
        .limit(1)
        .single(); 

      if (error) {
        // 'PGRST116' is the Supabase code for "no rows returned" (new customer)
        if (error.code !== 'PGRST116') {
          console.error('Error fetching customer data:', error);
        }
        return;
      }

      // If data is found, auto-fill the fields
      if (data) {
        const customer = data as { customer_name: string; delivery_address: string };
        setCustomerName(customer.customer_name);
        setAddress(customer.delivery_address);
      }
    } catch (err) {
      console.error('Unexpected error during customer fetch:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    
    // Trigger fetch only when exactly 10 digits are entered
    if (value.length === 10) {
      fetchCustomerData(value);
    }
  };

  // --- PAYMENT LOGIC ---
  const handlePayment = async () => {
    if (!phone || !address || !customerName) {
      alert("Please fill in Name, Phone, and Address");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create a Pending Order in Supabase FIRST
      const orderData: CreateOrderData = {
        customer_name: customerName,
        phone_number: phone,
        delivery_address: address,
        total_amount: totalAmount, 
        status: 'pending', 
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity, 
          quantity_kg: item.product.unit === 'kg' ? item.quantity : undefined,
          unit: item.product.unit, 
          imageName: item.product.imageName
        }))
      };

      const newOrder = await createOrder(orderData);
      if (!newOrder) throw new Error("Failed to initialize order");

      // 2. Create Razorpay Order securely via Supabase Client
      const { data: razorpayOrder, error: funcError } = await supabase.functions.invoke('create-order', {
        body: { amount: totalAmount }
      });

      if (funcError) throw new Error("Backend error: " + funcError.message);
      if (!razorpayOrder?.id) throw new Error("Payment gateway failed");

      // 3. Open Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "The Fishy Mart",
        description: "Fresh Fish Order",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          // --- SUCCESS PAYMENT HANDLER ---
          // 4. Update Supabase Order to 'confirmed' / 'paid'
          await (supabase.from('orders') as any).update({
            status: 'confirmed',
            payment_id: response.razorpay_payment_id,
            payment_status: 'paid'
          }).eq('id', newOrder.id);

          // 5. Clear Cart & Redirect
          clearCart();
          alert(`Payment Successful! Order #${newOrder.id.slice(0,6)} placed.`);
          navigate('/');
        },
        prefill: {
          name: customerName,
          contact: phone,
        },
        theme: {
          color: "#1c1c1c",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setIsSubmitting(false);
      });
      
      rzp1.open();

    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <div className="p-10 text-center">Cart is Empty</div>;
  }

  return (
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={false}>
      <div className="min-h-screen bg-[#f4f5f7] pb-32 md:pb-10">
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Address & User Info */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50 space-y-5">
              <div className="flex items-center gap-3">
                 <MapPin className="h-5 w-5 text-gray-700" />
                 <h3 className="font-bold text-gray-900 text-lg">Delivery Details</h3>
              </div>

              {/* 1. Phone Input (AT THE TOP) */}
              <div className="relative">
                 <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                 <Input 
                   type="tel" placeholder="Mobile Number" 
                   value={phone} onChange={handlePhoneChange} maxLength={10}
                   className="pl-10 h-12 bg-gray-50 border-transparent rounded-xl"
                 />
                 {isLoadingDetails && <span className="absolute right-3 top-3.5 text-xs text-blue-500 animate-pulse">Fetching details...</span>}
              </div>

              {/* 2. Name Input (AUTO-FILLS) */}
              <div className="relative">
                 <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                 <Input 
                   placeholder="Full Name" 
                   value={customerName}
                   onChange={(e) => setCustomerName(e.target.value)}
                   className={cn("pl-10 h-12 bg-gray-50 border-transparent rounded-xl transition-all", customerName && "border-green-200 bg-green-50")}
                 />
              </div>

              {/* 3. Address Input (AUTO-FILLS) */}
              <div className="relative">
                 <textarea 
                   placeholder="Full Address" 
                   value={address} onChange={(e) => setAddress(e.target.value)}
                   className={cn("w-full min-h-[100px] p-3 bg-gray-50 border border-transparent rounded-xl text-sm transition-all", address && "border-green-200 bg-green-50")}
                 />
              </div>
            </div>

            {/* Cart Items Summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
               <h3 className="font-bold text-gray-900 mb-4">Items ({totalItems})</h3>
               <div className="space-y-4">
                 {items.map(item => (
                   <div key={item.product.id} className="flex gap-4">
                      <img src={item.product.imageUrl} className="w-12 h-12 rounded bg-gray-100 object-cover" />
                      <div>
                        <p className="font-semibold text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x {item.product.unit}</p>
                      </div>
                      <div className="ml-auto font-bold text-sm">₹{item.product.price * item.quantity}</div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Bill) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="font-extrabold text-xl text-gray-900">₹{totalAmount.toFixed(2)}</span>
               </div>
               
               <button
                 onClick={handlePayment}
                 disabled={isSubmitting}
                 className={cn(
                   "w-full bg-[#1c1c1c] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-200",
                   isSubmitting && "bg-gray-400 cursor-not-allowed"
                 )}
               >
                 {isSubmitting ? "Processing..." : (
                   <>
                     <ShieldCheck className="w-5 h-5" />
                     <span>Pay Now</span>
                   </>
                 )}
               </button>
               
               <p className="text-[10px] text-gray-400 text-center">
                 Secured by Razorpay. 100% Safe Payments.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}