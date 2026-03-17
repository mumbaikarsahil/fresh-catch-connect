import React, { useEffect } from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Header } from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { Store, Target, MapPin, Fish, Award } from 'lucide-react';

// --- CUSTOM NATIVE INSTAGRAM COMPONENT ---
const InstagramReel = ({ url }: { url: string }) => {
  useEffect(() => {
    // Load Instagram's official embed script safely
    const scriptId = 'instagram-embed-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if ((window as any).instgrm) {
      // If script is already loaded, tell it to process new reels
      (window as any).instgrm.Embeds.process();
    }
  }, [url]);

  return (
    <div className="w-full max-w-[328px] mx-auto bg-white rounded-2xl overflow-hidden shadow-sm flex items-center justify-center min-h-[400px]">
      <blockquote
        className="instagram-media w-full"
        data-instgrm-permalink={`${url}?utm_source=ig_embed&ig_rid=1`}
        data-instgrm-version="14"
        style={{ background: '#FFF', border: 0, margin: 0, padding: 0, width: '100%' }}
      />
    </div>
  );
};
// -----------------------------------------

const About = () => {
  return (
    <ResponsiveLayout>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300">
        <Header />
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 pb-24 md:pb-16">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-4"
          >
            <Store className="w-8 h-8 text-blue-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6"
          >
            About The Fishy Mart
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 leading-relaxed"
          >
            A top player in Mumbai's seafood retail, acting as a one-stop destination for the freshest catches, servicing customers locally and across the city.
          </motion.p>
        </div>

        {/* Core Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          
          {/* Our Story */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg"><Award className="w-6 h-6 text-blue-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Our Journey</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Over the course of our journey, The Fishy Mart has established a firm foothold in the industry. We are widely known to provide top-tier service as dedicated Fish and Seafood Retailers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our core belief is that customer satisfaction is just as important as the quality of our products. This philosophy has helped us garner a vast and growing base of loyal customers.
            </p>
          </motion.div>

          {/* Team & Vision */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg"><Target className="w-6 h-6 text-blue-600" /></div>
              <h2 className="text-2xl font-bold text-gray-900">Vision & Team</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              We employ individuals who are deeply dedicated to their roles, putting in immense effort to achieve the common vision and larger goals of our company.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Looking to the near future, The Fishy Mart aims to expand its line of products and services to cater to an even larger client base across Mumbai.
            </p>
          </motion.div>
        </div>

        {/* INSTAGRAM REELS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Fish className="w-6 h-6 text-blue-600" /> Our Catch in Action
            </h2>
            <p className="text-gray-500 mt-2">Follow us on Instagram for the freshest updates</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 place-items-center">
            
            {/* Reel 1 */}
            <InstagramReel url="https://www.instagram.com/reel/DV3eEcLiGlq/" />

            {/* Reel 2 (Hidden on extra small mobile screens to save space) */}
            <div className="hidden sm:block w-full">
              <InstagramReel url="https://www.instagram.com/reel/DVNbKUuCDZT/" />
            </div>

            {/* Reel 3 (Hidden on tablets to keep grid balanced, visible on desktop) */}
            <div className="hidden md:block w-full">
              <InstagramReel url="https://www.instagram.com/reel/DVU9EEfCKTA/" />
            </div>

          </div>
        </motion.div>

        {/* Location Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center border border-gray-200"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-full mb-4 shadow-sm">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prominent Location</h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We occupy a prominent location in Mumbai, Navi Mumbai, Thane, Vasai- Virar and Mira Bhayandar. Commuting to us is an effortless task with various modes of transport readily available. You can easily locate us at <strong>Walia Compound Road, Chembur</strong>, making it highly accessible even for first-time visitors.
          </p>
        </motion.div>

      </main>
    </ResponsiveLayout>
  );
};

export default About;