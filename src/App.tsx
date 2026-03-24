import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

import Index from "./pages/Index";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import CartPage from "./pages/CartPage";
import NotFound from "./pages/NotFound";
import OrderSuccess from "./pages/OrderSuccess";
import MaintenancePage from "./pages/MaintenancePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import TrackOrder from "./pages/TrackOrder";
import TermsPage from "./pages/TermsPage";

const queryClient = new QueryClient();

// We wrap the routing logic in this inner component to handle the maintenance check
const AppContent = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch initial status on load
    const checkStatus = async () => {
      try {
        const { data } = await (supabase.from("store_settings") as any)
          .select("is_maintenance")
          .eq("id", 1)
          .single();
          
        if (data) setIsMaintenance(data.is_maintenance);
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();

    // 2. Listen for real-time toggle changes from the Admin dashboard
    const subscription = supabase
      .channel("settings")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "store_settings" },
        (payload) => setIsMaintenance(payload.new.is_maintenance)
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdminRoute = window.location.pathname.startsWith("/admin");

  // Show a blank/loading screen for a split second while checking the database
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // THE INTERCEPTOR: If maintenance is ON, and they aren't trying to log into Admin
  if (isMaintenance && !isAdminRoute) {
    return <MaintenancePage />;
  }

  // Otherwise, load the app normally
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/search" element={<Search />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="/trackorder" element={<TrackOrder />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<TermsPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;