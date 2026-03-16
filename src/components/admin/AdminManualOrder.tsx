import React, { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { Search, Plus, Minus, Trash2, MapPin, User, Phone, Map, ShieldCheck } from 'lucide-react';

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
  const [deliveryFee, setDeliveryFee] = useState(85);

  // Cart & Payment Details
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('upi_paid'); // 'upi_paid' or 'cod'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products.slice(0, 5); // Show first 5 by default
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [products, searchQuery]);

  // Cart Functions
  const addToCart = (product: Product) => {
    const existing = selectedItems.find(item => item.id === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: 1
      }]);
    }
    setSearchQuery(''); // Clear search after adding
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const itemTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = itemTotal + deliveryFee;

  // Submit Logic
  const handleSubmit = async () => {
    if (!customerName || phone.length !== 10 || !address || selectedItems.length === 0) {
      alert("Please fill all details and add at least one item.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await (supabase.from('orders') as any)
        .insert([{
          customer_name: customerName,
          phone_number: phone,
          delivery_address: address,
          pincode: pincode,
          delivery_fee: deliveryFee,
          total_amount: finalTotal,
          
          items: selectedItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            unit: item.unit
          })),
          
          status: 'confirmed', 
          payment_status: paymentMethod === 'upi_paid' ? 'paid' : 'pending',
          payment_id: paymentMethod === 'upi_paid' ? 'Manual_WhatsApp_UPI' : 'COD',
          delivery_preference: 'same_day_manual'
        }])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("Failed to return order data after saving.");

      alert(`✅ Order #${String(data.id).substring(0,8)} created successfully!`);
      onClose(); // Close the modal and refresh the list!
      
    } catch (error: any) {
      alert("Error creating order: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-white">
      
      {/* 1. Customer Details Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 border-b pb-2">Customer Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="tel" placeholder="Phone Number" maxLength={10} value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <div className="relative sm:col-span-2">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Full Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <div className="relative">
            <Map className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Pincode" maxLength={6} value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <div>
            <div className="flex items-center border rounded-lg px-3 py-2 focus-within:border-black">
              <span className="text-gray-500 mr-2 text-sm">Delivery ₹</span>
              <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(Number(e.target.value))} className="w-full text-sm outline-none bg-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Product Search & Add Section */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 border-b pb-2">Add Items</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for fish..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-black bg-gray-50" 
          />
        </div>
        
        {/* Search Results */}
        {filteredProducts.length > 0 && (
          <div className="border rounded-lg divide-y bg-white shadow-sm">
            {filteredProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
                <span className="text-sm font-medium">{p.name} <span className="text-gray-500 text-xs">(₹{p.price}/{p.unit})</span></span>
                <button onClick={() => addToCart(p)} className="bg-gray-900 text-white p-1 rounded hover:bg-black">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Selected Items Cart */}
      {selectedItems.length > 0 && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-2">
          {selectedItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded border shadow-sm">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">₹{item.price * item.quantity}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded bg-gray-50">
                  <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-500 hover:text-black"><Minus className="w-3 h-3" /></button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-500 hover:text-black"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Payment & Final Submit */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex gap-2">
          <button 
            onClick={() => setPaymentMethod('upi_paid')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg border ${paymentMethod === 'upi_paid' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            ✅ Already Paid (UPI)
          </button>
          <button 
            onClick={() => setPaymentMethod('cod')} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg border ${paymentMethod === 'cod' ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            💵 Cash on Delivery
          </button>
        </div>

        <div className="flex items-center justify-between text-lg">
          <span className="font-bold text-gray-900">Total Bill:</span>
          <span className="font-extrabold text-black">₹{finalTotal}</span>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting || selectedItems.length === 0}
          className={`w-full h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all ${isSubmitting || selectedItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1c1c1c] shadow-lg hover:bg-black'}`}
        >
          {isSubmitting ? "Creating Order..." : <><ShieldCheck className="w-5 h-5" /> Save Manual Order</>}
        </button>
      </div>

    </div>
  );
}