import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, User, Phone, MapPin, Map, Calendar, Loader2, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
  address?: string;
  pincode?: string;
  is_whatsapp_opted_in: boolean;
  last_order_date?: string;
  created_at: string;
}

export const CustomerCRM = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Customer Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', pincode: '' });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('last_order_date', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      if (data) setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const lowerQuery = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.full_name?.toLowerCase().includes(lowerQuery) || 
      c.phone_number?.includes(lowerQuery)
    );
  }, [customers, searchQuery]);

  const handleSaveCustomer = async () => {
    if (!formData.name || formData.phone.length !== 10) {
      alert("Name and a 10-digit phone number are required.");
      return;
    }

    setIsSaving(true);
    try {
      // ✅ FIX: Cast to 'any' to bypass the TypeScript 'never' error
      const { error } = await (supabase.from('customers') as any).upsert({
        full_name: formData.name,
        phone_number: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        last_order_date: new Date().toISOString()
      }, { onConflict: 'phone_number' });

      if (error) throw error;
      
      alert('Customer saved to CRM successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', address: '', pincode: '' });
      fetchCustomers(); 

    } catch (err: any) {
      alert("Failed to save customer: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* CRM Header & Search */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" /> Customer CRM
            </h2>
            <p className="text-sm text-gray-500 mt-1">Manage your {customers.length} registered customers.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#1c1c1c] text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-black transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Add Customer
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or phone number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 border-dashed">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{customer.full_name}</h3>
                {customer.is_whatsapp_opted_in && (
                  <span className="bg-green-100 text-green-700 p-1.5 rounded-md" title="WhatsApp Opt-in">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                )}
              </div>
              
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <a href={`tel:${customer.phone_number}`} className="hover:text-blue-600">{customer.phone_number}</a>
                </div>
                {(customer.address || customer.pincode) && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{customer.address} {customer.pincode ? `(${customer.pincode})` : ''}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-4 h-4" />
                Last Order: {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'Unknown'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-900">Add Customer to CRM</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-900 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Full Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full mt-1 border rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Phone Number</label>
                  <input type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} className="w-full mt-1 border rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="10 digits" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Delivery Address</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full mt-1 border rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="Street, Building, Flat no." />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Pincode</label>
                  <input type="text" maxLength={6} value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '')})} className="w-full mt-1 border rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50" placeholder="e.g. 400089" />
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={handleSaveCustomer} disabled={isSaving}
                  className="w-full bg-[#1c1c1c] text-white font-bold h-12 rounded-xl shadow-md hover:bg-black transition-all flex justify-center items-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : "Save Customer"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};