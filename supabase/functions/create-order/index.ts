import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ✅ CHANGED: Extract supabaseOrderId from the request
    const { amount, supabaseOrderId } = await req.json();

    const key = Deno.env.get('RAZORPAY_KEY_ID');
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!key || !secret) {
      throw new Error("Missing Razorpay Keys");
    }

    // ✅ CHANGED: Add receipt and notes to the Razorpay payload
    const orderData = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: supabaseOrderId, // Max 40 chars, Supabase UUID fits perfectly
      notes: {
        supabase_order_id: supabaseOrderId // This gets sent back in the webhook!
      }
    };

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
    if (razorpayOrder.error) throw new Error(razorpayOrder.error.description);

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