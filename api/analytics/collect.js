const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";

function clip(v, max) {
  if (v == null) return null;
  return String(v).slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });

  const body = req.body || {};
  const eventType = body.event_type === "conversion" ? "conversion" : body.event_type === "pageview" ? "pageview" : null;
  if (!eventType || !body.visitor_id || !body.session_id) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const row = {
    site_id: clip(body.site_id, 64) || "web-1",
    event_type: eventType,
    path: clip(body.path, 512),
    referrer: clip(body.referrer, 512),
    visitor_id: clip(body.visitor_id, 128),
    session_id: clip(body.session_id, 128),
    conversion_name: clip(body.conversion_name, 128),
  };

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      const err = await r.text().catch(() => "");
      console.error("analytics collect insert failed:", r.status, err);
      return res.status(500).json({ error: "Insert failed" });
    }
    return res.status(204).end();
  } catch (e) {
    console.error("analytics collect error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
