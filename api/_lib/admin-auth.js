// Who counts as a back-office admin: the owner, plus anyone the owner added in the admin "设置 → 管理员" list
// (public.admins table). Mirrors public.is_admin() used by the database policies.
export const OWNER_EMAIL = "cippy.kl@gmail.com";

export async function isAdminUser(user, supabaseUrl, serviceKey) {
  const email = String(user?.email || "").toLowerCase();
  if (!email) return false;
  if (email === OWNER_EMAIL) return true;
  if (!serviceKey) return false;
  try {
    const r = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(email)}&select=email`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    return r.ok && (await r.json()).length > 0;
  } catch {
    return false;
  }
}
