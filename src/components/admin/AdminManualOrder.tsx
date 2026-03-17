import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { Search, Plus, Minus, Trash2, MapPin, User, Phone, Map, ShieldCheck, Loader2, IndianRupee, X, ShoppingBag, MessageSquare, CheckCircle2, Wallet, Printer, Send } from 'lucide-react';
import { ThermalReceipt } from '@/components/ThermalReceipt'; 

interface AdminManualOrderProps {
  products: Product[];
  onClose: () => void;
}

export const AdminManualOrder: React.FC<AdminManualOrderProps> = ({ products, onClose }) => {
  // Customer Details
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  // ✅ FIX: Allow the delivery fee to be a string so you can actually backspace and clear it!
  const [deliveryFee, setDeliveryFee] = useState<number | string>(85);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Cart, Payment & Order State
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('upi_paid'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [savedOrder, setSavedOrder] = useState<any>(null);

  // --- Auto-Fetch Customer Details ---
  const fetchCustomerData = useCallback(async (phoneNumber: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('customer_name, delivery_address, pincode') 
        .eq('phone_number', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(); 

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const customer = data as { customer_name: string; delivery_address: string; pincode: string | null };
        if (!customerName) setCustomerName(customer.customer_name);
        if (!address) setAddress(customer.delivery_address);
        if (customer.pincode && !pincode) setPincode(customer.pincode);
      }
    } catch (err) {
      console.error("Error fetching customer data:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [customerName, address, pincode]);

  useEffect(() => {
    if (phone.length === 10) {
      fetchCustomerData(phone);
    }
  }, [phone, fetchCustomerData]);

  // --- Filter & Cart Logic ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 5);
    return products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [products, searchQuery]);

  const addToCart = (product: Product) => {
    if (savedOrder) return; 
    const existing = selectedItems.find(item => item.id === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setSelectedItems([...selectedItems, { id: product.id, name: product.name, price: product.price, unit: product.unit, quantity: 1 }]);
    }
    setSearchQuery(''); 
  };

  const updateQuantity = (id: string, delta: number) => {
    if (savedOrder) return; 
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (savedOrder) return;
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };
  
  // ✅ FIX: Safely convert the deliveryFee back to a number (or 0 if empty) for the math
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const itemTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = itemTotal + safeDeliveryFee;

  // --- WhatsApp Share Logic ---
  const handleWhatsAppShare = () => {
    if (!phone || phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number first.");
      return;
    }

    const itemsText = selectedItems.map(item => `▪ ${item.quantity}x ${item.name} - ₹${item.price * item.quantity}`).join('\n');
    const payMode = paymentMethod === 'upi_paid' ? 'UPI (PAID) ✅' : 'CASH ON DELIVERY 💵';
    const orderIdDisplay = savedOrder ? `#${String(savedOrder.id).substring(0,8)}` : '';

    const message = `🐟 *THE FISHY MART*\n*Order Receipt*\n\n*Order ID:* ${orderIdDisplay}\n*Customer:* ${customerName || 'Guest'}\n*Phone:* ${phone}\n*Address:* ${address}\n\n*Items:*\n${itemsText}\n\n*Subtotal:* ₹${itemTotal}\n*Delivery:* ₹${safeDeliveryFee}\n*TOTAL:* ₹${finalTotal}\n*Payment:* ${payMode}\n\nThank you for shopping!\n_Powered by Biillo_`;

    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // --- Better Iframe Print Logic ---
  const handlePrint = () => {
    const printContent = document.getElementById('thermal-receipt-content');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>
              @page { size: 58mm auto; margin: 0; }
              body { margin: 0; padding: 0; display: flex; justify-content: center; }
            </style>
          </head>
          <body>
            ${printContent.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    if (!customerName || phone.length !== 10 || !address || selectedItems.length === 0) {
      alert("Please fill all details and add at least one item.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await (supabase.from('orders') as any).insert([{
          customer_name: customerName,
          phone_number: phone,
          delivery_address: address,
          pincode: pincode,
          delivery_fee: safeDeliveryFee, // ✅ Save the safe number to the database
          total_amount: finalTotal,
          items: selectedItems.map(item => ({ productId: item.id, name: item.name, price: item.price, quantity: item.quantity, unit: item.unit })),
          status: 'confirmed', 
          payment_status: paymentMethod === 'upi_paid' ? 'paid' : 'pending',
          payment_id: paymentMethod === 'upi_paid' ? 'Manual_WhatsApp_UPI' : 'COD',
          delivery_preference: 'same_day_manual'
        }]).select().single();

      if (error) throw error;
      
      setSavedOrder(data); 
      
    } catch (error: any) {
      alert("Error creating order: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-50 flex flex-col h-screen w-full overflow-hidden">
      
      {/* Hidden Receipt for Printing */}
      <div className="hidden">
        <ThermalReceipt orderData={{ 
          customerName, 
          phone, 
          address, 
          items: selectedItems, 
          deliveryFee: safeDeliveryFee, // ✅ Pass the safe number
          finalTotal, 
          paymentMethod,
          orderId: savedOrder ? String(savedOrder.id).substring(0,8) : undefined
        }} />
      </div>

      <header className="bg-white px-4 py-4 sm:px-6 border-b border-gray-200 flex justify-between items-center shadow-sm shrink-0 z-10">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" /> 
          New WhatsApp/Offline Order
        </h2>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-hidden pointer-events-auto">
        <div className={`h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 lg:gap-6 lg:p-6 transition-opacity duration-300 ${savedOrder ? 'opacity-70 pointer-events-none' : ''}`}>
          
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full overflow-y-auto p-4 lg:p-0 space-y-6 pb-40 lg:pb-0">
            
            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-semibold text-gray-900 text-lg">Customer Details</h3>
                {isLoadingDetails && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative group">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="tel" placeholder="Phone Number (10 digits)" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>

                <div className="relative group sm:col-span-2">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="Full Delivery Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>

                <div className="relative group">
                  <Map className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <input type="text" placeholder="Pincode" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>

                <div className="relative group">
                  <IndianRupee className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  {/* ✅ FIX: The input handles the empty string gracefully so you can type freely */}
                  <input 
                    type="number" 
                    placeholder="Delivery Fee" 
                    value={deliveryFee} 
                    onChange={e => setDeliveryFee(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg border-b border-gray-100 pb-3">Menu Items</h3>
              <div className="relative group">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="text" placeholder="Search for fish..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 bg-white overflow-hidden">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">₹{p.price} / {p.unit}</p>
                      </div>
                      <button onClick={() => addToCart(p)} className="flex items-center justify-center bg-gray-900 text-white p-2 rounded-md hover:bg-black active:scale-95 transition-all">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col h-full bg-white lg:rounded-xl shadow-sm border border-gray-200 overflow-hidden z-20">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50/80">
              <ShoppingBag className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Current Order</h3>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
              {selectedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 opacity-20" />
                  <p className="text-sm">No items added yet</p>
                </div>
              ) : (
                selectedItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex flex-col bg-white p-3 rounded-lg border border-gray-200 shadow-sm gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">₹{item.price * item.quantity}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <div className="flex items-center bg-white border border-gray-300 rounded-md overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:absolute lg:bottom-4 lg:right-6 lg:left-auto lg:w-[calc(41.666667%-1.5rem)] xl:w-[calc(33.333333%-1.5rem)] bg-white p-4 lg:p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:shadow-xl lg:rounded-xl border-t lg:border border-gray-200 z-50 transition-all">
        
        {!savedOrder ? (
          <>
            <div className="flex gap-3 mb-4">
              <button 
                onClick={() => setPaymentMethod('upi_paid')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 text-sm font-semibold rounded-lg border transition-all ${
                  paymentMethod === 'upi_paid' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" /> Paid (UPI)
              </button>
              <button 
                onClick={() => setPaymentMethod('cod')} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 text-sm font-semibold rounded-lg border transition-all ${
                  paymentMethod === 'cod' ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Wallet className="w-4 h-4" /> COD
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 font-medium">Total Bill</span>
              <span className="text-2xl font-bold text-gray-900">₹{finalTotal}</span>
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={isSubmitting || selectedItems.length === 0}
              className={`w-full h-12 rounded-lg text-white font-semibold text-base flex items-center justify-center gap-2 transition-all ${
                isSubmitting || selectedItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 shadow-sm hover:bg-blue-700 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><ShieldCheck className="w-5 h-5" /> Save Order</>}
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Order Saved! (#{String(savedOrder.id).substring(0,8)})
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold shadow-sm transition-all"
              >
                <Printer className="w-5 h-5" /> Print
              </button>
              
              <button 
                onClick={handleWhatsAppShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#20bd5a] font-semibold shadow-sm transition-all"
              >
                <Send className="w-5 h-5" /> Share
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="w-full h-12 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold mt-1 transition-all"
            >
              Close Window
            </button>
          </div>
        )}

      </div>
    </div>
  );
}