const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const ADMIN_EMAIL = "cippy.kl@gmail.com";

async function getVerifiedUser(token) {
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  return r.ok ? r.json() : null;
}

async function fetchRows(serviceKey, query) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/analytics_events?${query}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  if (!r.ok) return [];
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!admin || admin.email !== ADMIN_EMAIL) return res.status(403).json({ error: "无权限" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });

  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since5min = new Date(now - 5 * 60 * 1000).toISOString();

  // MVP-scale aggregation done in JS after a capped fetch — fine for a boutique
  // site's traffic; would need a Postgres RPC/materialized view past a few
  // thousand events/day.
  const [recent24h, activeNow] = await Promise.all([
    fetchRows(serviceKey, `select=event_type,path,visitor_id,session_id,conversion_name,created_at&created_at=gte.${since24h}&order=created_at.desc&limit=5000`),
    fetchRows(serviceKey, `select=visitor_id&event_type=eq.pageview&created_at=gte.${since5min}&limit=2000`),
  ]);

  const pageviews = recent24h.filter(r => r.event_type === "pageview");
  const conversions = recent24h.filter(r => r.event_type === "conversion");

  const uv = new Set(pageviews.map(r => r.visitor_id)).size;
  const pv = pageviews.length;
  const activeVisitors = new Set(activeNow.map(r => r.visitor_id)).size;

  const sessionsWithPageview = new Map();
  for (const r of pageviews) {
    sessionsWithPageview.set(r.session_id, (sessionsWithPageview.get(r.session_id) || 0) + 1);
  }
  const totalSessions = sessionsWithPageview.size;
  const bouncedSessions = [...sessionsWithPageview.values()].filter(c => c === 1).length;
  const bounceRate = totalSessions > 0 ? bouncedSessions / totalSessions : 0;

  const convertedSessions = new Set(conversions.map(r => r.session_id));
  const sessionsThatConverted = [...convertedSessions].filter(s => sessionsWithPageview.has(s)).length;
  const conversionRate = totalSessions > 0 ? sessionsThatConverted / totalSessions : 0;

  const pathCounts = {};
  for (const r of pageviews) {
    if (!r.path) continue;
    pathCounts[r.path] = (pathCounts[r.path] || 0) + 1;
  }
  const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([path, count]) => ({ path, count }));

  const conversionCounts = {};
  for (const r of conversions) {
    const name = r.conversion_name || "(未命名)";
    conversionCounts[name] = (conversionCounts[name] || 0) + 1;
  }
  const topConversions = Object.entries(conversionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  return res.status(200).json({
    windowHours: 24,
    activeVisitors,
    uv,
    pv,
    bounceRate,
    conversionRate,
    totalConversions: conversions.length,
    topPaths,
    topConversions,
  });
}
