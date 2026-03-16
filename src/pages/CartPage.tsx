import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User, Clock, CheckCircle2, Edit2, Plus, Minus, Map } from 'lucide-react';
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

// ✅ ADDED: Pincode configurations
const CHEMBUR_PINCODES = ['400071', '400074', '400088', '400089', '400022', '400037', '400043', '400070', '400024', '400075', '400086'];
const NAVI_MUMBAI_PINCODES = ['400708', '400701', '400709', '400710', '400703', '400705', '400613', '400706', '400611', '400707', '400614', '400615'];
const THANE_PINCODES = ['400601', '400602', '400603', '400604', '400605', '400606', '400607', '400608', '400609', '400610', '400612'];
const MIRA_BHAYANDAR_PINCODES = ['401101', '401105', '401107', '401104'];
const VASAI_VIRAR_PINCODES = ['401201', '401202', '401203', '401209', '401208', '401207', '401303'];

const isMumbaiPincode = (pin: string) => {
  const p = parseInt(pin, 10);
  return p >= 400001 && p <= 400104;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, clearCart, updateQuantity, removeFromCart } = useCart();
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pincode, setPincode] = useState(''); // ✅ ADDED: Pincode state
  const [deliveryFee, setDeliveryFee] = useState(0); // ✅ ADDED: Fee state
  const [pincodeError, setPincodeError] = useState(''); // ✅ ADDED: Error state
  const [deliveryOption, setDeliveryOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDetailsSaved, setIsDetailsSaved] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/');
    }
  }, [items.length, navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const availableDeliveryOptions = useMemo(() => {
    const d = new Date();
    const currentHour = d.getHours();
    
    const getTwoHoursFromNow = () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      return futureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    if (currentHour >= 6 && currentHour < 12) {
      return [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'same_day_evening', label: 'Today, 4:00 PM - 7:00 PM' },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    else if (currentHour >= 12 && currentHour < 16) {
      return [
        { id: 'same_day_evening_6_7', label: 'Today, 6:00 PM - 7:00 PM' },
        { id: 'next_day_morning_8_9', label: 'Tomorrow, 8:00 AM - 9:00 AM' }
      ];
    } 
    else if (currentHour >= 16 && currentHour < 20) {
      return [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    else {
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

  const fetchCustomerData = useCallback(async (phoneNumber: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        // ✅ CHANGED: Added 'pincode' to the select query
        .select('customer_name, delivery_address, pincode') 
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); 

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // ✅ CHANGED: Updated the TypeScript type to expect the pincode
        const customer = data as { customer_name: string; delivery_address: string; pincode: string | null };
        
        setCustomerName(customer.customer_name);
        setAddress(customer.delivery_address); // Directly set the clean address
        
        // ✅ CHANGED: If they have a pincode saved in the database, automatically apply it and calculate the fee
        if (customer.pincode) {
           handlePincodeChange(customer.pincode);
        }
      }
    } catch (err) {
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (value.length === 10) fetchCustomerData(value);
  };

  // ✅ ADDED: Logic to validate pincode and calculate delivery fee
  const handlePincodeChange = (val: string) => {
    const pin = val.replace(/\D/g, '').slice(0, 6);
    setPincode(pin);
    setPincodeError('');
    
    if (pin.length === 6) {
      if (CHEMBUR_PINCODES.includes(pin)) {
        setDeliveryFee(65);
      } else if (
        isMumbaiPincode(pin) ||
        NAVI_MUMBAI_PINCODES.includes(pin) ||
        THANE_PINCODES.includes(pin) ||
        MIRA_BHAYANDAR_PINCODES.includes(pin) ||
        VASAI_VIRAR_PINCODES.includes(pin)
      ) {
        setDeliveryFee(85);
      } else {
        setDeliveryFee(0);
        setPincodeError('Sorry, we do not deliver to this pincode yet.');
      }
    } else {
      setDeliveryFee(0);
    }
  };

  const handleSaveDetails = () => {
    if (phone.length !== 10) return alert("Please enter a valid 10-digit phone number.");
    if (!customerName.trim()) return alert("Please enter your name.");
    if (!address.trim()) return alert("Please enter your delivery address.");
    if (pincode.length !== 6) return alert("Please enter a valid 6-digit pincode.");
    if (pincodeError) return alert(pincodeError);
    
    setIsDetailsSaved(true);
  };

  const handlePayment = async () => {
    if (!isDetailsSaved || !deliveryOption) {
      alert("Please save delivery details and select a delivery time.");
      return;
    }

    setIsSubmitting(true);
    
    // ✅ CHANGED: Calculate Final Total including Delivery Fee
    const finalTotalAmount = totalAmount + deliveryFee;

    try {
      const orderData: CreateOrderData = {
        customer_name: customerName,
        phone_number: phone,
        delivery_address: address,     // <--- Keep the address clean
        pincode: pincode,              // <--- Send pincode to the new column
        delivery_fee: deliveryFee,     // <--- Send delivery fee to the new column
        delivery_preference: deliveryOption, 
        total_amount: finalTotalAmount, 
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
        body: { 
          amount: finalTotalAmount, // ✅ Passes the new grand total to Razorpay
          supabaseOrderId: newOrder.id 
        }
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
        notes: {
          supabase_order_id: newOrder.id
        },
        handler: async function (response: any) {
          await (supabase.from('orders') as any).update({
            status: 'confirmed',
            payment_id: response.razorpay_payment_id,
            payment_status: 'paid'
          }).eq('id', newOrder.id);

          clearCart();
          navigate('/order-success', { state: { orderId: newOrder.id } });
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
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={false}>
      <div className="min-h-screen bg-[#f4f5f7] pb-32 md:pb-10">
        
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
              {isDetailsSaved ? (
                <div className="p-5 flex items-start justify-between bg-green-50/30">
                  <div className="flex gap-4">
                    <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Delivery at {customerName}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 max-w-md">{address}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">Pincode: {pincode}</p>
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

                    {/* ✅ ADDED: Pincode Input Field */}
                    <div className="relative">
                       <Map className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                       <Input 
                         type="text"
                         placeholder="Delivery Pincode (e.g., 400071)" 
                         value={pincode}
                         onChange={(e) => handlePincodeChange(e.target.value)}
                         maxLength={6}
                         className={cn("pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl transition-all", 
                           pincode.length === 6 && !pincodeError && "border-green-200 bg-green-50/50",
                           pincodeError && "border-red-400 bg-red-50/50"
                         )}
                       />
                       {pincodeError && <p className="text-xs text-red-500 mt-2 ml-1">{pincodeError}</p>}
                       {!pincodeError && pincode.length === 6 && deliveryFee > 0 && (
                          <p className="text-xs text-green-600 mt-2 ml-1 font-medium">Delivery available! Fee: ₹{deliveryFee}</p>
                       )}
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
                      disabled={!!pincodeError || pincode.length !== 6}
                      className={cn(
                        "w-full text-white font-bold h-12 rounded-xl transition-colors mt-2 shadow-sm",
                        (pincodeError || pincode.length !== 6) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      Save & Proceed
                    </button>
                  </div>
                </div>
              )}
            </div>

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

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
               <h3 className="font-bold text-gray-900 mb-4">Items ({totalItems})</h3>
               <div className="space-y-4 divide-y divide-gray-100">
                 {items.map(item => (
                   <div key={item.product.id} className="flex gap-4 pt-4 first:pt-0">
                      <img src={item.product.imageUrl} className="w-16 h-16 rounded-xl bg-gray-100 object-cover" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">₹{item.product.price} / {item.product.unit}</p>
                        </div>
                        
                        <div className="flex items-center mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                            <button 
                              onClick={() => {
                                if (item.quantity <= 1) removeFromCart(item.product.id);
                                else updateQuantity(item.product.id, item.quantity - 1);
                              }}
                              className="w-8 h-full flex items-center justify-center text-red-500 hover:bg-red-50 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-sm text-gray-900 py-1">
                        ₹{item.product.price * item.quantity}
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 space-y-4">
               {/* ✅ ADDED: Item breakdown and Delivery Fee UI */}
               <div className="space-y-3 pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Item Total</span>
                     <span className="font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Delivery Fee</span>
                     <span className="font-semibold text-gray-900">
                        {isDetailsSaved ? `₹${deliveryFee.toFixed(2)}` : 'Calculated at checkout'}
                     </span>
                  </div>
               </div>

               <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="font-extrabold text-xl text-gray-900">
                     ₹{(totalAmount + (isDetailsSaved ? deliveryFee : 0)).toFixed(2)}
                  </span>
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