import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Scale, Truck, AlertTriangle, ThermometerSnowflake, FileText } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

export default function TermsPage() {
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <ResponsiveLayout hideFloatingCart={false} showBottomNav={true}>
      <div className="min-h-screen bg-[#f4f5f7] pb-24">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm px-4 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Terms & Conditions</h1>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-6 md:p-8 space-y-8">
            
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">The Fishy Mart Policies</h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Last Updated: March 2026. By placing an order with The Fishy Mart, you agree to the following terms and guidelines. Our priority is delivering the freshest seafood to your kitchen.
              </p>
            </div>

            {/* Section 1: Product & Quality */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">1. Product Quality & Sourcing</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed marker:text-gray-300">
                <li>All our products are sourced fresh daily from local docks and trusted suppliers.</li>
                <li>Fish and seafood are natural products; therefore, slight variations in size, texture, and natural oceanic odor are completely normal and inherent to fresh catch.</li>
                <li>For guaranteed availability of specific items, orders must be placed at least <strong>1 day in advance</strong>.</li>
                <li>We maintain a strict cold chain, utilizing proper ice packing methods to ensure the fish remains completely fresh during transit.</li>
              </ul>
            </div>

            {/* Section 2: Pricing & Weight */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-600">
                <Scale className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">2. Pricing, Cleaning & Weights</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed marker:text-gray-300">
                <li>Seafood prices are highly dependent on the daily market catch, weather conditions, and availability. Prices may fluctuate without prior notice.</li>
                <li>Fish cleaning, scaling, and custom cutting are provided as per your request. However, slight variations in the final cut may occur.</li>
                <li><strong>Gross vs. Net Weight:</strong> The weight you are billed for is the "Gross Weight" (the weight of the whole, uncut fish). Depending on the cleaning and cutting style requested, the final "Net Weight" delivered to you will be lower (typically a 20% to 40% reduction due to the removal of scales, gills, guts, and fins).</li>
              </ul>
            </div>

            {/* Section 3: Delivery Guidelines */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <Truck className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">3. Delivery Guidelines</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed marker:text-gray-300">
                <li>Delivery is currently available in selected operational areas only.</li>
                <li>Standard Morning Delivery slots are between <strong>6:00 AM and 10:00 AM</strong>. Please note that exact timings may vary depending on local traffic, location, and daily order volumes.</li>
                <li><strong>Customer Availability:</strong> Because seafood is highly perishable, please ensure someone is available at the delivery address to receive the order during your selected time slot.</li>
                <li>If the customer is unreachable or unavailable upon arrival:
                  <ul className="list-[circle] pl-5 mt-1 space-y-1">
                    <li>The order will be left at the doorstep (only if explicitly instructed by the customer prior to delivery).</li>
                    <li>Otherwise, the delivery will be cancelled and <strong>no refund</strong> will be issued due to the perishable nature of the goods.</li>
                  </ul>
                </li>
              </ul>
            </div>

            {/* Section 4: Cancellations & Refunds */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-500">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">4. Order Cancellations</h3>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 leading-relaxed marker:text-gray-300">
                <li>Once an order is confirmed and processing begins, <strong>cancellation is not allowed on the day of delivery</strong>.</li>
                <li>The Fishy Mart reserves the right to cancel any order prior to dispatch due to unforeseen stock unavailability or poor daily catch quality. In such events, the customer will be notified immediately and a <strong>full refund</strong> will be issued to the original payment method.</li>
              </ul>
            </div>

            {/* Section 5: Storage & Safety */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-500">
                <ThermometerSnowflake className="w-5 h-5" />
                <h3 className="font-bold text-gray-900 text-lg">5. Storage & Safety</h3>
              </div>
              <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-4">
                <div className="flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-cyan-900 leading-relaxed font-medium">
                    Once the delivery is completed, the responsibility of maintaining the cold chain shifts to the customer. Please unpack and store your fish in a refrigerator or freezer <strong>immediately</strong> after receiving it to maintain optimal freshness and prevent spoilage.
                  </p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="text-center pb-8">
            <p className="text-xs text-gray-400">
              For any queries regarding these terms, please contact our support team.
            </p>
          </div>

        </div>
      </div>
    </ResponsiveLayout>
  );
}