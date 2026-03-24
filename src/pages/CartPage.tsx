import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, ShieldCheck, User, Clock, CheckCircle2, Plus, Minus, Map, Navigation, Home, Building, AlertCircle } from 'lucide-react';
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

// Pincode configurations
const CHEMBUR_PINCODES = ['400071', '400074', '400088', '400089', '400022', '400037', '400043', '400070', '400024', '400075', '400086'];
const NAVI_MUMBAI_PINCODES = ['400708', '400701', '400709', '400710', '400703', '400705', '400613', '400706', '400611', '400707', '400614', '400615'];
const THANE_PINCODES = ['400601', '400602', '400603', '400604', '400605', '400606', '400607', '400608', '400609', '400610', '400612'];
const MIRA_BHAYANDAR_PINCODES = ['401101', '401105', '401107', '401104'];
const VASAI_VIRAR_PINCODES = ['401201', '401202', '401203', '401209', '401208', '401207', '401303'];

const isMumbaiPincode = (pin: string) => {
  const p = parseInt(pin, 10);
  return p >= 400001 && p <= 400104;
};

// Helper to get the full Supabase storage URL
const BUCKET_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/`;
const getFullImageUrl = (path?: string) => {
  if (!path) return ''; 
  return path.startsWith('http') ? path : `${BUCKET_URL}${path}`;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, clearCart, updateQuantity, removeFromCart } = useCart();
  
  // UX Steps
  const [step, setStep] = useState<'phone' | 'address' | 'saved'>('phone');
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [pincode, setPincode] = useState('');
  
  // New Granular Address Fields
  const [address, setAddress] = useState(''); 
  const [houseNo, setHouseNo] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  
  const [deliveryFee, setDeliveryFee] = useState(0); 
  const [pincodeError, setPincodeError] = useState(''); 
  const [deliveryOption, setDeliveryOption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLocating, setIsLocating] = useState(false); 
  const [deliveryConfig, setDeliveryConfig] = useState({ sameDay: true, nextDay: true });

  // ✅ ADDED: Custom Modal State
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (items.length === 0) navigate('/');
  }, [items.length, navigate]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchDeliverySettings = async () => {
      try {
        const { data, error } = await supabase
          .from('store_settings')
          .select('same_day_enabled, next_day_enabled')
          .eq('id', 1)
          .single();

        if (data && !error) {
          const settings = data as { same_day_enabled: boolean; next_day_enabled: boolean };
          setDeliveryConfig({ sameDay: settings.same_day_enabled, nextDay: settings.next_day_enabled });
        }
      } catch (err) {
        console.error("Failed to fetch delivery settings", err);
      }
    };
    fetchDeliverySettings();
  }, []);

  const availableDeliveryOptions = useMemo(() => {
    const d = new Date();
    const currentHour = d.getHours();
    
    const getTwoHoursFromNow = () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);
      return futureDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    let baseOptions = [];

    if (currentHour >= 6 && currentHour < 12) {
      baseOptions = [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'same_day_evening', label: 'Today, 4:00 PM - 7:00 PM' },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    else if (currentHour >= 12 && currentHour < 16) {
      baseOptions = [
        { id: 'same_day_evening_6_7', label: 'Today, 6:00 PM - 7:00 PM' },
        { id: 'next_day_morning_8_9', label: 'Tomorrow, 8:00 AM - 9:00 AM' }
      ];
    } 
    else if (currentHour >= 16 && currentHour < 20) {
      baseOptions = [
        { id: 'same_day_2hr', label: `Today, by ${getTwoHoursFromNow()}` },
        { id: 'next_day_morning', label: 'Tomorrow, 8:00 AM - 10:00 AM' },
        { id: 'next_day_afternoon', label: 'Tomorrow, 12:00 PM - 2:00 PM' },
        { id: 'next_day_evening', label: 'Tomorrow, 5:00 PM - 8:00 PM' }
      ];
    } 
    else {
      const dayLabel = currentHour < 6 ? 'Today' : 'Tomorrow';
      baseOptions = [
        { id: 'next_day_morning', label: `${dayLabel}, 8:00 AM - 10:00 AM` },
        { id: 'next_day_afternoon', label: `${dayLabel}, 12:00 PM - 2:00 PM` },
        { id: 'next_day_evening', label: `${dayLabel}, 5:00 PM - 8:00 PM` }
      ];
    }

    return baseOptions.filter(option => {
      if (option.id.startsWith('same_day') && !deliveryConfig.sameDay) return false;
      if (option.id.startsWith('next_day') && !deliveryConfig.nextDay) return false;
      return true;
    });
  }, [deliveryConfig]);

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

  const handleVerifyPhone = async () => {
    if (phone.length !== 10) {
      setValidationErrors(["Please enter a valid 10-digit mobile number."]);
      setShowErrorModal(true);
      return;
    }
    
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, delivery_address, pincode') 
        .eq('phone_number', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); 

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const customer = data as { customer_name: string; delivery_address: string; pincode: string | null };
        setCustomerName(customer.customer_name);
        setAddress(customer.delivery_address);
        if (customer.pincode) handlePincodeChange(customer.pincode);
        setIsExistingCustomer(true);
      } else {
        setIsExistingCustomer(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
      setStep('address');
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setValidationErrors(["Geolocation is not supported by your browser."]);
      setShowErrorModal(true);
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        
        if (data && data.address) {
          if (data.address.postcode) handlePincodeChange(data.address.postcode);
          const detectedArea = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
          if (detectedArea) setArea(detectedArea);
        } else {
          setValidationErrors(["Could not detect exact area. Please enter manually."]);
          setShowErrorModal(true);
        }
      } catch (err) {
        setValidationErrors(["Error detecting location. Please enter manually."]);
        setShowErrorModal(true);
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setValidationErrors(["Location access was denied. Please enter manually."]);
      setShowErrorModal(true);
      setIsLocating(false);
    });
  };

  const handleSaveDetails = () => {
    if (!isExistingCustomer) {
      const formErrors = [];
      if (!customerName.trim()) formErrors.push("Your Name");
      if (pincode.length !== 6 || pincodeError) formErrors.push("A Valid 6-Digit Pincode");
      if (!houseNo.trim()) formErrors.push("House / Flat No.");
      if (!area.trim()) formErrors.push("Area / Street");

      if (formErrors.length > 0) {
        setValidationErrors(formErrors);
        setShowErrorModal(true);
        return;
      }
      
      const fullAddress = [houseNo, area, landmark ? `Near ${landmark}` : ''].filter(Boolean).join(', ');
      setAddress(fullAddress);
    }
    setStep('saved');
  };

  const handlePayment = async () => {
    // ✅ CHANGED: Trigger the custom modal instead of the browser alert
    const missingFields = [];
    if (step !== 'saved') missingFields.push("Delivery Address");
    if (!deliveryOption) missingFields.push("Preferred Delivery Time");

    if (missingFields.length > 0) {
      setValidationErrors(missingFields);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    const finalTotalAmount = totalAmount + deliveryFee;

    try {
      const orderData: CreateOrderData = {
        customer_name: customerName,
        phone_number: phone,
        delivery_address: address, 
        pincode: pincode,
        delivery_fee: deliveryFee, 
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
        body: { amount: finalTotalAmount, supabaseOrderId: newOrder.id }
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
        notes: { supabase_order_id: newOrder.id },
        handler: async function (response: any) {
          await (supabase.from('orders') as any).update({
            status: 'confirmed', payment_id: response.razorpay_payment_id, payment_status: 'paid'
          }).eq('id', newOrder.id);

          clearCart();
          navigate('/order-success', { state: { orderId: newOrder.id } });
        },
        prefill: { name: customerName, contact: phone },
        theme: { color: "#1c1c1c" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        setValidationErrors([`Payment Failed: ${response.error.description}`]);
        setShowErrorModal(true);
        setIsSubmitting(false);
      });
      rzp1.open();

    } catch (err) {
      setValidationErrors(["Something went wrong communicating with the server. Please try again."]);
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={false}>
      {/* ✅ ADDED: Beautiful Custom Validation Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-1">
                <AlertCircle className="w-7 h-7" />
              </div>
              
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Missing Information</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Please complete the following to proceed with your checkout:
                </p>
              </div>

              <div className="w-full bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
                <ul className="space-y-3">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {err}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-[#1c1c1c] text-white font-bold h-12 rounded-xl hover:bg-black transition-colors mt-2 shadow-md shadow-gray-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

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
              
              {/* STEP 1: VERIFY PHONE */}
              {step === 'phone' && (
                <div className="p-5 md:p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                     <h3 className="font-bold text-gray-900 text-lg">Contact Details</h3>
                  </div>
                  <div className="space-y-4 pt-2">
                    <div className="relative">
                       <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                       <Input 
                         type="tel" placeholder="10-digit Mobile Number" 
                         value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10}
                         className={cn("pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl", phone.length === 10 && "border-blue-300 bg-blue-50/50")}
                       />
                    </div>
                    <button 
                      onClick={handleVerifyPhone}
                      disabled={isLoadingDetails}
                      className={cn(
                        "w-full text-white font-bold h-12 rounded-xl transition-colors mt-2 shadow-sm flex items-center justify-center gap-2",
                        phone.length !== 10 ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                      )}
                    >
                      {isLoadingDetails ? "Checking..." : "Continue"}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS */}
              {step === 'address' && (
                <div className="p-5 md:p-6 space-y-5">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                     <h3 className="font-bold text-gray-900 text-lg">Delivery Address</h3>
                  </div>

                  {isExistingCustomer ? (
                    <div className="pt-2">
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                        <div className="flex gap-3">
                          <Home className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-gray-900">{customerName}</h4>
                            <p className="text-sm text-gray-600 mt-1">{address}</p>
                            <p className="text-sm font-semibold text-gray-700 mt-1">Pincode: {pincode}</p>
                            <p className="text-xs text-gray-500 mt-1">+91 {phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button 
                          onClick={() => {
                            setIsExistingCustomer(false);
                            setAddress('');
                          }}
                          className="flex-1 border border-gray-300 text-gray-700 font-semibold h-12 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                        >
                          Change / Add New
                        </button>
                        <button 
                          onClick={handleSaveDetails}
                          className="flex-1 bg-green-600 text-white font-bold h-12 rounded-xl hover:bg-green-700 shadow-sm transition-colors"
                        >
                          Deliver Here
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="relative">
                         <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                         <Input 
                           placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                           className={cn("pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl", customerName && "border-green-200 bg-green-50/50")}
                         />
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative flex-1">
                           <Map className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                           <Input 
                             type="text" placeholder="Pincode" value={pincode} onChange={(e) => handlePincodeChange(e.target.value)} maxLength={6}
                             className={cn("pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl", pincode.length === 6 && !pincodeError && "border-green-200 bg-green-50/50", pincodeError && "border-red-400 bg-red-50/50")}
                           />
                        </div>
                        <button 
                          onClick={detectLocation}
                          disabled={isLocating}
                          className="h-12 px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors whitespace-nowrap"
                        >
                          {isLocating ? <span className="animate-pulse">Locating...</span> : <><Navigation className="w-4 h-4" /> Detect</>}
                        </button>
                      </div>
                      {pincodeError && <p className="text-xs text-red-500 ml-1 -mt-2">{pincodeError}</p>}
                      {!pincodeError && pincode.length === 6 && deliveryFee > 0 && <p className="text-xs text-green-600 ml-1 -mt-2 font-medium">Delivery available! Fee: ₹{deliveryFee}</p>}

                      <div className="relative">
                         <Home className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                         <Input 
                           placeholder="House / Flat / Block No." value={houseNo} onChange={(e) => setHouseNo(e.target.value)}
                           className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                         />
                      </div>

                      <div className="relative">
                         <Building className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                         <Input 
                           placeholder="Area / Street / Sector" value={area} onChange={(e) => setArea(e.target.value)}
                           className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                         />
                      </div>

                      <div className="relative">
                         <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                         <Input 
                           placeholder="Nearby Landmark (Optional)" value={landmark} onChange={(e) => setLandmark(e.target.value)}
                           className="pl-10 h-12 bg-gray-50 border-gray-200 rounded-xl"
                         />
                      </div>

                      <button 
                        onClick={handleSaveDetails}
                        className={cn(
                          "w-full text-white font-bold h-12 rounded-xl transition-colors mt-2 shadow-sm",
                          "bg-black hover:bg-gray-800"
                        )}
                      >
                        Save Address & Proceed
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: FINAL SAVED VIEW */}
              {step === 'saved' && (
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
                    onClick={() => setStep('address')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className={cn(
              "bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50 space-y-4 transition-all duration-300",
              step !== 'saved' && "opacity-50 pointer-events-none grayscale-[0.2]"
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
                      type="radio" name="deliveryOption" value={option.id} checked={deliveryOption === option.id}
                      onChange={(e) => setDeliveryOption(e.target.value)}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-600"
                    />
                    <span className={cn("text-sm font-medium", deliveryOption === option.id ? "text-gray-900" : "text-gray-600")}>
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
                     <img 
                      src={getFullImageUrl(item.product.imageName || item.product.imageUrl)} 
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl bg-gray-100 object-cover" 
                     />
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
                            <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
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
               <div className="space-y-3 pb-3 border-b border-gray-100">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Item Total</span>
                     <span className="font-semibold text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-600">Delivery Fee</span>
                     <span className="font-semibold text-gray-900">
                        {step === 'saved' ? `₹${deliveryFee.toFixed(2)}` : 'Calculated at checkout'}
                     </span>
                  </div>
               </div>

               <div className="flex justify-between items-center pt-1">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="font-extrabold text-xl text-gray-900">
                     ₹{(totalAmount + (step === 'saved' ? deliveryFee : 0)).toFixed(2)}
                  </span>
               </div>
               
               <button
                 onClick={handlePayment}
                 disabled={isSubmitting}
                 className={cn(
                   "w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg",
                   isSubmitting 
                     ? "bg-gray-400 cursor-not-allowed shadow-none text-white" 
                     : "bg-[#1c1c1c] text-white hover:bg-black shadow-gray-200",
                   (step !== 'saved' || !deliveryOption) && !isSubmitting && "opacity-90"
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
                 Secured by Razorpay. Safe Payments.
               </p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}