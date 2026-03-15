// src/components/admin/AnalyticsDashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, Clock, Fish } from 'lucide-react';
import { cn } from '@/lib/utils';

// Local StatCard Component
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 shadow-card border border-border bg-white">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', color)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

interface AnalyticsProps {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  activeProductsCount: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ 
  totalRevenue, totalOrders, pendingOrders, activeProductsCount 
}) => {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-lg font-bold">Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={IndianRupee} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-blue-50 text-blue-600" />
        <StatCard icon={ShoppingBag} label="Orders" value={`${totalOrders}`} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Clock} label="Pending" value={`${pendingOrders}`} color="bg-yellow-50 text-yellow-600" />
        <StatCard icon={Fish} label="Active" value={`${activeProductsCount}`} color="bg-green-50 text-green-600" />
      </div>
    </div>
  );
};