import { supabase } from "../../../lib/supabase";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];
    const rawBody = JSON.stringify(req.body);

    const signedPayload = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_SECRET_KEY)
      .update(signedPayload)
      .digest("base64");

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { data } = req.body;

    if (data?.order?.order_status === "PAID") {
      const uid = data.order.order_tags?.uid;

      if (uid) {
        await supabase
          .from("users")
          .update({
            is_pro: true,
            pro_since: new Date().toISOString(),
          })
          .eq("uid", uid);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
