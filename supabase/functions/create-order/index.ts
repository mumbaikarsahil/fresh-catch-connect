import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// This allows your frontend (Vite) to talk to this backend function securely
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the amount sent from your CartPage
    const { amount } = await req.json();

    // 2. Get your Secret Keys from Supabase Vault (We will set this up next)
    const key = Deno.env.get('RAZORPAY_KEY_ID');
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key || !secret) {
      throw new Error("Missing Razorpay Keys");
    }

    // Convert amount to paise (e.g., ₹500 = 50000 paise)
    const orderData = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    };

    // 3. Talk to Razorpay securely using Basic Auth
    const basicAuth = btoa(`${key}:${secret}`);
    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(orderData),
    });

    const razorpayOrder = await razorpayRes.json();

    if (razorpayOrder.error) {
      throw new Error(razorpayOrder.error.description);
    }

    // 4. Return the Secure Order ID back to your CartPage
    return new Response(JSON.stringify(razorpayOrder), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});