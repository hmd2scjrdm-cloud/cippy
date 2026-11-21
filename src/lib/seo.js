export const SITE_URL = 'https://cippy.vercel.app';

const categoryCopy = {
  all: { en: ['Shop All Women\'s Clothing', 'Shop Cippy petite-friendly Korean-inspired womenswear in Malaysia. Browse dresses, tops, bottoms and matching sets with prices in RM.'], zh: ['全部女装', '选购 Cippy 马来西亚小个子韩系女装：连衣裙、上装、下装与套装搭配，价格以 RM 显示。'] },
  dresses: { en: ['Petite Dresses', 'Discover petite-friendly dresses at Cippy Malaysia. Browse everyday and going-out styles with clear sizing and RM prices.'], zh: ['小个子连衣裙', '选购 Cippy 马来西亚小个子连衣裙。查看日常及出门穿搭、尺码与 RM 价格。'] },
  sets: { en: ['Matching Sets', 'Explore matching outfit sets at Cippy Malaysia. Easy Korean-inspired looks with clear sizes and prices in RM.'], zh: ['韩系套装', '选购 Cippy 马来西亚韩系套装搭配。轻松找到适合小个子的穿搭，查看尺码与 RM 价格。'] },
  tops: { en: ['Women\'s Tops', 'Shop petite-friendly tops at Cippy Malaysia, from everyday tees to dressier styles. See sizes and RM prices.'], zh: ['女装上衣', '选购 Cippy 马来西亚小个子友好上衣，从日常 T 恤到出门穿搭，查看尺码与 RM 价格。'] },
  bottoms: { en: ['Skirts, Shorts & Pants', 'Browse skirts, shorts and pants at Cippy Malaysia. Find everyday bottoms with clear sizing and prices in RM.'], zh: ['半身裙、短裤与长裤', '选购 Cippy 马来西亚半身裙、短裤与长裤，查看尺码、库存与 RM 价格。'] },
  outerwear: { en: ['Cardigans & Outerwear', 'Browse cardigans and outerwear at Cippy Malaysia. Easy layering pieces with clear sizing and prices in RM.'], zh: ['开衫与外套', '选购 Cippy 马来西亚开衫与外套，查看尺码、库存与 RM 价格。'] },
};

export function getSeoData({ category = null, product = null, lang = 'en' } = {}) {
  if (product) {
    const name = lang === 'zh' ? (product.cnName || product.name) : product.name;
    const description = lang === 'zh'
      ? (product.cnDescription || product.cnStory || `查看 ${name} 的图片、尺码及价格。`)
      : (product.description || product.story || `View photos, sizes and price for ${name} at Cippy Malaysia.`);
    return {
      title: `${name} | Cippy Malaysia`,
      description: String(description).replace(/\s+/g, ' ').trim().slice(0, 260),
      url: `${SITE_URL}/?product=${encodeURIComponent(product.id)}`,
      image: product.imageUrl || `${SITE_URL}/assets/cippy-logo-new.png`,
      type: 'product',
      product,
    };
  }

  if (category === 'wishlist') {
    return { title: 'Saved Items | Cippy Malaysia', description: 'Your saved Cippy styles.', url: SITE_URL, image: `${SITE_URL}/assets/cippy-logo-new.png`, type: 'website', noindex: true };
  }

  if (category && categoryCopy[category]) {
    const [name, description] = categoryCopy[category][lang === 'zh' ? 'zh' : 'en'];
    return { title: `${name} | Cippy Malaysia`, description, url: `${SITE_URL}/?collection=${category}`, image: `${SITE_URL}/assets/cippy-logo-new.png`, type: 'website' };
  }

  return {
    title: lang === 'zh' ? 'Cippy Malaysia | 小个子韩系女装' : 'Cippy Malaysia | Petite-Friendly Korean Fashion',
    description: lang === 'zh'
      ? 'Cippy 为马来西亚日常精选小个子友好韩系女装。选购连衣裙、上衣、下装与套装，价格以 RM 显示。'
      : 'Cippy Malaysia offers petite-friendly Korean-inspired womenswear for everyday life. Shop dresses, tops, bottoms and sets in RM.',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/assets/cippy-logo-new.png`,
    type: 'website',
  };
}

function setMeta(selector, attribute, value) {
  const node = document.querySelector(selector);
  if (node) node.setAttribute(attribute, value);
}

export function applySeo(data, lang = 'en') {
  document.title = data.title;
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en';
  setMeta('meta[name="description"]', 'content', data.description);
  setMeta('meta[name="robots"]', 'content', data.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large');
  setMeta('link[rel="canonical"]', 'href', data.url);
  setMeta('meta[property="og:title"]', 'content', data.title);
  setMeta('meta[property="og:description"]', 'content', data.description);
  setMeta('meta[property="og:url"]', 'content', data.url);
  setMeta('meta[property="og:image"]', 'content', data.image.startsWith('/') ? `${SITE_URL}${data.image}` : data.image);
  setMeta('meta[property="og:type"]', 'content', data.type);
  setMeta('meta[property="og:locale"]', 'content', lang === 'zh' ? 'zh_MY' : 'en_MY');
  setMeta('meta[name="twitter:title"]', 'content', data.title);
  setMeta('meta[name="twitter:description"]', 'content', data.description);
  setMeta('meta[name="twitter:image"]', 'content', data.image.startsWith('/') ? `${SITE_URL}${data.image}` : data.image);

  const productSchema = document.getElementById('cippy-product-schema');
  if (productSchema) productSchema.remove();
  if (data.product) {
    const product = data.product;
    const schema = document.createElement('script');
    schema.id = 'cippy-product-schema';
    schema.type = 'application/ld+json';
    schema.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: data.description,
      image: data.image.startsWith('/') ? `${SITE_URL}${data.image}` : data.image,
      url: data.url,
      brand: { '@type': 'Brand', name: 'Cippy' },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'MYR',
        price: Number(product.price),
        availability: Number(product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        url: data.url,
      },
    }).replace(/</g, '\\u003c');
    document.head.appendChild(schema);
  }
}
