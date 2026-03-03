import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User, Clock, CheckCircle2, Edit2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CreateOrderData } from '@/types/order';
import { Input } from '@/components/ui/input';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { cn } from '@/lib/utils';
import { createOrder } from '@/services/orderService';
import { supabase } from '@/lib/supabase';

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
  const [deliveryOption, setDeliveryOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // NEW: UI State for collapsible sections
  const [isDetailsSaved, setIsDetailsSaved] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // --- NEW: DYNAMIC DELIVERY OPTIONS LOGIC ---
  const availableDeliveryOptions = useMemo(() => {
    const d = new Date();
    const currentHour = d.getHours();
    
    // Helper to calculate exact time 2 hours from now
    const getTwoHoursFromNow = () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      return futureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // A. Morning: 6 AM to 11:59 AM
    if (currentHour >= 6 && currentHour < 12) {
      return [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'same_day_evening', label: 'Today, 4:00 PM - 7:00 PM' },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    // B. Afternoon: 12 PM to 3:59 PM
    else if (currentHour >= 12 && currentHour < 16) {
      return [
        { id: 'same_day_evening_6_7', label: 'Today, 6:00 PM - 7:00 PM' },
        { id: 'next_day_morning_8_9', label: 'Tomorrow, 8:00 AM - 9:00 AM' }
      ];
    } 
    // C. Evening: 4 PM to 7:59 PM
    else if (currentHour >= 16 && currentHour < 20) {
      return [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    // D. Night/Late Night: 8 PM to 5:59 AM
    else {
      // If it's past midnight but before 6 AM, "Tomorrow" technically means "Today"
      const dayLabel = currentHour < 6 ? 'Today' : 'Tomorrow';
      return [
        { id: 'next_day_morning', label: `${dayLabel}, 8:00 AM - 10:00 AM` },
        { id: 'next_day_afternoon', label: `${dayLabel}, 12:00 PM - 2:00 PM` },
        { id: 'next_day_evening', label: `${dayLabel}, 5:00 PM - 8:00 PM` }
      ];
    }
  }, []);

  useEffect(() => {
    if (availableDeliveryOptions.length > 0 && !deliveryOption) {
      setDeliveryOption(availableDeliveryOptions[0].id);
    }
  }, [availableDeliveryOptions, deliveryOption]);

  // --- Auto-Fetch Logic ---
  // --- Auto-Fetch Logic ---
  const fetchCustomerData = useCallback(async (phoneNumber: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, delivery_address')
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); 

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // ✅ Tell TypeScript EXACTLY what properties to expect
        const customer = data as { customer_name: string; delivery_address: string };
        setCustomerName(customer.customer_name);
        setAddress(customer.delivery_address);
      }
    } catch (err) {
      console.error('Error fetching customer data:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (value.length === 10) fetchCustomerData(value);
  };

  const handleSaveDetails = () => {
    if (phone.length !== 10) return alert("Please enter a valid 10-digit phone number.");
    if (!customerName.trim()) return alert("Please enter your name.");
    if (!address.trim()) return alert("Please enter your delivery address.");
    
    setIsDetailsSaved(true);
  };

  // --- PAYMENT LOGIC ---
  const handlePayment = async () => {
    if (!isDetailsSaved || !deliveryOption) {
      alert("Please save delivery details and select a delivery time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData: CreateOrderData = {
        customer_name: customerName,
        phone_number: phone,
        delivery_address: address,
        delivery_preference: deliveryOption, 
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

      const { data: razorpayOrder, error: funcError } = await supabase.functions.invoke('create-order', {
        body: { amount: totalAmount }
      });

      if (funcError) throw new Error("Backend error: " + funcError.message);
      if (!razorpayOrder?.id) throw new Error("Payment gateway failed");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "The Fishy Mart",
        description: "Fresh Fish Order",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          await (supabase.from('orders') as any).update({
            status: 'confirmed',
            payment_id: response.razorpay_payment_id,
            payment_status: 'paid'
          }).eq('id', newOrder.id);

          clearCart();
          alert(`Payment Successful! Order #${newOrder.id.slice(0,6)} placed.`);
          navigate('/');
        },
        prefill: { name: customerName, contact: phone },
        theme: { color: "#1c1c1c" },
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
            
            {/* STEP 1: Delivery Details (Collapsible Zomato Style) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
              {/* Collapsed State Summary */}
              {isDetailsSaved ? (
                <div className="p-5 flex items-start justify-between bg-green-50/30">
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Delivery at {customerName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 max-w-md">{address}</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">+91 {phone}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDetailsSaved(false)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Expanded State Form */
                <div className="p-5 md:p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <MapPin className="h-5 w-5 text-gray-700" />
                     <h3 className="font-bold text-gray-900 text-lg">Delivery Details</h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="relative">
                       <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                       <Input 
                         type="tel" placeholder="Mobile Number" 
                         value={phone} onChange={handlePhoneChange} maxLength={10}
                         className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                       />
                       {isLoadingDetails && <span className="absolute right-3 top-3.5 text-xs text-blue-500 animate-pulse">Fetching details...</span>}
                    </div>

                    <div className="relative">
                       <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                       <Input 
                         placeholder="Full Name" 
                         value={customerName}
                         onChange={(e) => setCustomerName(e.target.value)}
                         className={cn("pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl transition-all", customerName && "border-green-200 bg-green-50/50")}
                       />
                    </div>

                    <div className="relative">
                       <textarea 
                         placeholder="Full Address (House No, Building, Area)" 
                         value={address} onChange={(e) => setAddress(e.target.value)}
                         className={cn("w-full min-h-[100px] p-3 bg-gray-50 border border-gray-200 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-xl text-sm transition-all", address && "border-green-200 bg-green-50/50")}
                       />
                    </div>

                    <button 
                      onClick={handleSaveDetails}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-colors mt-2 shadow-sm"
                    >
                      Save & Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Delivery Time Selection (Disabled until Step 1 is saved) */}
            <div className={cn(
              "bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50 space-y-4 transition-all duration-300",
              !isDetailsSaved && "opacity-50 pointer-events-none grayscale-[0.2]"
            )}>
              <div className="flex items-center gap-3 mb-2">
                 <Clock className="h-5 w-5 text-gray-700" />
                 <h3 className="font-bold text-gray-900 text-lg">Preferred Delivery Time</h3>
              </div>
              
              <div className="space-y-3">
                {availableDeliveryOptions.map((option) => (
                  <label 
                    key={option.id} 
                    className={cn(
                      "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all",
                      deliveryOption === option.id 
                        ? "border-green-600 bg-green-50/30" 
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="deliveryOption"
                      value={option.id}
                      checked={deliveryOption === option.id}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-600"
                    />
                    <span className={cn(
                      "text-sm font-medium",
                      deliveryOption === option.id ? "text-gray-900" : "text-gray-600"
                    )}>
                      {option.label}
                    </span>
                  </label>
                ))}
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
                 disabled={isSubmitting || !isDetailsSaved}
                 className={cn(
                   "w-full bg-[#1c1c1c] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-gray-200",
                   (isSubmitting || !isDetailsSaved) && "bg-gray-400 cursor-not-allowed shadow-none"
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