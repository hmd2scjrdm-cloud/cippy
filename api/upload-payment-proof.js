const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const BUCKET = "payment-proofs";

export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

async function ensureBucket(serviceKey) {
  await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  }).catch(() => {});
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Storage not configured" });

  const { fileBase64, fileName, contentType } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: "Missing file" });

  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;
  const buffer = Buffer.from(fileBase64, "base64");

  const doUpload = () =>
    fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": contentType || "application/octet-stream",
      },
      body: buffer,
    });

  let uploadRes = await doUpload();
  if (!uploadRes.ok) {
    // Bucket may not exist yet — create it once, then retry.
    await ensureBucket(serviceKey);
    uploadRes = await doUpload();
  }

  if (!uploadRes.ok) {
    const err = await uploadRes.text().catch(() => "");
    console.error("Payment proof upload failed:", uploadRes.status, err);
    return res.status(500).json({ error: "上传失败" });
  }

  return res.status(200).json({ url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` });
}
