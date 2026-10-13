import { uploadToR2 } from "./_lib/r2.js";
import { isAdminUser } from "./_lib/admin-auth.js";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

// Shipment photos (attached to the shipped email) are stored in Cloudflare R2.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!(await isAdminUser(admin, SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))) return res.status(403).json({ error: "无权限" });

  const { fileBase64, fileName, contentType } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: "Missing file" });

  try {
    const url = await uploadToR2({ folder: "shipment-photos", fileName, buffer: Buffer.from(fileBase64, "base64"), contentType });
    return res.status(200).json({ url });
  } catch (e) {
    console.error("Shipment photo upload failed:", e.message);
    return res.status(500).json({ error: "上传失败" });
  }
}
