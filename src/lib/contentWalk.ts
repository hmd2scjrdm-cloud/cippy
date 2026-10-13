// Shared by the shop (applying admin edits) and scripts/gen-content.mjs (listing editable fields),
// so a text's id is computed the same way in both places.
// Id = prefix + path: array entries use their `id` when they have one, otherwise their index.
const SKIP_KEYS = new Set(['id', 'type']);

const part = (el: unknown, index: number): string =>
  el && typeof el === 'object' && typeof (el as { id?: unknown }).id === 'string' ? (el as { id: string }).id : String(index);

export function walkContent(
  node: unknown,
  path: string,
  visit: (path: string, text: string, ancestors: unknown[], key: string) => void,
  ancestors: unknown[] = [],
): void {
  if (Array.isArray(node)) {
    node.forEach((el, i) => {
      if (typeof el === 'string') visit(`${path}.${i}`, el, ancestors, String(i));
      else walkContent(el, `${path}.${part(el, i)}`, visit, ancestors);
    });
  } else if (node && typeof node === 'object') {
    const next = [...ancestors, node];
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (SKIP_KEYS.has(key)) continue;
      if (typeof value === 'string') visit(`${path}.${key}`, value, next, key);
      else walkContent(value, `${path}.${key}`, visit, next);
    }
  }
}

export function applyContentOverrides<T>(data: T, prefix: string, overrides: Record<string, string>): T {
  if (!overrides || !Object.keys(overrides).length) return data;
  const clone = (node: unknown, path: string): unknown => {
    if (Array.isArray(node)) {
      return node.map((el, i) => (typeof el === 'string' ? pick(`${path}.${i}`, el) : clone(el, `${path}.${part(el, i)}`)));
    }
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
        if (SKIP_KEYS.has(key)) out[key] = value;
        else if (typeof value === 'string') out[key] = pick(`${path}.${key}`, value);
        else out[key] = clone(value, `${path}.${key}`);
      }
      return out;
    }
    return node;
  };
  const pick = (id: string, fallback: string) => {
    const v = overrides[id];
    return typeof v === 'string' && v !== '' ? v : fallback;
  };
  return clone(data, prefix) as T;
}
