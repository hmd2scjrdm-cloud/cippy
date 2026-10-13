// Lists every text on the shop that can be edited in the admin and writes public/content-defaults.json
// (the admin page reads it). Runs before `vite build`; the output is committed so `npm run dev` works too.
import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = mkdtempSync(join(tmpdir(), 'gen-content-'));
const bundle = async (entry, name) => {
  const outfile = join(dir, name);
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'silent' });
  return import(pathToFileURL(outfile).href);
};

const { POLICIES, FAQS } = await bundle('src/data/policies.ts', 'policies.mjs');
const { HOME_FIELDS } = await bundle('src/data/homeContent.ts', 'home.mjs');
const { walkContent } = await bundle('src/lib/contentWalk.ts', 'walk.mjs');

const FIELD_LABEL = {
  zhTitle: '栏目标题（中文）', enTitle: '栏目标题（英文）', zhIntro: '栏目简介（中文）', enIntro: '栏目简介（英文）',
  titleZh: '小标题（中文）', titleEn: '小标题（英文）', textZh: '正文（中文）', textEn: '正文（英文）',
  qZh: '问题（中文）', qEn: '问题（英文）', aZh: '回答（中文）', aEn: '回答（英文）',
};
const langOf = (k) => (/Zh$|^zh$/.test(k) ? '中文' : '英文');
const long = (t) => t.length > 70 || t.includes('\n');

const groups = [];

for (const section of POLICIES) {
  const out = [];
  walkContent(section, `policy.${section.id}`, (id, text, ancestors, key) => {
    // the policy item this text belongs to (nearest ancestor with a Chinese title)
    const item = [...ancestors].reverse().find((a) => a.titleZh);
    const owner = ancestors[ancestors.length - 1];
    let what = FIELD_LABEL[key];
    if (!what && (key === 'zh' || key === 'en')) what = (owner && owner.type ? '标签' : '提示') + `（${langOf(key)}）`;
    if (!what && /^\d+$/.test(key)) what = `列表第 ${Number(key) + 1} 条（${langOf(id.split('.').slice(-2)[0])}）`;
    out.push({ id, label: [section.zhTitle, item && item.titleZh, what || key].filter(Boolean).join(' › '), text, multiline: long(text) });
  });
  groups.push({ id: `policy.${section.id}`, section: '政策页', label: section.zhTitle, fields: out });
}

const faqOut = [];
walkContent(FAQS, 'faq', (id, text, ancestors, key) => {
  const faq = ancestors[ancestors.length - 1];
  faqOut.push({ id, label: `${faq.qZh} › ${FIELD_LABEL[key] || key}`, text, multiline: long(text) });
});
groups.push({ id: 'faq', section: '常见问题 FAQ', label: '常见问题', fields: faqOut });

const homeOut = [];
for (const f of HOME_FIELDS) {
  if (f.image !== undefined) homeOut.push({ id: `home.${f.id}.url`, label: f.label, text: f.image, image: true });
  else {
    homeOut.push({ id: `home.${f.id}.en`, label: `${f.label}（英文）`, text: f.en, multiline: !!f.multiline });
    homeOut.push({ id: `home.${f.id}.zh`, label: `${f.label}（中文）`, text: f.zh, multiline: !!f.multiline });
  }
}
groups.unshift({ id: 'home', section: '首页', label: '首页', fields: homeOut });

writeFileSync('public/content-defaults.json', JSON.stringify({ groups }));
console.log(`content-defaults.json: ${groups.length} groups, ${groups.reduce((n, g) => n + g.fields.length, 0)} fields`);
