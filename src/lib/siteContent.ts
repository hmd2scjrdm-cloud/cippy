import { useSyncExternalStore } from 'react';
import { supabase } from './supabase';
import { HOME_FIELDS } from '../data/homeContent';

// Texts edited in the admin "网站内容" page (settings table, key = 'site_content'): { [field id]: text }.
// Anything not edited falls back to the text written in the code.
let overrides: Record<string, string> = {};
const listeners = new Set<() => void>();

export async function loadSiteContent(): Promise<void> {
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'site_content').maybeSingle();
    if (!data?.value) return;
    const parsed = JSON.parse(data.value);
    if (parsed && typeof parsed === 'object') {
      overrides = parsed as Record<string, string>;
      listeners.forEach((l) => l());
    }
  } catch {
    // keep the built-in texts
  }
}

export function useSiteContent(): Record<string, string> {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => overrides,
  );
}

// Homepage text lookup: edited text if present, otherwise the default in homeContent.ts.
export function homeText(id: string, lang: 'en' | 'zh', content: Record<string, string>): string {
  const field = HOME_FIELDS.find((f) => f.id === id);
  const edited = content[`home.${id}.${lang}`];
  if (edited) return edited;
  return (field?.[lang] as string) ?? '';
}

export function homeImage(id: string, content: Record<string, string>): string {
  const field = HOME_FIELDS.find((f) => f.id === id);
  return content[`home.${id}.url`] || field?.image || '';
}
