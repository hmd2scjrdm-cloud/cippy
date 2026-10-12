import { randomBytes } from "node:crypto";
import { AwsClient } from "aws4fetch";

// Upload a file to the Cloudflare R2 bucket and return its public URL.
// `folder` keeps the bucket tidy (e.g. "shipment-photos"); the random part makes URLs unguessable.
export async function uploadToR2({ folder, fileName, buffer, contentType }) {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    throw new Error("R2 not configured");
  }
  const safeName = String(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}-${safeName}`;
  const client = new AwsClient({ accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, service: "s3", region: "auto" });
  const r = await client.fetch(`https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`, {
    method: "PUT",
    headers: { "Content-Type": contentType || "application/octet-stream" },
    body: buffer,
  });
  if (!r.ok) throw new Error(`R2 upload failed: ${r.status} ${await r.text().catch(() => "")}`);
  return `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}
