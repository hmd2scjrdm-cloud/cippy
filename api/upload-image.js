import { AwsClient } from "aws4fetch";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const ADMIN_EMAIL = "cippy.kl@gmail.com";

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!admin || admin.email !== ADMIN_EMAIL) return res.status(403).json({ error: "无权限" });

  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    return res.status(500).json({ error: "R2 not configured" });
  }

  const { fileBase64, fileName, contentType } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: "Missing file" });

  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(fileBase64, "base64");

  try {
    const client = new AwsClient({
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      service: "s3",
      region: "auto",
    });
    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
    const r = await client.fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": contentType || "application/octet-stream" },
      body: buffer,
    });
    if (!r.ok) {
      const err = await r.text().catch(() => "");
      console.error("R2 upload failed:", r.status, err);
      return res.status(500).json({ error: "上传失败" });
    }
    const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    return res.status(200).json({ url: publicUrl });
  } catch (e) {
    console.error("R2 upload error:", e);
    return res.status(500).json({ error: "上传失败" });
  }
}
