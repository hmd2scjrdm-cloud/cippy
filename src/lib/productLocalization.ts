export type StoreLanguage = 'en' | 'zh';

export function containsChinese(value: unknown): boolean {
  return /[\u3400-\u9fff]/u.test(String(value || ''));
}

export function sizeLabel(size: string, lang: StoreLanguage): string {
  const normalized = String(size || '').trim();
  if (normalized === '均码' || /^free\s*size$/i.test(normalized) || /^freesize$/i.test(normalized)) {
    return lang === 'zh' ? '均码' : 'Freesize';
  }
  return normalized;
}

// Chinese -> English for common fabric and garment words (longest first so "短款上衣" wins over "上衣").
const TERMS: [string, string][] = ([
  ['粘胶纤维', 'Viscose'], ['聚酯纤维', 'Polyester'], ['涤纶', 'Polyester'], ['氨纶', 'Spandex'], ['锦纶', 'Nylon'], ['腈纶', 'Acrylic'],
  ['莫代尔', 'Modal'], ['天丝', 'Tencel'], ['亚麻', 'Linen'], ['羊毛', 'Wool'], ['真丝', 'Silk'], ['纯棉', 'Cotton'], ['棉', 'Cotton'],
  ['螺纹面料', 'Rib knit'], ['螺纹', 'Rib knit'], ['针织', 'Knit'], ['雪纺', 'Chiffon'], ['蕾丝', 'Lace'], ['牛仔', 'Denim'], ['混纺', 'blend'], ['面料', 'fabric'],
  ['短款上衣', 'Cropped top'], ['短袖', 'Short-sleeve'], ['长袖', 'Long-sleeve'], ['吊带', 'Cami'], ['背心', 'Tank top'], ['衬衫', 'Shirt'], ['T恤', 'T-shirt'],
  ['半身裙', 'Skirt'], ['短裙', 'Mini skirt'], ['长裙', 'Maxi skirt'], ['连衣裙', 'Dress'], ['长裤', 'Trousers'], ['休闲裤', 'Casual pants'], ['短裤', 'Shorts'],
  ['外套', 'Jacket'], ['开衫', 'Cardigan'], ['套装', 'Set'], ['上衣', 'Top'], ['裙子', 'Skirt'], ['裤子', 'Pants'],
] as [string, string][]).sort((x, y) => y[0].length - x[0].length);

export function specLabel(value: string | undefined, lang: StoreLanguage): string {
  if (!value) return lang === 'zh' ? '资料待确认' : 'Not specified';

  const values: Record<string, [string, string]> = {
    'Gentle Hand Wash': ['Gentle hand wash', '轻柔手洗'],
    'Cold gentle wash': ['Cold gentle wash', '冷水轻柔洗涤'],
    '冷水轻柔手洗 / 悬挂晾干': ['Cold gentle hand wash / Hang dry', '冷水轻柔手洗 / 悬挂晾干'],
    'None': ['No lining', '无内衬'],
    '无内衬': ['No lining', '无内衬'],
    'Slight': ['Slight stretch', '微弹'],
    '微弹': ['Slight stretch', '微弹'],
    '高弹力': ['High stretch', '高弹力'],
    'Medium': ['Medium', '中等'],
    'High': ['High', '高'],
    'Low': ['Low', '低'],
    '微透': ['Slightly sheer', '微透'],
    '微透 (Slight)': ['Slightly sheer', '微透'],
    '螺纹面料': ['Ribbed fabric', '螺纹面料'],
    '螺纹棉混纺': ['Ribbed cotton blend', '螺纹棉混纺'],
    '混纺': ['Fabric blend', '混纺'],
    '聚酯纤维': ['Polyester', '聚酯纤维'],
    '棉、聚酯纤维': ['Cotton and polyester', '棉、聚酯纤维'],
    '粘胶纤维、聚酯纤维、氨纶': ['Viscose, polyester and elastane', '粘胶纤维、聚酯纤维、氨纶'],
    '短袖上衣、T恤': ['Short-sleeve top / T-shirt', '短袖上衣、T恤']
    ,'连衣裙': ['Dress', '连衣裙']
    ,'开衫': ['Cardigan', '开衫']
    ,'套装': ['Set', '套装']
    ,'上衣': ['Top', '上衣']
    ,'裙子': ['Skirt', '裙子']
    ,'抹胸上衣': ['Tube top', '抹胸上衣']
    ,'蛋糕短裙': ['Tiered mini skirt', '蛋糕短裙']
  };

  const normalized = value.trim();
  const translated = values[normalized];
  if (translated) return translated[lang === 'zh' ? 1 : 0];

  // Admin fields are often saved in Chinese (e.g. "95% 聚酯纤维 + 5% 氨纶"). For the English shop, swap the
  // known fabric / garment terms; anything unfamiliar is left as written rather than guessed.
  if (lang === 'en' && containsChinese(normalized)) {
    let out = normalized;
    for (const [zh, en] of TERMS) out = out.split(zh).join(` ${en} `);
    return out
      .replace(/\s*[,，、]\s*/g, ', ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s{2,}/g, ' ')
      .replace(/(^[,\s]+|[,\s]+$)/g, '')
      .trim();
  }
  return normalized;
}
