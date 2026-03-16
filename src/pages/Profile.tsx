import React from 'react';
import { Phone, Instagram, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { WHATSAPP_NUMBER } from '@/data/products';
import logo from '@/assets/logo.jpg';

const Profile = () => {
  const contactWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <ResponsiveLayout>
      <div className="px-4 py-8 lg:py-12 space-y-6 max-w-4xl mx-auto pb-24">
        
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden"
        >
          {/* Cover Photo / Gradient Banner */}
          <div className="h-32 lg:h-48 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400" />
          
          <div className="px-6 pb-8 lg:pb-10 text-center relative">
            {/* Profile Avatar */}
            <img
              src={logo}
              alt="The Fishy Mart"
              className="w-24 h-24 lg:w-32 lg:h-32 rounded-full mx-auto -mt-12 lg:-mt-16 object-cover border-4 border-background shadow-md bg-white"
            />
            
            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground mt-4 tracking-tight">
              The Fishy Mart
            </h1>
            
            <div className="mt-2.5">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs lg:text-sm font-bold uppercase tracking-wider rounded-full">
                #FishKhaoOnlyFresh
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm lg:text-base mt-4 max-w-lg mx-auto">
              Fresh fish delivery across Mumbai. Quality you can trust, right to your doorstep.
            </p>
          </div>
        </motion.div>

        {/* Info & Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          
          {/* Contact Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={contactWhatsApp}
            className="w-full group flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:border-whatsapp/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-whatsapp/10 flex items-center justify-center group-hover:bg-whatsapp group-hover:scale-110 transition-all duration-300">
              <Phone className="w-6 h-6 text-whatsapp group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-base">Contact Us</p>
              <p className="text-sm text-muted-foreground mt-0.5">+{WHATSAPP_NUMBER}</p>
            </div>
          </motion.button>

          {/* Instagram Card */}
          <motion.a
            href="https://instagram.com/thefishymart"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full group flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:border-pink-500/30 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-yellow-400 group-hover:via-pink-500 group-hover:to-purple-500 group-hover:scale-110 transition-all duration-300">
              <Instagram className="w-6 h-6 text-pink-500 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-base">Follow Us</p>
              <p className="text-sm text-muted-foreground mt-0.5">@thefishymart</p>
            </div>
          </motion.a>

          {/* Delivery Area Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-base">Delivery Area</p>
              <p className="text-sm text-muted-foreground mt-0.5">All over Mumbai City, Suburban, Thane city, Navi Mumbai, Vasai virar, Mira Bhayandar, </p>
            </div>
          </motion.div>

          {/* Delivery Time Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 bg-card rounded-2xl p-5 border border-border shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-foreground text-base">Delivery Time</p>
              <p className="text-sm text-muted-foreground mt-0.5">Same day, before 2 PM</p>
            </div>
          </motion.div>
          
        </div>

        {/* ✅ ADDED: Powered by Biillo Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-8 pb-4 text-center flex flex-col items-center justify-center space-y-1"
        >
          <p className="text-sm text-muted-foreground">
            Powered by{' '}
            <a
              href="https://biillo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-foreground hover:text-blue-600 transition-colors"
            >
              Biillo
            </a>
          </p>
        </motion.div>

      </div>
    </ResponsiveLayout>
  );
};

export default Profile;