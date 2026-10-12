// Store settings edited in the admin "设置" page (settings table, key = 'site_config').
// Public-readable, so the anon key is enough. Falls back to the launch defaults if the row is
// missing or unreadable so checkout never breaks on a settings problem.
export const DEFAULT_SITE_CONFIG = {
  shipping_west: 10,
  shipping_east: 15,
  free_shipping_min: 150,
  company_name: "",
  ssm_no: "",
  company_address: "",
  email_signoff: "",
};

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function getSiteConfig(supabaseUrl, anonKey) {
  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/settings?key=eq.site_config&select=value`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const [row] = r.ok ? await r.json() : [];
    const raw = row?.value ? JSON.parse(row.value) : {};
    const d = DEFAULT_SITE_CONFIG;
    return {
      shipping_west: num(raw.shipping_west, d.shipping_west),
      shipping_east: num(raw.shipping_east, d.shipping_east),
      free_shipping_min: num(raw.free_shipping_min, d.free_shipping_min),
      company_name: String(raw.company_name || ""),
      ssm_no: String(raw.ssm_no || ""),
      company_address: String(raw.company_address || ""),
      email_signoff: String(raw.email_signoff || ""),
    };
  } catch {
    return { ...DEFAULT_SITE_CONFIG };
  }
}

export function shippingFee(config, merchandiseSubtotal, isEast) {
  if (merchandiseSubtotal >= config.free_shipping_min) return 0;
  return isEast ? config.shipping_east : config.shipping_west;
}

const esc = (v) => String(v ?? "").replace(/[<>&"]/g, "");

// Sign-off + company details block for the bottom of every customer email.
export function emailCompanyFooterHtml(config, color = "#9ca3af") {
  const lines = [];
  const company = [config.company_name, config.ssm_no ? `SSM ${config.ssm_no}` : ""].filter(Boolean).join(" · ");
  if (company) lines.push(esc(company));
  if (config.company_address) lines.push(esc(config.company_address).replace(/\n/g, "<br/>"));
  return `<p style="margin:0 0 6px;font-size:12px;color:${color};">— ${esc(config.email_signoff) || "The Cippy team"}</p>` +
    (lines.length ? `<p style="margin:0 0 8px;font-size:11px;line-height:1.6;color:${color};">${lines.join("<br/>")}</p>` : "");
}
