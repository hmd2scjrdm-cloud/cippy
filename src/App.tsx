import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { products, mixMatchTops, mixMatchBottoms } from './data';
import { POLICIES, FAQS } from './data/policies';
import { CartItem, Product, StoryChapter } from './types';
import Logo from './components/Logo';
import StoryChapters from './components/StoryChapters';
import SizingHelper from './components/SizingHelper';
import MixMatchRoom from './components/MixMatchRoom';
import ProductCard from './components/ProductCard';
import ShoppingBagDrawer from './components/ShoppingBag';
import CheckoutPage from './components/CheckoutPage';
import ProductDetailModal from './components/ProductDetailModal';
import { Bilingual } from './components/Bilingual';
import { supabase } from './lib/supabase';
import { signInWithGoogleGmail, sendGmailMessage, logoutGmail, getGmailToken, getGmailEmail } from './lib/gmailService';
import { ShoppingBag, Star, Sparkles, BookOpen, Heart, ArrowRight, CheckCircle2, ChevronRight, Globe, Compass, RefreshCw, User, Lock, Mail, CreditCard, ClipboardList, LogOut, Truck, Package, Clock, Check, Search, X, TrendingUp, ChevronDown, GitCompare, Award, Calendar, Copy, Send, Bell, ShieldAlert, Trash2, Plus, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const getEmailHTML = (product: Product, brandConcept: string, siteUrl: string) => {
  const name = product.name;
  const cnName = product.cnName;
  const price = product.price;
  const story = product.cnStory || product.story;
  const imageUrl = product.imageUrl || '';
  const fabric = product.fabric || 'Premium Blended Fabric / 高级混纺面料';
  const lining = product.lining || 'Lined with soft premium silk / 亲肤顺滑内衬';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Cippy Fairytale New Arrival</title>
      <style>
        body { font-family: 'Georgia', serif; background-color: #FAF4F6; margin: 0; padding: 20px; color: #2D1E1E; }
        .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #FBEBF0; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(185, 106, 115, 0.08); }
        .header { background: linear-gradient(135deg, #FBEBF0 0%, #FFF0F2 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #FBEBF0; }
        .logo { font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #3F2B2B; text-transform: uppercase; margin: 0; }
        .subtitle { font-size: 10px; font-family: monospace; letter-spacing: 2px; color: #B96A73; text-transform: uppercase; margin-top: 5px; margin-bottom: 0; }
        .content { padding: 40px 30px; line-height: 1.8; text-align: center; }
        .greeting { font-style: italic; font-size: 16px; color: #5C4B4B; margin-bottom: 25px; }
        .featured-badge { display: inline-block; background-color: #FFF0F2; color: #B96A73; font-size: 10px; font-family: monospace; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 12px; margin-bottom: 15px; }
        .product-title { font-size: 24px; font-weight: bold; color: #3F2B2B; margin: 0; }
        .product-subtitle { font-size: 14px; color: #8C7C7C; margin-top: 5px; margin-bottom: 25px; }
        .image-container { position: relative; margin: 30px 0; border-radius: 16px; overflow: hidden; background-color: #FFFDFD; border: 1px solid #FBEBF0; }
        .product-image { width: 100%; max-height: 400px; object-fit: cover; display: block; }
        .story-box { background-color: #FFFDFD; border: 1px dashed #B96A73; border-radius: 16px; padding: 25px; margin: 30px 0; font-size: 13px; color: #5C4B4B; line-height: 1.8; font-style: italic; }
        .specs-table { width: 100%; margin: 25px 0; border-collapse: collapse; font-size: 12px; text-align: left; }
        .specs-table td { padding: 10px; border-bottom: 1px solid #F8F5F5; }
        .specs-label { font-weight: bold; color: #3F2B2B; width: 120px; }
        .price-tag { font-size: 22px; font-weight: bold; color: #B96A73; margin: 25px 0; }
        .cta-btn { display: inline-block; background-color: #3F2B2B; color: #FFFFFF !important; text-decoration: none; padding: 15px 35px; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; transition: background-color 0.3s; }
        .footer { background-color: #FFFDFD; border-top: 1px solid #FBEBF0; padding: 30px; text-align: center; font-size: 11px; color: #9E8E8E; }
        .footer p { margin: 5px 0; }
        .footer-links { margin-top: 15px; }
        .footer-links a { color: #B96A73; text-decoration: none; margin: 0 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Cippy Atelier</h1>
          <p class="subtitle">Bespoke Fairytale RTW &bull; Paris &bull; Seoul &bull; KL</p>
        </div>
        <div class="content">
          <p class="greeting">Dearest Fairytale Friend / 亲爱的仙女闺蜜，</p>
          <span class="featured-badge">New Arrival Alert / 新品惊艳登场</span>
          <h2 class="product-title">${cnName}</h2>
          <h3 class="product-subtitle">${name}</h3>
          
          ${imageUrl ? `
          <div class="image-container">
            <img src="${imageUrl}" alt="${name}" class="product-image" />
          </div>
          ` : ''}

          <div class="story-box">
            「${story}」
          </div>

          <table class="specs-table">
            <tr>
              <td class="specs-label">Series / 系列</td>
              <td>${product.series || 'Limited Fairy Tale Series'}</td>
            </tr>
            <tr>
              <td class="specs-label">Fabric / 面料</td>
              <td>${fabric}</td>
            </tr>
            <tr>
              <td class="specs-label">Lining / 内衬</td>
              <td>${lining}</td>
            </tr>
            <tr>
              <td class="specs-label">Sizes / 尺码</td>
              <td>S & M (Oversized Korean Silhouette)</td>
            </tr>
          </table>

          <div class="price-tag">
            RM ${price.toFixed(2)}
          </div>

          <a href="${siteUrl}" class="cta-btn" style="color: #FFFFFF !important;">Shop The Collection / 立即进入衣橱</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 Cippy Atelier. All rights reserved.</p>
          <p>You received this email because you subscribed to our Fairytale VIP alerts.</p>
          <div class="footer-links">
            <a href="${siteUrl}">Visit Store</a> | 
            <a href="${siteUrl}">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default function App() {
  // Dynamic visual atmosphere theme configurations
  const themePresets = {
    pink: {
      id: 'pink' as const,
      name: 'The Blush Canvas',
      cnName: '优雅玫瑰粉',
      cnDesc: '温馨甜美的落樱粉色，原汁原味的童话梦境。',
      primaryBg: 'bg-[#B96A73]',
      primaryText: 'text-[#B96A73]',
      primaryHover: 'hover:bg-[#a15a62]',
      primaryBorder: 'border-[#FBEBF0]',
      primaryBorderSoft: 'border-[#FBEBF0]/40',
      softBg: 'bg-[#FFF0F2]',
      softBgHover: 'hover:bg-[#FCE2E6]',
      pillBg: 'bg-[#FFF0F2]/40',
      badgeBg: 'bg-[#FFF0F2]/80 text-[#B96A73]',
      accentText: 'text-[#D89CA2]',
      accentTextHover: 'hover:text-[#B96A73]',
      accentFill: 'fill-[#FFF0F2]',
      starFill: 'fill-[#FFF0F2] text-[#D89CA2]',
      topBar: 'from-[#FBEBF0] via-[#FFF0F2] to-[#FBEBF0]',
      heroGradient: 'from-[#FFF5F7] via-[#FFFDFE] to-transparent',
      ribbonColor: '#B96A73',
      btnShadow: 'shadow-[#FFF0F2]',
      selectionBg: 'selection:bg-[#FFF5F7] selection:text-[#B96A73]',
      customProperties: {
        '--theme-primary-soft': '#FBEBF0',
        '--theme-shadow-color': 'rgba(251, 235, 240, 0.4)',
        '--theme-shadow-color-light': 'rgba(251, 235, 240, 0.3)',
        '--theme-shadow-hover': 'rgba(185, 106, 115, 0.3)',
        '--theme-shadow-hover-light': 'rgba(185, 106, 115, 0.2)',
        '--theme-scrollbar-bg': '#FFF5F7',
        '--theme-scrollbar-thumb': '#FBEBF0',
        '--theme-scrollbar-thumb-hover': '#B96A73',
      }
    }
  };

  const styleArchetypes = {
    storybook: {
      id: 'storybook' as const,
      name: 'Fairytale Storybook',
      cnName: '童话浪漫绘本风',
      desc: 'Soft hand-drawn shapes, floating stars, curved ruffles, and whimsical story frames.',
      cnDesc: '童话绘本细节，蓬松花边与流星点缀，温润治愈的浪漫梦境。',
      cardStyle: 'rounded-2xl border border-[#FBEBF0] shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 overflow-hidden bg-white',
      btnStyle: 'rounded-xl',
      fontTitle: 'font-serif',
      fontBody: 'font-sans',
      outerBg: 'bg-[#FAF4F6]',
      navStyle: 'rounded-full p-1 border border-[#FBEBF0]',
      navBtnStyle: 'rounded-full',
      heroLayout: 'grid grid-cols-1 md:grid-cols-12 gap-8 items-center',
    }
  };

  const styleArchetype = 'storybook';
  const activeArchetype = styleArchetypes[styleArchetype];

  // Read initial brand concept - locked to Concept C: CHAEWON
  const getInitialBrand = () => {
    return 'chaewon';
  };

  const [brandConcept, setBrandConcept] = useState<'hanyu' | 'nabi' | 'chaewon' | 'hwayoon' | 'yunseo'>('chaewon');

  const handleBrandConceptChange = (concept: 'hanyu' | 'nabi' | 'chaewon' | 'hwayoon' | 'yunseo') => {
    setBrandConcept('chaewon');
  };

  const isHanyu = false;
  const isChaewon = true;
  const isHwayoon = false;
  const isYunseo = false;

  const themeId = 'pink';
  const baseTheme = themePresets[themeId];
  
  // Override theme variables specifically for HANYU's warm rose/vivid-pink aesthetic, CHAEWON's elegant dark-brown/pink, HWA-YOON's dusty-rose/terracotta aesthetic, and YUNSEO's organic sage/oatmeal aesthetic
  const activeTheme = isHanyu ? {
    ...baseTheme,
    primaryBg: 'bg-[#D31558]',
    primaryText: 'text-[#D31558]',
    primaryHover: 'hover:bg-[#b01047]',
    softBg: 'bg-[#FFF5F7]',
    accentText: 'text-[#D31558]',
    customProperties: {
      ...baseTheme.customProperties,
      '--theme-primary-soft': '#FBEBF0',
      '--theme-scrollbar-thumb-hover': '#D31558',
    }
  } : isChaewon ? {
    ...baseTheme,
    primaryBg: 'bg-[#3F2B2B]',
    primaryText: 'text-[#3F2B2B]',
    primaryHover: 'hover:bg-[#2F1F1F]',
    softBg: 'bg-[#FFF5F7]',
    accentText: 'text-[#B96A73]',
    customProperties: {
      ...baseTheme.customProperties,
      '--theme-primary-soft': '#FBEBF0',
      '--theme-scrollbar-thumb-hover': '#3F2B2B',
    }
  } : isHwayoon ? {
    ...baseTheme,
    primaryBg: 'bg-[#C88E93]',
    primaryText: 'text-[#C88E93]',
    primaryHover: 'hover:bg-[#B3797D]',
    softBg: 'bg-[#FFF5F6]',
    accentText: 'text-[#C88E93]',
    customProperties: {
      ...baseTheme.customProperties,
      '--theme-primary-soft': '#FDF1F2',
      '--theme-scrollbar-thumb-hover': '#C88E93',
    }
  } : isYunseo ? {
    ...baseTheme,
    primaryBg: 'bg-[#5D6B54]',
    primaryText: 'text-[#5D6B54]',
    primaryHover: 'hover:bg-[#4A5543]',
    softBg: 'bg-[#F4F6F2]',
    accentText: 'text-[#7A8A70]',
    customProperties: {
      ...baseTheme.customProperties,
      '--theme-primary-soft': '#EFF2EC',
      '--theme-scrollbar-thumb-hover': '#5D6B54',
    }
  } : baseTheme;

  // Navigation tab states
  const [activeTab, setActiveTab] = useState<'rtw' | 'atelier' | 'journal' | 'policies' | 'account' | 'alerts' | 'checkout'>('rtw');
  const [atelierSubTab, setAtelierSubTab] = useState<'sizing' | 'mirror'>('sizing');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('shopping');
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [policySearchQuery, setPolicySearchQuery] = useState<string>('');
  
  // Language & Translation State
  const [lang, setLang] = useState<'en' | 'zh'>(() => {
    const saved = localStorage.getItem('cippy_lang');
    return (saved === 'zh' || saved === 'en') ? saved : 'en'; // English-first per brand repositioning
  });

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
    localStorage.setItem('cippy_lang', nextLang);
  };

  // Supabase Auth and User States
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<{ points: number; total_spent: number; tier: string } | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  // Only the store owner's account may access the internal campaign broadcast tools (see admin.html ALLOWED_EMAILS)
  const isAdminUser = currentUser?.email === 'cippy.kl@gmail.com';

  // Gmail & New Arrival Alerts States (Resend App)
  const [googleToken, setGoogleToken] = useState<string | null>(getGmailToken());
  const [googleEmail, setGoogleEmail] = useState<string | null>(getGmailEmail());
  
  // Prepopulated subscribers list including the user's actual email (christinechong235@gmail.com) for real tests!
  const [subscribers, setSubscribers] = useState([
    { name: 'Christine Chong', email: 'christinechong235@gmail.com', tier: 'Gold VIP', joined: '2026-03-12' },
    { name: 'Pearly Yap', email: 'pearly.yap@cippy.my', tier: 'Classic Member', joined: '2026-05-18' },
    { name: 'Lim Wei Ni', email: 'weini.lim@gmail.com', tier: 'Platinum VIP', joined: '2026-02-05' },
    { name: 'Jun SEO', email: 'seo.jun@outlook.com', tier: 'Classic Member', joined: '2026-06-22' },
    { name: 'Suki Low', email: 'sukilow.styling@gmail.com', tier: 'Gold VIP', joined: '2026-04-30' },
  ]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>(['christinechong235@gmail.com', 'pearly.yap@cippy.my', 'weini.lim@gmail.com', 'seo.jun@outlook.com', 'sukilow.styling@gmail.com']);
  const [alertProduct, setAlertProduct] = useState<any>(products[0]);
  const [alertTemplate, setAlertTemplate] = useState<'rose' | 'coffee' | 'midnight'>('rose');
  const [alertSubject, setAlertSubject] = useState('🌸 Cippy New Arrival Alert: {product_name} is live! 🌸');
  const [alertMessage, setAlertMessage] = useState(
    'Dear {name},\n\nWe are absolutely thrilled to introduce Cippy\'s newest ready-to-wear masterpiece! Beautifully tailored for our Malaysian Chinese dreamers, this premium loose-fit silhouette drapes like a dream.\n\nOrder now to get free luxury gift wrapping and direct door-to-door shipping.'
  );
  const [alertMessageZH, setAlertMessageZH] = useState(
    '亲爱的 {name}，您好！\n\n大马女孩的温婉日常新篇章！Cippy 梦幻工作室很高兴为您呈献我们的全新重磅成衣系列 ——【{product_name}】。\n\n精选高透气混纺棉麻材质，专为大马炎热温差气候与空调冷气房调校，优雅不费力。首发单笔满 RM150 免费升级专属奢华定制礼盒包装！'
  );
  
  // Custom subscribers addition state
  const [newSubName, setNewSubName] = useState('');
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubTier, setNewSubTier] = useState('Classic Member');

  // Send campaign progress/status states
  const [isSendingAlerts, setIsSendingAlerts] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number; logs: string[] }>({ current: 0, total: 0, logs: [] });
  const [alertStatusMessage, setAlertStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Campaign History & Resend Center logs
  const [campaignHistory, setCampaignHistory] = useState([
    {
      id: 'CAMP-9824',
      productName: 'Paris Girl | Cream Polka Dot Cami Dress Set',
      subject: '✨ Restock Alert: Paris Polka Dot Set back in S/M sizes!',
      sentAt: '2026-07-15T14:30:00Z',
      recipientsCount: 4,
      status: 'success',
      template: 'rose',
      emails: ['christinechong235@gmail.com', 'weini.lim@gmail.com', 'sukilow.styling@gmail.com', 'seo.jun@outlook.com']
    },
    {
      id: 'CAMP-7751',
      productName: 'Everyday Essential | Drawstring Casual Shorts',
      subject: '🚚 Cippy Essentials: Direct Restock from KL Dispatch Center',
      sentAt: '2026-07-12T09:15:00Z',
      recipientsCount: 3,
      status: 'success',
      template: 'coffee',
      emails: ['christinechong235@gmail.com', 'pearly.yap@cippy.my', 'weini.lim@gmail.com']
    }
  ]);

  const handleGoogleGmailSignIn = async () => {
    try {
      const res = await signInWithGoogleGmail();
      if (res) {
        setGoogleToken(res.token);
        setGoogleEmail(res.email);
        setAlertStatusMessage({
          type: 'success',
          text: lang === 'zh' ? `🔑 成功通过 Google 授权 Gmail 发送权限！已连接：${res.email}` : `🔑 Successfully authenticated Gmail via Google! Connected: ${res.email}`
        });
      }
    } catch (err: any) {
      setAlertStatusMessage({
        type: 'error',
        text: lang === 'zh' ? `❌ 授权失败：${err.message || err}` : `❌ Authorization failed: ${err.message || err}`
      });
    }
  };

  const handleGoogleGmailSignOut = async () => {
    await logoutGmail();
    setGoogleToken(null);
    setGoogleEmail(null);
    setAlertStatusMessage({
      type: 'info',
      text: lang === 'zh' ? '已退出 Google Gmail 授权。' : 'Successfully logged out of Google Gmail authorization.'
    });
  };

  const handleAddSubscriber = (emailStr: string, nameStr?: string) => {
    const email = emailStr.trim().toLowerCase();
    const name = (nameStr || email.split('@')[0]).trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setToastMessage(lang === 'zh' ? '⚠️ 请输入有效的电子邮箱地址。' : '⚠️ Please enter a valid email address.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    if (subscribers.some(s => s.email === email)) {
      setToastMessage(lang === 'zh' ? '⚠️ 该邮箱已经在您的订阅列表中。' : '⚠️ This email is already subscribed.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const nextSubs = [...subscribers, {
      name,
      email,
      tier: 'Gold VIP',
      joined: new Date().toISOString().split('T')[0]
    }];
    setSubscribers(nextSubs);
    localStorage.setItem('cippy_subscribers', JSON.stringify(nextSubs));
    setNewSubEmail('');
    setNewSubName('');
  };

  const handleRemoveSubscriber = (email: string) => {
    const nextSubs = subscribers.filter(s => s.email !== email);
    setSubscribers(nextSubs);
    localStorage.setItem('cippy_subscribers', JSON.stringify(nextSubs));
  };

  const getEmailHtmlContent = (recipientName: string, product: any, template: 'rose' | 'coffee' | 'midnight', customText: string) => {
    const brandName = "Cippy Studio";
    const prodName = lang === 'zh' ? (product.cnName || product.name) : product.name;
    const prodDesc = lang === 'zh' ? (product.cnDescription || product.description) : product.description;
    const prodStory = lang === 'zh' ? (product.cnStory || product.story) : product.story;
    const prodPrice = product.price;
    const prodImg = product.imageUrl || "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/005.png";

    // Colors based on template style
    let primaryColor = "#B96A73"; // Pink
    let secondaryColor = "#FFF0F2";
    let textColor = "#333333";
    let fontStack = "system-ui, -apple-system, sans-serif";
    let backgroundGradient = "#FFF5F7";
    let cardBg = "#ffffff";

    if (template === 'coffee') {
      primaryColor = "#3F2B2B"; // Brown
      secondaryColor = "#F9F6F0"; // Cream beige
      textColor = "#4A3E3E";
      backgroundGradient = "#F5ECE6";
    } else if (template === 'midnight') {
      primaryColor = "#2C2C3E"; // Midnight blue
      secondaryColor = "#E6E6FA"; // Lavender
      textColor = "#1F2937";
      backgroundGradient = "#ECECFF";
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${prodName} - New Arrival Alert</title>
        <style>
          body {
            font-family: ${fontStack};
            background-color: ${backgroundGradient};
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: ${cardBg};
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            border: 1px solid ${secondaryColor};
          }
          .header {
            background-color: ${secondaryColor};
            padding: 40px 20px;
            text-align: center;
            border-bottom: 3px solid ${primaryColor};
          }
          .header h1 {
            color: ${primaryColor};
            margin: 0;
            font-size: 28px;
            letter-spacing: 4px;
            text-transform: uppercase;
          }
          .header p {
            color: ${textColor};
            margin: 10px 0 0 0;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .greeting {
            font-size: 16px;
            color: ${textColor};
            margin-bottom: 25px;
            font-weight: 500;
          }
          .custom-text {
            font-size: 14px;
            line-height: 1.8;
            color: #555555;
            margin-bottom: 35px;
            text-align: justify;
            white-space: pre-line;
          }
          .product-card {
            border: 1px dashed ${primaryColor};
            border-radius: 16px;
            padding: 25px;
            background-color: ${secondaryColor}33;
            margin-bottom: 35px;
          }
          .product-img {
            max-width: 250px;
            height: auto;
            border-radius: 12px;
            margin-bottom: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .product-title {
            font-size: 18px;
            font-weight: bold;
            color: ${primaryColor};
            margin: 10px 0;
          }
          .product-price {
            font-size: 20px;
            font-weight: bold;
            color: ${textColor};
            margin-bottom: 15px;
          }
          .product-desc {
            font-size: 13px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .btn {
            display: inline-block;
            background-color: ${primaryColor};
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 30px;
            font-weight: bold;
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 0 4px 10px ${primaryColor}40;
            transition: all 0.3s ease;
          }
          .footer {
            background-color: #f9f9f9;
            padding: 25px;
            text-align: center;
            font-size: 11px;
            color: #999999;
            border-top: 1px solid #eeeeee;
          }
          .footer a {
            color: ${primaryColor};
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CIPPY</h1>
            <p>SEOUL &bull; KUALA LUMPUR DIRECT</p>
          </div>
          <div class="content">
            <div class="greeting">Hi ${recipientName},</div>
            <div class="custom-text">${customText}</div>
            
            <div class="product-card">
              <img src="${prodImg}" class="product-img" alt="${prodName}" />
              <div class="product-title">${prodName}</div>
              <div class="product-price">RM ${prodPrice}</div>
              <div class="product-desc">${prodStory || prodDesc}</div>
              <a href="https://ai.studio/build" class="btn">View Collection / 探索成衣</a>
            </div>
          </div>
          <div class="footer">
            <p>This is a VIP arrival alert sent on behalf of ${brandName} via Google Workspace Integration.</p>
            <p>&copy; 2026 Cippy Studio. KL Boutique. Direct inquiries to <a href="mailto:christinechong235@gmail.com">christinechong235@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleSendCampaign = async (isTest: boolean, testEmailInput?: string) => {
    if (!googleToken) {
      setAlertStatusMessage({
        type: 'error',
        text: lang === 'zh' ? '请先登录 Google 账户以授权发送 Gmail！' : 'Please Sign In with Google first to authorize Gmail sending!'
      });
      return;
    }

    const recipientsToProcess = isTest 
      ? [{ name: 'Test Recipient', email: testEmailInput || 'christinechong235@gmail.com', tier: 'Tester' }]
      : subscribers.filter(s => selectedEmails.includes(s.email));

    if (recipientsToProcess.length === 0) {
      setAlertStatusMessage({
        type: 'error',
        text: lang === 'zh' ? '请至少选择一位订阅者！' : 'Please select at least one subscriber!'
      });
      return;
    }

    setIsSendingAlerts(true);
    setAlertStatusMessage({
      type: 'info',
      text: lang === 'zh' ? '正在连接 Gmail API 准备发送...' : 'Connecting to Gmail API, preparing queue...'
    });
    setSendingProgress({ current: 0, total: recipientsToProcess.length, logs: [] });

    let successCount = 0;
    const updatedLogs: string[] = [];

    const currentProdName = lang === 'zh' ? (alertProduct.cnName || alertProduct.name) : alertProduct.name;
    const subWithProd = alertSubject.replace(/{product_name}/g, currentProdName);

    for (let i = 0; i < recipientsToProcess.length; i++) {
      const recipient = recipientsToProcess[i];
      const namePlaceholder = recipient.name;
      
      const customizedMessage = (lang === 'zh' ? alertMessageZH : alertMessage)
        .replace(/{name}/g, namePlaceholder)
        .replace(/{product_name}/g, currentProdName);

      const htmlBody = getEmailHtmlContent(recipient.name, alertProduct, alertTemplate, customizedMessage);

      try {
        await sendGmailMessage(googleToken, recipient.email, googleEmail || '', subWithProd, htmlBody);
        successCount++;
        updatedLogs.push(`✅ [${i + 1}/${recipientsToProcess.length}] Successfully sent to ${recipient.email}`);
      } catch (err: any) {
        console.error(`Error sending to ${recipient.email}:`, err);
        updatedLogs.push(`❌ [${i + 1}/${recipientsToProcess.length}] Failed to send to ${recipient.email}: ${err.message || err}`);
      }

      setSendingProgress(prev => ({
        ...prev,
        current: i + 1,
        logs: [...updatedLogs]
      }));
    }

    setIsSendingAlerts(false);

    if (successCount === recipientsToProcess.length) {
      setAlertStatusMessage({
        type: 'success',
        text: lang === 'zh' 
          ? `🎉 发送完成！成功通过 Gmail 发送了 ${successCount} 封成衣新品推送邮件！`
          : `🎉 Send complete! Successfully delivered ${successCount} ready-to-wear alerts via Gmail!`
      });
    } else {
      setAlertStatusMessage({
        type: 'info',
        text: lang === 'zh'
          ? `⚠️ 部分发送完成。成功: ${successCount} 封，失败: ${recipientsToProcess.length - successCount} 封。请检查发送日志。`
          : `⚠️ Campaign partially completed. Success: ${successCount}, Failed: ${recipientsToProcess.length - successCount}. Check logs below.`
      });
    }

    // Save campaign in history
    if (!isTest) {
      const newCamp = {
        id: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
        productName: alertProduct.name,
        subject: subWithProd,
        sentAt: new Date().toISOString(),
        recipientsCount: recipientsToProcess.length,
        status: successCount === recipientsToProcess.length ? 'success' : 'partial',
        template: alertTemplate,
        emails: recipientsToProcess.map(r => r.email)
      };
      setCampaignHistory(prev => [newCamp, ...prev]);
    }
  };

  const handleResendCampaign = async (camp: any) => {
    if (!googleToken) {
      setAlertStatusMessage({
        type: 'error',
        text: lang === 'zh' ? '请先登录 Google 账户以授权重发 Gmail！' : 'Please Sign In with Google first to authorize Gmail resending!'
      });
      return;
    }

    setIsSendingAlerts(true);
    setAlertStatusMessage({
      type: 'info',
      text: lang === 'zh' ? `正在一键重新群发历史推送 [${camp.id}]...` : `One-click re-triggering campaign [${camp.id}]...`
    });
    setSendingProgress({ current: 0, total: camp.emails.length, logs: [] });

    const matchingProd = products.find(p => p.name === camp.productName) || products[0];
    let successCount = 0;
    const updatedLogs: string[] = [];

    const currentProdName = lang === 'zh' ? (matchingProd.cnName || matchingProd.name) : matchingProd.name;

    for (let i = 0; i < camp.emails.length; i++) {
      const email = camp.emails[i];
      const sub = subscribers.find(s => s.email === email) || { name: email.split('@')[0], email };

      const customizedMessage = (lang === 'zh' ? alertMessageZH : alertMessage)
        .replace(/{name}/g, sub.name)
        .replace(/{product_name}/g, currentProdName);

      const htmlBody = getEmailHtmlContent(sub.name, matchingProd, camp.template || 'rose', customizedMessage);
      const subject = camp.subject.replace(/{product_name}/g, currentProdName);

      try {
        await sendGmailMessage(googleToken, email, googleEmail || '', subject, htmlBody);
        successCount++;
        updatedLogs.push(`✅ [${i + 1}/${camp.emails.length}] Resent successfully to ${email}`);
      } catch (err: any) {
        console.error(`Error resending to ${email}:`, err);
        updatedLogs.push(`❌ [${i + 1}/${camp.emails.length}] Failed to resend to ${email}: ${err.message || err}`);
      }

      setSendingProgress(prev => ({
        ...prev,
        current: i + 1,
        logs: [...updatedLogs]
      }));
    }

    setIsSendingAlerts(false);

    if (successCount === camp.emails.length) {
      setAlertStatusMessage({
        type: 'success',
        text: lang === 'zh'
          ? `🎉 一键重发成功！[${camp.id}] 已完全推送至所有 ${successCount} 个邮箱！`
          : `🎉 One-click resend complete! [${camp.id}] fully pushed to all ${successCount} recipients!`
      });
    } else {
      setAlertStatusMessage({
        type: 'info',
        text: lang === 'zh'
          ? `⚠️ 重发部分完成。成功: ${successCount} 封，失败: ${camp.emails.length - successCount} 封。`
          : `⚠️ Resend partially completed. Success: ${successCount}, Failed: ${camp.emails.length - successCount}.`
      });
    }

    const resendRecord = {
      id: `RE-${camp.id}-${Math.floor(10 + Math.random() * 90)}`,
      productName: camp.productName,
      subject: `[RESEND] ${camp.subject}`,
      sentAt: new Date().toISOString(),
      recipientsCount: camp.emails.length,
      status: successCount === camp.emails.length ? 'success' : 'partial',
      template: camp.template,
      emails: camp.emails
    };
    setCampaignHistory(prev => [resendRecord, ...prev]);
  };

  const getThemeHexColor = () => {
    if (isHanyu) return '#D31558';
    if (isChaewon) return '#3F2B2B';
    if (isHwayoon) return '#C88E93';
    if (isYunseo) return '#5D6B54';
    return '#B96A73'; // Default pink
  };

  const getMonthlySpendingData = () => {
    const data: { [key: string]: number } = {};
    
    // Generate the last 6 months dynamically ending at current month
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      data[key] = 0;
    }

    // Populate actual orders into the 6-month structure
    userOrders.forEach(ord => {
      try {
        const date = new Date(ord.created_at);
        if (isNaN(date.getTime())) return;
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amt = parseFloat(ord.total_amount) || 0;
        
        if (data[key] !== undefined) {
          data[key] += amt;
        } else {
          data[key] = amt;
        }
      } catch (e) {
        console.error(e);
      }
    });

    // Convert to chart data and sort chronologically
    const sortedKeys = Object.keys(data).sort();
    return sortedKeys.map(key => {
      const [year, month] = key.split('-');
      const monthNum = parseInt(month, 10);
      let label = '';
      if (lang === 'zh') {
        label = `${monthNum}月`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${monthNames[monthNum - 1]}`;
      }
      return {
        month: label,
        rawMonth: `${year}-${month}`,
        spending: parseFloat(data[key].toFixed(2)),
      };
    });
  };
  
  // Auth Form Fields States
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authStatus, setAuthStatus] = useState({ message: '', isError: false });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);

  // Member Rewards States
  const [unlockedCoupons, setUnlockedCoupons] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cippy_unlocked_coupons') || '[]');
    } catch {
      return [];
    }
  });

  // Dynamic Products and details states
  const [dbProducts, setDbProducts] = useState<Product[]>(products);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cippy_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [giftBoxTopup, setGiftBoxTopup] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'dresses' | 'tops' | 'bottoms' | 'outerwear' | 'sets' | 'wishlist'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'best-sellers'>('newest');

  // Compare Feature state
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  const getAdvancedEmailHTML = (product: Product, subjectText: string, messageText: string, style: 'rose' | 'coffee' | 'midnight', recipientEmail: string) => {
    const name = product.name;
    const cnName = product.cnName;
    const price = product.price;
    const imageUrl = product.imageUrl || '';
    const fabric = product.fabric || 'Premium Blended Fabric / 高级混纺面料';
    const lining = product.lining || 'Lined with soft premium silk / 亲肤顺滑内衬';
    const siteUrl = window.location.origin;

    // Formatting recipient greeting
    const recipientName = recipientEmail.split('@')[0];
    const capitalRecipientName = recipientName.charAt(0).toUpperCase() + recipientName.slice(1);

    // Style setups
    let bgColor = '#FAF4F6';
    let borderColor = '#FBEBF0';
    let accentColor = '#B96A73';
    let primaryTextColor = '#3F2B2B';
    let buttonColor = '#3F2B2B';
    let containerBg = '#FFFFFF';

    if (style === 'coffee') {
      bgColor = '#FAF8F5';
      borderColor = '#E6DFD5';
      accentColor = '#8A7663';
      primaryTextColor = '#4A3E3D';
      buttonColor = '#5C4E4D';
    } else if (style === 'midnight') {
      bgColor = '#161419';
      borderColor = '#2B2433';
      accentColor = '#E39CA5';
      primaryTextColor = '#FAF5FF';
      buttonColor = '#D89CA2';
      containerBg = '#201A24';
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cippy Fairytale Alert</title>
        <style>
          body { font-family: 'Georgia', serif; background-color: ${bgColor}; margin: 0; padding: 20px; color: ${style === 'midnight' ? '#EAE2ED' : '#2D1E1E'}; }
          .container { max-width: 600px; margin: 0 auto; background-color: ${containerBg}; border: 1px solid ${borderColor}; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05); }
          .header { background: ${style === 'midnight' ? 'linear-gradient(135deg, #2B202F 0%, #1A131F 100%)' : 'linear-gradient(135deg, #FFF0F2 0%, #F5EAEB 100%)'}; padding: 40px 20px; text-align: center; border-bottom: 1px solid ${borderColor}; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 4px; color: ${style === 'midnight' ? '#FAF5FF' : '#3F2B2B'}; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 10px; font-family: monospace; letter-spacing: 2px; color: ${accentColor}; text-transform: uppercase; margin-top: 5px; margin-bottom: 0; }
          .content { padding: 40px 30px; line-height: 1.8; text-align: center; }
          .greeting { font-style: italic; font-size: 16px; color: ${style === 'midnight' ? '#C2B5C7' : '#5C4B4B'}; margin-bottom: 25px; }
          .featured-badge { display: inline-block; background-color: ${style === 'midnight' ? '#2F202F' : '#FFF0F2'}; color: ${accentColor}; font-size: 10px; font-family: monospace; font-weight: bold; text-transform: uppercase; padding: 4px 12px; border-radius: 12px; margin-bottom: 15px; }
          .product-title { font-size: 24px; font-weight: bold; color: ${style === 'midnight' ? '#FAF5FF' : '#3F2B2B'}; margin: 0; }
          .product-subtitle { font-size: 14px; color: ${style === 'midnight' ? '#9F8FA4' : '#8C7C7C'}; margin-top: 5px; margin-bottom: 25px; }
          .image-container { position: relative; margin: 30px 0; border-radius: 16px; overflow: hidden; background-color: ${style === 'midnight' ? '#251E2A' : '#FFFDFD'}; border: 1px solid ${borderColor}; }
          .product-image { width: 100%; max-height: 400px; object-fit: cover; display: block; }
          .story-box { background-color: ${style === 'midnight' ? '#1A141F' : '#FFFDFD'}; border: 1px dashed ${accentColor}; border-radius: 16px; padding: 25px; margin: 30px 0; font-size: 13px; color: ${style === 'midnight' ? '#D6C8DA' : '#5C4B4B'}; line-height: 1.8; font-style: italic; white-space: pre-line; text-align: left; }
          .specs-table { width: 100%; margin: 25px 0; border-collapse: collapse; font-size: 12px; text-align: left; color: ${style === 'midnight' ? '#9F8FA4' : '#6E5E5E'}; }
          .specs-table td { padding: 10px; border-bottom: 1px solid ${style === 'midnight' ? '#2C2533' : '#F8F5F5'}; }
          .specs-label { font-weight: bold; color: ${style === 'midnight' ? '#FAF5FF' : '#3F2B2B'}; width: 120px; }
          .price-tag { font-size: 22px; font-weight: bold; color: ${accentColor}; margin: 25px 0; }
          .cta-btn { display: inline-block; background-color: ${buttonColor}; color: #FFFFFF !important; text-decoration: none; padding: 15px 35px; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; transition: background-color 0.3s; }
          .footer { background-color: ${style === 'midnight' ? '#141117' : '#FFFDFD'}; border-top: 1px solid ${borderColor}; padding: 30px; text-align: center; font-size: 11px; color: ${style === 'midnight' ? '#867A8A' : '#9E8E8E'}; }
          .footer p { margin: 5px 0; }
          .footer-links { margin-top: 15px; }
          .footer-links a { color: ${accentColor}; text-decoration: none; margin: 0 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">Cippy Atelier</h1>
            <p class="subtitle">Bespoke Fairytale RTW &bull; Paris &bull; Seoul &bull; KL</p>
          </div>
          <div class="content">
            <p class="greeting">Dearest ${capitalRecipientName} / 亲爱的仙女闺蜜，</p>
            <span class="featured-badge">New Arrival Alert / 新品群发速递</span>
            <h2 class="product-title">${cnName}</h2>
            <h3 class="product-subtitle">${name}</h3>
            
            ${imageUrl ? `
            <div class="image-container">
              <img src="${imageUrl}" alt="${name}" class="product-image" />
            </div>
            ` : ''}

            <div class="story-box">
              ${messageText.replace('{product_name}', cnName)}
            </div>

            <table class="specs-table">
              <tr>
                <td class="specs-label">Tailoring / 剪裁</td>
                <td>Premium Loose-Fit (S/M Size Recommended) / 慵懒版型 独家剪裁</td>
              </tr>
              <tr>
                <td class="specs-label">Material / 面料</td>
                <td>${fabric}</td>
              </tr>
              <tr>
                <td class="specs-label">Lining / 内衬</td>
                <td>${lining}</td>
              </tr>
            </table>

            <div class="price-tag">RM ${price.toFixed(2)}</div>

            <a href="${siteUrl}?product=${product.id}" class="cta-btn" target="_blank">View Dress / 一键订购</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 Cippy Atelier. All rights reserved.</p>
            <p>Sent via Gmail Secure Relay for verified VIP subscribers.</p>
            <div class="footer-links">
              <a href="${siteUrl}">Boutique</a> | 
              <a href="${siteUrl}">Unsubscribe</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleAdvancedCampaignSend = async (customSubjectOverride?: string, customEmailsOverride?: string[], customProductOverride?: Product, customStyleOverride?: 'rose' | 'coffee' | 'midnight', messageOverride?: string) => {
    if (!googleToken) {
      alert(lang === 'zh' ? '🔒 请先点击“授权 Google 发件箱”按钮进行登录。' : '🔒 Please authorize your Google Sender account first.');
      return;
    }

    const targetProduct = customProductOverride || alertProduct;
    if (!targetProduct) {
      alert(lang === 'zh' ? '⚠️ 请先选择一款新品成衣。' : '⚠️ Please select a product first.');
      return;
    }

    const emailsToSend = customEmailsOverride || selectedEmails;
    if (emailsToSend.length === 0) {
      alert(lang === 'zh' ? '⚠️ 请至少勾选或添加一位订阅闺蜜邮箱。' : '⚠️ Please select at least one recipient email.');
      return;
    }

    const templateStyle = customStyleOverride || alertTemplate;
    const finalSubjectRaw = customSubjectOverride || alertSubject;
    const finalSubject = finalSubjectRaw.replace('{product_name}', lang === 'zh' ? targetProduct.cnName : targetProduct.name);

    const messageTemplate = messageOverride || (lang === 'zh' ? alertMessageZH : alertMessage);

    // Confirmation
    const confirmed = window.confirm(
      lang === 'zh'
        ? `🌸 确认要向这 ${emailsToSend.length} 位订阅者发送/重发 [${targetProduct.cnName}] 的定制 Gmail 推送吗？`
        : `🌸 Are you sure you want to broadcast the customized alert for [${targetProduct.name}] to ${emailsToSend.length} recipient(s)?`
    );
    if (!confirmed) return;

    setIsSendingAlerts(true);
    setSendingProgress({ current: 0, total: emailsToSend.length, logs: ['[System] Initializing Mail Delivery queue...'] });

    let successCount = 0;
    let failCount = 0;
    const siteUrl = window.location.origin;

    for (let i = 0; i < emailsToSend.length; i++) {
      const email = emailsToSend[i];
      const htmlContent = getAdvancedEmailHTML(targetProduct, finalSubject, messageTemplate, templateStyle, email);

      setSendingProgress(prev => ({
        ...prev,
        current: i + 1,
        logs: [...prev.logs, `[Queue] Preparing email for ${email}...`]
      }));

      try {
        await sendGmailMessage(googleToken, email, googleEmail || 'me', finalSubject, htmlContent);
        successCount++;
        setSendingProgress(prev => ({
          ...prev,
          logs: [...prev.logs, `✨ [Delivered] Successfully sent to ${email}`]
        }));
      } catch (err: any) {
        console.error(`Failed to broadcast custom campaign to ${email}:`, err);
        failCount++;
        setSendingProgress(prev => ({
          ...prev,
          logs: [...prev.logs, `❌ [Failed] Error sending to ${email}: ${err.message || err}`]
        }));
      }
    }

    // Add to campaign history
    const newCampaign = {
      id: `CAMP-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: targetProduct.name,
      subject: finalSubject,
      sentAt: new Date().toISOString(),
      recipientsCount: emailsToSend.length,
      status: failCount === 0 ? 'success' : 'partial_success',
      template: templateStyle,
      emails: emailsToSend,
      messageTemplate
    };

    setCampaignHistory(prev => [newCampaign, ...prev]);
    setIsSendingAlerts(false);

    if (failCount === 0) {
      setToastMessage(lang === 'zh' ? '🎉 新品邮件群发完成！100% 成功交付。' : '🎉 New Arrival Campaign Broadcasted! 100% delivered.');
    } else {
      setToastMessage(lang === 'zh' ? `🔔 群发完毕。成功 ${successCount} 件，失败 ${failCount} 件。` : `🔔 Broadcast completed with ${failCount} delivery failure(s).`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleCompare = (product: Product) => {
    setCompareProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        setToastMessage(lang === 'zh' ? `🔄 已移除对比："${product.cnName}"` : `🔄 Removed "${product.name}" from compare`);
        setTimeout(() => setToastMessage(null), 3000);
        return prev.filter(p => p.id !== product.id);
      } else {
        if (prev.length >= 3) {
          setToastMessage(lang === 'zh' ? "⚠️ 最多只能同时对比 3 件成衣哦！" : "⚠️ You can compare up to 3 fairytale items at once!");
          setTimeout(() => setToastMessage(null), 3000);
          return prev;
        }
        setToastMessage(lang === 'zh' ? `✨ 已加入对比："${product.cnName}"` : `✨ Added "${product.name}" to compare`);
        setTimeout(() => setToastMessage(null), 3000);
        return [...prev, product];
      }
    });
  };

  const getProductAttribute = (p: Product, attr: 'fabric' | 'transparency' | 'care' | 'stretch' | 'lining') => {
    if (attr === 'fabric') {
      if (p.fabric) return { en: p.fabric, zh: p.fabric };
      const zhDetail = p.cnDetails?.find(d => d.includes('面料') || d.includes('材质'));
      const enDetail = p.details?.find(d => d.toLowerCase().includes('fabric'));
      return {
        zh: zhDetail ? zhDetail.replace(/.*(?:面料材质|面料)[：:]\s*/, '') : '高质透气面料',
        en: enDetail ? enDetail.replace(/.*(?:fabric)[：:]\s*/i, '') : 'Premium breathable fabric'
      };
    }
    if (attr === 'care') {
      if (p.care) return { en: p.care, zh: p.care };
      const zhDetail = p.cnDetails?.find(d => d.includes('洗涤') || d.includes('保养') || d.includes('建议'));
      const enDetail = p.details?.find(d => d.toLowerCase().includes('care'));
      return {
        zh: zhDetail ? zhDetail.replace(/.*(?:洗涤建议|洗涤)[：:]\s*/, '') : '建议冷水轻柔手洗，平铺晾干',
        en: enDetail ? enDetail.replace(/.*(?:care)[：:]\s*/i, '') : 'Gentle hand wash or dry clean recommended'
      };
    }
    if (attr === 'transparency') {
      if (p.transparency) return { en: p.transparency, zh: p.transparency };
      if (p.category === 'outerwear' || p.category === 'bottoms') {
        return { zh: '不透光，厚实垂顺', en: 'Opaque with premium drape' };
      }
      if (p.name.toLowerCase().includes('mesh') || p.name.toLowerCase().includes('sheer') || p.name.toLowerCase().includes('lace')) {
        return { zh: '微透，温柔若隐若现（建议浅色内衣）', en: 'Semi-sheer (Nude base garments recommended)' };
      }
      return { zh: '不透（自带优质双层内衬或厚实针织）', en: 'Opaque (Fully lined or cozy woven fabric)' };
    }
    if (attr === 'stretch') {
      if (p.stretch) return { en: p.stretch, zh: p.stretch };
      if (p.name.toLowerCase().includes('knit') || p.name.toLowerCase().includes('sweater') || p.name.toLowerCase().includes('ribbed')) {
        return { zh: '高弹力，软糯修身贴合', en: 'Highly elastic, cozy form-fitting stretch' };
      }
      if (p.name.toLowerCase().includes('elastic') || p.name.toLowerCase().includes('drawstring') || p.category === 'sets') {
        return { zh: '中等弹力（后腰/抽绳款式，宽松舒适）', en: 'Moderate stretch (Elastic back / drawstring)' };
      }
      return { zh: '无弹/微弹（专为立体垂感剪裁打造）', en: 'Non-stretch or micro-stretch (Made for structured drape)' };
    }
    if (attr === 'lining') {
      if (p.lining) return { en: p.lining, zh: p.lining };
      if (p.category === 'dresses' || p.category === 'sets') {
        return { zh: '有亲肤顺滑内衬，穿着安心', en: 'Fully lined with smooth skin-friendly lining' };
      }
      return { zh: '无内衬（精选舒适单层透气面料）', en: 'Unlined (Lightweight, breathable single-layer fabric)' };
    }
    return { zh: '-', en: '-' };
  };
  

  // Supabase Authentication Operations
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStatus({ message: '', isError: false });
    setIsAuthLoading(true);

    if (!supabase) {
      setAuthStatus({ message: lang === 'zh' ? '系统初始化失败，请稍后再试。' : 'Supabase client is not initialized', isError: true });
      setIsAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setToastMessage(lang === 'zh' ? '✨ 欢迎回来！会员登录成功。' : '✨ Welcome back! Sign in successful.');
        setTimeout(() => setToastMessage(null), 2500);
      } else if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: {
              full_name: authName
            },
            emailRedirectTo: `${window.location.origin}/?activated=true`
          }
        });
        if (error) throw error;
        
        setIsSignUpComplete(true);
        setToastMessage(lang === 'zh' ? '✉️ 激活验证邮件已发送，请完成邮箱双重确认！' : '✉️ Verification email sent! Please complete the double-confirmation.');
        setTimeout(() => setToastMessage(null), 4000);
      } else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail);
        if (error) throw error;
        setAuthStatus({
          message: lang === 'zh' ? '✉️ 密码重置邮件已发送，请检查您的邮箱。' : '✉️ Password reset email has been sent!',
          isError: false
        });
      }
    } catch (err: any) {
      console.error("Authentication error caught:", err);
      let errMsg = lang === 'zh' ? '登录验证过程中发生错误' : 'An error occurred during authentication';
      
      if (err) {
        const errStr = String(err);
        const errMessageStr = err.message ? String(err.message) : '';
        const isFetchError = err.name === 'AuthRetryableFetchError' || 
                             errMessageStr === '{}' || 
                             errMessageStr.includes('AuthRetryableFetchError') ||
                             errStr.includes('AuthRetryableFetchError') ||
                             errStr === '{}';

        if (isFetchError) {
          // Dev note: this usually means the Supabase `profiles` table is missing a column
          // (full_name / avatar_url / email / username) that the new-user sync trigger expects.
          // Fix via Supabase SQL Editor: ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS <col> text;
          console.error(
            'Signup failed: Supabase profiles-sync trigger likely errored (missing column on public.profiles — full_name/avatar_url/email/username). Add the missing column(s) in the Supabase SQL Editor.'
          );
          errMsg = lang === 'zh'
            ? '❌ 注册暂时遇到问题，请稍后再试，或联系客服协助处理。'
            : '❌ Registration is temporarily unavailable. Please try again shortly or contact support.';
        } else {
          if (typeof err === 'string') {
            errMsg = err;
          } else if (err.message && typeof err.message === 'string') {
            errMsg = err.message;
          } else if (err.error_description && typeof err.error_description === 'string') {
            errMsg = err.error_description;
          } else if (err.error && typeof err.error === 'string') {
            errMsg = err.error;
          } else if (typeof err === 'object') {
            try {
              const str = JSON.stringify(err);
              if (str && str !== '{}') {
                errMsg = str;
              } else {
                errMsg = err.toString ? err.toString() : 'Unknown connection error';
              }
            } catch {
              errMsg = 'Unknown connection error';
            }
          }
        }
      }

      // Final sanitization of empty string / bracket representation
      if (errMsg === '{}' || !errMsg || errMsg.trim() === '{}') {
        errMsg = lang === 'zh'
          ? '❌ 认证服务器返回空响应，请检查您的网络连接或 Supabase 数据库。'
          : '❌ The authentication server returned an empty response. Please check your network or Supabase database.';
      }

      setAuthStatus({
        message: errMsg,
        isError: true
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setToastMessage(lang === 'zh' ? '🔒 账号已安全登出。' : '🔒 Securely logged out.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);
        
      if (error) {
        console.error("Error updating order status:", error);
      } else {
        setUserOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        setToastMessage(lang === 'zh' ? '✨ 物流追踪状态已更新！' : '✨ Delivery tracking status updated!');
        setTimeout(() => setToastMessage(null), 2500);
      }
    } catch (err) {
      console.error("Failed to update status in Supabase:", err);
    }
  };

  // Effect 1: Load Dynamic Products from Supabase
  React.useEffect(() => {
    async function fetchProducts() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Supabase dynamic products fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          // Admin's "上架中" toggle sets in_stock=false to delist a product — hide those from customers.
          const listed = data.filter((p: any) => p.in_stock !== false);
          const mapped: Product[] = listed.map((p: any) => ({
            id: String(p.id),
            name: p.name || "",
            cnName: p.name_zh || p.name || "",
            category: (p.category || "").toLowerCase() === 'dress' || (p.category || "").toLowerCase() === 'dresses' ? 'dresses' : 
                      (p.category || "").toLowerCase() === 'top' || (p.category || "").toLowerCase() === 'tops' ? 'tops' :
                      (p.category || "").toLowerCase() === 'bottom' || (p.category || "").toLowerCase() === 'bottoms' ? 'bottoms' :
                      (p.category || "").toLowerCase() === 'outerwear' ? 'outerwear' :
                      (p.category || "").toLowerCase() === 'set' || (p.category || "").toLowerCase() === 'sets' ? 'sets' : 'dresses',
            price: Number(p.price_myr || p.price || 0),
            sku: p.sku || undefined,
            sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M'],
            color_images: p.color_images && typeof p.color_images === 'object' ? p.color_images : undefined,
            description: p.description || "",
            cnDescription: p.description_zh || p.description || "",
            story: p.story || "",
            cnStory: p.story_zh || p.story || "",
            details: Array.isArray(p.details) ? p.details : [],
            cnDetails: Array.isArray(p.details_zh) ? p.details_zh : (Array.isArray(p.details) ? p.details : []),
            color: p.color || '#B96A73',
            bgGradient: p.bgGradient || 'from-pink-50 to-pink-100',
            imageUrl: p.image_url || '',
            detailImages: Array.isArray(p.images) ? p.images : [],
            images: Array.isArray(p.images) ? p.images : [],
            clothingType: p.clothing_type || "",
            series: p.series || "",
            fabric: p.fabric || "",
            transparency: p.transparency || "Medium",
            stretch: p.stretch || "Slight",
            lining: p.lining || "None",
            care: p.care || "Gentle Hand Wash"
          }));
          setDbProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load live Supabase products. Falling back to data.ts", err);
      }
    }
    fetchProducts();
  }, []);

  // Effect to handle email activation redirect from URL search params directly
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      if (params.get('activated') === 'true' || hashParams.get('type') === 'signup' || params.get('type') === 'signup') {
        setAuthMode('signin');
        setAuthStatus({
          message: lang === 'zh' 
            ? '🎉 邮箱双重确认成功！您已成功激活 Cippy 会员账户。现在请输入您的邮箱与密码进行登录。' 
            : '🎉 Email double-confirmation successful! You have successfully activated your Cippy Fairytale Member account. Please enter your email and password to log in.',
          isError: false
        });
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }
  }, [lang]);

  // Effect 2: Sync Supabase Session Auth
  React.useEffect(() => {
    if (!supabase) return;

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Detect if they arrived from an email confirmation link
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isActivationRedirect = params.get('activated') === 'true' || 
                                     hashParams.get('type') === 'signup' || 
                                     params.get('type') === 'signup' ||
                                     window.location.href.includes('type=signup');
        
        if (isActivationRedirect) {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setAuthMode('signin');
          setAuthStatus({
            message: lang === 'zh' 
              ? '🎉 邮箱双重确认成功！您已成功激活 Cippy 会员账户。现在请输入您的邮箱与密码进行登录。' 
              : '🎉 Email double-confirmation successful! You have successfully activated your Cippy Fairytale Member account. Please enter your email and password to log in.',
            isError: false
          });
          // Clear query params to prevent showing this message again on refresh
          if (typeof window !== 'undefined') {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
          return;
        }
      }

      setCurrentUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setUserOrders([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [lang]);

  // Effect 3: Load Profile and Order details when logged in
  React.useEffect(() => {
    if (!supabase || !currentUser) {
      setUserProfile(null);
      setUserOrders([]);
      return;
    }

    async function loadUserProfileAndOrders() {
      try {
        // Query Profile
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('points, total_spent, tier')
          .eq('id', currentUser.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        } else {
          // Auto insert profile if not exists
          const { error: insertError } = await supabase.from('profiles').insert([{
            id: currentUser.id,
            points: 0,
            total_spent: 0,
            tier: 'Classic',
            created_at: new Date().toISOString()
          }]);
          if (!insertError) {
            setUserProfile({ points: 0, total_spent: 0, tier: 'Classic' });
          }
        }

        // Query User Orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (orders) {
          setUserOrders(orders);
        }
      } catch (err) {
        console.error("Error loading user profile & orders:", err);
      }
    }

    loadUserProfileAndOrders();
  }, [currentUser]);

  // Effect 4: Persist Wishlist to LocalStorage
  React.useEffect(() => {
    localStorage.setItem('cippy_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isExist = prev.some(item => item.id === product.id);
      if (isExist) {
        setToastMessage(lang === 'zh' ? `🌸 已从收藏夹移除 "${product.cnName}"` : `🌸 Removed "${product.name}" from Saves!`);
        setTimeout(() => setToastMessage(null), 2500);
        return prev.filter(item => item.id !== product.id);
      } else {
        setToastMessage(lang === 'zh' ? `💖 已成功收藏 "${product.cnName}"！` : `💖 Added "${product.name}" to Saves!`);
        setTimeout(() => setToastMessage(null), 2500);
        return [...prev, product];
      }
    });
  };
  
  // Custom toast notification state for cart additions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Missing states for alerts and subscription management
  const [isSubscribedToAlerts, setIsSubscribedToAlerts] = useState(true);
  const handleToggleSubscribe = () => {
    setIsSubscribedToAlerts(!isSubscribedToAlerts);
    setToastMessage(
      !isSubscribedToAlerts 
        ? (lang === 'zh' ? '🌸 成功订阅！您将在新品上市时收到精美邮件。' : '🌸 Subscribed successfully! You will receive fairytale alerts.')
        : (lang === 'zh' ? '💤 已关闭订阅。' : '💤 Unsubscribed from arrival notifications.')
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [selectedArrivalProduct, setSelectedArrivalProduct] = useState<Product | null>(dbProducts[0]);
  const [composerSubject, setComposerSubject] = useState('🌸 Cippy New Arrival Alert: {product_name} is live! 🌸');
  const [selectedTemplateStyle, setSelectedTemplateStyle] = useState<'rose' | 'coffee' | 'midnight'>('rose');
  const [composerMessageZH, setComposerMessageZH] = useState('亲爱的闺蜜，Cippy 严选甄选的成衣新品 {product_name} 正式发布啦！这次的新品融合了我们最具标志性的剪裁美学，无论是蕾丝花边、棉麻垂感，还是精美蝴蝶结，都能为您带来绝妙的温润质感。欢迎点击下方链接查看新品详情与一键下单。');
  const [composerMessage, setComposerMessage] = useState('Dearest Fairytale Friend, Cippy’s boutique ready-to-wear masterpiece {product_name} has officially landed! This item features our signature loose fit silhouette, delicate romantic ribbons, and premium organic cotton-linen textures. Discover the style story and shop now via the link below.');
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<string[]>(['christinechong235@gmail.com', 'pearly.yap@cippy.my', 'weini.lim@gmail.com']);
  const [customNewSubscriberEmail, setCustomNewSubscriberEmail] = useState('');
  const [isSendingGmail, setIsSendingGmail] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState<{ current: number; total: number; logs: string[] }>({ current: 0, total: 0, logs: [] });

  const gmailEmail = googleEmail;
  const gmailToken = googleToken;

  const handleGmailLogout = async () => {
    await handleGoogleGmailSignOut();
  };

  const handleGmailLogin = async () => {
    await handleGoogleGmailSignIn();
  };

  // Filter products by category and search query
  const filteredProducts = dbProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all'
      || (selectedCategory === 'wishlist' 
        ? wishlist.some(w => w.id === p.id) 
        : p.category === selectedCategory);
    const matchesSearch = productSearchQuery.trim() === '' || 
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.cnName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
      (p.cnDescription && p.cnDescription.toLowerCase().includes(productSearchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Sort products dynamically based on selected criteria
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (sortBy === 'best-sellers') {
      // Deterministic stable sales count score for authentic best-seller experience
      const salesA = (a.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 150) + 50;
      const salesB = (b.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 150) + 50;
      return salesB - salesA;
    }
    // newest (Default): Sweet/Summer series first, then original index order
    const RIBBED_TEE_ID = 'e59bbfe1-abfa-439f-b433-88eb20d9d011';
    const isNewA = a.series === "Cippy Sweet" || a.series === "Cippy Summer";
    const isNewB = b.series === "Cippy Sweet" || b.series === "Cippy Summer";
    const scoreA = (a.id === RIBBED_TEE_ID ? 100000 : 0) + (isNewA ? 1000 : 0) + products.findIndex(orig => orig.id === a.id);
    const scoreB = (b.id === RIBBED_TEE_ID ? 100000 : 0) + (isNewB ? 1000 : 0) + products.findIndex(orig => orig.id === b.id);
    return scoreB - scoreA;
  });

  // Cart operations
  const handleAddProductToCart = (product: Product, size: 'S' | 'M') => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item =>
          (item.product.id === product.id && item.selectedSize === size)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedSize: size, quantity: 1 }];
    });

    // Trigger cart shake animation
    setIsCartAnimating(true);
    setTimeout(() => {
      setIsCartAnimating(false);
    }, 800);

    // Show custom toast notification
    setToastMessage(
      lang === 'zh'
        ? `✨ "${product.cnName}" (${size}) 已加入您的童话购物袋！`
        : `✨ "${product.name}" (${size}) added to your Storybook Bag!`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRedeemReward = async (pointsRequired: number, couponCode: string, successMessageZH: string, successMessageEN: string) => {
    if (!currentUser) {
      alert(lang === 'zh' ? '🌸 请先登录会员账号再进行兑换。' : '🌸 Please log in to redeem rewards.');
      return;
    }
    const currentPoints = userProfile?.points || 0;
    if (currentPoints < pointsRequired) {
      alert(lang === 'zh' ? '🌸 抱歉，您的积分余额不足以兑换此礼品。' : '🌸 Insufficient points balance for this reward.');
      return;
    }

    const nextPoints = currentPoints - pointsRequired;
    
    // Update local state
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, points: nextPoints } : null);
    }

    // Save to database
    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ points: nextPoints })
          .eq('id', currentUser.id);
      } catch (err) {
        console.error("Failed to update points in Supabase:", err);
      }
    }

    // Add to unlockedCoupons
    const nextCoupons = [...unlockedCoupons, couponCode];
    setUnlockedCoupons(nextCoupons);
    localStorage.setItem('cippy_unlocked_coupons', JSON.stringify(nextCoupons));

    alert(lang === 'zh' ? successMessageZH : successMessageEN);
  };

  const handleUpdateQuantity = (productId: string, size: 'S' | 'M', change: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleRemoveItem = (productId: string, size: 'S' | 'M') => {
    setCartItems(prev => prev.filter(item => !(item.product.id === productId && item.selectedSize === size)));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const refreshProfileAndOrders = async () => {
    if (!supabase || !currentUser) return;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, total_spent, tier')
        .eq('id', currentUser.id)
        .single();
      if (profile) setUserProfile(profile);

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (orders) setUserOrders(orders);
    } catch (err) {
      console.error("Refresh profile & orders failed:", err);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Handle return from Stripe Checkout redirect (?checkout=success|cancelled&order=...&session_id=...)
  const [checkoutReturnState, setCheckoutReturnState] = useState<{ status: 'success' | 'cancelled'; orderId?: string } | null>(null);
  const [isConfirmingReturn, setIsConfirmingReturn] = useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    setActiveTab('checkout');
    const cleanUrl = () => window.history.replaceState({}, '', window.location.pathname);

    if (checkout === 'cancelled') {
      setCheckoutReturnState({ status: 'cancelled' });
      cleanUrl();
      return;
    }

    if (checkout === 'success') {
      const orderId = params.get('order') || undefined;
      const sessionId = params.get('session_id') || undefined;
      setIsConfirmingReturn(true);
      (async () => {
        try {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          // Confirm regardless of login — guests still need their order marked paid,
          // they just won't earn member points (confirm-order.js handles that split).
          if (orderId) {
            await fetch('/api/confirm-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: JSON.stringify({ orderId, sessionId }),
            });
          }
          setCartItems([]);
          await refreshProfileAndOrders();
        } catch (err) {
          console.error('Order confirmation failed:', err);
        } finally {
          setCheckoutReturnState({ status: 'success', orderId });
          setIsConfirmingReturn(false);
          cleanUrl();
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#FAF4F6] text-zinc-800 font-sans selection:bg-[#FFF5F7] selection:text-[#B96A73] flex flex-col items-center justify-center p-2 sm:p-4 md:p-8"
      style={{ ...activeTheme.customProperties } as React.CSSProperties}
    >
      {/* Pristine rounded card container matching high-end mockup design */}
      <div id="nabi-studio-app-card" className="w-full max-w-7xl bg-[#FFFBFD] rounded-[32px] shadow-2xl border border-[#FBEBF0] overflow-hidden flex flex-col min-h-[90vh]">
        
        {/* Animated Announcement Ticker Row */}
        <div className="w-full bg-[#FFF0F2] text-[#B96A73] border-b border-[#FBEBF0] py-2.5 px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-medium font-sans transition-all duration-500"
          style={{
            backgroundColor: isYunseo ? '#F4F6F2' : isHwayoon ? '#FFF5F6' : isHanyu ? '#FFF5F7' : isChaewon ? '#FFF5F7' : '#FFF0F2',
            color: isYunseo ? '#5D6B54' : isHwayoon ? '#C88E93' : isHanyu ? '#D31558' : isChaewon ? '#3F2B2B' : '#B96A73',
            borderColor: isYunseo ? '#EFF2EC' : isHwayoon ? '#FDF1F2' : '#FBEBF0'
          }}
        >
          {/* Left Side: Language Switcher & Saves */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <div className="flex items-center bg-white/50 border border-current/10 rounded-full p-0.5 text-[9px] font-sans">
                <button
                  onClick={() => { if (lang !== 'zh') toggleLanguage(); }}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-bold ${
                    lang === 'zh'
                      ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#3F2B2B]'
                      : 'text-current/60 hover:text-current'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => { if (lang !== 'en') toggleLanguage(); }}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer font-bold ${
                    lang === 'en'
                      ? 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-[#3F2B2B]'
                      : 'text-current/60 hover:text-current'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
            <span className="text-zinc-300 font-light select-none">|</span>
            <button
              onClick={() => {
                setActiveTab('rtw');
                setSelectedCategory('wishlist');
                document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                setToastMessage(lang === 'zh' ? `💖 已显示您的所有收藏项目` : `💖 Showing your saved fairytale items`);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer font-semibold"
            >
              <Heart className={`w-3.5 h-3.5 text-rose-500 fill-rose-500`} />
              <span>{lang === 'zh' ? `我的收藏 (${wishlist.length})` : `Saves (${wishlist.length})`}</span>
            </button>
          </div>

          {/* Right Side: Account state portal */}
          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => {
                  setActiveTab('account');
                  document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer font-bold"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {lang === 'zh' ? `会员: ${currentUser.email?.split('@')[0]} (${userProfile?.tier || 'Classic'} Tier - ${userProfile?.points || 0} pts)` : `Hi, ${currentUser.email?.split('@')[0]} (${userProfile?.tier || 'Classic'} Tier - ${userProfile?.points || 0} pts)`}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('account');
                  setAuthMode('signin');
                  document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer font-bold"
              >
                <User className="w-3.5 h-3.5" />
                <span>{lang === 'zh' ? '会员登录 / 注册' : 'Member Portal'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Header / Navigation */}
        <header className="px-4 md:px-10 py-6 bg-white/90 border-b border-[#FBEBF0] backdrop-blur-md">
          {isYunseo ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: ESTABLISHED 2026 */}
              <div className="md:w-1/3 text-center md:text-left">
                <span className="text-[11px] tracking-[0.25em] font-sans font-bold text-[#5D6B54]/70 uppercase">
                  CIPPY MINIMAL &middot; 极简
                </span>
              </div>

              {/* Center: Brand name in sleek spacing */}
              <div className="md:w-1/3 text-center">
                <h1 
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-serif text-3xl font-semibold tracking-[0.3em] text-[#5D6B54] hover:opacity-80 transition-opacity duration-300 cursor-pointer select-none uppercase"
                >
                  CIPPY
                </h1>
              </div>

              {/* Right: navigation links with custom colors */}
              <div className="md:w-1/3 flex items-center justify-center md:justify-end gap-6 md:gap-8">
                <button
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'rtw' ? 'text-[#5D6B54] border-b border-[#5D6B54] pb-0.5' : 'text-zinc-500 hover:text-[#5D6B54] pb-0.5 border-b border-transparent'
                  }`}
                >
                  COLLECTION
                </button>
                <button
                  onClick={() => {
                    setActiveTab('atelier');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'atelier' ? 'text-[#5D6B54] border-b border-[#5D6B54] pb-0.5' : 'text-zinc-500 hover:text-[#5D6B54] pb-0.5 border-b border-transparent'
                  }`}
                >
                  ATELIER
                </button>
                <button
                  onClick={() => {
                    setActiveTab('journal');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'journal' ? 'text-[#5D6B54] border-b border-[#5D6B54] pb-0.5' : 'text-zinc-500 hover:text-[#5D6B54] pb-0.5 border-b border-transparent'
                  }`}
                >
                  THE STORY
                </button>
                <button
                  onClick={() => {
                    setActiveTab('account');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'account' ? 'text-[#5D6B54] border-b border-[#5D6B54] pb-0.5' : 'text-zinc-500 hover:text-[#5D6B54] pb-0.5 border-b border-transparent'
                  }`}
                >
                  {lang === 'zh' ? '会员中心' : 'MEMBER'}
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer uppercase ${
                    isCartAnimating 
                      ? 'animate-cart-shake text-[#5D6B54]' 
                      : 'text-zinc-500 hover:text-[#5D6B54]'
                  }`}
                >
                  BAG ({totalCartCount})
                </button>
              </div>
            </div>
          ) : isHwayoon ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: KUALA LUMPUR · SEOUL */}
              <div className="md:w-1/3 text-center md:text-left">
                <span className="text-[11px] tracking-[0.25em] font-sans font-bold text-zinc-400 uppercase">
                  KUALA LUMPUR &middot; SEOUL
                </span>
              </div>

              {/* Center: Hwa-Yoon in elegant italic serif */}
              <div className="md:w-1/3 text-center">
                <h1 
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-serif text-3xl font-bold tracking-[0.05em] italic text-[#C88E93] hover:opacity-85 transition-opacity duration-300 cursor-pointer select-none"
                >
                  Cippy Selection
                </h1>
              </div>

              {/* Right: COLLECTION, ARCHIVE, BOUTIQUE, and Cart option */}
              <div className="md:w-1/3 flex items-center justify-center md:justify-end gap-6 md:gap-8">
                <button
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'rtw' ? 'text-[#C88E93] border-b-2 border-[#C88E93] pb-0.5' : 'text-zinc-500 hover:text-[#C88E93] pb-0.5 border-b-2 border-transparent'
                  }`}
                >
                  COLLECTION
                </button>
                <button
                  onClick={() => {
                    setActiveTab('atelier');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'atelier' ? 'text-[#C88E93] border-b-2 border-[#C88E93] pb-0.5' : 'text-zinc-500 hover:text-[#C88E93] pb-0.5 border-b-2 border-transparent'
                  }`}
                >
                  ARCHIVE
                </button>
                <button
                  onClick={() => {
                    setActiveTab('journal');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'journal' ? 'text-[#C88E93] border-b-2 border-[#C88E93] pb-0.5' : 'text-zinc-500 hover:text-[#C88E93] pb-0.5 border-b-2 border-transparent'
                  }`}
                >
                  BOUTIQUE
                </button>
                <button
                  onClick={() => {
                    setActiveTab('account');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'account' ? 'text-[#C88E93] border-b-2 border-[#C88E93] pb-0.5' : 'text-zinc-500 hover:text-[#C88E93] pb-0.5 border-b-2 border-transparent'
                  }`}
                >
                  {lang === 'zh' ? '会员中心' : 'MEMBER'}
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer uppercase ${
                    isCartAnimating 
                      ? 'animate-cart-shake text-[#C88E93]' 
                      : 'text-zinc-500 hover:text-[#C88E93]'
                  }`}
                >
                  CART ({totalCartCount})
                </button>
              </div>
            </div>
          ) : isChaewon ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left navigation links: COLLECTION, THE NARRATIVE */}
              <div className="md:w-1/3 flex items-center justify-center md:justify-start gap-6 md:gap-8">
                <button
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'rtw' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <Bilingual en="COLLECTION" zh="成衣目录" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('rtw');
                    setTimeout(() => {
                      document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 0);
                  }}
                  className="text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent"
                >
                  <Bilingual en="SHOP NOW" zh="浏览商品" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('journal');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'journal' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <Bilingual en="THE NARRATIVE" zh="品牌故事" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
              </div>

              {/* Center: CHAEWON Title Logo */}
              <div className="md:w-1/3 flex justify-center">
                <img 
                  src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/logo/cippylogo.svg.PNG"
                  alt="Cippy Logo"
                  onClick={() => {
                    setActiveTab('rtw');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain hover:opacity-85 transition-opacity duration-300 cursor-pointer select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Right navigation links: ARCHIVE, MEMBER, ALERTS, CART */}
              <div className="md:w-1/3 flex items-center justify-center md:justify-end gap-6 md:gap-8">
                <button
                  onClick={() => {
                    setActiveTab('atelier');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'atelier' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <Bilingual en="ARCHIVE" zh="工坊" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
                <button
                  onClick={() => {
                    setActiveTab('policies');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'policies' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <Bilingual en="T&C" zh="政策条款" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
                {isAdminUser && (
                  <button
                    onClick={() => {
                      setActiveTab('alerts');
                      document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                      activeTab === 'alerts' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                    }`}
                  >
                    <Bilingual en="ALERTS" zh="推送群发" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveTab('account');
                    document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                    activeTab === 'account' ? 'text-[#3F2B2B] border-b-2 border-[#3F2B2B] pb-1' : 'text-zinc-500 hover:text-[#3F2B2B] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <Bilingual en="MEMBER" zh="会员中心" enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal" />
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer uppercase ${
                    isCartAnimating
                      ? 'animate-cart-shake text-[#3F2B2B]'
                      : 'text-zinc-500 hover:text-[#3F2B2B]'
                  }`}
                >
                  <Bilingual en={`CART (${totalCartCount})`} zh={`购物袋 (${totalCartCount})`} enClassName="block" zhClassName="block text-[8px] tracking-normal font-normal normal-case" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Left: Brand / ESTABLISHED 2024 */}
              <div className="md:w-1/3 flex items-center justify-center md:justify-start">
                {isHanyu ? (
                  <div 
                    onClick={() => {
                      setActiveTab('rtw');
                      document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <span className="font-serif font-bold text-2xl tracking-wider text-[#D31558] uppercase">
                      CIPPY
                    </span>
                    <span className="text-zinc-300 font-light text-xl mx-1.5">/</span>
                    <span className="font-serif font-semibold text-lg text-zinc-800">
                      韩风
                    </span>
                  </div>
                ) : (
                  <div className="text-[10px] tracking-[0.25em] font-sans text-zinc-400 font-semibold uppercase text-center md:text-left">
                    ESTABLISHED 2024
                  </div>
                )}
              </div>
   
              {/* Center: Brand Name (Only for Nabi Studio, for Hanyu it's on the left!) */}
              <div className="md:w-1/3 text-center">
                {!isHanyu ? (
                  <h1 
                    onClick={() => setActiveTab('rtw')}
                    className="font-serif text-3xl font-semibold tracking-[0.22em] text-[#D89CA2] hover:text-[#B96A73] transition-colors duration-300 cursor-pointer select-none"
                    style={{ letterSpacing: '0.22em' }}
                  >
                    CIPPY STUDIO
                  </h1>
                ) : (
                  <div className="hidden md:block text-[10px] tracking-[0.25em] font-sans text-zinc-400 font-medium uppercase">
                    SEOUL - KUALA LUMPUR DIRECT
                  </div>
                )}
              </div>
   
              {/* Right: Desktop Navigation Links */}
              <nav className="flex items-center justify-center md:justify-end gap-6 md:gap-8 md:w-1/3">
                {isHanyu ? (
                  // Hanyu Navigation links: COLLECTIONS, THE STORY, LOOSE-FIT GUIDE, MEMBER, POLICIES
                  [
                    { id: 'rtw' as const, label: 'COLLECTIONS' },
                    { id: 'journal' as const, label: 'THE STORY' },
                    { id: 'atelier' as const, label: 'LOOSE-FIT GUIDE' },
                    { id: 'account' as const, label: 'MEMBER' },
                    { id: 'policies' as const, label: 'POLICIES' }
                  ].map((link) => {
                    const isSelected = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveTab(link.id);
                          document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`text-[11px] tracking-[0.15em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                          isSelected ? 'text-[#D31558] border-b-2 border-[#D31558] pb-1' : 'text-zinc-500 hover:text-[#D31558] pb-1 border-b-2 border-transparent'
                        }`}
                      >
                        {link.label === 'MEMBER' ? (lang === 'zh' ? '会员中心' : 'MEMBER') : link.label}
                      </button>
                    );
                  })
                ) : (
                  // Nabi Navigation links: ATELIER, RTW EDITION, THE JOURNAL, MEMBER, POLICIES
                  [
                    { id: 'atelier' as const, label: 'ATELIER' },
                    { id: 'rtw' as const, label: 'RTW EDITION' },
                    { id: 'journal' as const, label: 'THE JOURNAL' },
                    { id: 'account' as const, label: 'MEMBER' },
                    { id: 'policies' as const, label: 'POLICIES' }
                  ].map((link) => {
                    const isSelected = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveTab(link.id);
                          document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                          isSelected ? 'text-[#B96A73]' : 'text-zinc-500 hover:text-[#B96A73]'
                        }`}
                      >
                        {link.label === 'MEMBER' ? (lang === 'zh' ? '会员中心' : 'MEMBER') : link.label}
                      </button>
                    );
                  })
                )}
   
                {/* CART (count) link */}
                {isHanyu ? (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className={`w-10 h-10 rounded-full border border-[#D31558] flex items-center justify-center text-xs font-serif font-bold text-[#D31558] hover:bg-[#FFF5F7] transition-all duration-300 cursor-pointer relative shrink-0 ${
                      isCartAnimating ? 'animate-cart-shake bg-[#FFF5F7]' : ''
                    }`}
                  >
                    Bag
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#D31558] text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-sans font-bold">
                        {totalCartCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className={`text-[11px] tracking-[0.2em] font-bold font-sans transition-all duration-300 cursor-pointer ${
                      isCartAnimating 
                        ? 'animate-cart-shake text-[#B96A73]' 
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    CART ({totalCartCount})
                  </button>
                )}
              </nav>
            </div>
          )}
        </header>
 
        {/* Main Viewport Content inside the frame */}
        <main id="main-viewport" className="flex-1 p-4 sm:p-6 md:p-10 transition-all duration-300">
          
          {/* RTW Edition Tab */}
          {activeTab === 'rtw' && (
            <div className="space-y-16 animate-fade-in">
              
              {/* Editorial Section matching screenshot exactly */}
              {isYunseo ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pt-2 pb-6">
                  {/* Left Column: Minimalist Modern Presentation */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:sticky lg:top-24">
                    <div className="space-y-6">
                      <span className="text-[10px] uppercase font-sans text-[#5D6B54] font-bold tracking-[0.25em] block">
                        CHAPTER 01 &mdash; SILENT STRUCTURES
                      </span>
                      <h2 className="font-serif text-5xl sm:text-6xl font-light text-[#5D6B54] leading-[1.1] tracking-tight">
                        Art of <br />
                        Muted <br />
                        Presence.
                      </h2>
                      <p className="text-xs sm:text-[13px] text-zinc-500 font-sans leading-relaxed max-w-sm">
                        An exploration of structural soft drapery. Crafted from high-density linen and combed cotton, cut to float beautifully between the skin and the environment.
                      </p>
                    </div>

                    <div className="space-y-6 pt-4">
                      {/* Brand Info */}
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] bg-[#5D6B54]/20 w-12" />
                        <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-[#5D6B54]/80 uppercase">
                          ORGANIC LINEN &amp; COMBED COTTON
                        </span>
                      </div>

                      {/* Rounded capsule button */}
                      <div>
                        <button
                          onClick={() => {
                            document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-[#5D6B54] hover:bg-[#4A5543] text-white px-10 py-3.5 rounded-none font-sans tracking-[0.2em] text-[11px] font-semibold uppercase transition-all duration-300 cursor-pointer shadow-xs hover:shadow-sm"
                        >
                          DISCOVER CURATION
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 3 asymmetrical modern design cards */}
                  <div className="lg:col-span-7">
                    <div className="space-y-8">
                      {/* Minimal card 01 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('tops');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col sm:flex-row items-center gap-6 bg-[#F4F6F2] border border-[#E4E8DF] p-6 rounded-none cursor-pointer transition-all duration-300 hover:bg-[#EFF2EC] hover:translate-x-1"
                      >
                        <div className="w-full sm:w-1/3 bg-white border border-[#E4E8DF] h-32 rounded-none relative overflow-hidden flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/004.png"
                            alt="Sage Blouse"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/5" />
                          <span className="absolute top-2 left-2 bg-[#5D6B54] text-white font-mono text-[9px] px-1 rounded-none select-none">I</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-serif text-lg font-medium text-zinc-800">The Sage Cocoon Blouse</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            Featuring asymmetric tailoring with structured drop shoulders. A lightweight silhouette drapes beautifully with absolute breeze.
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <span className="text-xs font-mono font-bold text-zinc-800">RM 45</span>
                            <span className="text-[10px] text-[#5D6B54] font-semibold tracking-wider uppercase">Linen Combed</span>
                          </div>
                        </div>
                      </div>

                      {/* Minimal card 02 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('bottoms');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col sm:flex-row items-center gap-6 bg-[#F4F6F2] border border-[#E4E8DF] p-6 rounded-none cursor-pointer transition-all duration-300 hover:bg-[#EFF2EC] hover:translate-x-1"
                      >
                        <div className="w-full sm:w-1/3 bg-white border border-[#E4E8DF] h-32 rounded-none relative overflow-hidden flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/007.png"
                            alt="Structure Pants"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/5" />
                          <span className="absolute top-2 left-2 bg-[#5D6B54] text-white font-mono text-[9px] px-1 rounded-none select-none">II</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-serif text-lg font-medium text-zinc-800">Muted Pleated Trousers</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            Crafted with high-waisted folds to give an elongated loose-fit appearance while maintaining complete ease of movement.
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <span className="text-xs font-mono font-bold text-zinc-800">RM 40</span>
                            <span className="text-[10px] text-[#5D6B54] font-semibold tracking-wider uppercase">Dry Touch Linen</span>
                          </div>
                        </div>
                      </div>

                      {/* Minimal card 03 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('dresses');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col sm:flex-row items-center gap-6 bg-[#F4F6F2] border border-[#E4E8DF] p-6 rounded-none cursor-pointer transition-all duration-300 hover:bg-[#EFF2EC] hover:translate-x-1"
                      >
                        <div className="w-full sm:w-1/3 bg-white border border-[#E4E8DF] h-32 rounded-none relative overflow-hidden flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/003.png"
                            alt="Cocoon Dress"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/5" />
                          <span className="absolute top-2 left-2 bg-[#5D6B54] text-white font-mono text-[9px] px-1 rounded-none select-none">III</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-serif text-lg font-medium text-zinc-800">Organic Minimalist Dress Set</h4>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            A relaxed aesthetic drapes flawlessly around the silhouette, emphasizing slow living and unpretentious high-fashion style.
                          </p>
                          <div className="flex items-center gap-4 pt-1">
                            <span className="text-xs font-mono font-bold text-zinc-800">RM 120</span>
                            <span className="text-[10px] text-[#5D6B54] font-semibold tracking-wider uppercase">Premium Combed Cotton</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isHwayoon ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pt-2 pb-6">
                  
                  {/* Left Column: Bold Serif Editorial Narrative */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-8 lg:sticky lg:top-24">
                    <div className="space-y-6">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 font-bold tracking-[0.25em] block">
                        CHAPTER I: THE GENTLE FLOW
                      </span>
                      <h2 className="font-serif text-5xl sm:text-6xl font-bold text-zinc-800 leading-[1.1] tracking-tight">
                        Ready-to-<br />
                        Wear <br />
                        for Soft <br />
                        Days.
                      </h2>
                      <p className="text-xs sm:text-[13px] text-zinc-500 font-sans leading-relaxed max-w-sm">
                        Inspired by Korean silhouettes, crafted for the Malaysian heart. Our new ready-to-wear pieces celebrate the beauty of loose-fitting comfort.
                      </p>
                    </div>

                    <div className="space-y-6 pt-4">
                      {/* Divider with AVAILABLE info */}
                      <div className="flex items-center gap-4">
                        <div className="h-[1px] bg-zinc-200 w-12" />
                        <span className="text-[10px] tracking-[0.2em] font-sans font-bold text-zinc-400 uppercase">
                          AVAILABLE IN S &mdash; M ONLY
                        </span>
                      </div>

                      {/* Rounded capsule button */}
                      <div>
                        <button
                          onClick={() => {
                            document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-[#C88E93] hover:bg-[#B3797D] text-white px-10 py-3.5 rounded-full font-sans tracking-[0.2em] text-[11px] font-bold uppercase transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                        >
                          BEGIN YOUR STORY
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 4-Card Grid conforming to screenshot */}
                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
                      
                      {/* Card 01 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('sets');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col cursor-pointer"
                      >
                        <div className="relative bg-[#FFF0F2]/50 border border-[#FCE3E6] rounded-2xl overflow-hidden h-[240px] shadow-2xs transition-all duration-300 group-hover:bg-[#FFF0F2]/75 group-hover:scale-[1.01] flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/005.png"
                            alt="Campus Diary Set"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-4 left-4 text-white z-10 text-left">
                            <span className="font-serif text-2xl font-light italic text-white/90 block">01</span>
                            <span className="font-sans text-[10px] tracking-[0.2em] font-bold uppercase">Campus Diary Set</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center w-full px-1 mt-3">
                          <span className="text-[11px] font-mono font-bold text-zinc-800">RM 80</span>
                          <span className="text-[10px] font-sans text-zinc-400 font-medium italic">Ruffle Skirt Set</span>
                        </div>
                      </div>

                      {/* Card 02 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('dresses');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col cursor-pointer"
                      >
                        <div className="relative bg-[#FFF0F2]/50 border border-[#FCE3E6] rounded-2xl overflow-hidden h-[240px] shadow-2xs transition-all duration-300 group-hover:bg-[#FFF0F2]/75 group-hover:scale-[1.01] flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/001.png"
                            alt="Matcha Jacquard Dress"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-4 left-4 text-white z-10 text-left">
                            <span className="font-serif text-2xl font-light italic text-white/90 block">02</span>
                            <span className="font-sans text-[10px] tracking-[0.2em] font-bold uppercase">Matcha Jacquard Dress</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center w-full px-1 mt-3">
                          <span className="text-[11px] font-mono font-bold text-zinc-800">RM 58</span>
                          <span className="text-[10px] font-sans text-zinc-400 font-medium italic">Premium Jacquard</span>
                        </div>
                      </div>

                      {/* Card 03 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('sets');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col cursor-pointer"
                      >
                        <div className="relative bg-[#FFF0F2]/50 border border-[#FCE3E6] rounded-2xl overflow-hidden h-[240px] shadow-2xs transition-all duration-300 group-hover:bg-[#FFF0F2]/75 group-hover:scale-[1.01] flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/004.png"
                            alt="Seoul Street Puff Sleeve"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-4 left-4 text-white z-10 text-left">
                            <span className="font-serif text-2xl font-light italic text-white/90 block">03</span>
                            <span className="font-sans text-[10px] tracking-[0.2em] font-bold uppercase">Seoul Street Puff Top</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center w-full px-1 mt-3">
                          <span className="text-[11px] font-mono font-bold text-zinc-800">RM 45</span>
                          <span className="text-[10px] font-sans text-zinc-400 font-medium italic">Soft Cotton</span>
                        </div>
                      </div>

                      {/* Card 04 */}
                      <div 
                        onClick={() => {
                          setSelectedCategory('sets');
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="group flex flex-col cursor-pointer"
                      >
                        <div className="relative bg-[#FFF0F2]/50 border border-[#FCE3E6] rounded-2xl overflow-hidden h-[240px] shadow-2xs transition-all duration-300 group-hover:bg-[#FFF0F2]/75 group-hover:scale-[1.01] flex items-center justify-center">
                          <img 
                            src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/003.png"
                            alt="Paris Girl Polka Set"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
                          <div className="absolute bottom-4 left-4 text-white z-10 text-left">
                            <span className="font-serif text-2xl font-light italic text-white/90 block">04</span>
                            <span className="font-sans text-[10px] tracking-[0.2em] font-bold uppercase">Paris Girl Polka Set</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center w-full px-1 mt-3">
                          <span className="text-[11px] font-mono font-bold text-zinc-800">RM 120</span>
                          <span className="text-[10px] font-sans text-zinc-400 font-medium italic">Polka Dot Cami + Cardigan</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              ) : isHanyu ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-2 pb-6">
                  {/* Left Column: White Card with Soft Pink Glowing Gradients and Cherry Blossom Flower */}
                  <div className="lg:col-span-6 flex justify-center">
                    <div className="relative bg-white rounded-[32px] border border-[#FBEBF0] p-8 md:p-12 w-full max-w-[480px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center text-center space-y-6">
                      
                      {/* Floating Bestseller Badge */}
                      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-rose-50 border border-rose-200/60 rounded-full pl-1.5 pr-2.5 py-0.5 shadow-xs">
                        <img 
                          src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/001.png"
                          alt="Bestseller"
                          className="w-5 h-5 rounded-full object-cover border border-rose-200"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[9px] font-sans font-bold text-[#D31558] tracking-wider uppercase">Best Seller</span>
                      </div>

                      {/* Gradient Blobs to match screenshot */}
                      <div className="absolute top-6 left-6 w-32 h-32 bg-[#FFD1DC]/30 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-6 right-6 w-32 h-32 bg-[#FFA6C9]/15 rounded-full blur-3xl pointer-events-none" />
                      
                      {/* Custom Cherry Blossom SVG */}
                      <div className="relative z-10 p-2">
                        <svg
                          className="w-16 h-16 text-[#D31558] animate-gentle-bounce"
                          viewBox="0 0 100 100"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="50" cy="50" r="3.5" fill="currentColor" />
                          {/* 5 petals */}
                          <path d="M 50,50 C 50,36 43,18 50,14 C 57,18 50,36 50,50 Z" />
                          <path d="M 50,50 C 60,41 79,31 82,36 C 79,43 60,41 50,50 Z" />
                          <path d="M 50,50 C 58,56 69,78 64,82 C 59,78 58,56 50,50 Z" />
                          <path d="M 50,50 C 42,56 31,78 36,82 C 41,78 42,56 50,50 Z" />
                          <path d="M 50,50 C 40,41 21,31 18,36 C 21,43 40,41 50,50 Z" />
                          
                          {/* Petite stamens */}
                          <line x1="50" y1="42" x2="50" y2="34" />
                          <line x1="56" y1="46" x2="63" y2="41" />
                          <line x1="54" y1="54" x2="61" y2="59" />
                          <line x1="46" y1="54" x2="39" y2="59" />
                          <line x1="44" y1="46" x2="37" y2="41" />
                        </svg>
                      </div>

                      {/* Text under flower */}
                      <div className="space-y-4 relative z-10">
                        <h2 className="text-2xl md:text-3xl font-serif italic font-bold text-[#D31558] tracking-tight">
                          "The Softness of Being"
                        </h2>
                        <p className="text-xs md:text-[13px] text-zinc-500 font-sans leading-relaxed max-w-sm">
                          Curated for the humid Malaysian afternoons. Our loose-fit silhouettes allow for breathability without compromising on high-end Korean aesthetics.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Modern Loose-Fit Collection Text */}
                  <div className="lg:col-span-6 flex flex-col justify-center space-y-8 pl-0 lg:pl-6">
                    <div className="space-y-2">
                      <span className="text-[11px] font-sans tracking-[0.25em] text-[#D31558] font-bold uppercase block">
                        CHAPTER 01 / READY-TO-WEAR
                      </span>
                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#2E1065] tracking-tight leading-tight">
                        Modern Loose-Fit <br />
                        Collection
                      </h2>
                    </div>

                    {/* Bullets with numbers */}
                    <div className="space-y-6 max-w-md">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold tracking-widest text-[#D31558] font-sans uppercase">
                          01. HIGH-END CRAFTSMANSHIP
                        </h4>
                        <p className="text-xs md:text-[13px] text-zinc-500 font-sans leading-relaxed">
                          Every stitch curated for the discerning Malaysian Chinese market.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold tracking-widest text-[#D31558] font-sans uppercase">
                          02. THE S-M PHILOSOPHY
                        </h4>
                        <p className="text-xs md:text-[13px] text-zinc-500 font-sans leading-relaxed">
                          Exclusively sized in Small and Medium for a perfect, intentional drape.
                        </p>
                      </div>
                    </div>

                    {/* Available card block with red left border */}
                    <div className="bg-white rounded-2xl border border-[#FBEBF0] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-[#D31558] max-w-lg">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono tracking-widest text-[#C2A383] font-bold uppercase block">
                          CURRENTLY AVAILABLE
                        </span>
                        <h3 className="font-serif font-bold text-zinc-800 text-lg leading-tight">
                          Ready-to-Wear Essentials
                        </h3>
                      </div>
                      
                      <button
                        onClick={() => {
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#D31558] hover:bg-[#b01047] text-white font-sans font-bold text-xs px-6 py-3 rounded-full shadow-md transition-all duration-300 tracking-wider cursor-pointer whitespace-nowrap uppercase"
                      >
                        EXPLORE CATALOG
                      </button>
                    </div>

                    {/* Bottom margin indicators inside the editorial area */}
                    <div className="pt-4 border-t border-[#FBEBF0] flex items-center justify-between max-w-lg">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 font-semibold uppercase">
                        EST. 2024 / SEOUL - KUALA LUMPUR
                      </span>
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D31558]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#D89CA2]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFF5F7]" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : isChaewon ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#FBEBF0] rounded-[24px] overflow-hidden bg-white shadow-xs">
                  {/* Left Column: Chapter 01, Large Pink Box with Calligraphy, and the Narrative block */}
                  <div className="lg:col-span-7 p-6 md:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#FBEBF0] space-y-8">
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-mono text-zinc-400 font-semibold tracking-[0.25em] block">
                        {lang === 'zh' ? '第一章 — 宽松轮廓美学' : 'CHAPTER 01 — THE LOOSE SILHOUETTE'}
                      </span>
                      
                      {/* Large custom image container with model photo matching mockup exactly */}
                      <div className="relative bg-[#FFF0F2]/70 rounded-2xl h-[400px] w-full flex items-center justify-center overflow-hidden border border-[#FCE3E6] group">
                        <img 
                          src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0013.jpeg"
                          alt="Chaewon Campaign"
                          className="absolute inset-0 h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-[6000ms] ease-out"
                          referrerPolicy="no-referrer"
                        />
                        {/* Elegant thin dashed border inside the box */}
                        <div className="absolute inset-4 border border-dashed border-white/60 rounded-xl pointer-events-none" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                        
                        {/* White Stylized Text in Bottom Left */}
                        <div className="absolute bottom-6 left-6 text-white font-serif text-5xl font-bold tracking-widest select-none opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                          新上市
                        </div>
                        
                        <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-xs text-[#3F2B2B] font-sans font-bold text-[9px] tracking-[0.25em] px-2.5 py-1 uppercase rounded-sm">
                          Cippy Atelier
                        </div>
                      </div>
                    </div>

                    {/* Lower narrative block: brand positioning — A Storybook Wardrobe */}
                    <div className="bg-[#FFFDFD] border border-[#FBEBF0] rounded-2xl p-6 space-y-2">
                      <h3 className="text-2xl md:text-3xl font-serif text-[#3F2B2B] leading-tight font-semibold">
                        A Storybook Wardrobe
                      </h3>
                      <span className="text-xs font-serif text-[#B96A73] font-medium block">故事衣橱</span>
                      <p className="text-xs md:text-[13px] text-zinc-500 font-sans leading-relaxed italic pt-1">
                        {lang === 'zh'
                          ? '那些你会一穿再穿的日常。'
                          : "Pieces you'll reach for, again and again."}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Fit Profile, description, CTAs and hot releases preview */}
                  <div className="lg:col-span-5 p-6 md:p-8 lg:p-10 flex flex-col justify-between space-y-8">
                    
                    {/* Fit Profile block */}
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-[#B96A73] tracking-[0.25em] font-sans uppercase block">
                        {lang === 'zh' ? '版型解析' : 'FIT PROFILE'}
                      </span>
                      <h2 className="font-serif text-3xl md:text-4xl font-semibold italic text-[#3F2B2B] tracking-tight leading-tight">
                        {lang === 'zh' ? '「温柔大廓形」' : '"The Gentle Over-Size"'}
                      </h2>
                      <p className="text-xs md:text-[13px] text-zinc-500 font-sans leading-relaxed">
                        {lang === 'zh'
                          ? '不设限的版型。留白的空间感。只做 S 与 M。'
                          : 'No rigid structures. Just space to move. S & M only.'}
                      </p>

                      {/* Action buttons matching mockup styling */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => {
                            document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-[#3F2B2B] hover:bg-[#2F1F1F] text-white px-8 py-3 rounded-lg font-sans tracking-[0.2em] text-[11px] font-bold uppercase transition-all duration-300 cursor-pointer shadow-sm"
                        >
                          {lang === 'zh' ? '立即选购' : 'SHOP NOW'}
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('journal');
                            document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="bg-white hover:bg-zinc-50 text-[#3F2B2B] border border-[#3F2B2B]/40 px-8 py-3 rounded-lg font-sans tracking-[0.2em] text-[11px] font-bold uppercase transition-all duration-300 cursor-pointer"
                        >
                          {lang === 'zh' ? '穿搭画册' : 'LOOKBOOK'}
                        </button>
                      </div>
                    </div>

                    {/* Thin border divider */}
                    <div className="border-t border-[#FBEBF0] w-full" />

                    {/* Preview product teasers */}
                    <div className="space-y-3">
                      <span className="text-[10px] tracking-[0.2em] font-mono text-zinc-400 font-bold uppercase block">
                        {lang === 'zh' ? '新品热预览' : 'HOT RELEASE PREVIEW'}
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Ribbed Crewneck Tee */}
                        {(() => {
                          const p = dbProducts.find(p => p.id === 'e59bbfe1-abfa-439f-b433-88eb20d9d011');
                          return (
                            <div
                              onClick={() => { if (p) setSelectedProduct(p); }}
                              className="group relative bg-[#FFF0F2]/40 border border-[#FBEBF0] rounded-2xl p-4 flex flex-col justify-between h-[160px] overflow-hidden hover:bg-[#FFF0F2]/60 transition-all duration-300 cursor-pointer"
                            >
                              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#B96A73] z-10" />
                              <div className="w-full h-1/2 rounded-lg overflow-hidden bg-[#FFF0F2]/70">
                                {p?.imageUrl && (
                                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                )}
                              </div>
                              <div className="space-y-0.5 pt-1">
                                <h4 className="text-[10px] sm:text-[11px] font-sans font-bold text-zinc-700 tracking-wider uppercase group-hover:text-[#B96A73] transition-colors line-clamp-1">
                                  {lang === 'zh' ? '版型超正圆领T' : 'RIBBED CREWNECK TEE'}
                                </h4>
                                <span className="text-[10px] font-mono text-[#B96A73] font-semibold">RM 15</span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Drawstring Casual Shorts */}
                        {(() => {
                          const p = dbProducts.find(p => p.id === 'bef1b190-bd86-4e1f-b3c4-c2ce24c79bca');
                          return (
                            <div
                              onClick={() => { if (p) setSelectedProduct(p); }}
                              className="group relative bg-[#FFF0F2]/40 border border-[#FBEBF0] rounded-2xl p-4 flex flex-col justify-between h-[160px] overflow-hidden hover:bg-[#FFF0F2]/60 transition-all duration-300 cursor-pointer"
                            >
                              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#B96A73] z-10" />
                              <div className="w-full h-1/2 rounded-lg overflow-hidden bg-[#FFF0F2]/70">
                                {p?.imageUrl && (
                                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                )}
                              </div>
                              <div className="space-y-0.5 pt-1">
                                <h4 className="text-[10px] sm:text-[11px] font-sans font-bold text-zinc-700 tracking-wider uppercase group-hover:text-[#B96A73] transition-colors line-clamp-1">
                                  {lang === 'zh' ? '日常必备抽绳休闲短裤' : 'DRAWSTRING CASUAL SHORTS'}
                                </h4>
                                <span className="text-[10px] font-mono text-[#B96A73] font-semibold">RM 36</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch pt-2 pb-6">
                  {/* Left Column (Arched frame and Effortless Sophistication) */}
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <span className="font-serif italic text-zinc-400 text-sm block">
                        Chapter 01: The Morning Waltz
                      </span>
                      
                      {/* Huge Arched Frame matching screenshot with real model image */}
                      <div className="relative rounded-t-full h-[380px] w-full flex flex-col justify-center items-center overflow-hidden border border-[#FBE3E6]/60 shadow-xs group">
                        <img 
                          src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0019.jpeg"
                          alt="Nabi Spring"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[6000ms] ease-out"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                        <span className="font-sans tracking-[0.25em] text-xs text-white font-semibold text-center uppercase relative z-10 drop-shadow-md">
                          LOOSE FIT / RTW SILHOUETTE
                        </span>
                        <span className="absolute bottom-8 right-8 font-serif italic text-4xl text-white relative z-10 drop-shadow-md">
                          Spring
                        </span>
                      </div>
                    </div>

                    {/* Bottom description block */}
                    <div className="pt-4 flex items-end justify-between gap-6">
                      <div className="space-y-2 max-w-sm">
                        <h2 className="text-4xl font-serif font-semibold italic text-zinc-800 leading-tight">
                          Effortless <br />
                          Sophistication
                        </h2>
                        <p className="text-xs text-zinc-500 leading-relaxed text-justify">
                          Curated for the tropical humidity of Malaysia, our Korean-inspired loose-fit collection balances airy volumes with structured elegance.
                        </p>
                      </div>
                      <span className="text-6xl font-serif font-semibold text-[#EBC4C8]/60 select-none">
                        01
                      </span>
                    </div>
                  </div>

                  {/* Right Column (Sizing narrative, READY-TO-WEAR FOCUS and the overlapping signature banner) */}
                  <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                    
                    {/* Sizing Narrative */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="h-[1px] w-12 bg-zinc-300" />
                        <span className="text-[10px] tracking-widest text-zinc-400 font-sans uppercase font-medium">
                          SIZING NARRATIVE
                        </span>
                      </div>

                      {/* Double Circles */}
                      <div className="flex gap-6 justify-start items-center">
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full border border-[#FBEBF0] flex items-center justify-center bg-white/40 shadow-xs">
                            <span className="text-2xl font-serif text-zinc-700">S</span>
                          </div>
                          <span className="text-[9px] tracking-widest text-zinc-400 font-mono uppercase mt-2">
                            PETITE FRAME
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="w-24 h-24 rounded-full border border-[#FBEBF0] flex items-center justify-center bg-white/40 shadow-xs">
                            <span className="text-2xl font-serif text-zinc-700">M</span>
                          </div>
                          <span className="text-[9px] tracking-widest text-zinc-400 font-mono uppercase mt-2">
                            STANDARD FLOW
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ready to wear focus quote */}
                    <div className="space-y-3">
                      <h3 className="font-sans tracking-widest text-xs font-semibold text-zinc-800 uppercase">
                        READY-TO-WEAR FOCUS
                      </h3>
                      <p className="font-serif italic text-xs leading-relaxed text-zinc-600 text-justify border-l border-zinc-200 pl-4">
                        "Like a childhood storybook, we believe clothing should be a sanctuary of comfort. Our high-end RTW pieces are crafted for the modern Malaysian woman who values both the avant-garde Korean aesthetic and everyday ease."
                      </p>
                    </div>

                    {/* Collection signature overlapping banner */}
                    <div className="relative pt-6 pb-4">
                      <div className="bg-[#FCE2E6] p-6 rounded-2xl relative shadow-xs">
                        <span className="text-[9px] font-mono tracking-widest text-[#D3939B] uppercase block">
                          COLLECTION SIGNATURE
                        </span>
                        <h4 className="font-serif text-2xl md:text-3xl text-[#B96A73] italic mt-1 font-semibold">
                          The Blush Canvas
                        </h4>
                      </div>
                      
                      {/* Overlapping button */}
                      <button 
                        onClick={() => {
                          document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="absolute -bottom-2 right-4 bg-[#3F3B3B] hover:bg-[#2F2B2B] text-white tracking-widest uppercase font-sans text-[10px] font-semibold px-6 py-3.5 shadow-md flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
                      >
                        EXPLORE READY TO WEAR <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Product catalog section */}
              <div id="garments-section" className="space-y-8 border-t border-[#FBEBF0] pt-12 scroll-mt-24">
                
                {/* Header / Filter row */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-[#FBEBF0] pb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-serif text-zinc-800 tracking-tight">
                      Our Ready-to-Wear Catalogue
                    </h2>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5">
                      Made for Malaysia. Lightweight. Breathable. Everyday.
                    </p>
                  </div>

                  {/* Filter Tabs & Search Row */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-1.5 flex-1 xl:flex-initial">
                      {[
                        { id: 'all', label: 'All Garments', cnLabel: '全部成衣' },
                        { id: 'wishlist', label: `Saves (${wishlist.length})`, cnLabel: '我的收藏 💖' },
                        { id: 'dresses', label: 'Dresses', cnLabel: '连衣裙' },
                        { id: 'sets', label: 'Sets', cnLabel: '套装搭配' },
                        { id: 'tops', label: 'Tops', cnLabel: '上装' },
                        { id: 'bottoms', label: 'Bottoms', cnLabel: '下装' },
                        { id: 'outerwear', label: 'Outerwear', cnLabel: '开衫外套' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer ${
                            selectedCategory === cat.id
                              ? `bg-[#FFF0F2] text-[#B96A73] border border-[#FBEBF0]`
                              : `text-zinc-500 hover:text-[#B96A73] hover:bg-[#FFF0F2]/30 border border-transparent`
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span className="text-[9px] block font-serif opacity-70 font-normal">{cat.cnLabel}</span>
                        </button>
                      ))}
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative flex items-center bg-white border border-[#FBEBF0] rounded-xl hover:border-pink-200 transition-all font-sans text-zinc-700 w-full md:w-48 shrink-0">
                      <span className="pl-3 pr-1 text-zinc-400 select-none flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 text-[#D89CA2]" />
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-xs bg-transparent py-2.5 pl-1 pr-8 outline-none rounded-xl cursor-pointer font-sans text-zinc-700 w-full appearance-none font-medium"
                      >
                        <option value="newest">{lang === 'zh' ? '✨ 最新上架' : '✨ Newest First'}</option>
                        <option value="price-asc">{lang === 'zh' ? '💸 价格：低到高' : '💸 Price: Low to High'}</option>
                        <option value="price-desc">{lang === 'zh' ? '💎 价格：高到低' : '💎 Price: High to Low'}</option>
                        <option value="best-sellers">{lang === 'zh' ? '🔥 畅销热卖' : '🔥 Best Sellers'}</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
                        <Search className="w-4 h-4 text-[#D89CA2]" />
                      </span>
                      <input
                        type="text"
                        placeholder={lang === 'zh' ? '搜索商品名称 / 拼音...' : 'Search ready-to-wear...'}
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full text-xs pl-9 pr-8 py-2.5 bg-white border border-[#FBEBF0] hover:border-pink-200 focus:border-[#B96A73] focus:ring-1 focus:ring-[#B96A73] outline-none rounded-xl transition-all font-sans text-zinc-700 placeholder-zinc-400"
                      />
                      {productSearchQuery && (
                        <button
                          onClick={() => setProductSearchQuery('')}
                          className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-[#FFF0F2]/10 rounded-3xl border border-[#FBEBF0]/40">
                    <ShoppingBag className="w-12 h-12 text-[#D89CA2] mx-auto" />
                    <p className="text-zinc-500 font-medium font-serif text-sm mt-3">
                      {productSearchQuery 
                        ? (lang === 'zh' ? `未找到符合 "${productSearchQuery}" 的童话商品。` : `No fairytale items found matching "${productSearchQuery}".`)
                        : selectedCategory === 'wishlist'
                        ? (lang === 'zh' ? '您的收藏夹是空的哦 💖 快去为心爱的衣物点亮小红心吧！' : 'Your saved fairytale list is empty. Tap the heart 💖 on any outfit to fill it with magic!')
                        : (lang === 'zh' ? '该分类下暂无商品。' : 'No fairytale items found under this shelf.')}
                    </p>
                    <div className="flex justify-center gap-4 mt-3">
                      {productSearchQuery && (
                        <button
                          onClick={() => setProductSearchQuery('')}
                          className="text-xs text-[#B96A73] underline font-sans cursor-pointer hover:text-[#A85B64] font-semibold"
                        >
                          {lang === 'zh' ? '清空搜索' : 'Clear Search'}
                        </button>
                      )}
                      {(selectedCategory !== 'all' || productSearchQuery) && (
                        <button
                          onClick={() => {
                            setSelectedCategory('all');
                            setProductSearchQuery('');
                          }}
                          className="text-xs text-[#B96A73] underline font-sans cursor-pointer hover:text-[#A85B64] font-semibold"
                        >
                          {lang === 'zh' ? '返回浏览全部成衣' : 'View All Shelves · 返回浏览全部'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div id="allProductsGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sortedProducts.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        onAddProductToCart={handleAddProductToCart}
                        onViewProduct={setSelectedProduct}
                        activeTheme={activeTheme}
                        activeArchetype={activeArchetype}
                        lang={lang}
                        onToggleCompare={handleToggleCompare}
                        isComparing={compareProducts.some(p => p.id === prod.id)}
                        isWishlisted={wishlist.some(w => w.id === prod.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    ))}
                  </div>
                )}

                {/* Quick Sizing fairy callout */}
                <div className="mt-16 bg-[#FFF5F7] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden border border-[#FBEBF0]">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FBEBF0]/30 rounded-full blur-2xl" />
                  
                  <div className="space-y-2 relative z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-1 text-[#D89CA2]">
                      <Star className="w-4 h-4 fill-[#FBEBF0]" />
                      <span className="text-xs font-mono tracking-widest font-semibold uppercase">{lang === 'zh' ? '尺码小仙女提醒' : 'SIZING FAIRY NOTICE'}</span>
                    </div>
                    <h3 className="text-lg md:text-xl font-serif text-zinc-800 tracking-tight">
                      {lang === 'zh' ? '拿不定主意选 S 还是 M？' : 'Unsure between Small (S) and Medium (M)?'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-sans max-w-xl">
                      {lang === 'zh'
                        ? '宽松版型，一测就懂。'
                        : 'Loose-fit sizing, made simple.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('atelier');
                      setAtelierSubTab('sizing');
                      document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white hover:bg-[#FFF0F2] text-[#B96A73] font-sans font-semibold text-xs px-5 py-3 rounded-xl border border-[#FBEBF0] shadow-xs transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    Open Sizing Fairy · 尺码测算 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Atelier Tab (Combined Sizing Fairy and Virtual Dressing Room) */}
          {activeTab === 'atelier' && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <span className="text-xs font-mono tracking-[0.25em] text-[#D89CA2] uppercase block">
                  Nabi Atelier Salon
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-zinc-800 tracking-tight">
                  {lang === 'zh' ? '试衣工坊' : 'Atelier Fitting & Dressing Room'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'zh'
                    ? '虚拟试穿宽松成衣搭配，或计算您的理想身形比例。'
                    : 'Virtually try on loose-fit combinations or calculate your ideal silhouette proportions.'}
                </p>
              </div>

              <div className="flex justify-center gap-6 border-b border-[#FBEBF0] pb-4 max-w-md mx-auto">
                <button
                  onClick={() => setAtelierSubTab('sizing')}
                  className={`text-xs tracking-[0.15em] font-sans font-medium uppercase pb-2 border-b-2 transition-all cursor-pointer ${
                    atelierSubTab === 'sizing' ? 'border-[#B96A73] text-[#B96A73]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {lang === 'zh' ? '尺码精灵计算器' : 'Sizing Fairy Calculator'}
                </button>
                <button
                  onClick={() => setAtelierSubTab('mirror')}
                  className={`text-xs tracking-[0.15em] font-sans font-medium uppercase pb-2 border-b-2 transition-all cursor-pointer ${
                    atelierSubTab === 'mirror' ? 'border-[#B96A73] text-[#B96A73]' : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
                >
                  {lang === 'zh' ? '虚拟试衣间' : 'Virtual Dressing Room'}
                </button>
              </div>

              {atelierSubTab === 'sizing' ? (
                <div className="animate-fade-in max-w-4xl mx-auto">
                  <SizingHelper activeTheme={activeTheme} activeArchetype={activeArchetype} lang={lang} />
                </div>
              ) : (
                <div className="animate-fade-in">
                  <MixMatchRoom onAddProductToCart={handleAddProductToCart} activeTheme={activeTheme} activeArchetype={activeArchetype} lang={lang} />
                </div>
              )}
            </div>
          )}

          {/* The Journal Tab */}
          {activeTab === 'journal' && (
            <div className="animate-fade-in">
              <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
                <span className="text-xs font-mono tracking-[0.25em] text-[#D89CA2] uppercase block">
                  Our Anthology
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-zinc-800 tracking-tight">
                  {lang === 'zh' ? '品牌纪事' : 'The Journal Chronicles'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'zh'
                    ? '阅读 Cippy 成衣背后的童话起源与穿搭日记。'
                    : "Read the fairytale origins and styling diaries behind Cippy's ready-to-wear garments."}
                </p>
              </div>
              <StoryChapters activeTheme={activeTheme} activeArchetype={activeArchetype} lang={lang} />
            </div>
          )}

          {/* Help & Policies Tab */}
          {activeTab === 'policies' && (
            <div className="space-y-8 animate-fade-in max-w-5xl mx-auto px-4">
              <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
                <span className="text-xs font-mono tracking-[0.25em] text-[#D89CA2] uppercase block">
                  Cippy Malaysia
                </span>
                <h2 className="text-2xl md:text-3xl font-serif text-zinc-800 tracking-tight">
                  {lang === 'zh' ? '政策与帮助中心' : 'Help & Policies Center'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'zh'
                    ? '购物前请仔细阅读我们的政策。如有任何疑问，随时与我们联系。'
                    : 'Please read our policies carefully before purchasing. Feel free to contact us anytime.'}
                </p>
              </div>

              {/* Master-Detail Help Center Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24 bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-[#FBEBF0] shadow-sm">
                  <div>
                    <h4 className="text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">
                      {lang === 'zh' ? '分类导航' : 'Categories'}
                    </h4>
                    
                    {/* Search Bar */}
                    <div className="relative mb-4 px-2">
                      <input
                        type="text"
                        placeholder={lang === 'zh' ? '搜索政策或问题...' : 'Search policies or FAQs...'}
                        className="w-full text-xs px-3 py-2 bg-zinc-50 border border-[#FBEBF0] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#B96A73] transition-all"
                        value={policySearchQuery}
                        onChange={(e) => setPolicySearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 max-h-[350px] lg:max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                    {/* All Option */}
                    <button
                      onClick={() => {
                        setSelectedPolicyId('all');
                        setPolicySearchQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 ${
                        selectedPolicyId === 'all' && !policySearchQuery
                          ? 'text-[#B96A73] bg-[#FFF0F2]/60 font-bold'
                          : 'text-zinc-600 hover:text-[#B96A73] hover:bg-[#FFF0F2]/30'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-[#D89CA2]">00/</span>
                      <span>{lang === 'zh' ? '查看全部政策' : 'View All Policies'}</span>
                    </button>

                    {/* Each Section Option */}
                    {POLICIES.map((p, index) => {
                      const isActive = selectedPolicyId === p.id && !policySearchQuery;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPolicyId(p.id);
                            setPolicySearchQuery('');
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 ${
                            isActive
                              ? 'text-[#B96A73] bg-[#FFF0F2]/60 font-bold'
                              : 'text-zinc-600 hover:text-[#B96A73] hover:bg-[#FFF0F2]/30'
                          }`}
                        >
                          <span className="text-[10px] font-mono text-[#D89CA2]">
                            {String(index + 1).padStart(2, '0')}/
                          </span>
                          <span>{lang === 'zh' ? p.zhTitle : p.enTitle}</span>
                        </button>
                      );
                    })}

                    {/* FAQ Category explicitly */}
                    <button
                      onClick={() => {
                        setSelectedPolicyId('faq');
                        setPolicySearchQuery('');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 ${
                        selectedPolicyId === 'faq' && !policySearchQuery
                          ? 'text-[#B96A73] bg-[#FFF0F2]/60 font-bold'
                          : 'text-zinc-600 hover:text-[#B96A73] hover:bg-[#FFF0F2]/30'
                      }`}
                    >
                      <span className="text-[10px] font-mono text-[#D89CA2]">16/</span>
                      <span>{lang === 'zh' ? '常见问题 FAQ' : 'FAQ / Q&A'}</span>
                    </button>
                  </div>
                </div>

                {/* Right Content Panel */}
                <div className="lg:col-span-8 space-y-8 min-h-[400px]">
                  {/* Search results banner if search active */}
                  {policySearchQuery && (
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 mb-4 text-xs text-zinc-500">
                      {lang === 'zh' ? '搜索结果：包含 ' : 'Search results for: "'}
                      <span className="text-[#B96A73] font-bold">"{policySearchQuery}"</span>
                      {lang === 'zh' ? ' 的相关条目' : '"'}
                      <button
                        onClick={() => setPolicySearchQuery('')}
                        className="ml-3 text-[#B96A73] underline hover:text-[#a15a62]"
                      >
                        {lang === 'zh' ? '清空搜索' : 'Clear search'}
                      </button>
                    </div>
                  )}

                  {/* Render Search Results or Selected Policy */}
                  {(() => {
                    if (policySearchQuery) {
                      const query = policySearchQuery.toLowerCase();
                      const matchedItems: any[] = [];
                      const matchedFaqs: any[] = [];

                      // Search standard policies
                      POLICIES.forEach((section) => {
                        section.items.forEach((item) => {
                          const matchesZh =
                            item.titleZh.toLowerCase().includes(query) ||
                            (item.textZh && item.textZh.toLowerCase().includes(query)) ||
                            (item.listZh && item.listZh.some(li => li.toLowerCase().includes(query)));
                          const matchesEn =
                            item.titleEn.toLowerCase().includes(query) ||
                            (item.textEn && item.textEn.toLowerCase().includes(query)) ||
                            (item.listEn && item.listEn.some(li => li.toLowerCase().includes(query)));

                          if (matchesZh || matchesEn) {
                            matchedItems.push({
                              sectionTitle: lang === 'zh' ? section.zhTitle : section.enTitle,
                              ...item,
                            });
                          }
                        });
                      });

                      // Search FAQs
                      FAQS.forEach((faq) => {
                        const matchesZh =
                          faq.qZh.toLowerCase().includes(query) ||
                          faq.aZh.toLowerCase().includes(query);
                        const matchesEn =
                          faq.qEn.toLowerCase().includes(query) ||
                          faq.aEn.toLowerCase().includes(query);

                        if (matchesZh || matchesEn) {
                          matchedFaqs.push(faq);
                        }
                      });

                      if (matchedItems.length === 0 && matchedFaqs.length === 0) {
                        return (
                          <div className="text-center py-16 bg-white rounded-3xl border border-[#FBEBF0] p-8 space-y-2">
                            <p className="text-zinc-500 text-sm">
                              {lang === 'zh' ? '未找到相关政策或问题解答。' : 'No matching policies or FAQs found.'}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {lang === 'zh' ? '试着精简关键字，或通过底部 WhatsApp 联系我们。' : 'Try simplifying your terms, or contact support below.'}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          {matchedItems.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="font-serif font-bold text-zinc-700 text-sm uppercase tracking-wider">
                                {lang === 'zh' ? '匹配的政策条目' : 'Matched Policy Articles'}
                              </h3>
                              <div className="grid grid-cols-1 gap-4">
                                {matchedItems.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-5 rounded-2xl border border-[#FBEBF0] shadow-sm space-y-3"
                                  >
                                    <div className="flex items-center justify-between gap-2 border-b border-[#FBEBF0]/40 pb-2">
                                      <span className="text-[10px] font-mono text-[#D89CA2] uppercase tracking-wider">
                                        {item.sectionTitle}
                                      </span>
                                      {item.tag && (
                                        <span
                                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            item.tag.type === 'ok'
                                              ? 'bg-emerald-50 text-emerald-600'
                                              : item.tag.type === 'no'
                                              ? 'bg-rose-50 text-rose-600'
                                              : 'bg-amber-50 text-amber-600'
                                          }`}
                                        >
                                          {lang === 'zh' ? item.tag.zh : item.tag.en}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-sans font-bold text-zinc-800 text-sm">
                                        {lang === 'zh' ? item.titleZh : item.titleEn}
                                      </h4>
                                      <p className="text-zinc-400 text-[10px] mt-0.5 font-mono">
                                        {lang === 'zh' ? item.titleEn : item.titleZh}
                                      </p>
                                    </div>
                                    {(item.textZh || item.textEn) && (
                                      <p className="text-xs text-zinc-600 leading-relaxed">
                                        {lang === 'zh' ? item.textZh : item.textEn}
                                      </p>
                                    )}
                                    {lang === 'zh' && item.textEn && (
                                      <p className="text-xs text-zinc-400 italic leading-relaxed">
                                        {item.textEn}
                                      </p>
                                    )}
                                    {lang === 'en' && item.textZh && (
                                      <p className="text-xs text-zinc-400 italic leading-relaxed">
                                        {item.textZh}
                                      </p>
                                    )}
                                    {/* Lists */}
                                    {((lang === 'zh' && item.listZh) || (lang === 'en' && item.listEn)) && (
                                      <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600">
                                        {(lang === 'zh' ? item.listZh : item.listEn)?.map((li: string, lIdx: number) => (
                                          <li key={lIdx}>{li}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {matchedFaqs.length > 0 && (
                            <div className="space-y-4 pt-4">
                              <h3 className="font-serif font-bold text-zinc-700 text-sm uppercase tracking-wider">
                                {lang === 'zh' ? '匹配的常见问题' : 'Matched Frequently Asked Questions'}
                              </h3>
                              <div className="space-y-3">
                                {matchedFaqs.map((faq, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white p-5 rounded-2xl border border-[#FBEBF0] shadow-sm space-y-2"
                                  >
                                    <h4 className="font-bold text-zinc-800 text-xs flex items-start gap-2">
                                      <span className="text-[#B96A73] font-mono font-bold">Q:</span>
                                      <span>{lang === 'zh' ? faq.qZh : faq.qEn}</span>
                                    </h4>
                                    <p className="text-zinc-600 text-xs pl-5 leading-relaxed">
                                      {lang === 'zh' ? faq.aZh : faq.aEn}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Display selected policy or All
                    const activeSections =
                      selectedPolicyId === 'all'
                        ? POLICIES
                        : POLICIES.filter((p) => p.id === selectedPolicyId);

                    return (
                      <div className="space-y-12">
                        {/* 1. Policies content blocks */}
                        {activeSections.map((section) => (
                          <div key={section.id} className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-[#FBEBF0] pb-3">
                              <span className="text-sm font-mono font-bold text-[#B96A73]">
                                {String(POLICIES.findIndex((p) => p.id === section.id) + 1).padStart(2, '0')} /
                              </span>
                              <h3 className="font-serif font-bold text-zinc-800 text-lg md:text-xl">
                                {lang === 'zh' ? section.zhTitle : section.enTitle} &middot;{' '}
                                <span className="font-sans text-xs text-zinc-400 font-normal">
                                  {lang === 'zh' ? section.enTitle : section.zhTitle}
                                </span>
                              </h3>
                            </div>

                            {/* Section Warning Banner */}
                            {section.warning && (
                              <div className="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
                                {lang === 'zh' ? section.warning.zh : section.warning.en}
                              </div>
                            )}

                            {/* Section Items */}
                            <div className="grid grid-cols-1 gap-5">
                              {section.items.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="bg-white p-5 rounded-2xl border border-[#FBEBF0] shadow-sm space-y-3 hover:shadow-md transition-shadow duration-300"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-sans font-bold text-zinc-800 text-sm">
                                      {lang === 'zh' ? item.titleZh : item.titleEn}
                                    </h4>
                                    {item.tag && (
                                      <span
                                        className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                          item.tag.type === 'ok'
                                            ? 'bg-emerald-50 text-emerald-600'
                                            : item.tag.type === 'no'
                                            ? 'bg-rose-50 text-rose-600'
                                            : 'bg-amber-50 text-amber-600'
                                        }`}
                                      >
                                        {lang === 'zh' ? item.tag.zh : item.tag.en}
                                      </span>
                                    )}
                                  </div>

                                  {(item.textZh || item.textEn) && (
                                    <p className="text-xs text-zinc-600 leading-relaxed">
                                      {lang === 'zh' ? item.textZh : item.textEn}
                                    </p>
                                  )}

                                  {/* Subtitles or alternate translation in small text */}
                                  {lang === 'zh' && item.textEn && (
                                    <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                                      {item.textEn}
                                    </p>
                                  )}
                                  {lang === 'en' && item.textZh && (
                                    <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                                      {item.textZh}
                                    </p>
                                  )}

                                  {/* Lists */}
                                  {((lang === 'zh' && item.listZh) || (lang === 'en' && item.listEn)) && (
                                    <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600">
                                      {(lang === 'zh' ? item.listZh : item.listEn)?.map((li: string, lIdx: number) => (
                                        <li key={lIdx}>{li}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* 2. Frequently Asked Questions block (only shown if all policies active or explicitly clicked FAQ) */}
                        {(selectedPolicyId === 'faq' || selectedPolicyId === 'all') && (
                          <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3 border-b border-[#FBEBF0] pb-3">
                              <span className="text-sm font-mono font-bold text-[#B96A73]">16 /</span>
                              <h3 className="font-serif font-bold text-zinc-800 text-lg md:text-xl">
                                {lang === 'zh' ? '常见问题 FAQ' : 'Frequently Asked Questions'} &middot;{' '}
                                <span className="font-sans text-xs text-zinc-400 font-normal">
                                  {lang === 'zh' ? 'Questions & Answers' : '常见问答'}
                                </span>
                              </h3>
                            </div>

                            <div className="space-y-3">
                              {FAQS.map((faq, idx) => {
                                const isOpen = faqOpenIndex === idx;
                                return (
                                  <div
                                    key={idx}
                                    className="border border-[#FBEBF0] rounded-2xl overflow-hidden bg-white shadow-sm"
                                  >
                                    <button
                                      onClick={() => setFaqOpenIndex(isOpen ? null : idx)}
                                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#FFF0F2]/20 transition-colors gap-3"
                                    >
                                      <span className="font-medium text-xs text-zinc-800">
                                        {lang === 'zh' ? faq.qZh : faq.qEn}
                                      </span>
                                      <ChevronRight
                                        className={`w-4 h-4 text-[#D89CA2] transition-transform duration-300 ${
                                          isOpen ? 'rotate-90' : ''
                                        }`}
                                      />
                                    </button>
                                    {isOpen && (
                                      <div className="px-5 pb-5 pt-1 border-t border-[#FBEBF0]/30 bg-[#FFF0F2]/10">
                                        <p className="text-xs text-zinc-600 leading-relaxed">
                                          {lang === 'zh' ? faq.aZh : faq.aEn}
                                        </p>
                                        {lang === 'zh' && (
                                          <p className="text-[11px] text-zinc-400 italic mt-1.5 leading-relaxed">
                                            {faq.aEn}
                                          </p>
                                        )}
                                        {lang === 'en' && (
                                          <p className="text-[11px] text-zinc-400 italic mt-1.5 leading-relaxed">
                                            {faq.aZh}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Customer support shortcut footer */}
                        <div className="bg-[#FFF0F2]/30 border border-[#FBEBF0] rounded-2xl p-6 text-center space-y-3">
                          <h4 className="font-serif font-bold text-zinc-800 text-sm">
                            {lang === 'zh' ? '需要额外协助吗？' : 'Still need help?'}
                          </h4>
                          <p className="text-xs text-zinc-500">
                            {lang === 'zh'
                              ? '如果您对商品尺寸、面料、洗涤或订单有任何疑问，请随时联系我们的客服。'
                              : 'If you have any questions regarding sizes, fabrics, care or your order, reach out to us.'}
                          </p>
                          <a
                            href="https://wa.me/601120861073"
                            target="_blank"
                            referrerPolicy="no-referrer"
                            className="inline-flex items-center gap-2 bg-[#B96A73] hover:bg-[#a15a62] text-white text-xs px-5 py-2.5 rounded-full font-bold shadow-md transition-all duration-200"
                          >
                            <Mail className="w-4 h-4" />
                            <span>{lang === 'zh' ? 'WhatsApp 客服 (+601120861073)' : 'WhatsApp Customer Support (+601120861073)'}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>
          )}

          {/* Account Portal / VIP Member Dashboard Tab */}
          {activeTab === 'account' && (
            <div className="space-y-12 animate-fade-in max-w-5xl mx-auto py-4">
              {!currentUser ? (
                /* 1. Logged Out State: Sleek Dual-Language Auth Form */
                <div className="max-w-md mx-auto bg-white border border-[#FBEBF0] rounded-3xl p-8 shadow-sm space-y-6">
                  {isSignUpComplete ? (
                    <div className="text-center space-y-6 py-2 animate-fade-in">
                      {/* Magical floating envelope icon */}
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-pink-100 rounded-full blur-xl opacity-70 animate-pulse" />
                          <div className="relative w-16 h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-[#B96A73]">
                            <Mail className="w-8 h-8" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-serif text-zinc-800 font-bold">
                          {lang === 'zh' ? '🌸 双重激活邮件已发送' : '🌸 Verification Email Sent'}
                        </h3>
                        <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                          {lang === 'zh' 
                            ? `我们已向您的邮箱 ${authEmail} 发送了一封激活验证邮件。请检查您的收件箱（或垃圾邮件箱），并点击邮件中的激活链接。` 
                            : `We have sent an activation email to ${authEmail}. Please check your inbox (or spam folder) and click the activation link.`}
                        </p>
                      </div>

                      <div className="bg-[#FFFDFC] border border-[#FBEBF0] rounded-2xl p-4 text-left text-xs space-y-3">
                        <h4 className="font-bold text-zinc-700 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#B96A73]" />
                          {lang === 'zh' ? '接下来该怎么做？' : 'What to do next?'}
                        </h4>
                        <ol className="list-decimal pl-4 text-zinc-500 space-y-1.5 leading-relaxed">
                          <li>
                            {lang === 'zh' 
                              ? '打开您的电子邮箱，寻找来自 Cippy Fairytale Boutique 的双重激活验证邮件。' 
                              : 'Open your mailbox and look for the verification email from Cippy Fairytale Boutique.'}
                          </li>
                          <li>
                            {lang === 'zh' 
                              ? '点击邮件中的“确认您的邮箱” (Confirm your email) 激活链接。' 
                              : 'Click the "Confirm your email" activation link inside the message.'}
                          </li>
                          <li>
                            {lang === 'zh' 
                              ? '链接点击后您将被重定向回当前会员登录页面，您即可安全登录您的专属童话账户！' 
                              : 'After clicking, you will be redirected back here where you can securely log in and access your fairytale workspace.'}
                          </li>
                        </ol>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setIsSignUpComplete(false);
                            setAuthMode('signin');
                            setAuthStatus({ message: '', isError: false });
                          }}
                          className="w-full py-3 bg-[#B96A73] hover:bg-[#A85B64] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>{lang === 'zh' ? '已完成激活？前往登录' : 'Activated? Go to Sign In'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={async () => {
                            try {
                              setIsAuthLoading(true);
                              const { error } = await supabase!.auth.signUp({
                                email: authEmail,
                                password: authPassword,
                                options: {
                                  data: { full_name: authName }
                                }
                              });
                              if (error) throw error;
                              setToastMessage(lang === 'zh' ? '✨ 激活邮件已重新发送！' : '✨ Activation email resent successfully!');
                              setTimeout(() => setToastMessage(null), 2500);
                            } catch (err: any) {
                              setToastMessage(err.message || (lang === 'zh' ? '重新发送失败' : 'Resend failed'));
                              setTimeout(() => setToastMessage(null), 2500);
                            } finally {
                              setIsAuthLoading(false);
                            }
                          }}
                          disabled={isAuthLoading}
                          className="text-[10px] text-[#B96A73] hover:underline font-bold block mx-auto pt-1"
                        >
                          {isAuthLoading 
                            ? (lang === 'zh' ? '正在重发中...' : 'Resending...') 
                            : (lang === 'zh' ? '没有收到邮件？点击重新发送' : 'Didn\'t get it? Click to resend email')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Logo displayed beautifully */}
                      <div className="flex justify-center mb-6">
                        <img 
                          src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/logo/cippylogo.svg.PNG" 
                          alt="Cippy Logo" 
                          className="h-12 w-auto object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Switch Tabs */}
                      <div className="flex border-b border-zinc-100 pb-3">
                        <button
                          onClick={() => {
                            setAuthMode('signin');
                            setAuthStatus({ message: '', isError: false });
                            setIsSignUpComplete(false);
                          }}
                          className={`flex-1 text-center py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                            authMode === 'signin'
                              ? 'text-[#B96A73] border-b-2 border-[#B96A73]'
                              : 'text-zinc-400 hover:text-zinc-600'
                          }`}
                        >
                          {lang === 'zh' ? '会员登录' : 'Sign In'}
                        </button>
                        <button
                          onClick={() => {
                            setAuthMode('signup');
                            setAuthStatus({ message: '', isError: false });
                            setIsSignUpComplete(false);
                          }}
                          className={`flex-1 text-center py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                            authMode === 'signup'
                              ? 'text-[#B96A73] border-b-2 border-[#B96A73]'
                              : 'text-zinc-400 hover:text-zinc-600'
                          }`}
                        >
                          {lang === 'zh' ? '注册账号' : 'Register'}
                        </button>
                      </div>

                      {/* Header Title */}
                      <div className="text-center space-y-1">
                        <span className="font-serif italic text-xs text-[#D89CA2]">
                          {authMode === 'signin'
                            ? (lang === 'zh' ? '欢迎回来，亲爱的' : 'Welcome back, dreamer')
                            : (lang === 'zh' ? '开启您的童话之旅' : 'Begin your storybook journey')}
                        </span>
                        <h3 className="text-xl font-serif text-zinc-800 tracking-tight">
                          {authMode === 'signin'
                            ? (lang === 'zh' ? 'Cippy 专属会员中心' : 'Cippy Member Account')
                            : (lang === 'zh' ? '开启您的童话旅程' : 'Create Fairy Account')}
                        </h3>
                      </div>

                      {/* Continuous Loading reassurance state if registering */}
                      {isAuthLoading && authMode === 'signup' && (
                        <div className="p-4 bg-pink-50/70 border border-pink-100/40 rounded-2xl space-y-2 text-center animate-pulse">
                          <div className="flex justify-center items-center gap-2">
                            <div className="w-4 h-4 border-2 border-[#B96A73]/30 border-t-[#B96A73] rounded-full animate-spin" />
                            <span className="text-xs font-bold text-[#B96A73]">
                              {lang === 'zh' ? '会员注册安全连接中...' : 'Connecting register services...'}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-relaxed">
                            {lang === 'zh' 
                              ? '✨ 我们正在为您连接 Supabase 安全服务器并派发双重激活邮件。这通常需要几秒钟，请勿关闭或刷新此页面。' 
                              : '✨ We are connecting to Supabase cloud and issuing a verification email. This takes a few seconds. Please do not close or refresh.'}
                          </p>
                        </div>
                      )}

                      {/* Status Alerts */}
                      {authStatus.message && (
                        <div className={`p-4 text-xs leading-relaxed rounded-xl border whitespace-pre-line ${
                          authStatus.isError
                            ? 'bg-rose-50 border-rose-100 text-rose-600'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          {authStatus.message}
                        </div>
                      )}

                      {/* Actual Form */}
                      <form onSubmit={handleAuthSubmit} className="space-y-4">
                        {authMode === 'signup' && (
                          <div className="space-y-1.5">
                            <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block font-bold">
                              {lang === 'zh' ? '您的姓名 / Name' : 'Name'}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                placeholder="e.g. Rachel Lim"
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                className="w-full text-xs font-sans px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#B96A73] transition-all bg-zinc-50/50"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 block font-bold">
                            {lang === 'zh' ? '电子邮箱地址 / Email Address' : 'Email Address'}
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              placeholder="your.name@example.com"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              className="w-full text-xs font-sans px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#B96A73] transition-all bg-zinc-50/50"
                            />
                          </div>
                        </div>

                        {authMode !== 'forgot' && (
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-400 font-bold">
                                {lang === 'zh' ? '密码 / Password (6+ digits)' : 'Password (6+ characters)'}
                              </label>
                              {authMode === 'signin' && (
                                <button
                                  type="button"
                                  onClick={() => setAuthMode('forgot')}
                                  className="text-[10px] text-[#B96A73] hover:underline font-bold"
                                >
                                  {lang === 'zh' ? '忘记密码?' : 'Forgot?'}
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="w-full text-xs font-sans px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#B96A73] transition-all bg-zinc-50/50"
                              />
                            </div>
                          </div>
                        )}

                        {authMode === 'forgot' && (
                          <button
                            type="button"
                            onClick={() => setAuthMode('signin')}
                            className="text-[10px] text-zinc-400 hover:text-[#B96A73] font-bold"
                          >
                            ← {lang === 'zh' ? '返回密码登录' : 'Back to Login'}
                          </button>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isAuthLoading}
                          className="w-full py-3 bg-[#B96A73] hover:bg-[#A85B64] text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                        >
                          {isAuthLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>
                                {authMode === 'signup'
                                  ? (lang === 'zh' ? '正在进行安全注册...' : 'REGISTERING...')
                                  : (lang === 'zh' ? '安全登录中...' : 'CONNECTING...')}
                              </span>
                            </>
                          ) : (
                            <span>
                              {authMode === 'signin'
                                ? (lang === 'zh' ? '安全登录 / Sign In' : 'Sign In Securely')
                                : authMode === 'signup'
                                ? (lang === 'zh' ? '立即注册 / Join Club' : 'Register & Join Club')
                                : (lang === 'zh' ? '发送重置链接 / Reset' : 'Send Reset Link')}
                            </span>
                          )}
                        </button>
                      </form>

                      {/* Fairytale Benefit disclaimer */}
                      <div className="border-t border-zinc-100 pt-4 space-y-2 text-[10px] text-zinc-400 leading-relaxed font-sans">
                        <p className="font-bold text-zinc-500 uppercase tracking-wider text-center">
                          🌟 {lang === 'zh' ? 'Cippy 会员尊享特权' : 'CIPPY LOYALTY PRIVILEGES'}
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>{lang === 'zh' ? '下单自动积分：每消费 RM1 累积 1 积分，返现立等可用' : 'Earn 1 Loyalty Point for every RM1 spent on ready-to-wear.'}</li>
                          <li>{lang === 'zh' ? '等级成长：积分越高享永久折扣越丰厚（最高白金卡永久9折）' : 'Level up to Gold or Platinum for lifetime automated cashbacks.'}</li>
                          <li>{lang === 'zh' ? '订单云存储：随时登录追踪物流、发货包裹与开箱记录' : 'Access order timelines, SPX Express tracking codes, and packaging choices.'}</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* 2. Logged In State: Dynamic VIP Dashboard with Order Timelines */
                <div className="space-y-10">
                  {/* Banner Profile Card */}
                  <div className="bg-gradient-to-r from-[#FFF5F7] via-[#FFFDFE] to-[#FFF0F2] border border-[#FBEBF0] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-100/30 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D89CA2]/10 rounded-full blur-2xl" />
                    
                    <div className="flex items-center gap-4 relative z-10 text-center md:text-left flex-col sm:flex-row">
                      <div className="w-16 h-16 rounded-full bg-white border border-[#FBEBF0] shadow-sm flex items-center justify-center text-2xl font-serif text-[#B96A73] font-bold">
                        {currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                          <h3 className="font-serif text-lg font-bold text-zinc-800">
                            {currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}
                          </h3>
                          <span className={`px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-full border ${
                            userProfile?.tier === 'Platinum'
                              ? 'bg-purple-50 text-purple-600 border-purple-200'
                              : userProfile?.tier === 'Gold'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-zinc-50 text-zinc-500 border-zinc-200'
                          }`}>
                            {userProfile?.tier || 'Classic'} VIP
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-sans">
                          {lang === 'zh' ? `已绑定邮箱：${currentUser.email}` : `Connected via ${currentUser.email}`}
                        </p>
                      </div>
                    </div>

                    {/* Stats Counter Row */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-8 relative z-10 w-full md:w-auto">
                      {/* Stat 01: Points Balance */}
                      <div className="bg-white/75 backdrop-blur-xs border border-white/60 p-4 rounded-2xl text-center shadow-xs">
                        <span className="text-[10px] tracking-widest text-zinc-400 font-mono block uppercase">
                          {lang === 'zh' ? '我的积分余额' : 'POINTS BALANCE'}
                        </span>
                        <span className="text-2xl font-serif font-bold text-[#B96A73] block mt-0.5 animate-pulse">
                          {userProfile?.points || 0} <span className="text-xs font-normal font-sans">pts</span>
                        </span>
                        <span className="text-[9px] text-zinc-400 font-sans">
                          {lang === 'zh' ? '每 100 积分可折抵 RM5' : '100 pts = RM5 cash rebate'}
                        </span>
                      </div>

                      {/* Stat 02: Total Invested */}
                      <div className="bg-white/75 backdrop-blur-xs border border-white/60 p-4 rounded-2xl text-center shadow-xs">
                        <span className="text-[10px] tracking-widest text-zinc-400 font-mono block uppercase">
                          {lang === 'zh' ? '累计消费总额' : 'TOTAL SPENT'}
                        </span>
                        <span className="text-2xl font-serif font-bold text-zinc-800 block mt-0.5">
                          RM {userProfile?.total_spent || 0}
                        </span>
                        <span className="text-[9px] text-[#B96A73] font-sans font-bold">
                          {userProfile?.tier === 'Platinum' ? '✨ 享受永久 9.0 折白金特惠' : userProfile?.tier === 'Gold' ? '✨ 享受永久 9.5 折黄金特惠' : '满 RM150 即可自动升级为黄金卡'}
                        </span>
                      </div>
                    </div>

                    {/* Log out option */}
                    <div className="shrink-0 relative z-10 w-full md:w-auto flex justify-center">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-rose-200/60 hover:bg-rose-50 text-rose-500 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{lang === 'zh' ? '安全退出' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>

                  {/* VIP Membership Card & Daily Check-In Grid */}
                  <div className="grid grid-cols-1 gap-6 sm:gap-8 max-w-xl mx-auto w-full">
                    {/* VIP Card: Cippy Atelier Fairy Pass */}
                    <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-xs">
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                          <Award className="w-5 h-5 text-[#B96A73]" />
                          {lang === 'zh' ? '尊贵会员卡 / Fairy Pass' : 'Exclusive Fairy Pass'}
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans">
                          {lang === 'zh' ? 'Cippy 梦幻工作室定制会员凭证，彰显您独特的优雅品味。' : 'Your bespoke membership credentials issued by Cippy Atelier.'}
                        </p>
                      </div>

                      {/* 3D Glassmorphic Premium VIP Pass */}
                      <div className="relative aspect-[1.586/1] w-full max-w-sm mx-auto bg-gradient-to-br from-[#2D1E1E] via-[#4A3232] to-[#1E1414] rounded-2xl p-5 text-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden group select-none">
                        {/* Shimmer light effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                        
                        {/* Elegant background graphics */}
                        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#B96A73]/20 rounded-full blur-xl" />
                        <div className="absolute bottom-4 left-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

                        {/* Top Section of Card */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-serif text-sm tracking-widest font-bold text-[#E5D5D5]">CIPPY ATELIER</span>
                            <span className="block text-[8px] font-mono tracking-widest text-[#B96A73]/80 uppercase mt-0.5">PARIS &bull; SEOUL &bull; KL</span>
                          </div>
                          {/* Elegant virtual microchip design */}
                          <div className="w-8 h-6 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-md border border-amber-300 opacity-85 flex items-center justify-center p-0.5 relative overflow-hidden">
                            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-600/30" />
                            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-amber-600/30" />
                            <div className="w-4 h-3 border border-amber-500/40 rounded-xs" />
                          </div>
                        </div>

                        {/* Card Center: Tier & Holographic Text */}
                        <div className="my-5">
                          <span className="text-[10px] tracking-[0.2em] text-[#C8B8B8] font-mono block uppercase">{lang === 'zh' ? '会员特权级别' : 'TIER CLASSIFICATION'}</span>
                          <span className="text-xl font-serif font-bold tracking-widest bg-gradient-to-r from-pink-200 via-[#FBEBF0] to-yellow-100 bg-clip-text text-transparent uppercase mt-1 block">
                            {userProfile?.tier || 'Classic'} VIP
                          </span>
                        </div>

                        {/* Card Footer: Holder name and Serial Number */}
                        <div className="flex justify-between items-end pt-2 border-t border-white/10 text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[8px] tracking-wider text-[#9E8E8E] font-mono block">{lang === 'zh' ? '持卡人姓名' : 'CARD HOLDER'}</span>
                            <span className="font-sans font-semibold tracking-wide text-[#EAE0E0]">
                              {currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0]}
                            </span>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-[8px] tracking-wider text-[#9E8E8E] font-mono block">{lang === 'zh' ? '专属会员卡号' : 'MEMBER SERIAL'}</span>
                            <span className="font-mono text-[10px] tracking-widest text-amber-100 font-bold">
                              8888 2026 {currentUser.id.substring(0, 4).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tier benefits overview details */}
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-[11px] text-zinc-500 space-y-1.5 font-sans leading-relaxed">
                        <span className="font-bold text-[#B96A73] uppercase tracking-wider block">
                          {lang === 'zh' ? '✦ 等级成长与永久权益 ✦' : '✦ Tier Benefits Matrix ✦'}
                        </span>
                        <div className="flex justify-between border-b pb-1 border-zinc-100">
                          <span className="font-semibold text-zinc-700">{lang === 'zh' ? 'Classic (初始等级):' : 'Classic (Starter):'}</span>
                          <span>{lang === 'zh' ? '享 1:1 下单积分返现' : '1:1 Point Reward back'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1 border-zinc-100">
                          <span className="font-semibold text-[#C88E93]">{lang === 'zh' ? 'Gold (满 RM150):' : 'Gold (Over RM150):'}</span>
                          <span>{lang === 'zh' ? '享全店成衣永久 9.5 折特权' : 'Lifetime 5% Off discount'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-purple-600">{lang === 'zh' ? 'Platinum (最高级):' : 'Platinum (Highest):'}</span>
                          <span>{lang === 'zh' ? '享全店成衣永久 9.0 折特权' : 'Lifetime 10% Off discount'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unlocked Rewards Vault Section */}
                  <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                    <div className="border-b pb-3 border-zinc-100">
                      <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        {lang === 'zh' ? '已解锁的会员奖励仓库 / Unlocked Rewards Vault' : 'Your Unlocked Rewards Vault'}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">
                        {lang === 'zh' ? '已成功兑换的专属折扣码、运费券与礼盒升级凭证记录：' : 'Review and copy your active loyalty discount codes and voucher passes:'}
                      </p>
                    </div>

                    {unlockedCoupons.length === 0 ? (
                      <div className="text-center py-8 bg-[#FFF5F7]/10 rounded-2xl border border-dashed border-zinc-200/80">
                        <p className="text-xs text-zinc-400 italic">
                          {lang === 'zh' ? '🌸 仓库里空荡荡的。点击下方“积分好礼”兑换，即可解锁并保存您的折扣码！' : '🌸 Your vault is empty. Redeem items below to fill your fairytale vault!'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unlockedCoupons.map((code, idx) => {
                          let labelZH = "";
                          let labelEN = "";
                          let colorTheme = "pink";

                          if (code === "CIPGIFT150") {
                            labelZH = "免费升级豪华定制礼盒";
                            labelEN = "Complimentary Gift Wrapping Pass";
                            colorTheme = "pink";
                          } else if (code === "CIPTEN300") {
                            labelZH = "RM15 立折现金抵扣券";
                            labelEN = "RM15 Off Cash Rebate Voucher";
                            colorTheme = "amber";
                          } else if (code === "CIPSHIP200") {
                            labelZH = "全马免运费无限折抵券";
                            labelEN = "Free Standard Shipping Pass";
                            colorTheme = "purple";
                          } else {
                            labelZH = "专属优惠代码";
                            labelEN = "Exclusive Coupon Pass";
                            colorTheme = "zinc";
                          }

                          return (
                            <div key={idx} className={`border p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-2xs ${
                              colorTheme === 'pink' 
                                ? 'bg-rose-50/20 border-rose-100 text-rose-800' 
                                : colorTheme === 'amber' 
                                ? 'bg-amber-50/20 border-amber-100 text-amber-800' 
                                : 'bg-purple-50/20 border-purple-100 text-purple-800'
                            }`}>
                              <div className="space-y-1">
                                <span className={`text-[8px] tracking-wider font-mono px-1.5 py-0.5 rounded-sm uppercase font-bold ${
                                  colorTheme === 'pink' ? 'bg-rose-100/50 text-rose-700' : colorTheme === 'amber' ? 'bg-amber-100/50 text-amber-700' : 'bg-purple-100/50 text-purple-700'
                                }`}>
                                  {lang === 'zh' ? '已解锁可用' : 'ACTIVE PASS'}
                                </span>
                                <h5 className="text-xs font-bold text-zinc-800 mt-1">{lang === 'zh' ? labelZH : labelEN}</h5>
                              </div>
                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-100">
                                <span className="font-mono text-xs font-bold tracking-wider select-all select-none text-zinc-700 bg-white border border-zinc-200/50 px-2 py-1 rounded-md shrink-0">
                                  {code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(code);
                                    alert(lang === 'zh' ? `💖 代码 [${code}] 已复制！在购物车结账时填入即可使用。` : `💖 Code [${code}] copied to clipboard!`);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] bg-zinc-900 text-white font-bold px-2.5 py-1.5 rounded-md hover:bg-[#B96A73] transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{lang === 'zh' ? '复制' : 'Copy'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Points Redemption Rewards Section */}
                  <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
                    <div className="border-b pb-3 border-zinc-100">
                      <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        {lang === 'zh' ? '积分好礼限时兑换 / Point Rewards' : 'Point Redemption Boutique'}
                      </h4>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5">
                        {lang === 'zh' ? '用您在 Cippy 的消费积分解锁仙女礼盒升级和独家成衣折扣券：' : 'Redeem your loyalty points for direct cart benefits and special upgrades:'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Reward 01: Free Gift Box upgrade */}
                      <div className="border border-zinc-100 p-4 rounded-2xl bg-[#FFFDFD] space-y-3 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-[9px] tracking-wider font-mono bg-[#FFF0F2] text-[#B96A73] px-1.5 py-0.5 rounded-sm uppercase font-bold">Gift wrapping</span>
                          <h5 className="text-xs font-bold text-zinc-800 mt-1">{lang === 'zh' ? '免费升级豪华定制礼盒' : 'Free Luxury Gift Box Upgrade'}</h5>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{lang === 'zh' ? '单笔订单不限消费额直接免费升级价值 RM15 包装' : 'Receive complimentary silk wrapping for your entire bag.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                          <span className="text-xs font-serif font-bold text-[#B96A73]">150 pts</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemReward(
                              150, 
                              "CIPGIFT150", 
                              "💖 兑换成功！专属免邮码 [CIPGIFT150] 已复制到您的已解锁会员奖励仓库！", 
                              "💖 Redeemed successfully! Pass [CIPGIFT150] added to your active rewards vault."
                            )}
                            className="text-[10px] bg-zinc-950 text-white font-bold px-3 py-1.5 rounded-md hover:bg-[#B96A73] transition-colors cursor-pointer"
                          >
                            {lang === 'zh' ? '立即兑换' : 'Redeem'}
                          </button>
                        </div>
                      </div>

                      {/* Reward 02: RM15 Voucher */}
                      <div className="border border-zinc-100 p-4 rounded-2xl bg-[#FFFDFD] space-y-3 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-[9px] tracking-wider font-mono bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-sm uppercase font-bold">Cash voucher</span>
                          <h5 className="text-xs font-bold text-zinc-800 mt-1">{lang === 'zh' ? 'RM15 立折现金抵扣券' : 'RM15 Off Cash Coupon'}</h5>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{lang === 'zh' ? '无门槛现金抵扣券，全店成衣皆可折上折抵扣' : 'Direct cash rebate on any ready-to-wear catalog item.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                          <span className="text-xs font-serif font-bold text-amber-700">300 pts</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemReward(
                              300, 
                              "CIPTEN300", 
                              "💖 兑换成功！专属抵扣码 [CIPTEN300] 已生成，已保存至您的会员奖励仓库！", 
                              "💖 Redeemed successfully! Voucher [CIPTEN300] added to your active rewards vault."
                            )}
                            className="text-[10px] bg-zinc-950 text-white font-bold px-3 py-1.5 rounded-md hover:bg-amber-600 transition-colors cursor-pointer"
                          >
                            {lang === 'zh' ? '立即兑换' : 'Redeem'}
                          </button>
                        </div>
                      </div>

                      {/* Reward 03: Free shipping coupon */}
                      <div className="border border-zinc-100 p-4 rounded-2xl bg-[#FFFDFD] space-y-3 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <span className="text-[9px] tracking-wider font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-sm uppercase font-bold">Free shipping</span>
                          <h5 className="text-xs font-bold text-zinc-800 mt-1">{lang === 'zh' ? '全马免运费无限折抵券' : 'Free Shipping Direct Pass'}</h5>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{lang === 'zh' ? '支持西马/东马/新加坡，直接免除整笔包裹快递邮费' : 'Waiver of flat SPX Express postage fees for Malaysian deliveries.'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-zinc-50">
                          <span className="text-xs font-serif font-bold text-purple-700">200 pts</span>
                          <button
                            type="button"
                            onClick={() => handleRedeemReward(
                              200, 
                              "CIPSHIP200", 
                              "💖 兑换成功！免邮代码 [CIPSHIP200] 已生成，已保存至您的会员奖励仓库！", 
                              "💖 Redeemed successfully! Pass [CIPSHIP200] added to your active rewards vault."
                            )}
                            className="text-[10px] bg-zinc-950 text-white font-bold px-3 py-1.5 rounded-md hover:bg-purple-600 transition-colors cursor-pointer"
                          >
                            {lang === 'zh' ? '立即兑换' : 'Redeem'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gmail New Arrival Alerts & Broadcaster Hub — admin only */}
                  {isAdminUser && (
                  <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-8 shadow-xs">
                    <div className="border-b pb-4 border-zinc-100">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-[#B96A73]" />
                            {lang === 'zh' ? '仙女新品邮件速递中心 / Fairytale Gmail Alerts' : 'Fairytale Gmail Alert Hub'}
                          </h4>
                          <p className="text-xs text-zinc-400 font-sans">
                            {lang === 'zh' ? '使用 Gmail 接口向 VIP 闺蜜发送和重发优雅定制的韩国款新品上市通知' : 'Connect your Gmail account to broadcast or resend boutique arrival notifications directly to subscribers.'}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-[#FFF0F2] text-[#B96A73] px-2.5 py-1 rounded-full uppercase">
                          Gmail API Live
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left Part: Customer Subscription Control (5 cols) */}
                      <div className="lg:col-span-5 bg-[#FFFDFC]/60 border border-[#FBEBF0]/80 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFF0F2]/50 rounded-bl-full -z-10" />
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 text-[#B96A73] border border-rose-100 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase">
                            <Bell className="w-3 h-3" />
                            {lang === 'zh' ? '客户通知偏好' : 'Customer Alert Preference'}
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-serif font-bold text-[#3F2B2B] text-sm">
                              {lang === 'zh' ? '订购新品上市提醒邮件' : 'Subscribe to Fairytale Alerts'}
                            </h5>
                            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                              {lang === 'zh' ? '开启后，每当 Cippy 上新全新高级剪裁成衣时，您的 Gmail 邮箱将会第一时间收到带有严选甄选手记和穿搭故事的精美 HTML 邮件！' : 'Be the absolute first to receive custom layout catalogs, story chapter cards, and purchase links whenever a new Cippy item lands.'}
                            </p>
                          </div>

                          {/* Subscription Status Badge */}
                          <div className="py-2.5 px-3 bg-white border border-zinc-100 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-zinc-400 block uppercase">{lang === 'zh' ? '我的状态' : 'My Status'}</span>
                              <span className={`text-xs font-bold ${isSubscribedToAlerts ? 'text-emerald-600' : 'text-zinc-500'}`}>
                                {isSubscribedToAlerts 
                                  ? (lang === 'zh' ? '🌸 已开启新品提醒' : '🌸 Active Subscriber') 
                                  : (lang === 'zh' ? '💤 未开启提醒' : '💤 Unsubscribed')}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleToggleSubscribe}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 ${
                                isSubscribedToAlerts 
                                  ? 'bg-zinc-150 hover:bg-zinc-200 text-zinc-700 border border-zinc-200' 
                                  : 'bg-[#B96A73] hover:bg-[#a15a62] text-white shadow-xs'
                              }`}
                            >
                              {isSubscribedToAlerts 
                                ? (lang === 'zh' ? '取消订阅' : 'Unsubscribe') 
                                : (lang === 'zh' ? '开启订阅' : 'Subscribe Now')}
                            </button>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#D89CA2] bg-pink-50/20 border border-pink-100/40 p-3 rounded-xl italic font-serif">
                          {lang === 'zh' 
                            ? '“每件衣服都是一封写给明日晴空的信。” —— Cippy Atelier' 
                            : '"Every garment is a handwritten letter to a beautiful tomorrow."'}
                        </div>
                      </div>

                      {/* Right Part: Broadcaster (7 cols) */}
                      <div className="lg:col-span-7 space-y-6">
                        {/* 1. Google Sender Auth Panel */}
                        <div className="border border-[#FBEBF0] rounded-2xl p-5 bg-zinc-50/30 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-mono text-[#D89CA2] tracking-widest uppercase font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-[#B96A73]" />
                                {lang === 'zh' ? 'MERCHANT GMAIL 账户发件授权' : 'MERCHANT GMAIL AUTHORIZATION'}
                              </span>
                              <h5 className="text-xs font-bold text-zinc-700">
                                {googleEmail 
                                  ? (lang === 'zh' ? `已连接发件人：${googleEmail}` : `Sender Connected: ${googleEmail}`) 
                                  : (lang === 'zh' ? '授权您的 Google 发件箱发送邮件' : 'Authorize Gmail API Sender Account')}
                              </h5>
                            </div>

                            {googleEmail ? (
                              <button
                                type="button"
                                onClick={handleGoogleGmailSignOut}
                                className="inline-flex items-center gap-1.5 text-[10px] bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                <LogOut className="w-3 h-3" />
                                <span>{lang === 'zh' ? '退出断开' : 'Disconnect'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleGoogleGmailSignIn}
                                className="inline-flex items-center gap-1.5 text-[10px] bg-[#3F2B2B] hover:bg-zinc-800 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
                              >
                                <Globe className="w-3.5 h-3.5 text-pink-300 animate-spin" />
                                <span>{lang === 'zh' ? '授权 Google 发件箱' : 'Authorize Google Sender'}</span>
                              </button>
                            )}
                          </div>

                          <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                            {lang === 'zh' 
                              ? '为符合 RFC 安全协议，群发新品提醒需使用您的个人/商业 Gmail API 授权。系统不会存储您的密码，仅在本地缓存临时 Token 以便通过官方 OAuth 发信。' 
                              : 'To securely broadcast or resend alerts, authorize Cippy to communicate via the Gmail Send API. Access tokens are kept safe in memory.'}
                          </p>
                        </div>

                        {/* 2. Broadcast Campaign Controller (only interactive if auth complete) */}
                        <div className={`border rounded-2xl p-5 space-y-5 transition-all duration-300 ${
                          googleEmail ? 'border-[#FBEBF0] bg-white shadow-xs' : 'border-dashed border-zinc-200 bg-zinc-50/50 opacity-70'
                        }`}>
                          <div className="flex items-center justify-between border-b pb-2 border-zinc-100">
                            <span className="text-[10px] font-mono tracking-widest text-[#B96A73] font-bold uppercase flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                              {lang === 'zh' ? '新品邮件广播控制台' : 'AIRALERT BROADCASTER CONTROL'}
                            </span>
                            {!googleEmail && (
                              <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded">
                                {lang === 'zh' ? '🔒 等待 Google 授权' : '🔒 Waiting for Auth'}
                              </span>
                            )}
                          </div>

                          {/* Select Dress / Product */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                              {lang === 'zh' ? '选择要推荐的新品成衣 / Select New Garment' : 'Feature New Arrival'}
                            </label>
                            <select
                              disabled={!googleEmail}
                              value={alertProduct?.id || ''}
                              onChange={(e) => {
                                const prod = dbProducts.find(p => p.id === e.target.value);
                                if (prod) setAlertProduct(prod);
                              }}
                              className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2 text-xs font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed"
                            >
                              {dbProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  {lang === 'zh' ? `【RM ${p.price}】${p.cnName} (${p.name})` : `[RM ${p.price}] ${p.name}`}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Email Preview Card */}
                          {alertProduct && (
                            <div className="bg-[#FFFDFD] border border-dashed border-[#FBEBF0] rounded-xl p-3.5 space-y-2.5 text-xs">
                              <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase">{lang === 'zh' ? '邮件预览草稿' : 'LIVE MAIL TEMPLATE PREVIEW'}</span>
                              <div className="space-y-1">
                                <p className="font-sans text-zinc-600">
                                  <strong>Subject:</strong> 🌸 Cippy {lang === 'zh' ? '新品速递' : 'New Arrival'}: {lang === 'zh' ? alertProduct.cnName : alertProduct.name} {lang === 'zh' ? '梦幻登场!' : 'is Here!'} 👗
                                </p>
                                <p className="font-sans text-zinc-400 text-[11px] line-clamp-1">
                                  <strong>Sender:</strong> {googleEmail || 'me'}
                                </p>
                              </div>
                              <div className="border-t pt-2.5 flex items-center gap-3">
                                <div className="w-12 h-12 rounded bg-pink-50 border border-pink-100 overflow-hidden shrink-0">
                                  {alertProduct.imageUrl ? (
                                    <img src={alertProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : '👗'}
                                </div>
                                <div className="space-y-0.5">
                                  <h6 className="font-bold text-zinc-700 leading-tight">
                                    {lang === 'zh' ? alertProduct.cnName : alertProduct.name}
                                  </h6>
                                  <p className="text-[10px] text-[#B96A73] font-mono font-bold">
                                    RM {alertProduct.price.toFixed(2)}
                                  </p>
                                  <p className="text-[9px] text-zinc-400 line-clamp-1 italic font-serif">
                                    {lang === 'zh' ? alertProduct.cnStory : alertProduct.story}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Subscribers List Manager */}
                          <div className="space-y-2.5">
                            <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                              {lang === 'zh' ? `VIP 订阅闺蜜名单 (${subscribers.length} 位)` : `Active Fairy Subscribers (${subscribers.length})`}
                            </label>

                            <div className="flex gap-2">
                              <div className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  disabled={!googleEmail}
                                  placeholder={lang === 'zh' ? '姓名 / Name' : 'Name'}
                                  value={newSubName}
                                  onChange={(e) => setNewSubName(e.target.value)}
                                  className="w-1/3 bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2 text-xs font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed"
                                />
                                <input
                                  type="email"
                                  disabled={!googleEmail}
                                  placeholder={lang === 'zh' ? '邮箱地址 / Email' : 'Email address'}
                                  value={newSubEmail}
                                  onChange={(e) => setNewSubEmail(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddSubscriber(newSubEmail, newSubName);
                                    }
                                  }}
                                  className="flex-1 bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2 text-xs font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed"
                                />
                              </div>
                              <button
                                type="button"
                                disabled={!googleEmail}
                                onClick={() => handleAddSubscriber(newSubEmail, newSubName)}
                                className="bg-[#3F2B2B] hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Scrolling list */}
                            <div className="max-h-[140px] overflow-y-auto border border-zinc-100 rounded-xl divide-y divide-zinc-50 bg-white">
                              {subscribers.map((sub) => (
                                <div key={sub.email} className="flex items-center justify-between px-3 py-2 text-[11px] font-sans">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-zinc-700">{sub.name}</span>
                                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100/50 px-1.5 py-0.2 rounded font-mono">
                                        {sub.tier}
                                      </span>
                                    </div>
                                    <span className="text-zinc-500 font-mono text-[10px] block">{sub.email}</span>
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!googleEmail}
                                    onClick={() => handleRemoveSubscriber(sub.email)}
                                    className="text-zinc-400 hover:text-rose-600 transition-colors p-1"
                                    title={lang === 'zh' ? '删除订阅者' : 'Remove Subscriber'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Submit / Send Action Button */}
                          <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            <button
                              type="button"
                              disabled={!googleEmail || isSendingAlerts}
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  lang === 'zh'
                                    ? `🌸 确认要向 ${subscribers.length} 位订阅闺蜜群发新品 [${alertProduct?.cnName || alertProduct?.name}] 的 Gmail 提醒邮件吗？`
                                    : `🌸 Are you sure you want to broadcast the Gmail alert for [${alertProduct?.name}] to ${subscribers.length} recipient(s)?`
                                );
                                if (confirmed) {
                                  await handleSendCampaign(false);
                                }
                              }}
                              className={`flex-1 font-serif font-bold text-xs uppercase tracking-widest text-white py-3.5 rounded-xl transition-all duration-300 transform shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                                googleEmail 
                                  ? 'bg-[#B96A73] hover:bg-[#a15a62] hover:-translate-y-0.5' 
                                  : 'bg-zinc-300 cursor-not-allowed'
                              }`}
                            >
                              {isSendingAlerts ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                  <span>{lang === 'zh' ? '仙女群发中...' : 'BROADCASTING...'}</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 text-pink-100" />
                                  <span>
                                    {lang === 'zh' 
                                      ? `📢 群发提醒 (${subscribers.length}人)` 
                                      : `📢 Broadcast (${subscribers.length} Recip.)`}
                                  </span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={!googleEmail || isSendingAlerts}
                              onClick={async () => {
                                await handleSendCampaign(true, googleEmail || undefined);
                              }}
                              className={`px-4 py-3.5 font-serif font-bold text-xs uppercase tracking-wider rounded-xl transition-all border shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
                                googleEmail 
                                  ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200' 
                                  : 'bg-zinc-100 text-zinc-400 border-zinc-150 cursor-not-allowed'
                              }`}
                              title={lang === 'zh' ? '发送单封测试邮件到您的发件箱邮箱以验证格式' : 'Send a mock email to your own inbox to preview'}
                            >
                              <span>🧪 {lang === 'zh' ? '发测试信' : 'Send Test'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resend Center & Campaign Logs */}
                    <div className="border-t pt-6 border-zinc-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h5 className="font-serif font-bold text-zinc-800 text-sm flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-zinc-400" />
                            {lang === 'zh' ? '历史群发与一键重发中心' : 'Campaign Logs & One-Click Resend'}
                          </h5>
                          <p className="text-[10px] text-zinc-400 font-sans">
                            {lang === 'zh' ? '查看通过 Google SDK 成功发送的历史邮件，并可一键重新激活推送' : 'Review historic campaigns sent securely, and re-trigger with zero manual input.'}
                          </p>
                        </div>
                      </div>

                      {/* History list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {campaignHistory.map((camp) => (
                          <div key={camp.id} className="bg-zinc-50/50 border border-zinc-150/50 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold bg-[#3F2B2B] text-cream-50 px-2 py-0.5 rounded uppercase">
                                  {camp.id}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">
                                  {new Date(camp.sentAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h6 className="text-xs font-bold text-zinc-700 line-clamp-1">
                                {camp.productName}
                              </h6>
                              <p className="text-[10px] text-zinc-500 font-sans line-clamp-1">
                                <strong>Subject:</strong> {camp.subject}
                              </p>
                              <p className="text-[9px] text-zinc-400">
                                <strong>Recipients ({camp.recipientsCount}):</strong> {camp.emails.join(', ')}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-zinc-100/60">
                              <span className="text-[10px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {lang === 'zh' ? '发送成功' : 'Delivered'}
                              </span>

                              <button
                                type="button"
                                disabled={!googleEmail || isSendingAlerts}
                                onClick={async () => {
                                  const confirmed = window.confirm(
                                    lang === 'zh'
                                      ? `🌸 确认要重新对这 ${camp.recipientsCount} 位订阅者一键群发历史提醒 [${camp.id}] 吗？`
                                      : `🌸 Re-trigger campaign [${camp.id}]? This will securely resend alerts to ${camp.recipientsCount} subscribers.`
                                  );
                                  if (confirmed) {
                                    await handleResendCampaign(camp);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-[#B96A73] hover:text-[#a15a62] disabled:text-zinc-300 transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{lang === 'zh' ? '一键重发' : 'One-Click Resend'}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Monthly Spending Trends Section */}
                  <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b pb-3 border-zinc-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#B96A73]" style={{ color: getThemeHexColor() }} />
                          {lang === 'zh' ? '月度消费趋势 / Monthly Spending' : 'Your Monthly Spending Trends'}
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans">
                          {lang === 'zh' ? '基于您在 Cippy 的历史订单，自动分析近 6 个月的消费金额趋势：' : 'Visualize your purchase amounts across the last 6 months:'}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-zinc-50 border px-3 py-1 text-zinc-500 rounded-lg shrink-0">
                        {lang === 'zh' ? `总消费 RM ${userProfile?.total_spent || 0}` : `Total Spent: RM ${userProfile?.total_spent || 0}`}
                      </span>
                    </div>

                    <div className="w-full h-[260px] pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getMonthlySpendingData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                          <XAxis 
                            dataKey="month" 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'monospace' }} 
                          />
                          <YAxis 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fontSize: 11, fill: '#71717a', fontFamily: 'monospace' }}
                            tickFormatter={(v) => `RM ${v}`}
                          />
                          <Tooltip 
                            cursor={{ fill: '#FFF5F7', opacity: 0.15 }}
                            content={({ active, payload }: any) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white/95 backdrop-blur-md border border-zinc-100 p-3 rounded-2xl shadow-md">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono font-bold">
                                      {payload[0].payload.rawMonth}
                                    </p>
                                    <p className="text-xs font-bold text-zinc-800 mt-1">
                                      {lang === 'zh' ? '消费金额' : 'Spending'}: <span className="text-[#B96A73]" style={{ color: getThemeHexColor() }}>RM {payload[0].value.toFixed(2)}</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="spending" 
                            fill={getThemeHexColor()} 
                            radius={[6, 6, 0, 0]} 
                            barSize={32} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Real-time Order History Section */}
                  <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b pb-3 border-zinc-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                          <ClipboardList className="w-5 h-5 text-[#B96A73]" />
                          {lang === 'zh' ? '我的历史成衣订单 / Order History' : 'Your Fairytale Order History'}
                        </h4>
                        <p className="text-xs text-zinc-400 font-sans">
                          {lang === 'zh' ? '购买过的 Cippy 成衣、包装礼盒与物流状态云记录：' : 'Review previous checkout items, gift-wrapping choices, and statuses:'}
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold bg-zinc-50 border px-3 py-1 text-zinc-500 rounded-lg shrink-0">
                        Total {userOrders.length}
                      </span>
                    </div>

                    {userOrders.length === 0 ? (
                      /* Empty Order History State */
                      <div className="text-center py-16 bg-[#FFF5F7]/15 rounded-2xl border border-[#FBEBF0]/40 space-y-3">
                        <ShoppingBag className="w-10 h-10 text-[#D89CA2] mx-auto animate-bounce" />
                        <h5 className="font-serif italic text-zinc-700 text-xs font-bold">
                          {lang === 'zh' ? '您的会员衣柜空空的' : 'Your Storybook Wardrobe is Empty'}
                        </h5>
                        <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                          {lang === 'zh' ? '您还没有购买过 Cippy 的童话服饰。现在就前往我们的 Ready-to-Wear 产品系列中探索吧！' : 'You have not made any purchases yet. Head back to the collection to start your fairytale.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('rtw');
                            document.getElementById('garments-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="mt-2 text-xs bg-[#B96A73] text-white font-sans px-5 py-2 rounded-xl hover:bg-[#A85B64] transition-all cursor-pointer"
                        >
                          {lang === 'zh' ? '浏览全部成衣' : 'Explore Ready-to-Wear'}
                        </button>
                      </div>
                    ) : (
                      /* Table / Cards of Live Supabase Orders */
                      <div className="space-y-6">
                        {userOrders.map((ord) => {
                          // Try to parse items
                          let itemsArray: any[] = [];
                          try {
                            itemsArray = typeof ord.items === 'string' ? JSON.parse(ord.items) : (Array.isArray(ord.items) ? ord.items : []);
                          } catch {
                            itemsArray = [];
                          }

                          const statusStr = ord.status || 'pending';
                          let statusStepIndex = 0;
                          if (statusStr === 'pending' || statusStr === 'unpaid') {
                            statusStepIndex = 0;
                          } else if (statusStr === 'processing' || statusStr === 'ready_to_pack' || statusStr === 'packed' || statusStr === 'paid') {
                            statusStepIndex = 1;
                          } else if (statusStr === 'shipped' || statusStr === 'dispatched') {
                            statusStepIndex = 2;
                          } else if (statusStr === 'delivered' || statusStr === 'completed') {
                            statusStepIndex = 3;
                          }

                          return (
                            <div key={ord.id} className="border border-zinc-100 rounded-2xl p-5 hover:border-[#FBEBF0] transition-colors bg-zinc-50/20 space-y-5">
                              {/* Order metadata line */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 border-zinc-100 text-xs">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">ORDER REFERENCE</span>
                                  <span className="font-mono font-bold text-zinc-700">#{ord.id.substring(0, 13)}...</span>
                                </div>
                                <div className="space-y-0.5 sm:text-right">
                                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">ORDER DATE</span>
                                  <span className="text-zinc-600 font-medium">
                                    {new Date(ord.created_at).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <div className="space-y-0.5 sm:text-right">
                                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">STATUS</span>
                                  {statusStr === 'pending' || statusStr === 'unpaid' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-0.5 rounded-full uppercase">
                                      {lang === 'zh' ? '等候处理 (Pending)' : 'Pending'}
                                    </span>
                                  ) : statusStr === 'processing' || statusStr === 'ready_to_pack' || statusStr === 'packed' || statusStr === 'paid' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest bg-teal-50 text-teal-600 border border-teal-100 px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                                      {lang === 'zh' ? '配货包装中 (Packing)' : 'Ready to Pack'}
                                    </span>
                                  ) : statusStr === 'shipped' || statusStr === 'dispatched' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                                      {lang === 'zh' ? '包裹已寄出 (Shipped)' : 'Shipped via SPX Express'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                                      {lang === 'zh' ? '已签收 (Delivered)' : 'Delivered'}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Dynamic Visual Step-by-Step Progress Timeline */}
                              <div className="bg-[#FFFDFC]/80 border border-[#FBEBF0] rounded-2xl p-4 md:p-5 space-y-4 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-mono tracking-widest text-[#B96A73] font-bold uppercase flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-[#B96A73] animate-bounce" />
                                    {lang === 'zh' ? '实时物流状态追踪 / Delivery Progress' : 'Live Delivery Tracking Timeline'}
                                  </span>
                                  {/* Simulate SPX Express Progress controller for user testing */}
                                  <div className="flex items-center gap-1.5 bg-pink-50/50 border border-pink-100/55 rounded-lg px-2 py-1">
                                    <span className="text-[9px] font-medium text-pink-500 font-mono">
                                      {lang === 'zh' ? '测试物流模拟:' : 'Test Sim:'}
                                    </span>
                                    <select
                                      value={statusStr}
                                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                      className="bg-transparent border-none text-[9px] font-semibold text-zinc-600 focus:outline-none cursor-pointer"
                                    >
                                      <option value="pending">{lang === 'zh' ? '1. 已下单' : '1. Placed'}</option>
                                      <option value="processing">{lang === 'zh' ? '2. 配货包装' : '2. Packing'}</option>
                                      <option value="shipped">{lang === 'zh' ? '3. 已寄出 SPX' : '3. Shipped'}</option>
                                      <option value="delivered">{lang === 'zh' ? '4. 已签收' : '4. Delivered'}</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Timeline Steps (Desktop Row / Mobile Column) */}
                                <div className="relative pt-2">
                                  {/* Desktop Horizontal Line */}
                                  <div className="hidden md:block absolute top-[18px] left-[12%] right-[12%] h-[3px] bg-zinc-100 -z-0 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-pink-300 to-[#B96A73] transition-all duration-1000 ease-in-out" 
                                      style={{ width: `${(statusStepIndex / 3) * 100}%` }}
                                    />
                                  </div>

                                  {/* Mobile Vertical Line (only visible on mobile) */}
                                  <div className="block md:hidden absolute top-[16px] bottom-[16px] left-[16px] w-[3px] bg-zinc-100 -z-0 rounded-full overflow-hidden">
                                    <div 
                                      className="w-full bg-gradient-to-b from-pink-300 to-[#B96A73] transition-all duration-1000 ease-in-out" 
                                      style={{ height: `${(statusStepIndex / 3) * 100}%` }}
                                    />
                                  </div>

                                  {/* Responsive steps container */}
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-2 relative z-10">
                                    {[
                                      {
                                        id: 0,
                                        titleEN: "Order Placed",
                                        titleZH: "订单已提交",
                                        descEN: "Preparing boutique items",
                                        descZH: "童话衣橱配发中",
                                        icon: Clock
                                      },
                                      {
                                        id: 1,
                                        titleEN: "Ribbon Packing",
                                        titleZH: "配货包装中",
                                        descEN: "Perfumed ribbon box wrapping",
                                        descZH: "手折蝴蝶结香氛礼盒",
                                        icon: Package
                                      },
                                      {
                                        id: 2,
                                        titleEN: "Shipped via SPX Express",
                                        titleZH: "已寄出 SPX",
                                        descEN: "SPX Express live tracking is active",
                                        descZH: "交付 SPX Express 运输",
                                        icon: Truck
                                      },
                                      {
                                        id: 3,
                                        titleEN: "Delivered",
                                        titleZH: "已签收配送",
                                        descEN: "Enjoy your lovely wear",
                                        descZH: "宝贝已安全抵达您的手中",
                                        icon: Check
                                      }
                                    ].map((step) => {
                                      const isCompleted = statusStepIndex >= step.id;
                                      const isActive = statusStepIndex === step.id;
                                      const StepIcon = step.icon;

                                      // Estimated delivery calculations
                                      const createdDate = new Date(ord.created_at);
                                      const estDate = new Date(createdDate);
                                      if (step.id === 1) estDate.setDate(createdDate.getDate() + 1);
                                      else if (step.id === 2) estDate.setDate(createdDate.getDate() + 2);
                                      else if (step.id === 3) estDate.setDate(createdDate.getDate() + 4);
                                      
                                      const dateStr = estDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      });

                                      return (
                                        <div 
                                          key={step.id} 
                                          className={`flex md:flex-col items-start md:items-center text-left md:text-center gap-3 md:gap-1.5 transition-all ${
                                            isActive ? 'scale-[1.01] font-semibold' : 'opacity-85'
                                          }`}
                                        >
                                          {/* Step Icon Node */}
                                          <div className="relative shrink-0 flex items-center justify-center">
                                            {/* Pulse animation for active step */}
                                            {isActive && (
                                              <span className="absolute inline-flex h-9 w-9 rounded-full bg-pink-100 animate-ping opacity-75" />
                                            )}
                                            
                                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all z-10 ${
                                              isCompleted 
                                                ? 'bg-[#B96A73] border-[#B96A73] text-white shadow-xs' 
                                                : 'bg-white border-zinc-200 text-zinc-400'
                                            }`}>
                                              {isCompleted && step.id < statusStepIndex ? (
                                                <Check className="w-4 h-4 text-white" strokeWidth={3} />
                                              ) : (
                                                <StepIcon className={`w-4 h-4 ${isActive ? 'animate-pulse text-white' : ''}`} />
                                              )}
                                            </div>
                                          </div>

                                          {/* Step details content */}
                                          <div className="space-y-0.5 md:pt-1">
                                            <div className="flex items-center gap-1 md:justify-center">
                                              <span className={`text-[11px] tracking-wide block ${isCompleted ? 'text-zinc-800 font-bold' : 'text-zinc-400 font-medium'}`}>
                                                {lang === 'zh' ? step.titleZH : step.titleEN}
                                              </span>
                                              {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                                              )}
                                            </div>
                                            
                                            <span className="text-[9px] text-zinc-400 block max-w-[140px] leading-relaxed md:mx-auto">
                                              {lang === 'zh' ? step.descZH : step.descEN}
                                            </span>

                                            {/* Dynamic Estimated date display */}
                                            <span className={`text-[9px] font-mono block md:mx-auto ${isCompleted ? 'text-[#B96A73] font-bold' : 'text-zinc-300'}`}>
                                              {isActive ? (lang === 'zh' ? `进行中 · ${dateStr}` : `Active · ${dateStr}`) : 
                                               isCompleted ? (lang === 'zh' ? `已完成 · ${dateStr}` : `Completed · ${dateStr}`) : 
                                               (lang === 'zh' ? `预计 · ${dateStr}` : `Est · ${dateStr}`)}
                                            </span>

                                            {/* Real SPX Express tracking number, filled in by admin when the order ships */}
                                            {step.id === 2 && isCompleted && (
                                              <span className="text-[8px] font-mono bg-zinc-100 border border-zinc-200/50 px-1 py-0.5 rounded-sm text-zinc-500 block w-fit md:mx-auto mt-0.5 select-all">
                                                SPX: <strong className="text-zinc-700 font-bold">{(ord as any).tracking_number || (lang === 'zh' ? '待补填' : 'pending')}</strong>
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* Items Breakdown list */}
                              <div className="space-y-2">
                                <span className="text-[9px] font-mono tracking-widest text-zinc-400 uppercase block font-bold">{lang === 'zh' ? '订购商品' : 'ITEMS ORDERED'}</span>
                                <div className="space-y-3">
                                  {itemsArray.map((item: any, idx: number) => {
                                    const resolvedProduct = dbProducts.find(p => p.id === String(item.id || item.product?.id).split('-')[0] || p.id === String(item.id || item.product?.id));
                                    const productName = resolvedProduct ? (lang === 'zh' ? resolvedProduct.cnName : resolvedProduct.name) : (item.name || item.product?.name || 'Cippy Wear');
                                    const productPrice = resolvedProduct ? resolvedProduct.price : (item.price_myr || item.product?.price || 0);
                                    const productImg = resolvedProduct?.imageUrl || item.product?.imageUrl || item.product?.image_url;
                                    const itemSize = item.size || item.selectedSize || 'S';
                                    const itemQty = item.qty || item.quantity || 1;

                                    return (
                                      <div key={idx} className="flex items-center justify-between gap-4 text-xs font-sans">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-10 h-10 rounded bg-[#FFF0F2] flex items-center justify-center font-serif text-[#B96A73] font-bold text-sm overflow-hidden shrink-0 border border-pink-100/30">
                                            {productImg ? (
                                              <img src={productImg} alt="" className="w-full h-full object-cover" />
                                            ) : '👗'}
                                          </div>
                                          <div className="space-y-0.5">
                                            <h6 className="font-bold text-zinc-800 line-clamp-1">
                                              {productName}
                                            </h6>
                                            <p className="text-[10px] text-zinc-400">
                                              Size: <strong className="text-zinc-600 font-mono font-bold">{itemSize}</strong> · Qty: <strong className="text-zinc-600 font-mono font-bold">{itemQty}</strong>
                                            </p>
                                          </div>
                                        </div>
                                        <span className="font-mono font-bold text-zinc-700">RM {productPrice * itemQty}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Order breakdown footer details */}
                              <div className="border-t pt-3 border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                                <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500">
                                  <div>
                                    <strong className="text-zinc-700 font-bold">{lang === 'zh' ? '支付方式: ' : 'Payment: '}</strong>
                                    <span className="bg-zinc-100 text-zinc-600 font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold">{ord.payment_method || 'DuitNow Transfer'}</span>
                                  </div>
                                  <div>
                                    <strong className="text-zinc-700 font-bold">{lang === 'zh' ? '包装方案: ' : 'Packaging: '}</strong>
                                    <span>{ord.gift_wrap ? (lang === 'zh' ? '🎁 豪华仙女礼盒包' : '🎁 Luxury Gift Box') : (lang === 'zh' ? '🌿 绿色环保简约包' : '🌿 Eco-friendly wrap')}</span>
                                  </div>
                                </div>
                                <div className="sm:text-right">
                                  <span className="text-[10px] text-zinc-400 block">{lang === 'zh' ? '实付总额 (含邮运费)' : 'Total Paid (Incl. Shipping)'}</span>
                                  <span className="text-base font-serif font-bold text-[#B96A73]">RM {ord.total_amount}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checkout' && (
            <CheckoutPage
              cartItems={cartItems}
              giftBoxTopup={giftBoxTopup}
              lang={lang}
              currentUser={currentUser}
              onOrderComplete={() => {
                setCartItems([]);
                setGiftBoxTopup(false);
                refreshProfileAndOrders();
              }}
              onBack={() => setActiveTab('rtw')}
              onViewPolicies={() => setActiveTab('policies')}
              returnState={checkoutReturnState}
              isConfirmingReturn={isConfirmingReturn}
              onDismissReturnState={() => {
                setCheckoutReturnState(null);
                setActiveTab('rtw');
              }}
            />
          )}

          {activeTab === 'alerts' && isAdminUser && (
            <div className="space-y-8 animate-fade-in-up">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-[#FFF0F2] via-white to-[#FBEBF0] border border-[#FBEBF0] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-pink-100/10 rounded-bl-full -z-10" />
                <div className="space-y-1.5 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-[#FFF0F2] text-[#B96A73] px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-[#B96A73]" />
                    {lang === 'zh' ? '仙女专属 · 邮件群发与一键重发中心' : 'Fairytale Alert & Resend System'}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-zinc-800">
                    {lang === 'zh' ? 'Cippy 仙女新品群发与重发中心' : 'Cippy Alerts & Resend Center'}
                  </h3>
                  <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                    {lang === 'zh' 
                      ? '通过 Google Workspace Gmail API 极速将带有严选甄选图、故事章节、穿搭细节和一键购买链接的精美 HTML 新品速递广播给您的小红书/大马 VIP 闺蜜。'
                      : 'Connect your Gmail secure credentials to broadcast, customize, or instantly resend bespoke apparel-launch HTML catalogs directly to active VIP dreamers.'}
                  </p>
                </div>

                {/* Google Connection Card */}
                <div className="bg-white/80 backdrop-blur-xs border border-[#FBEBF0] rounded-2xl p-4 flex items-center gap-3.5 shrink-0 shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-[#B96A73]" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-zinc-800 leading-none">
                      {googleEmail ? (lang === 'zh' ? '已授权发件人' : 'Authorized Sender') : (lang === 'zh' ? '未连接' : 'Disconnected')}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {googleEmail ? googleEmail : (lang === 'zh' ? '请先授权 Google 账户' : 'Requires Google Auth')}
                    </p>
                    <div className="pt-1">
                      {googleEmail ? (
                        <button
                          type="button"
                          onClick={handleGoogleGmailSignOut}
                          className="text-[9px] font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1"
                        >
                          <LogOut className="w-2.5 h-2.5" />
                          <span>{lang === 'zh' ? '断开连接' : 'Disconnect'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleGoogleGmailSignIn}
                          className="text-[9px] font-bold text-[#B96A73] hover:text-[#9A4C55] transition-colors flex items-center gap-1"
                        >
                          <Globe className="w-2.5 h-2.5" />
                          <span>{lang === 'zh' ? '立即授权' : 'Authorize Now'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Column 1: Campaign Designer (6 cols) */}
                <div className="lg:col-span-6 bg-white border border-[#FBEBF0] rounded-3xl p-6 space-y-6 shadow-xs">
                  <div className="flex items-center gap-2 border-b pb-3 border-zinc-100">
                    <Mail className="w-4 h-4 text-[#B96A73]" />
                    <h4 className="font-serif text-sm font-bold text-zinc-800">
                      {lang === 'zh' ? '新品推广策划器 / Campaign Composer' : 'Fairytale Campaign Composer'}
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Select Product */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        {lang === 'zh' ? '推荐成衣新品 / Select Dress' : 'Select Showcase Apparel'}
                      </label>
                      <select
                        disabled={!googleEmail}
                        value={alertProduct?.id || ''}
                        onChange={(e) => {
                          const prod = dbProducts.find(p => p.id === e.target.value);
                          if (prod) setAlertProduct(prod);
                        }}
                        className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2.5 font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed transition-colors"
                      >
                        {dbProducts.map(p => (
                          <option key={p.id} value={p.id}>
                            {lang === 'zh' ? `【RM ${p.price}】${p.cnName} (${p.name})` : `[RM ${p.price}] ${p.name}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex justify-between items-center">
                        <span>{lang === 'zh' ? '邮件主题 / Email Subject' : 'Email Subject Line'}</span>
                        <span className="text-[9px] font-mono text-zinc-300 select-none">{"{product_name} will auto-replace"}</span>
                      </label>
                      <input
                        type="text"
                        disabled={!googleEmail}
                        placeholder={lang === 'zh' ? '输入邮件标题...' : 'Enter campaign email title...'}
                        value={alertSubject}
                        onChange={(e) => setAlertSubject(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-3 py-2.5 font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed transition-colors"
                      />
                    </div>

                    {/* Theme selector */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        {lang === 'zh' ? '视觉主题与色系 / Template Color Vibe' : 'Select Template Visual Color Style'}
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'rose' as const, nameZH: '胭脂粉纱', nameEN: 'Blush Rose', bg: 'bg-[#FFF0F2]', text: 'text-[#B96A73]', border: 'border-pink-200' },
                          { id: 'coffee' as const, nameZH: '复古摩卡', nameEN: 'Warm Coffee', bg: 'bg-[#FAF8F5]', text: 'text-[#8A7663]', border: 'border-amber-200' },
                          { id: 'midnight' as const, nameZH: '深蓝华尔兹', nameEN: 'Midnight Waltz', bg: 'bg-[#2B2433]', text: 'text-[#E39CA5]', border: 'border-[#3D3249]' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            disabled={!googleEmail}
                            onClick={() => setAlertTemplate(t.id)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                              alertTemplate === t.id 
                                ? 'border-[#B96A73] bg-white shadow-2xs scale-[1.02]' 
                                : 'border-transparent bg-zinc-50/50 hover:bg-zinc-50'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full ${t.bg} border ${t.border} flex items-center justify-center mb-1`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            </span>
                            <span className="text-[10px] font-medium text-zinc-700">{lang === 'zh' ? t.nameZH : t.nameEN}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Story/Message Textarea */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        {lang === 'zh' ? '写给闺蜜的温润日常穿搭故事 / Custom Style Narrative' : 'Showcase Narrative / Style Story'}
                      </label>
                      {lang === 'zh' ? (
                        <textarea
                          rows={5}
                          disabled={!googleEmail}
                          value={alertMessageZH}
                          onChange={(e) => setAlertMessageZH(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed transition-colors leading-relaxed"
                        />
                      ) : (
                        <textarea
                          rows={5}
                          disabled={!googleEmail}
                          value={alertMessage}
                          onChange={(e) => setAlertMessage(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl p-3 font-sans text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed transition-colors leading-relaxed"
                        />
                      )}
                    </div>

                    {/* Broadcast button */}
                    <button
                      type="button"
                      disabled={!googleEmail || isSendingAlerts || selectedEmails.length === 0}
                      onClick={() => handleAdvancedCampaignSend()}
                      className={`w-full font-serif font-bold text-xs uppercase tracking-widest text-white py-3.5 rounded-xl transition-all duration-300 transform shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        googleEmail && selectedEmails.length > 0
                          ? 'bg-[#B96A73] hover:bg-[#a15a62] hover:-translate-y-0.5' 
                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {isSendingAlerts ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>{lang === 'zh' ? '正在执行高定群发魔法...' : 'DELIVERING CROWD CAMPAIGN...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-pink-100" />
                          <span>
                            {lang === 'zh' 
                              ? `📢 立即向 ${selectedEmails.length} 位勾选闺蜜发送新品邮件` 
                              : `📢 Broadcast Launch to ${selectedEmails.length} Selected Recipient(s)`}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Column 2: VIP Recipient Selection (3 cols) */}
                <div className="lg:col-span-3 bg-white border border-[#FBEBF0] rounded-3xl p-6 space-y-6 shadow-xs h-full flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b pb-3 border-zinc-100">
                      <User className="w-4 h-4 text-[#B96A73]" />
                      <h4 className="font-serif text-sm font-bold text-zinc-800">
                        {lang === 'zh' ? 'VIP 订阅闺蜜队列' : 'VIP Fairy Recipients'}
                      </h4>
                    </div>

                    {/* Add Inline Subscriber */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                        {lang === 'zh' ? '快速邀请新闺蜜 / Add recipient' : 'Invite Recipient Email'}
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          disabled={!googleEmail}
                          placeholder="input@email.com"
                          value={newSubEmail}
                          onChange={(e) => setNewSubEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubscriber(newSubEmail, newSubName);
                              if (newSubEmail.trim() && !selectedEmails.includes(newSubEmail.trim().toLowerCase())) {
                                setSelectedEmails(prev => [...prev, newSubEmail.trim().toLowerCase()]);
                              }
                            }
                          }}
                          className="flex-1 bg-zinc-50 border border-zinc-200/50 rounded-xl px-2.5 py-2 text-xs font-mono text-zinc-700 focus:outline-none focus:border-[#B96A73] disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          disabled={!googleEmail}
                          onClick={() => {
                            handleAddSubscriber(newSubEmail, newSubName);
                            if (newSubEmail.trim() && !selectedEmails.includes(newSubEmail.trim().toLowerCase())) {
                              setSelectedEmails(prev => [...prev, newSubEmail.trim().toLowerCase()]);
                            }
                          }}
                          className="bg-[#3F2B2B] hover:bg-zinc-800 disabled:bg-zinc-200 text-white font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Checklist of Recipients */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                          {lang === 'zh' ? '选择发送列表' : 'CHECKLIST TARGETS'}
                        </span>
                        <button
                          type="button"
                          disabled={!googleEmail}
                          onClick={() => {
                            if (selectedEmails.length === subscribers.length) {
                              setSelectedEmails([]);
                            } else {
                              setSelectedEmails(subscribers.map(s => s.email));
                            }
                          }}
                          className="text-[9px] font-mono text-[#B96A73] hover:underline"
                        >
                          {selectedEmails.length === subscribers.length ? (lang === 'zh' ? '全不选' : 'Deselect All') : (lang === 'zh' ? '全选' : 'Select All')}
                        </button>
                      </div>

                      <div className="max-h-[220px] overflow-y-auto border border-zinc-100 rounded-2xl divide-y divide-zinc-50 bg-white">
                        {subscribers.map((sub) => {
                          const isChecked = selectedEmails.includes(sub.email);
                          return (
                            <div key={sub.email} className="flex items-center justify-between px-3.5 py-2.5 text-[11px] font-sans hover:bg-zinc-50/50 transition-colors">
                              <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  disabled={!googleEmail}
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedEmails(prev => prev.filter(e => e !== sub.email));
                                    } else {
                                      setSelectedEmails(prev => [...prev, sub.email]);
                                    }
                                  }}
                                  className="accent-[#B96A73] rounded"
                                />
                                <div className="space-y-0.5">
                                  <span className="font-bold text-zinc-700 block">{sub.name}</span>
                                  <span className="font-mono text-zinc-400 text-[10px] block">{sub.email}</span>
                                </div>
                              </label>
                              <button
                                type="button"
                                disabled={!googleEmail}
                                onClick={() => {
                                  handleRemoveSubscriber(sub.email);
                                  setSelectedEmails(prev => prev.filter(e => e !== sub.email));
                                }}
                                className="text-zinc-300 hover:text-rose-600 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recipient status metrics */}
                  <div className="pt-4 border-t border-zinc-100 bg-pink-50/10 p-3 rounded-2xl border mt-4 text-[11px] font-sans space-y-1">
                    <p className="text-zinc-500">
                      Primary Tester: <span className="font-bold text-zinc-700 select-all font-mono font-medium">christinechong235@gmail.com</span>
                    </p>
                    <p className="text-zinc-400 font-normal">
                      Only active checkboxes will receive the broadcast during checkout or bulk resending.
                    </p>
                  </div>
                </div>

                {/* Column 3: Real-Time Live Sandbox Preview (3 cols) */}
                <div className="lg:col-span-3 bg-white border border-[#FBEBF0] rounded-3xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center gap-2 border-b pb-3 border-zinc-100">
                    <Compass className="w-4 h-4 text-[#B96A73]" />
                    <h4 className="font-serif text-sm font-bold text-zinc-800">
                      {lang === 'zh' ? '邮件实境沙盒预览' : 'Live Sandbox Preview'}
                    </h4>
                  </div>

                  {alertProduct ? (
                    <div 
                      className="border rounded-2xl overflow-hidden shadow-2xs font-serif text-[9px] scale-[0.98] origin-top transition-all duration-500"
                      style={{
                        backgroundColor: alertTemplate === 'midnight' ? '#161419' : alertTemplate === 'coffee' ? '#FAF8F5' : '#FAF4F6',
                        borderColor: alertTemplate === 'midnight' ? '#2B2433' : alertTemplate === 'coffee' ? '#E6DFD5' : '#FBEBF0',
                        color: alertTemplate === 'midnight' ? '#EAE2ED' : '#2D1E1E'
                      }}
                    >
                      {/* Live Tiny Header */}
                      <div className="p-3 border-b text-center" style={{ borderColor: alertTemplate === 'midnight' ? '#2B2433' : '#FBEBF0', background: alertTemplate === 'midnight' ? '#201A24' : '#FFF5F7' }}>
                        <span className="font-bold tracking-widest block uppercase text-[10px] text-zinc-800" style={{ color: alertTemplate === 'midnight' ? '#FAF5FF' : '#3F2B2B' }}>Cippy Atelier</span>
                        <span className="text-[7px] font-mono opacity-60">Bespoke Fairytale RTW &bull; KL</span>
                      </div>

                      {/* Content sandbox view */}
                      <div className="p-4 space-y-3 text-center">
                        <p className="italic opacity-80">{lang === 'zh' ? '亲爱的仙女闺蜜，' : 'Dearest Fairytale Friend,'}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[7px] font-mono font-bold" style={{ backgroundColor: alertTemplate === 'midnight' ? '#2F202F' : '#FFF0F2', color: alertTemplate === 'midnight' ? '#E39CA5' : '#B96A73' }}>
                          New Arrival Alert
                        </span>

                        <h5 className="text-[12px] font-bold" style={{ color: alertTemplate === 'midnight' ? '#FAF5FF' : '#3F2B2B' }}>
                          {lang === 'zh' ? alertProduct.cnName : alertProduct.name}
                        </h5>

                        {alertProduct.imageUrl && (
                          <div className="my-2.5 rounded-lg overflow-hidden max-h-[140px] border" style={{ borderColor: alertTemplate === 'midnight' ? '#2B2433' : '#FBEBF0' }}>
                            <img src={alertProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="p-2.5 rounded-lg border border-dashed font-sans text-[8px] leading-relaxed text-left max-h-[100px] overflow-y-auto" style={{ backgroundColor: alertTemplate === 'midnight' ? '#1A141F' : '#FFFDFD', borderColor: alertTemplate === 'midnight' ? '#E39CA5' : '#B96A73' }}>
                          {(lang === 'zh' ? alertMessageZH : alertMessage).replace('{product_name}', alertProduct.cnName)}
                        </div>

                        <div className="text-[11px] font-bold" style={{ color: alertTemplate === 'midnight' ? '#E39CA5' : '#B96A73' }}>
                          RM {alertProduct.price.toFixed(2)}
                        </div>

                        <div className="pt-1.5">
                          <span className="inline-block px-4 py-2 rounded-lg text-[9px] font-bold font-sans text-white uppercase tracking-wider" style={{ backgroundColor: alertTemplate === 'midnight' ? '#D89CA2' : alertTemplate === 'coffee' ? '#5C4E4D' : '#3F2B2B' }}>
                            View Dress / 一键订购
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-zinc-400 text-xs">
                      {lang === 'zh' ? '请选择新品以获得实时实境预览' : 'Select a garment dress to see sandbox live preview'}
                    </div>
                  )}
                </div>

              </div>

              {/* Progress Logs Panel (Only visible if queue runs) */}
              {sendingProgress.total > 0 && (
                <div className="bg-zinc-950 text-emerald-400 font-mono p-5 rounded-2xl space-y-3.5 border border-zinc-800 shadow-lg text-[11px]">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>{lang === 'zh' ? 'GMAIL API 实时发信广播队列' : 'LIVE GMAIL BROADCAST QUEUE MONITOR'}</span>
                    </span>
                    <span>
                      {sendingProgress.current} / {sendingProgress.total} COMPLETED
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-500 ease-out" 
                      style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                    />
                  </div>

                  {/* Scrollable logs */}
                  <div className="max-h-[140px] overflow-y-auto space-y-1.5 pt-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                    {sendingProgress.logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-zinc-600 select-none">[{i + 1}]</span>
                        <span className="leading-relaxed">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Campaign Archives & One-Click Resend Center */}
              <div className="bg-white border border-[#FBEBF0] rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
                <div className="border-b pb-4 border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-0.5">
                    <h4 className="font-serif text-lg font-bold text-zinc-800 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#B96A73]" />
                      {lang === 'zh' ? '历史群发归档与重发控制台 / Resend Hub' : 'Campaign Archives & One-Click Resend Center'}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans">
                      {lang === 'zh' ? '一键克隆和重新发送已经发布过的推广项目，支持自定义修改或选择原定客户偏好重投' : 'Check history and one-click clone/resend to selected fairy VIP subscribers.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-[#FFF0F2] text-[#B96A73] border border-pink-100/40 px-3 py-1 rounded-lg shrink-0">
                    Total {campaignHistory.length} Campaigns
                  </span>
                </div>

                <div className="space-y-4">
                  {campaignHistory.map((camp) => (
                    <div key={camp.id} className="border border-zinc-100 hover:border-[#FBEBF0] rounded-2xl p-5 bg-zinc-50/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                      <div className="space-y-2 max-w-2xl text-xs">
                        {/* Meta tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] font-bold bg-[#3F2B2B] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                            {camp.id}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 font-semibold">
                            {new Date(camp.sentAt).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded">
                            <Check className="w-3 h-3" />
                            DELIVERED
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold bg-rose-50 text-[#B96A73] border border-[#FBEBF0] px-2 py-0.5 rounded capitalize">
                            {camp.template} Theme
                          </span>
                        </div>

                        {/* Title and details */}
                        <div className="space-y-0.5">
                          <h5 className="font-bold text-zinc-800 leading-snug">
                            {camp.subject}
                          </h5>
                          <p className="text-zinc-500 font-sans">
                            {lang === 'zh' ? '包含新品成衣：' : 'Showcased Garment: '} <strong className="text-zinc-700 font-bold">{camp.productName}</strong>
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-1">
                            {lang === 'zh' ? `目标发信闺蜜 (${camp.recipientsCount} 位)：` : `Recipients (${camp.recipientsCount}): `}
                            {camp.emails.join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Action block */}
                      <div className="shrink-0 flex items-center gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          disabled={!googleEmail || isSendingAlerts}
                          onClick={() => {
                            // Find matching product
                            const prod = dbProducts.find(p => p.name === camp.productName) || dbProducts[0];
                            handleAdvancedCampaignSend(camp.subject, camp.emails, prod, camp.template, camp.messageTemplate);
                          }}
                          className={`flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-sans font-bold px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                            googleEmail 
                              ? 'bg-white hover:bg-rose-50/50 text-[#B96A73] border-[#FBEBF0] hover:border-[#B96A73] shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5' 
                              : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                          }`}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSendingAlerts ? 'animate-spin' : ''}`} />
                          <span>{lang === 'zh' ? '一键克隆重发' : 'One-Click Resend'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
                <section className="bg-[#FFF5F7]/40 border-t border-[#FBEBF0] py-12 px-4 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#B96A73] mx-auto md:mx-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-zinc-800 text-sm">{lang === 'zh' ? '1. 高端韩系剪裁' : '1. High-End Korean Tailoring'}</h3>
              <h4 className="text-[11px] font-serif text-[#D89CA2] font-semibold leading-none mt-0.5">高端成衣版型与垂感</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans text-justify md:text-left">
                {lang === 'zh'
                  ? '每一件成衣都经过精准的落肩计算与垂坠设计，确保 S 与 M 码始终呈现显瘦又舒适的韩系垂感。'
                  : 'Every garment is created as a ready-to-wear masterpiece with precise drop-shoulder calculations and drapes, ensuring that S & M sizes always produce a flattering, slim, yet comfortable Korean drape.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#B96A73] mx-auto md:mx-0">
                <Heart className="w-5 h-5 fill-[#FFF0F2]" />
              </div>
              <h3 className="font-serif font-bold text-zinc-800 text-sm">{lang === 'zh' ? '2. 精致细节巧思' : '2. Delicate Editorial Touch'}</h3>
              <h4 className="text-[11px] font-serif text-[#D89CA2] font-semibold leading-none mt-0.5">温润浪漫的视觉治愈</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans text-justify md:text-left">
                {lang === 'zh'
                  ? '从品牌标志性蝴蝶结到柔软的荷叶边与设计口袋，每件衣裳都融入了童话般的精致巧思，为您的日常街头漫步注入俏皮浪漫的温度。'
                  : 'From the brand bow ribbon to the soft ruffles and organic pockets, our clothes are infused with cute fairytale motifs that bring playfulness and cozy romance into your daily urban walks.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FFF0F2] flex items-center justify-center text-[#B96A73] mx-auto md:mx-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-zinc-800 text-sm">{lang === 'zh' ? '3. 大马本地化服务' : '3. Localised Malaysian Service'}</h3>
              <h4 className="text-[11px] font-serif text-[#D89CA2] font-semibold leading-none mt-0.5">专为大马华裔女孩贴心打造</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans text-justify md:text-left">
                {lang === 'zh'
                  ? '我们深知大马的气候与生活方式。棉麻混纺面料在艳阳街头透气清凉，在冷气咖啡馆里也舒适宜人，配合本地化 RM 定价与快捷配送。'
                  : "We understand Malaysia's climate and lifestyle. Our cotton-linen blends are extremely breathable for sunny streets, yet comfortable for air-conditioned cafés, with prompt localized RM pricing and delivery."}
              </p>
            </div>

          </div>
        </section>

        {/* Elegant footer inside card */}
        <footer className="bg-white border-t border-[#FBEBF0] py-10 px-4 md:px-10 text-xs text-zinc-400">
          {isYunseo ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[11px] font-bold text-zinc-400">
              {/* Left: copyright */}
              <div className="md:w-1/3 text-center md:text-left tracking-wider uppercase">
                &copy; 2026 CIPPY MINIMAL. ALL RIGHTS RESERVED.
              </div>
              
              {/* Center: Social handles */}
              <div className="md:w-1/3 flex justify-center gap-6 md:gap-8 tracking-widest text-zinc-500">
                <a href="#instagram" className="hover:text-[#5D6B54] transition-colors">INSTAGRAM</a>
                <a href="#xhs" className="hover:text-[#5D6B54] transition-colors">XIAOHONGSHU</a>
                <a href="#atelier" className="hover:text-[#5D6B54] transition-colors">ATELIER SITE</a>
              </div>

              {/* Right: Brand motto */}
              <div className="md:w-1/3 text-center md:text-right tracking-wider text-zinc-500 uppercase">
                SILENT TAILORING &middot; 允熙微风
              </div>
            </div>
          ) : isHwayoon ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[11px] font-bold text-zinc-400">
              {/* Left: copyright */}
              <div className="md:w-1/3 text-center md:text-left tracking-wider uppercase">
                &copy; 2026 CIPPY SELECTION. ALL RIGHTS RESERVED.
              </div>
              
              {/* Center: Social handles */}
              <div className="md:w-1/3 flex justify-center gap-6 md:gap-8 tracking-widest text-zinc-500">
                <a href="#instagram" className="hover:text-[#C88E93] transition-colors">INSTAGRAM</a>
                <a href="#wechat" className="hover:text-[#C88E93] transition-colors">WECHAT MALL</a>
                <a href="#xhs" className="hover:text-[#C88E93] transition-colors">XIAOHONGSHU</a>
              </div>

              {/* Right: Brand motto */}
              <div className="md:w-1/3 text-center md:text-right tracking-wider text-zinc-500 uppercase">
                READY-TO-WEAR &middot; 准备穿
              </div>
            </div>
          ) : isChaewon ? (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[11px] font-bold text-zinc-400">
              <div className="md:w-1/3 text-center md:text-left tracking-wider uppercase">
                &copy; 2026 CIPPY ATELIER. ALL RIGHTS RESERVED.
              </div>
              <div className="md:w-1/3 flex justify-center gap-6 tracking-widest text-zinc-500">
                <a href="https://wa.me/601120861073" target="_blank" rel="noreferrer" className="hover:text-[#3F2B2B] transition-colors">
                  {lang === 'zh' ? '客服 WHATSAPP' : 'WHATSAPP SUPPORT'}
                </a>
              </div>
              <div className="md:w-1/3 text-center md:text-right tracking-wider text-zinc-500 uppercase">
                MADE IN SEOUL &middot; 蔚蓝之境
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-zinc-500 font-sans font-semibold">
                <button 
                  onClick={() => { setActiveTab('rtw'); document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className="hover:text-[#B96A73] cursor-pointer"
                >
                  Boutique Catalogue
                </button>
                <span>·</span>
                <button 
                  onClick={() => { setActiveTab('atelier'); setAtelierSubTab('mirror'); document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className="hover:text-[#B96A73] cursor-pointer"
                >
                  Dressing Room Mixer
                </button>
                <span>·</span>
                <button 
                  onClick={() => { setActiveTab('atelier'); setAtelierSubTab('sizing'); document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className="hover:text-[#B96A73] cursor-pointer"
                >
                  Sizing Fairy Calculator
                </button>
                <span>·</span>
                <button 
                  onClick={() => { setActiveTab('journal'); document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className="hover:text-[#B96A73] cursor-pointer"
                >
                  Style Chronicles
                </button>
                <span>·</span>
                <button 
                  onClick={() => { setActiveTab('policies'); document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className="hover:text-[#B96A73] cursor-pointer"
                >
                  Help & Policies
                </button>
              </div>

              <div className="max-w-md mx-auto space-y-1.5 text-[11px] font-sans">
                <p>
                  Curated with tender care for Malaysian Chinese dreamers. Inspired by Korean loose fit aesthetics.
                </p>
                <p className="text-zinc-400 font-medium">
                  © 2026 CIPPY STUDIO. All Rights Reserved. Crafted with love and fairytale threads.
                </p>
              </div>
            </div>
          )}
        </footer>
      </div>

      {/* Floating Bag drawer overlay */}
      <ShoppingBagDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        lang={lang}
        currentUser={currentUser}
        userProfile={userProfile}
        onRefreshProfileAndOrders={refreshProfileAndOrders}
        giftBoxTopup={giftBoxTopup}
        onToggleGiftBoxTopup={setGiftBoxTopup}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setActiveTab('checkout');
          document.getElementById('nabi-studio-app-card')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Dynamic Editorial Detail Modal Overlay */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          lang={lang}
          isWishlisted={wishlist.some((w: any) => w.id === selectedProduct.id)}
          onAddProductToCart={handleAddProductToCart}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Side-by-Side Comparison Drawer/Floating Panel */}
      {compareProducts.length > 0 && !isCompareModalOpen && (
        <div className="fixed bottom-6 right-6 md:right-24 z-45 bg-white/95 backdrop-blur-md shadow-2xl border border-pink-100 rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center gap-4 max-w-xl w-[calc(100%-2rem)] md:w-auto animate-gentle-bounce">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFF5F7] p-1.5 rounded-lg text-[#B96A73]">
              <GitCompare className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-800 font-sans leading-tight">
                {lang === 'zh' ? `对比栏 (${compareProducts.length}/3)` : `Compare (${compareProducts.length}/3)`}
              </p>
              <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                {lang === 'zh' ? '添加更多或立即开始对比' : 'Add more or start comparing'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            {compareProducts.map(prod => (
              <div key={prod.id} className="relative group shrink-0 w-10 h-10 bg-pink-50 border border-pink-100/60 rounded-lg overflow-hidden">
                {prod.imageUrl ? (
                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#B96A73]" style={{ color: prod.color }}>
                    ★
                  </div>
                )}
                <button
                  onClick={() => handleToggleCompare(prod)}
                  className="absolute -top-1 -right-1 bg-zinc-900/80 text-white rounded-full p-0.5 hover:bg-zinc-900 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => setCompareProducts([])}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 font-bold font-sans px-2 py-1.5 cursor-pointer"
            >
              {lang === 'zh' ? '清空' : 'Clear'}
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#B96A73] text-white hover:bg-[#A85B64] font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <span>{lang === 'zh' ? '对比成衣' : 'Compare Now'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Fullscreen Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-55 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full border border-pink-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#FBEBF0] flex items-center justify-between bg-gradient-to-r from-pink-50/50 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFF0F2] rounded-xl text-[#B96A73]">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-zinc-800 leading-tight">
                    {lang === 'zh' ? '仙女衣橱 · 细节横向对比' : 'Fairytale Atelier Comparison Spec'}
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-sans mt-0.5">
                    {lang === 'zh' 
                      ? '横向对比面料、透光、弹力、版型与洗涤建议，挑选最适合您的那一束微光' 
                      : 'Compare materials, stretch, transparency, and care to find your fairytale fit.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table / Side-by-side spec list */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 font-sans">
              <div className="min-w-[600px] divide-y divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden shadow-2xs">
                
                {/* Row 1: Product Header Card */}
                <div className="grid grid-cols-4 bg-zinc-50/40">
                  <div className="p-4 flex flex-col justify-center border-r border-zinc-100 bg-zinc-50/20">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                      Garment / 成衣对比
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans mt-1">
                      {lang === 'zh' ? `已选择 ${compareProducts.length} 件成衣` : `${compareProducts.length} items chosen`}
                    </span>
                  </div>

                  {/* Empty headers for products if there are fewer than 3 */}
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    return (
                      <div key={index} className="p-4 border-r border-zinc-100 last:border-r-0 relative flex flex-col justify-between h-full min-h-[220px]">
                        {prod ? (
                          <>
                            <button
                              onClick={() => handleToggleCompare(prod)}
                              className="absolute top-2 right-2 bg-zinc-100 text-zinc-500 hover:text-rose-500 rounded-full p-1 cursor-pointer transition-colors"
                              title={lang === 'zh' ? '移除' : 'Remove'}
                            >
                              <X className="w-3 h-3" />
                            </button>
                            
                            <div className="space-y-3">
                              {/* Thumbnail image or placeholder */}
                              <div className={`w-full h-28 bg-gradient-to-b ${prod.bgGradient} rounded-xl overflow-hidden flex items-center justify-center border border-pink-100/40`}>
                                {prod.imageUrl ? (
                                  <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="text-center font-mono text-[10px]" style={{ color: prod.color }}>
                                    ★ CIPPY ★
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-snug">
                                  {prod.name}
                                </h4>
                                <h5 className="text-[10px] text-[#B96A73] font-medium truncate mt-0.5">
                                  {prod.cnName}
                                </h5>
                                <p className="text-xs font-mono font-bold text-zinc-800 mt-1">
                                  RM {prod.price}
                                </p>
                              </div>
                            </div>

                            {/* Quick Add To Bag Row */}
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  handleAddProductToCart(prod, 'S');
                                  setToastMessage(lang === 'zh' ? `✨ 已添加 ${prod.cnName} (S) 至购物袋` : `✨ Added ${prod.name} (S) to Bag`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                }}
                                className="w-full py-1.5 bg-[#B96A73] hover:bg-[#A85B64] text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                              >
                                {lang === 'zh' ? '一键加购 (S)' : 'Add (S)'}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-zinc-100 rounded-2xl bg-zinc-50/20">
                            <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
                              EMPTY SLOT
                            </span>
                            <span className="text-[9px] text-zinc-400 mt-1 max-w-[120px]">
                              {lang === 'zh' ? '在列表商品中点击“加入对比”来填充' : 'Click "Compare" on items to fill this slot'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row 2: Category & Type */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center">
                    {lang === 'zh' ? '品类系列' : 'Category / Series'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-700 flex items-center font-sans">
                        {prod ? (
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-pink-50 text-[#B96A73] rounded-full text-[9px] font-bold uppercase tracking-wider">
                              {prod.category}
                            </span>
                            {prod.series && (
                              <p className="text-[10px] text-zinc-400 italic">
                                {prod.series}
                              </p>
                            )}
                          </div>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

                {/* Row 3: Fabric */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center">
                    {lang === 'zh' ? '面料材质 🌿' : 'Fabric / Materials 🌿'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    const attr = prod ? getProductAttribute(prod, 'fabric') : null;
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-700 flex items-center font-sans">
                        {prod && attr ? (
                          <span className="font-medium leading-relaxed">
                            {lang === 'zh' ? attr.zh : attr.en}
                          </span>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

                {/* Row 4: Transparency */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center">
                    {lang === 'zh' ? '透光触感 🌤️' : 'Transparency 🌤️'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    const attr = prod ? getProductAttribute(prod, 'transparency') : null;
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-700 flex items-center font-sans">
                        {prod && attr ? (
                          <span className="leading-relaxed">
                            {lang === 'zh' ? attr.zh : attr.en}
                          </span>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

                {/* Row 5: Stretch */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center">
                    {lang === 'zh' ? '弹力弹度 🧶' : 'Stretch & Elasticity 🧶'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    const attr = prod ? getProductAttribute(prod, 'stretch') : null;
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-700 flex items-center font-sans">
                        {prod && attr ? (
                          <span className="leading-relaxed">
                            {lang === 'zh' ? attr.zh : attr.en}
                          </span>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

                {/* Row 6: Lining */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center">
                    {lang === 'zh' ? '舒适内衬 👗' : 'Inner Lining 👗'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    const attr = prod ? getProductAttribute(prod, 'lining') : null;
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-700 flex items-center font-sans">
                        {prod && attr ? (
                          <span className="leading-relaxed text-zinc-600">
                            {lang === 'zh' ? attr.zh : attr.en}
                          </span>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

                {/* Row 7: Care instructions */}
                <div className="grid grid-cols-4">
                  <div className="p-3.5 border-r border-zinc-100 bg-zinc-50/20 font-bold text-xs text-zinc-500 flex items-center font-sans">
                    {lang === 'zh' ? '洗涤与保养 🧼' : 'Care instructions 🧼'}
                  </div>
                  {[0, 1, 2].map(index => {
                    const prod = compareProducts[index];
                    const attr = prod ? getProductAttribute(prod, 'care') : null;
                    return (
                      <div key={index} className="p-3.5 border-r border-zinc-100 last:border-r-0 text-xs text-zinc-500 leading-relaxed flex items-center font-sans">
                        {prod && attr ? (
                          <span>
                            {lang === 'zh' ? attr.zh : attr.en}
                          </span>
                        ) : '-'}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#FBEBF0] flex justify-end gap-3 bg-zinc-50/50">
              <button
                onClick={() => {
                  setCompareProducts([]);
                  setIsCompareModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer font-sans"
              >
                {lang === 'zh' ? '清空所有' : 'Clear All'}
              </button>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer font-sans"
              >
                {lang === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-zinc-900/90 backdrop-blur-md text-white text-xs px-4 py-3 rounded-xl shadow-lg border border-zinc-800 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-sans font-medium">{toastMessage}</span>
        </div>
      )}

    <Analytics />
    </div>
  );
}
