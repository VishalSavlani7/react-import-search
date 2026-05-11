import admin from "../../../lib/firebase-admin";
import { supabase } from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const { uid, email } = decoded;

    const { error } = await supabase
      .from("users")
      .upsert({ uid, email }, { onConflict: "uid" });

    if (error) throw error;

    return res.status(200).json({ success: true, uid, email });
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
