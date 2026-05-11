import admin from "../../../lib/firebase-admin";
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;

  try {
    const { uid } = await admin.auth().verifyIdToken(token);

    const { data, error } = await supabase
      .from("users")
      .select("is_pro, email")
      .eq("uid", uid)
      .single();

    if (error) throw error;

    return res.status(200).json({ isPro: data.is_pro, email: data.email });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
