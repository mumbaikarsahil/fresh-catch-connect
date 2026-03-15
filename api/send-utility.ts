// api/send-utility.ts
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { phoneNumbers, templateName } = req.body;
    const token = process.env.META_ACCESS_TOKEN;
    const phoneId = process.env.PHONE_NUMBER_ID;
  
    try {
      // Loop through the numbers and send the template
      for (const number of phoneNumbers) {
        await fetch(`https://graph.facebook.com/v22.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: number,
            type: "template",
            template: {
              name: templateName,
              language: { code: "en_US" } // Change based on your approved template
            }
          }),
        });
      }
  
      return res.status(200).json({ success: true, message: 'Broadcast sent!' });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send messages' });
    }
  }