// Homepage texts that can be edited in the admin ("网站内容 → 首页"). `id` is the key stored in settings.site_content
// (`home.<id>.en` / `.zh`, or `home.<id>.url` for images). Keep the defaults identical to what the shop showed before.
export interface HomeField {
  id: string;
  label: string;
  en?: string;
  zh?: string;
  image?: string;
  multiline?: boolean;
}

export const HOME_FIELDS: HomeField[] = [
  { id: 'hero.featuredImage', label: '当前首页主视觉（首推商品实拍，可更换）', image: 'https://pub-0c1693782698482098fa2ba7577d4409.r2.dev/1792493632314-img_1792493629101.jpg' },
  { id: 'hero.image', label: '旧版首页大图（存档）', image: 'https://pub-0c1693782698482098fa2ba7577d4409.r2.dev/product-image/WhatsApp%20Image%202026-08-20%20at%2019.39.28.jpeg' },
  { id: 'hero.chapter', label: '旧版小标题（存档）', en: 'CHAPTER 01 — THE LOOSE SILHOUETTE', zh: '第一章 — 宽松轮廓美学' },
  { id: 'hero.badge', label: '旧版大图文字（存档）', en: 'NEW IN', zh: '新品现货' },
  { id: 'hero.storyTitle', label: '旧版品牌标语（存档）', en: 'A Storybook Wardrobe', zh: '故事衣橱' },
  { id: 'hero.storyTagline', label: '旧版品牌短句（存档）', en: "Pieces you'll reach for, again and again.", zh: '那些你会一穿再穿的日常。' },
  { id: 'hero.fitLabel', label: '旧版版型小标题（存档）', en: 'FIT PROFILE', zh: '版型解析' },
  { id: 'hero.fitTitle', label: '旧版版型大标题（存档）', en: '"The Gentle Over-Size"', zh: '「温柔大廓形」' },
  { id: 'hero.fitBody', label: '旧版版型说明（存档）', multiline: true, en: 'Petite-friendly proportions with comfortable room to move. Available sizes are shown on each product; compare the garment measurements or ask us before ordering. Currently offered in S–M and Freesize; no larger sizes yet.', zh: '以小个子友好比例与舒适活动空间为重点。每件商品都会显示实际可选尺码；下单前请对照实测尺寸，拿不准可直接咨询客服。目前提供 S–M 与均码，暂无大码。' },
  { id: 'hero.shopButton', label: '旧版主按钮（存档）', en: 'SHOP NOW', zh: '立即选购' },
  { id: 'hero.lookbookButton', label: '旧版第二按钮（存档）', en: 'OUR STORY', zh: '品牌故事' },
  { id: 'hero.previewTitle', label: '旧版商品预览标题（存档）', en: 'HOT RELEASE PREVIEW', zh: '新品热预览' },
];

// Override ids for a field: images use a single `url`, text uses `en` / `zh`.
export const homeFieldIds = (f: HomeField): string[] =>
  f.image !== undefined ? [`home.${f.id}.url`] : [`home.${f.id}.en`, `home.${f.id}.zh`];
