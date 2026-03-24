import React from 'react';
import { Phone, Instagram, MapPin, Clock, ChevronRight, PackageSearch, Search, Info, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { WHATSAPP_NUMBER } from '@/data/products';
import logo from '@/assets/logo.jpg';
import { Link } from 'react-router-dom';

const Profile = () => {
  // Navigation Links Data
  const quickLinks = [
    { id: 'track', label: 'Track My Order', icon: PackageSearch, path: '/trackorder', color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'search', label: 'Search Menu', icon: Search, path: '/', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'contact', label: 'Contact Us', icon: PhoneCall, path: '/contact', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'about', label: 'About Us', icon: Info, path: '/about', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <ResponsiveLayout>
      <div className="px-4 py-8 lg:py-12 space-y-6 max-w-2xl mx-auto pb-24">
        
        {/* --- PROFILE HEADER CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden"
        >
          {/* Cover Photo / Gradient Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400" />
          
          <div className="px-6 pb-6 text-center relative">
            {/* Profile Avatar */}
            <img
              src={logo}
              alt="The Fishy Mart"
              className="w-24 h-24 rounded-full mx-auto -mt-12 object-cover border-4 border-background shadow-md bg-white"
            />
            
            <h1 className="text-2xl font-extrabold text-foreground mt-3 tracking-tight">
              The Fishy Mart
            </h1>
            
            <div className="mt-2">
              <span className="inline-block px-4 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                #FishKhaoOnlyFresh
              </span>
            </div>
          </div>
        </motion.div>

        {/* --- QUICK LINKS / APP MENU --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="divide-y divide-gray-100">
            {quickLinks.map((link) => (
              <Link 
                key={link.id} 
                to={link.path}
                className="flex items-center p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${link.bg} mr-4`}>
                  <link.icon className={`w-5 h-5 ${link.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{link.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* --- STORE INFO CARDS --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="font-bold text-gray-900 px-2 text-lg">Store Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Area Card */}
            <div className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-base">Delivery Area</p>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">Mumbai City, Suburban, Thane, Navi Mumbai, Vasai-Virar, Mira Bhayandar</p>
              </div>
            </div>

            {/* Delivery Time Card */}
            <div className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-base">Delivery Time</p>
                <p className="text-sm text-muted-foreground mt-0.5">Same day, before 2 PM</p>
              </div>
            </div>

            {/* Instagram Card */}
            <a
              href="https://instagram.com/the_fishy_mart"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all sm:col-span-2 md:col-span-1"
            >
              <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center shrink-0">
                <Instagram className="w-6 h-6 text-pink-500" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-foreground text-base">Follow Us</p>
                <p className="text-sm text-muted-foreground mt-0.5">@the_fishy_mart</p>
              </div>
            </a>
          </div>
        </motion.div>

        {/* Powered by Biillo Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8 text-center"
        >
          <a href="https://www.biillo.com" className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Powered by</span>
            <span className="text-xs font-bold text-gray-800 tracking-wide">BIILLO</span>
          </a>
        </motion.div>

      </div>
    </ResponsiveLayout>
  );
};

export default Profile;