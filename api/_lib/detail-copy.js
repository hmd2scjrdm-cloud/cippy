import { GoogleGenAI } from '@google/genai';

export async function generateDetailCopy({ imageUrl, note }, res) {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: '请先在 Vercel 设置 GEMINI_API_KEY' });
  if (typeof note !== 'string' || !note.trim() || note.length > 1000) return res.status(400).json({ error: '请填写简短的观察重点' });
  let url;
  try { url = new URL(imageUrl); } catch { return res.status(400).json({ error: '图片链接无效' }); }
  const allowedOrigin = new URL(process.env.R2_PUBLIC_URL || 'https://pub-0c1693782698482098fa2ba7577d4409.r2.dev').origin;
  if (url.origin !== allowedOrigin || url.protocol !== 'https:') return res.status(400).json({ error: '请先把图片上传到后台，再生成文案' });

  try {
    const imageResponse = await fetch(url, { signal: AbortSignal.timeout(10000), redirect: 'error' });
    const type = imageResponse.headers.get('content-type') || '';
    const length = Number(imageResponse.headers.get('content-length') || 0);
    if (!imageResponse.ok || !/^image\/(jpeg|png|webp)$/.test(type.split(';')[0]) || length > 5_000_000) return res.status(400).json({ error: '图片必须是 5MB 以下的 JPG、PNG 或 WebP' });
    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length > 5_000_000) return res.status(400).json({ error: '图片太大' });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text: `You write concise, natural Malaysian women's fashion product detail copy. Use the image and seller's note: ${note.trim()}.
Return JSON with zh and en objects. Each has label (2-5 words), headline (short), explanation (1-2 sentences), points (2-3 short lines separated by newline). Both languages must convey the same factual information. Never invent fabric composition, measurements, stretch, lining, support, fit outcome, shipping, or other unverifiable claims. If a claim is not visible or specified in the note, omit it. Avoid exaggerated marketing and markdown.` }, { inlineData: { mimeType: type.split(';')[0], data: bytes.toString('base64') } }],
      config: { responseMimeType: 'application/json' }
    });
    const result = JSON.parse(response.text || '{}');
    for (const lang of ['zh', 'en']) {
      if (!result[lang] || !['label', 'headline', 'explanation', 'points'].every(key => typeof result[lang][key] === 'string')) throw new Error('Invalid generation response');
      for (const key of ['label', 'headline', 'explanation', 'points']) result[lang][key] = result[lang][key].slice(0, 1000);
    }
    return res.status(200).json({ zh: result.zh, en: result.en });
  } catch (error) {
    console.error('Detail copy generation failed:', error);
    return res.status(500).json({ error: '生成失败，请稍后重试或手动填写' });
  }
}
