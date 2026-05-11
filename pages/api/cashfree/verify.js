import { supabase } from "../../../lib/supabase";
import { cashfreeConfig } from "../../../lib/cashfree";

export default async function handler(req, res) {
  const { order_id } = req.query;

  try {
    const response = await fetch(
      `${cashfreeConfig.baseUrl}/pg/orders/${order_id}`,
      {
        headers: {
          "x-api-version": "2023-08-01",
          "x-client-id": cashfreeConfig.appId,
          "x-client-secret": cashfreeConfig.secretKey,
        },
      },
    );

    const order = await response.json();

    if (order.order_status === "PAID") {
      const uid = order.order_tags?.uid;

      await supabase
        .from("users")
        .update({
          is_pro: true,
          pro_since: new Date().toISOString(),
        })
        .eq("uid", uid);

      return res.redirect("/success");
    }

    return res.redirect("/cancel");
  } catch (err) {
    return res.redirect("/cancel");
  }
}
