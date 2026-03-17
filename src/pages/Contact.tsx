import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { PhoneCall, MapPin, MessageCircle, Clock, Mail, Fish } from 'lucide-react';

const Contact = () => {
  const WHATSAPP_NUMBER = "919082165743";
  const PHONE_NUMBER = "+919082165743";
  const WHATSAPP_MESSAGE = "Hi! I need some help with my order from The Fishy Mart.";

  return (
    <ResponsiveLayout>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300">
        <Header />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-24 md:pb-16">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4"
          >
            <Fish className="w-8 h-8 text-blue-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-gray-500"
          >
            Have a question about today's catch or need help with an order? We're just a call or message away!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Left Column: Contact Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Primary Support Card (Highlighted) */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Customer Support</h2>
              <p className="text-gray-500 text-sm mb-6">Instant support for your orders and inquiries.</p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#1c1c1c] hover:bg-black text-white py-3.5 px-4 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-md"
                >
                  <PhoneCall className="w-5 h-5" />
                  Call +91 90821 65743
                </a>
                <a 
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-semibold transition-all active:scale-[0.98] shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm shrink-0">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Our Store</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  The Fishy Mart<br />
                  Shop no 25, Prakash Thorat Marg,<br />
                  nr. Railway station, Sahadeep Colony,<br />
                  Chembur West, Ramabai Colony,<br />
                  Chembur, Mumbai, Maharashtra 400089
                </p>
              </div>
            </div>

            {/* Timings & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Store Hours</h3>
                  <p className="text-gray-500 text-xs">Mon - Sun<br/>8:00 AM - 9:00 PM</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">Email Us</h3>
                  <a href="mailto:support@thefishymart.in" className="text-blue-600 hover:underline text-xs">
                    support@thefishymart.in
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Embedded Map */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }}
            className="h-[300px] lg:h-full min-h-[400px] bg-gray-200 rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative"
          >
            {/* Google Maps Embed using the specific address provided */}
            {/* Google Maps Embed using the specific address provided */}
          <iframe 
            src="https://maps.google.com/maps?q=3W63%2BV3%20Mumbai%2C%20Maharashtra&t=&z=16&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="The Fishy Mart Location"
            className="absolute inset-0"
          ></iframe>
          </motion.div>

        </div>
      </main>
    </ResponsiveLayout>
  );
};

export default Contact;