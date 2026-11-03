import { readFile } from 'node:fs/promises';
import { isAdminUser } from './_lib/admin-auth.js';
import { renderOrderSheetPdf } from './_lib/order-sheet-pdf.js';

const SUPABASE_URL = 'https://ilzeziznxzaxxudzhdmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return res.status(503).json({ error: '订单服务尚未配置' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(403).json({ error: '请先登录管理员账号' });
  try {
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    const user = userResponse.ok ? await userResponse.json() : null;
    if (!(await isAdminUser(user, SUPABASE_URL, serviceKey))) return res.status(403).json({ error: '无权限' });
    const orderId = String(req.body?.orderId || '');
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(orderId)) return res.status(400).json({ error: '订单编号无效' });
    const orderResponse = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    });
    if (!orderResponse.ok) return res.status(502).json({ error: '读取订单失败' });
    const order = (await orderResponse.json())[0];
    if (!order) return res.status(404).json({ error: '找不到订单' });
    const font = await readFile(new URL('../assets/NotoSansCJKsc-Regular.otf', import.meta.url));
    const pdf = await renderOrderSheetPdf(order, font);
    const safeId = String(order.order_id || order.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cippy-order-${safeId}-4x6.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    return res.status(200).send(pdf);
  } catch (error) {
    console.error('order sheet PDF failed', error);
    return res.status(500).json({ error: '订单 PDF 生成失败，请稍后重试' });
  }
}
