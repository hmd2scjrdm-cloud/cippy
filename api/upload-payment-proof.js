import { uploadToR2 } from "./_lib/r2.js";

export const config = {
  api: { bodyParser: { sizeLimit: "6mb" } },
};

// Customers upload a DuitNow / bank-transfer screenshot at checkout (before they have an account),
// so this endpoint is public: it only accepts images or PDFs. Files are stored in Cloudflare R2.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { fileBase64, fileName, contentType } = req.body || {};
  if (!fileBase64 || !fileName) return res.status(400).json({ error: "Missing file" });
  if (!/^(image\/|application\/pdf$)/.test(String(contentType || ""))) {
    return res.status(400).json({ error: "只能上传图片或 PDF" });
  }

  try {
    const url = await uploadToR2({ folder: "payment-proofs", fileName, buffer: Buffer.from(fileBase64, "base64"), contentType });
    return res.status(200).json({ url });
  } catch (e) {
    console.error("Payment proof upload failed:", e.message);
    return res.status(500).json({ error: "上传失败" });
  }
}
