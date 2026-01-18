import React from 'react';
import { Phone, Instagram, MapPin, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { CartDrawer } from '@/components/CartDrawer';
import { WHATSAPP_NUMBER } from '@/data/products';
import logo from '@/assets/logo.jpg';

const Profile = () => {
  const contactWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
  };

  return (
    <MobileLayout>
      <div className="p-4 space-y-6">
        {/* Business Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 text-center shadow-card"
        >
          <img
            src={logo}
            alt="The Fishy Mart"
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
          />
          <h1 className="text-xl font-bold text-card-foreground">The Fishy Mart</h1>
          <p className="text-primary font-medium text-sm">#FishKhaoOnlyFresh</p>
          <p className="text-muted-foreground text-sm mt-2">
            Fresh fish delivery across Mumbai. Quality you can trust.
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={contactWhatsApp}
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-whatsapp/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-whatsapp" />
            </div>
            <div className="text-left">
              <p className="font-medium text-card-foreground">Contact Us</p>
              <p className="text-sm text-muted-foreground">+91 9082165743</p>
            </div>
          </motion.button>

          <motion.a
            href="https://instagram.com/thefishymart"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-card-foreground">Follow Us</p>
              <p className="text-sm text-muted-foreground">@thefishymart</p>
            </div>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-card-foreground">Delivery Area</p>
              <p className="text-sm text-muted-foreground">All over Mumbai</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-card"
          >
            <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="text-left">
              <p className="font-medium text-card-foreground">Delivery Time</p>
              <p className="text-sm text-muted-foreground">Same day, before 2 PM</p>
            </div>
          </motion.div>
        </div>

        {/* Admin Link */}
        <motion.a
          href="/admin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-4"
        >
          <Shield className="w-4 h-4" />
          Admin Login
        </motion.a>
      </div>

      <CartDrawer />
    </MobileLayout>
  );
};

export default Profile;
