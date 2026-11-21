import test from 'node:test';
import assert from 'node:assert/strict';
import { getSeoData } from '../src/lib/seo.js';

test('homepage metadata stays on the canonical homepage', () => {
  const seo = getSeoData();
  assert.equal(seo.url, 'https://cippy.vercel.app/');
  assert.match(seo.description, /Malaysia/);
});

test('categories have distinct bilingual titles and canonical URLs', () => {
  const english = getSeoData({ category: 'dresses', lang: 'en' });
  const chinese = getSeoData({ category: 'dresses', lang: 'zh' });
  assert.equal(english.url, 'https://cippy.vercel.app/?collection=dresses');
  assert.notEqual(english.title, chinese.title);
  assert.match(chinese.description, /连衣裙/);
});

test('saved items are not indexed', () => {
  assert.equal(getSeoData({ category: 'wishlist' }).noindex, true);
});

test('product metadata has one URL and uses its real price and image', () => {
  const product = {
    id: 'item-1', name: 'White Dress', cnName: '白色连衣裙',
    description: 'A simple white dress.', price: 52,
    imageUrl: '/images/white-dress.jpg', stock: 3,
  };
  const seo = getSeoData({ product, category: 'dresses', lang: 'en' });
  assert.equal(seo.url, 'https://cippy.vercel.app/?product=item-1');
  assert.equal(seo.image, '/images/white-dress.jpg');
  assert.equal(seo.product.price, 52);
});
