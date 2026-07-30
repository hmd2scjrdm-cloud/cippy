const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";
const ADMIN_EMAIL = "cippy.kl@gmail.com";

// Consolidated into one dynamic route ([action].js -> tracker / collect / stats)
// instead of three separate files: Vercel's Hobby plan caps serverless
// functions per deployment, and this project was already close to that limit.

function clip(v, max) {
  if (v == null) return null;
  return String(v).slice(0, max);
}

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

function serveTracker(req, res) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  const script = `(function(){
  var cs = document.currentScript;
  var siteId = (cs && cs.getAttribute('data-site-id')) || 'web-1';
  var endpoint = '/api/analytics/collect';

  function uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function getId(key, storage){
    try {
      var v = storage.getItem(key);
      if (!v) { v = uuid(); storage.setItem(key, v); }
      return v;
    } catch (e) { return uuid(); }
  }

  var visitorId = getId('cippy_vid', window.localStorage);
  var sessionId = getId('cippy_sid', window.sessionStorage);

  function send(payload){
    try {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function(){});
    } catch (e) {}
  }

  send({
    site_id: siteId,
    event_type: 'pageview',
    path: location.pathname + location.search,
    referrer: document.referrer || null,
    visitor_id: visitorId,
    session_id: sessionId
  });

  document.addEventListener('click', function(e){
    var el = e.target && e.target.closest ? e.target.closest('[data-track-conversion]') : null;
    if (!el) return;
    send({
      site_id: siteId,
      event_type: 'conversion',
      path: location.pathname + location.search,
      referrer: document.referrer || null,
      visitor_id: visitorId,
      session_id: sessionId,
      conversion_name: el.getAttribute('data-track-conversion')
    });
  }, true);
})();
`;
  res.status(200).send(script);
}

async function handleCollect(req, res) {
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

async function handleStats(req, res) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const admin = await getVerifiedUser(token);
  if (!admin || admin.email !== ADMIN_EMAIL) return res.status(403).json({ error: "无权限" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(500).json({ error: "Not configured" });

  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since5min = new Date(now - 5 * 60 * 1000).toISOString();

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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = String(req.query?.action || "").replace(/\.js$/, "");

  if (action === "tracker" && req.method === "GET") return serveTracker(req, res);
  if (action === "collect" && req.method === "POST") return handleCollect(req, res);
  if (action === "stats" && req.method === "GET") return handleStats(req, res);

  return res.status(404).json({ error: "Not found" });
}
