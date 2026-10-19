const STATE_CODES = {
  johor: "jhr", kedah: "kdh", kelantan: "ktn", melaka: "mlk", malacca: "mlk",
  "negeri sembilan": "nsn", pahang: "phg", perak: "prk", perlis: "pls",
  penang: "png", "pulau pinang": "png", sabah: "sbh", sarawak: "srw",
  selangor: "sgr", terengganu: "trg", "kuala lumpur": "kul", putrajaya: "pjy",
  labuan: "lbn",
};

export function stateCode(value) {
  const clean = String(value || "").trim().toLowerCase();
  if (/^[a-z]{3}$/.test(clean)) return clean;
  return STATE_CODES[clean] || "";
}

export function easyParcelConfig() {
  const live = String(process.env.EASYPARCEL_MODE || "demo").toLowerCase() === "live";
  return {
    apiKey: process.env.EASYPARCEL_API_KEY || "",
    baseUrl: live ? "https://connect.easyparcel.my/" : "https://demo.connect.easyparcel.my/",
    mode: live ? "live" : "demo",
    sender: {
      name: process.env.EASYPARCEL_SENDER_NAME || "",
      company: process.env.EASYPARCEL_SENDER_COMPANY || "Cippy",
      phone: process.env.EASYPARCEL_SENDER_PHONE || "",
      address1: process.env.EASYPARCEL_SENDER_ADDRESS1 || "",
      address2: process.env.EASYPARCEL_SENDER_ADDRESS2 || "",
      city: process.env.EASYPARCEL_SENDER_CITY || "",
      state: stateCode(process.env.EASYPARCEL_SENDER_STATE),
      postcode: process.env.EASYPARCEL_SENDER_POSTCODE || "",
    },
  };
}

function appendValue(params, key, value) {
  if (value === undefined || value === null) return;
  params.append(key, String(value));
}

export function formBody(payload) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((row, index) => {
        if (row && typeof row === "object") {
          Object.entries(row).forEach(([field, fieldValue]) => appendValue(params, `${key}[${index}][${field}]`, fieldValue));
        } else {
          appendValue(params, `${key}[${index}]`, row);
        }
      });
    } else {
      appendValue(params, key, value);
    }
  });
  return params;
}

export async function easyParcelCall(config, action, payload) {
  const response = await fetch(`${config.baseUrl}?ac=${encodeURIComponent(action)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody({ api: config.apiKey, ...payload }),
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { throw new Error("EasyParcel returned an unreadable response"); }
  if (!response.ok || String(json.api_status || "").toLowerCase() === "error") {
    throw new Error(json.error_remark || `EasyParcel request failed (${response.status})`);
  }
  return json;
}

export function validateConfig(config) {
  if (!config.apiKey) return "EASYPARCEL_API_KEY is not configured";
  const missing = Object.entries(config.sender).filter(([key, value]) => key !== "address2" && !value).map(([key]) => key);
  return missing.length ? `Missing EasyParcel sender settings: ${missing.join(", ")}` : "";
}

