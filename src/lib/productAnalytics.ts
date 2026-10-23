const seenImpressions = new Set<string>();

function id(key: string, storage: Storage): string {
  let value = storage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    storage.setItem(key, value);
  }
  return value;
}

function sendProductEvent(type: 'product_impression' | 'product_view', productId: string) {
  if (!productId) return;
  try {
    const payload = JSON.stringify({
      site_id: 'web-1', event_type: type, path: `product:${productId}`,
      visitor_id: id('cippy_vid', localStorage), session_id: id('cippy_sid', sessionStorage),
    });
    fetch('/api/analytics/collect', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never interrupt shopping.
  }
}

export function trackProductImpression(productId: string) {
  if (seenImpressions.has(productId)) return;
  seenImpressions.add(productId);
  sendProductEvent('product_impression', productId);
}

export function trackProductView(productId: string) {
  sendProductEvent('product_view', productId);
}
