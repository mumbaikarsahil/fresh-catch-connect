import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ArrowLeft, MapPin, Phone, Receipt, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { WHATSAPP_NUMBER } from '@/data/products';
import { CreateOrderData } from '@/types/order';
import { Input } from '@/components/ui/input';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { cn } from '@/lib/utils';
import { createOrder } from '@/services/orderService';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    totalAmount,
    totalItems,
    clearCart,
  } = useCart();
  
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [customerAddresses, setCustomerAddresses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Add this new state

  // ... (Keep your existing fetchCustomerAddress, handlePhoneChange, generateWhatsAppLink logic here) ...
  // Re-paste that logic if you need to, or I can include it all if you prefer. 
  // For brevity, I am showing the render fixes below.
  
  const fetchCustomerAddress = useCallback(async (phoneNumber: string) => {
    setIsLoadingAddress(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockCustomerData: Record<string, string> = {
        '9876543210': '123 Main St, Bangalore, Karnataka 560001',
        '9876543211': '456 Park Avenue, Mumbai, Maharashtra 400001',
      };
      setCustomerAddresses(prev => ({
        ...prev,
        [phoneNumber]: mockCustomerData[phoneNumber] || ''
      }));
      if (mockCustomerData[phoneNumber]) {
        setAddress(mockCustomerData[phoneNumber]);
      }
    } catch (error) {
      console.error('Error fetching customer address:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(value);
    if (value.length === 10) {
      fetchCustomerAddress(value);
    } else if (value.length === 0) {
      setAddress('');
    }
  };

  const generateWhatsAppLink = () => {
    if (!phone) {
      alert('Please enter your phone number');
      return '#';
    }
    if (!address) {
      alert('Please enter your delivery address');
      return '#';
    }
    const itemsList = items
      .map((item) => `• ${item.product.name} (${item.quantity} ${item.product.unit}) - ₹${item.product.price * item.quantity}`)
      .join('\n');

    const message = encodeURIComponent(
      `*New Order*\n\n*Customer Phone:* ${phone}\n\n*Order Details:*\n${itemsList}\n\n*Total: ₹${totalAmount}*\n\n*Delivery Address:* ${address}`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  const handleCheckout = async () => {
    if (!phone || !address) {
      alert("Please fill in all details");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Prepare the order data with proper typing
      const orderData: CreateOrderData = {
        customer_name: "User",
        phone_number: phone,
        delivery_address: address,
        total_amount: totalAmount + 5, // Including the platform fee
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit,
          imageName: item.product.imageName
        })),
      };

      // 2. Create the order using the order service
      const order = await createOrder(orderData);
      console.log('Order created successfully:', order);
      
      // 3. Generate WhatsApp link with order details
      const whatsappLink = generateWhatsAppLink();
      
      // 4. Clear the cart
      clearCart();
      
      // 5. Show success message and redirect to WhatsApp
      alert('Order placed successfully! You will be redirected to WhatsApp for confirmation.');
      
      // 6. Redirect to WhatsApp in the same tab
      window.location.href = whatsappLink;

    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      // FIX 1: Hide Bottom Nav here too
      <ResponsiveLayout hideFloatingCart={true} showBottomNav={false}>
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50/50">
          <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
            <img 
               src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png" 
               alt="Empty Cart" 
               className="w-32 h-32 opacity-50"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Your cart is empty</h2>
          <p className="text-gray-500 mt-2 mb-8 text-center max-w-xs">
            Looks like you haven't added any fresh catches yet.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-[#1c1c1c] text-white rounded-lg font-semibold hover:bg-black transition-all shadow-lg shadow-gray-200"
          >
            See Restaurants Near You
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    // FIX 2: Added showBottomNav={false} to hide the menu bar
    <ResponsiveLayout hideFloatingCart={true} showBottomNav={false}>
      <div className="min-h-screen bg-[#f4f5f7] pb-32 md:pb-10">
        
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Checkout</h1>
              <p className="text-xs text-gray-500 mt-1">{totalItems} items in cart</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Address Section */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Delivery Details</h3>
              </div>

              <div className="grid gap-5">
                <div className="relative group">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <Input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={10}
                    className="pl-10 h-12 bg-gray-50 border-transparent focus:bg-white focus:border-black/20 rounded-xl transition-all font-medium text-base"
                  />
                  {isLoadingAddress && (
                    <span className="absolute right-3 top-4 text-xs text-blue-600 font-medium animate-pulse">
                      Locating...
                    </span>
                  )}
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                  <textarea
                    placeholder="Complete Address (House No, Building, Street, Landmark)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[100px] pl-10 pt-3 pr-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-black/20 focus:ring-0 resize-none text-sm transition-all"
                  />
                  {customerAddresses[phone] && !isLoadingAddress && (
                    <div className="absolute right-3 bottom-3">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Saved
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100/50">
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-gray-700" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Order Summary</h3>
              </div>

              <div className="divide-y divide-dashed divide-gray-100">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="py-5 flex items-start gap-4"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                        <img
                          src={`/src/assets/${item.product.imageName}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-base">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">₹{item.product.price} / {item.product.unit}</p>
                          </div>
                          
                          <div className="text-right">
                             <p className="text-sm font-bold text-gray-900">₹{item.product.price * item.quantity}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                           <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm h-8 w-24 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-500 transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50">
                <div className="flex items-center gap-2 mb-4">
                   <Receipt className="w-4 h-4 text-gray-400" />
                   <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Bill Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Item Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="border-b border-dashed border-gray-300 cursor-help">Delivery Fee</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                   <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹5.00</span>
                  </div>
                </div>

                <div className="my-4 border-t border-dashed border-gray-200" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">To Pay</span>
                  <span className="font-extrabold text-xl text-gray-900">₹{(totalAmount + 5).toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl p-3 flex items-start gap-3">
                 <div className="bg-white p-1 rounded">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-4 h-4" alt="Whatsapp" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-700">Order via WhatsApp</p>
                    <p className="text-[10px] text-gray-500 leading-tight">Your order details will be sent directly to our store manager.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING BOTTOM BAR (Payment) --- */}
      {/* This will now be visible because the bottom nav is gone */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 shadow-[0_-5px_20px_rgb(0,0,0,0.05)] z-40 lg:hidden">
         <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 uppercase">Total</span>
                <span className="text-xl font-extrabold text-gray-900">₹{(totalAmount + 5).toFixed(2)}</span>
             </div>
             <button
  onClick={handleCheckout}
  disabled={!phone || !address || isSubmitting} // Add isSubmitting here
  className={cn(
    "flex-1 bg-[#1c1c1c] text-white font-bold text-lg h-12 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-gray-200",
    (!phone || !address || isSubmitting) && "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed"
  )}
>
  {isSubmitting ? (
    <span>Processing...</span>
  ) : (
    <>
      <span>Place Order</span>
      <ArrowLeft className="w-5 h-5 rotate-180" />
    </>
  )}
</button>
         </div>
      </div>
      
       {/* Desktop CTA remains same */}
        <div className="hidden lg:block fixed bottom-10 right-[max(2rem,calc((100vw-64rem)/2))] w-[20rem]">
        <button
  onClick={handleCheckout}
  disabled={!phone || !address || isSubmitting} // Add isSubmitting here
  className={cn(
    "flex-1 bg-[#1c1c1c] text-white font-bold text-lg h-12 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-gray-200",
    (!phone || !address || isSubmitting) && "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed"
  )}
>
  {isSubmitting ? (
    <span>Processing...</span>
  ) : (
    <>
      <span>Place Order</span>
      <ArrowLeft className="w-5 h-5 rotate-180" />
    </>
  )}
</button>
        </div>

    </ResponsiveLayout>
  );
}