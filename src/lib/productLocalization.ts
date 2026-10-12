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
  };

  const translated = values[value.trim()];
  return translated ? translated[lang === 'zh' ? 1 : 0] : value;
}
