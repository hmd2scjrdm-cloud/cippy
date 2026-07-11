import nodemailer from "nodemailer";

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
