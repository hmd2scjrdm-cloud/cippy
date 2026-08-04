export interface PriceTier {
  emoji: string;
  en: string;
  zh: string;
}

// Brand-tier badge shown in place of raw price emphasis: RM15-35 Entry,
// RM35-55 Everyday, RM55+ Signature.
export function getPriceTier(price: number): PriceTier {
  if (price < 35) return { emoji: '🤍', en: 'Entry Piece', zh: '入门款' };
  if (price < 55) return { emoji: '🌷', en: 'Everyday Piece', zh: '日常爱用' };
  return { emoji: '🍃', en: 'Signature Piece', zh: '品牌设计' };
}
