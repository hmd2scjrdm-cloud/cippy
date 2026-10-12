import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';

// Store settings edited in the admin "设置" page (settings table, key = 'site_config').
export interface SiteConfig {
  shippingWest: number;
  shippingEast: number;
  freeShippingMin: number;
}

const DEFAULTS: SiteConfig = { shippingWest: 10, shippingEast: 15, freeShippingMin: 150 };

let current: SiteConfig = DEFAULTS;
const listeners = new Set<() => void>();

const money = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export async function loadSiteConfig(): Promise<void> {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'site_config').maybeSingle();
    if (!data?.value) return;
    const raw = JSON.parse(data.value);
    current = {
      shippingWest: money(raw.shipping_west, DEFAULTS.shippingWest),
      shippingEast: money(raw.shipping_east, DEFAULTS.shippingEast),
      freeShippingMin: money(raw.free_shipping_min, DEFAULTS.freeShippingMin),
    };
    listeners.forEach((l) => l());
  } catch {
    // Keep the defaults; the server recalculates shipping at checkout anyway.
  }
}

export function useSiteConfig(): SiteConfig {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => current,
  );
}
