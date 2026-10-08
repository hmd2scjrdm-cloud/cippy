import manifest from './optimizedImages.json';

const R2_BASE = 'https://pub-0c1693782698482098fa2ba7577d4409.r2.dev/';
const optimized = manifest as Record<string, string>;

// Original R2 uploads are 2–13 MB. /opt/*.webp are 1200px-max WebP copies of them (public/opt).
// Anything not in the manifest (e.g. fresh admin uploads, already compressed on upload) is left as is.
export function opt(url?: string | null): string {
  if (!url) return url || '';
  if (!url.startsWith(R2_BASE)) return url;
  const local = optimized[url.slice(R2_BASE.length)];
  return local ? `/opt/${local}` : url;
}

export function optAll(urls: unknown): string[] {
  return Array.isArray(urls) ? urls.map((u) => opt(String(u))) : [];
}
