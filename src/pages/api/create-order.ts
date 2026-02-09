import Razorpay from 'razorpay';
import type { NextApiRequest, NextApiResponse } from 'next';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works in paise (₹500 = 50000 paise)
      currency: 'INR',
      receipt: 'order_' + Date.now(),
    };

    try {
      const order = await razorpay.orders.create(options);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: 'Error creating Razorpay order' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}