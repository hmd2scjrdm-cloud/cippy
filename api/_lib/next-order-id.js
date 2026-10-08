// Next order number = highest existing numeric order_id + 1.
// (Counting rows is unsafe: backfilled/manual orders and old duplicate test orders mean
// row count no longer tracks the highest number, which made new orders collide.)
// Needs the service role key — RLS hides other customers' orders from anon/user tokens.
export async function nextOrderId(supabaseUrl, serviceKey) {
  const r = await fetch(`${supabaseUrl}/rest/v1/orders?select=order_id&limit=10000`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
  });
  const rows = r.ok ? await r.json() : [];
  let max = 10009;
  for (const row of rows) {
    if (/^\d+$/.test(String(row.order_id || ""))) max = Math.max(max, parseInt(row.order_id, 10));
  }
  return String(max + 1);
}
