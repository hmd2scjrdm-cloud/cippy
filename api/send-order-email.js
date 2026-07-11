import nodemailer from "nodemailer";

const SUPABASE_URL = "https://ilzeziznxzaxxudzhdmu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsemV6aXpueHpheHh1ZHpoZG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2Njk1ODMsImV4cCI6MjA5NzI0NTU4M30.NrfZ9tuDOHRkkeuotdF838ATIBsEkKa21LCpJ_AdQuI";

const currency = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
});

function cleanText(value, fallback = "") {
  return String(value ?? fallback).replace(/[<>]/g, "").trim();
}

function formatItems(items = []) {
  return items
    .map((item) => {
      const name = cleanText(item.name_zh || item.name || "Item");
      const details = [item.variant, item.color, item.size].filter(Boolean).map(cleanText).join(" / ");
      const qty = Number(item.qty || 1);
      const price = Number(item.price_myr || 0) * qty;
      return `- ${name}${details ? ` (${details})` : ""} x ${qty}: ${currency.format(price)}`;
    })
    .join("\n");
}

async function getVerifiedUser(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;
  return response.json();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { customer = {}, items = [], totals = {}, giftNote = "" } = req.body || {};
  const customerEmail = cleanText(customer.email).toLowerCase();
  const customerName = cleanText(customer.name, "Cippy customer");
  const phone = cleanText(customer.phone);
  const address = cleanText(customer.address);

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return res.status(500).json({ error: "Gmail SMTP is not configured in Vercel environment variables" });
  }
  if (!customerEmail || !customerEmail.includes("@")) {
    return res.status(400).json({ error: "Customer email is required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const user = await getVerifiedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Please sign in before checkout" });
  }
  if (!user.email_confirmed_at && !user.confirmed_at) {
    return res.status(403).json({ error: "Please verify your email before checkout" });
  }
  if (String(user.email || "").toLowerCase() !== customerEmail) {
    return res.status(403).json({ error: "Checkout email must match your verified account email" });
  }

  const orderId = `CIPPY-${Date.now().toString().slice(-8)}`;
  const subtotal = Number(totals.subtotal || 0);
  const shipping = Number(totals.shipping || 0);
  const total = Number(totals.total || subtotal + shipping);
  const itemLines = formatItems(items);
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || process.env.GMAIL_USER;

  const body = [
    `Order: ${orderId}`,
    "",
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    phone ? `Phone: ${phone}` : "",
    address ? `Address: ${address}` : "",
    "",
    "Items:",
    itemLines,
    "",
    `Subtotal: ${currency.format(subtotal)}`,
    `Shipping: ${shipping === 0 ? "FREE" : currency.format(shipping)}`,
    `Total: ${currency.format(total)}`,
    giftNote ? `\nGift note:\n${cleanText(giftNote)}` : "",
    "",
    "Thank you for shopping with Cippy.",
  ].filter(Boolean).join("\n");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Cippy <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      bcc: notifyEmail,
      subject: `Cippy order confirmation ${orderId}`,
      text: body,
    });

    return res.status(200).json({ success: true, orderId });
  } catch (error) {
    console.error("send-order-email error:", error);
    return res.status(500).json({ error: "Unable to send order email" });
  }
}
