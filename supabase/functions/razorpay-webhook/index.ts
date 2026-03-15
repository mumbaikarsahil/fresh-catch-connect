import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const bodyText = await req.text();
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!signature || !secret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    // Verify the Razorpay Signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyText));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signatureHex !== signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(bodyText);
    
    // Check if it's a successful payment event
    if (payload.event === "payment.captured" || payload.event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const supabaseOrderId = paymentEntity.notes?.supabase_order_id;
      const paymentId = paymentEntity.id;

      if (supabaseOrderId) {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

        // 1. Update the order AND select the updated row data using .select().single()
        const { data: orderData, error } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "confirmed",
            payment_id: paymentId
          })
          .eq("id", supabaseOrderId)
          .select()
          .single();

        if (error) throw error;

        // 2. SEND TELEGRAM NOTIFICATION
        if (orderData) {
          const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
          const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

          if (telegramToken && telegramChatId) {
            // Format the items list nicely
            const itemsList = orderData.items.map((item: any) => 
              `• ${item.quantity_kg ? item.quantity_kg + 'kg' : item.quantity + 'x'} <b>${item.name}</b> (₹${item.price * (item.quantity_kg || item.quantity)})`
            ).join('\n');

            // Construct the message using HTML parse mode for bolding
            const message = `
🚨 <b>NEW PAID ORDER!</b> 🚨
<b>ID:</b> #${String(orderData.id).slice(0, 8).toUpperCase()}
<b>Amount:</b> ₹${orderData.total_amount}

👤 <b>Customer Details:</b>
<b>Name:</b> ${orderData.customer_name}
<b>Phone:</b> ${orderData.phone_number}
<b>Time:</b> ${orderData.delivery_preference?.replace(/_/g, ' ').toUpperCase()}

📦 <b>Items:</b>
${itemsList}

📍 <b>Delivery Address:</b>
${orderData.delivery_address}
            `;

            // Send the request to Telegram API
            await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'HTML'
              })
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: "success" }), { status: 200 });
    
  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});