export function splitStreetIntoLines(street: string): string[] {
  const remaining = street.trim();
  if (!remaining) return [];
  const lines: string[] = [];
  let text = remaining;
  while (text && lines.length < 3) {
    if (text.length <= 35) { lines.push(text); text = ''; break; }
    const segment = text.slice(0, 36);
    const splitAt = Math.max(segment.lastIndexOf(','), segment.lastIndexOf(' '));
    const cut = splitAt >= 15 ? splitAt : 35;
    lines.push(text.slice(0, cut).replace(/[,\s]+$/, ''));
    text = text.slice(cut).replace(/^[,\s]+/, '');
  }
  return text ? [] : lines;
}
