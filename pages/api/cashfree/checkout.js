// import admin from "../../../lib/firebase-admin";
// import { supabase } from "../../../lib/supabase";
// import { cashfreeConfig } from "../../../lib/cashfree";

// export default async function handler(req, res) {
//   if (req.method !== "POST")
//     return res.status(405).json({ error: "Method not allowed" });

//   const { token } = req.body;

//   try {
//     const { uid, email } = await admin.auth().verifyIdToken(token);

//     // ✅ supabase is used here — fetch user data
//     const { data: user, error: fetchError } = await supabase
//       .from("users")
//       .select("uid")
//       .eq("uid", uid)
//       .single();

//     // If user doesn't exist yet, create them
//     if (fetchError || !user) {
//       await supabase
//         .from("users")
//         .upsert({ uid, email }, { onConflict: "uid" });
//     }

//     const orderData = {
//       order_id: `ORDER_${uid}_${Date.now()}`,
//       order_amount: 999,
//       order_currency: "INR",
//       customer_details: {
//         customer_id: uid,
//         customer_email: email,
//         customer_phone: "9999999999",
//       },
//       order_meta: {
//         return_url: `${process.env.NEXT_PUBLIC_URL}/api/cashfree/verify?order_id={order_id}`,
//         notify_url: `${process.env.NEXT_PUBLIC_URL}/api/cashfree/webhook`,
//       },
//       order_tags: { uid },
//     };

//     const response = await fetch(`${cashfreeConfig.baseUrl}/pg/orders`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "x-api-version": "2025-01-01",
//         "x-client-id": cashfreeConfig.appId,
//         "x-client-secret": cashfreeConfig.secretKey,
//       },
//       body: JSON.stringify(orderData),
//     });

//     const order = await response.json();

//     if (!order.payment_session_id) {
//       throw new Error("Failed to create order");
//     }

//     return res.status(200).json({
//       orderId: order.order_id,
//       paymentSessionId: order.payment_session_id,
//     });
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// }
import { Cashfree, CFEnvironment } from "cashfree-pg";
import admin from "../../../lib/firebase-admin";
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token } = req.body;

    const { uid, email } = await admin.auth().verifyIdToken(token);

    // Cashfree config
    Cashfree.XClientId = process.env.CASHFREE_APP_ID;
    Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY;
    Cashfree.XEnvironment = CFEnvironment.SANDBOX;

    await supabase.from("users").upsert({ uid, email }, { onConflict: "uid" });

    const orderRequest = {
      order_amount: 999,
      order_currency: "INR",
      order_id: `ORDER_${uid}_${Date.now()}`,

      customer_details: {
        customer_id: uid,
        customer_email: email,
        customer_phone: "9999999999",
      },

      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_URL}/payment-success?order_id={order_id}`,
      },
    };

    const response = await Cashfree.PGCreateOrder("2023-08-01", orderRequest);

    return res.status(200).json({
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);

    return res.status(500).json({
      error: err?.response?.data || err.message,
    });
  }
}
