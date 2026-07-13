(function () {
  var STORAGE_KEY = "cippy-lang";
  var DICT = {
  "Free shipping in Malaysia on all orders above RM150 • Shop Now": "马来西亚境内订单满 RM150 免运费 • 立即购买",
  "New In": "新品",
  "Clothing": "服饰",
  "Accessories": "配饰",
  "Sale": "特卖",
  "Community": "社区",
  "SS24 Collection": "2024春夏系列",
  "The Art of": "解锁",
  "Effortless": "不费力优雅",
  "Chic": "的艺术",
  "Shop New In": "选购新品",
  "Explore Trends": "探索潮流",
  "Popular Categories": "热门分类",
  "Trending Now": "当下流行",
  "Dresses": "连衣裙",
  "Bottoms": "下装",
  "Knitwear": "针织衫",
  "Shoes": "鞋履",
  "Weekly Drop": "每周新品",
  "Fresh picks from our Seoul design team.": "首尔设计团队精选好物。",
  "Shop All New Arrivals": "查看全部新品",
  "Limited Edition": "限定系列",
  "The Crimson Edit": "绯红特辑",
  "Our signature bold red collection, designed to make a statement in the city.": "我们标志性的红色系列，让你在城市中尽显个性。",
  "Shop Collection": "选购系列",
  "Floral Romance": "花语浪漫",
  "From RM 89": "RM 89 起",
  "City Essentials": "都市必备",
  "From RM 45": "RM 45 起",
  "Trending in KL": "吉隆坡热门",
  "Bestsellers": "畅销好物",
  "Influencer's Choice": "博主推荐",
  "Limited Re-stock": "限量补货",
  "Add to Cart": "加入购物车",
  "Aesthetic Oversized Tee": "美学оversize短袖",
  "RM 79.00": "RM 79.00",
  "Wide-Leg Linen Trousers": "宽腿亚麻长裤",
  "RM 149.00": "RM 149.00",
  "Trending": "热门",
  "Silk Slip Dress": "真丝吊带裙",
  "RM 189.00": "RM 189.00",
  "Boxy Structure Blazer": "方正廓形西装外套",
  "RM 219.00": "RM 219.00",
  "Free shipping over RM150 in Malaysia 🎀": "满 RM150 全马免运费 🎀",

  "Recommended Pairing": "推荐搭配",
  "Bundle Save": "套装省",
  "Both items": "两件合计",
  "Bundle Price": "套装优惠价",
  "Saved ♡": "已收藏",
  "Complete the Look": "推荐搭配",

  "Type": "类型",
  "Fabric": "面料",
  "Lining": "内衬",
  "Stretch": "弹性",
  "Transparency": "透肤",
  "Care": "洗涤",
  "Model Info": "模特参考",

  "Skirt": "裙子",
  "Dress": "连衣裙",
  "Top": "上衣",
  "Pants": "长裤",
  "Shorts": "短裤",
  "Outerwear": "外套",
  "Knit": "针织",
  "Set": "套装",
  "Polyester": "聚酯纤维",
  "Cotton": "棉",
  "Linen": "亚麻",
  "Chiffon": "雪纺",
  "Velvet": "丝绒",
  "Denim": "牛仔",

  "White Skirt": "白色裙子",
  "Pink Skirt": "粉色裙子",
  "Black": "黑色",
  "White": "白色",
  "Pink": "粉色",
  "Blue": "蓝色",
  "Green": "绿色",
  "Beige": "米色",
  "Brown": "棕色",
  "Grey": "灰色",
  "Purple": "紫色",
  "Red": "红色",
  "Yellow": "黄色",
  "Orange": "橙色",
  "Navy": "藏青色",
  "Forest Green": "墨绿色",
  "Apricot": "杏色",
  "Khaki": "卡其色",
  "Cream": "奶油色",

  "Real Girls, Real Looks": "真实穿搭 · 真实上身",
  "Worn & Loved": "穿搭上身图",
  "Your photo here": "你的上身图",
  "Follow us @cippy.kl": "关注我们 @cippy.kl",
  "@sofia_lee": "@sofia_lee",
  "@nurul.fits": "@nurul.fits",
  "@amy_wong": "@amy_wong",
  "@jolene_t": "@jolene_t",
  "Join the Club": "加入会员俱乐部",
  "Sign up for early access to drops and exclusive 'Red' inspired styling tips. Get 10% off your first order!": "注册即可抢先体验新品并获取「红」系列专属穿搭灵感，首单立享9折！",
  "Subscribe": "订阅",
  "Curating effortless Korean aesthetic for the modern Malaysian woman. Quality pieces for your everyday vibe.": "为现代马来西亚女性精选不费力的韩系美学单品，让日常造型更有质感。",
  "Shop": "购物",
  "New Arrivals": "新品上市",
  "Best Sellers": "畅销榜",
  "Help": "帮助",
  "Shipping & Returns": "配送与退换货",
  "Privacy Policy": "隐私政策",
  "Terms of Service": "服务条款",
  "Contact Us": "联系我们",
  "Contact": "联系方式",
  "Bangsar Village II,": "Bangsar Village II,",
  "Kuala Lumpur, Malaysia": "马来西亚吉隆坡",
  "hello@cippy.com.my": "hello@cippy.com.my",
  "© 2024 cippy Malaysia. All Rights Reserved.": "© 2024 cippy Malaysia. 保留所有权利。",
  "Home": "首页",
  "Explore": "探索",
  "Wishlist": "心愿单",
  "Profile": "我的",
  "cippy": "cippy",
  "The Edit": "精选系列",
  "Curated essentials for the modern lifestyle. Effortless, chic, and uniquely yours.": "为现代生活精选的必备单品，不费力、优雅，独属于你。",
  "Skirts": "半身裙",
  "Tops": "上衣",
  "Pants": "长裤",
  "Outerwear": "外套",
  "Sets": "套装",
  "All": "全部",
  "Price: Low to High": "价格：从低到高",
  "Price: High to Low": "价格：从高到低",
  "6 Items": "6 件商品",
  "Series:": "系列：",
  "Cippy Essential": "Cippy 基础系列",
  "Cippy Sweet": "Cippy 甜美系列",
  "Cippy Summer": "Cippy 夏日系列",
  "Cippy Daily": "Cippy 日常系列",
  "#OOTD": "#OOTD",
  "#KoreanStyle": "#韩系风",
  "Urban Linen Set": "都市亚麻套装",
  "MYR 189.00": "MYR 189.00",
  "#Aesthetic": "#美学",
  "Petite Croissant Bag": "迷你可颂包",
  "MYR 125.00": "MYR 125.00",
  "#HotItem": "#爆款",
  "#DateNight": "#约会穿搭",
  "Crimson Silk Muse": "绯红真丝灵感",
  "MYR 210.00": "MYR 210.00",
  "#StreetStyle": "#街头风",
  "Cloud Walker Chunky": "云朵厚底鞋",
  "MYR 299.00": "MYR 299.00",
  "#SquadGoals": "#闺蜜穿搭",
  "Autumn Knit Vest": "秋季针织马甲",
  "MYR 95.00": "MYR 95.00",
  "#DailyCarry": "#每日必备",
  "Essence Gold Series": "精萃金色系列",
  "MYR 155.00": "MYR 155.00",
  "Defining the new standard of effortless chic for Gen Z Malaysia. Community-driven, trend-conscious, and always evolving.": "为马来西亚 Z 世代重新定义不费力的优雅风格。以社区为核心，紧跟潮流，持续进化。",
  "Instagram Shop": "Instagram 商店",
  "Support": "客户支持",
  "Connect": "关注我们",
  "Saves": "收藏",
  "Me": "我的",
  "New Arrival": "新品上市",
  "Lumière Linen Midi Dress": "Lumière 亚麻中长裙",
  "RM 249.00": "RM 249.00",
  "RM 320.00": "RM 320.00",
  "An effortlessly chic staple for the modern Malaysian wardrobe. Crafted from breathable organic linen, featuring a minimalist silhouette and a flattering tie-back detail. Perfect for sun-soaked afternoons at Bukit Bintang or evening gallery hops.": "现代马来西亚衣橱里不费力的优雅必备款。采用透气有机亚麻面料制成，极简轮廓搭配修身的系带背部细节，无论是阳光洒满的武吉免登午后，还是傍晚的画廊漫步都恰到好处。",
  "Select Color": "选择颜色",
  "Select Size": "选择尺码",
  "Size Guide": "尺码指南",
  "All measurements in cm": "所有尺寸单位为 cm",
  "Product not found": "找不到此商品",
  "Add both to cart": "两件一起加入购物袋",
  "Size": "尺码",
  "Type": "类型",
  "Fabric": "面料",
  "Series": "系列",
  "Added to wishlist ♡": "已加入心愿单 ♡",
  "Removed from wishlist": "已移出心愿单",
  "Added to bag ✓": "已加入购物袋 ✓",
  "Outfit added to bag ✓": "套装已加入购物袋 ✓",
  "Please select a size": "请先选择尺码",
  "Please select a variant first": "请先选择款式",
  "S": "S",
  "M": "M",
  "L": "L",
  "Add to Bag": "加入购物袋",
  "Save to Wishlist": "收藏到心愿单",
  "Express Shipping to West Malaysia": "西马快递配送",
  "Arrives in 1-3 business days. RM 8.00 or FREE over RM 150.": "1-3 个工作日送达。运费 RM 8.00，订单满 RM 150 免运费。",
  "Store Pickup (Suria KLCC)": "门店自提（Suria KLCC）",
  "Ready for collection in 2 hours.": "2 小时内可到店自提。",
  "Complete The Look": "搭配全套造型",
  "View More Essentials": "查看更多必备单品",
  "Cloud Leather Mules": "云感皮革穆勒鞋",
  "Petite Rouge Bag": "迷你红色手袋",
  "RM 220.00": "RM 220.00",
  "Stellar Gold Layers": "星辰金色叠链",
  "RM 95.00": "RM 95.00",
  "Organza Layering Shirt": "欧根纱叠搭衬衫",
  "RM 155.00": "RM 155.00",
  "Redefining the Malaysian minimalist aesthetic for the digital generation.": "为数字时代重新定义马来西亚极简美学。",
  "Join The Inner Circle": "加入核心圈",
  "Stay updated on our latest drops and exclusive offers.": "第一时间获取最新上新与专属优惠。",
  "Join": "加入",
  "Your Shopping Bag": "我的购物袋",
  "Review your selections and proceed to secure checkout.": "确认你的选购商品，前往安全结账。",
  "Almost there!": "就差一点！",
  "MYR 50.00 to free shipping": "再购 MYR 50.00 即可免运费",
  "Free standard shipping on orders over MYR 200.00": "订单满 MYR 200.00 享免费标准配送",
  "Cloud Knit Sweater": "云感针织毛衣",
  "Ivory | M": "象牙白 | M码",
  "-": "-",
  "1": "1",
  "+": "+",
  "MYR 129.00": "MYR 129.00",
  "Geometric Charm": "几何吊坠",
  "Gold-plated | OS": "镀金 | 均码",
  "MYR 21.00": "MYR 21.00",
  "Add a gift note (Free)": "添加礼物贺卡（免费）",
  "Payment Methods": "支付方式",
  "GrabPay": "GrabPay",
  "T&G eWallet": "T&G eWallet",
  "FPX": "FPX",
  "Visa/Master": "Visa/Master",
  "Order Summary": "订单摘要",
  "Subtotal": "小计",
  "MYR 150.00": "MYR 150.00",
  "Shipping": "运费",
  "MYR 12.00": "MYR 12.00",
  "Tax (SST 6%)": "税费 (SST 6%)",
  "MYR 9.00": "MYR 9.00",
  "Apply": "使用",
  "Total": "总计",
  "MYR 171.00": "MYR 171.00",
  "Secure Checkout": "安全结账",
  "All transactions are secured and encrypted.": "所有交易均经过加密保护。",
  "GST included where applicable.": "如适用，已包含消费税。",
  "Secured": "安全保障",
  "Tracked": "全程追踪",
  "Returns": "轻松退货",
  "Effortless chic for the modern Malaysian lifestyle. Curated with love, delivered with care.": "为现代马来西亚生活方式打造的不费力优雅风格，用心精选，悉心呈递。",
  "Customer Care": "客户服务",
  "FAQs": "常见问题",
  "Legal": "法律信息",
  "cippy Club": "cippy 会员俱乐部",
  "Curated rewards for the effortless woman. Join our inner circle for exclusive access to the latest trends, lifestyle perks, and intimate community events.": "为不费力的优雅女性精心打造的专属福利。加入我们的核心圈，抢先体验最新潮流、生活福利与私享社区活动。",
  "Membership Tiers": "会员等级",
  "Elevate your shopping experience as you grow with us.": "与我们一起成长，升级你的购物体验。",
  "Pink Ribbon": "粉色丝带",
  "Entry Level": "入门等级",
  "Welcome Voucher (10% Off)": "新人优惠券（9折）",
  "RM1 = 1 Point": "RM1 = 1 积分",
  "Early Sale Notification": "提前获知促销信息",
  "No Spend Requirement": "无消费门槛",
  "Most Popular": "最受欢迎",
  "Rose Gold": "玫瑰金",
  "Style Enthusiast": "风格达人",
  "1.5x Points Multiplier": "1.5倍积分加成",
  "Free Shipping (No Min.)": "免运费（无最低消费）",
  "Birthday Reward (RM50)": "生日礼遇（RM50）",
  "Exclusive \"Member Drops\"": "专属「会员限定新品」",
  "Spend RM1,500 Yearly": "年消费满 RM1,500",
  "Diamond Silk": "钻石丝绸",
  "VIP Elite": "VIP 尊享",
  "2x Points Multiplier": "2倍积分加成",
  "1-on-1 Styling Consultation": "一对一造型顾问",
  "Priority Customer Care": "优先客户服务",
  "Invitation to VIP Tea Parties": "受邀参加 VIP 茶会",
  "Spend RM5,000 Yearly": "年消费满 RM5,000",
  "How it Works": "玩法介绍",
  "Shop & Earn": "购物赚积分",
  "Every RM1 spent earns you 1 point. Accumulate points with every purchase, online or in-store.": "每消费 RM1 即可获得 1 积分，无论线上线下购物都能累积积分。",
  "2": "2",
  "Accumulate Points": "累积积分",
  "Watch your points grow. 500 points can be redeemed for RM50 credit on your next haul.": "积分逐渐累积，500 积分即可兑换 RM50 购物金。",
  "3": "3",
  "Unlock Tiers": "解锁等级",
  "The more you spend, the faster you climb. Higher tiers unlock multipliers and secret perks.": "消费越多，升级越快。更高等级可解锁积分加成与隐藏福利。",
  "Learn More": "了解更多",
  "Exclusive Perks": "专属福利",
  "More than just shopping—it's a lifestyle.": "不止是购物，更是一种生活方式。",
  "Early Drops": "提前上新",
  "Shop new collections 24 hours before anyone else.": "比所有人提前 24 小时选购新系列。",
  "Styling Consultation": "造型咨询",
  "Personalized lookbooks curated by our lead stylist.": "由首席造型师为你定制专属穿搭手册。",
  "Member Events": "会员活动",
  "Invitations to intimate launch parties and workshops.": "受邀参加私密新品发布会与工作坊。",
  "Ready to be Lovely?": "准备好闪耀登场了吗？",
  "Create an account today and start earning rewards immediately. Your first welcome gift is waiting.": "立即注册账户，马上开始赚取积分，专属新人礼正在等你。",
  "Create Account": "创建账户",
  "Sign In": "登录",
  "By joining, you agree to our": "加入即代表你同意我们的",
  "Terms & Conditions": "条款与条件",
  ".": "。",
  "Redefining effortless chic for the modern woman. Curated in Seoul, Loved in Malaysia.": "为现代女性重新定义不费力的优雅。源自首尔设计，深受马来西亚喜爱。",
  "The Sale": "特卖专区",
  "Newsletter": "订阅资讯",
  "Your email address": "你的电子邮箱",
  "Promo Code": "优惠码",
  "Write your heartfelt message here...": "在这里写下你的祝福...",
  "Email address": "电子邮箱",
  "Search trends...": "搜索潮流...",
  "Get 10% off your first order.": "首单立享9折优惠。",
  "Loading…": "载入中…",
  "Select Size": "选择尺码",
  "Add to Bag": "加入购物袋",
  "Save to Wishlist": "收藏",
  "Product Details": "参数信息",
  "Detail Photos": "图文详情",
  "Complete the Look": "搭配单品",
  "Complete The Look": "搭配全套造型",
  "View More Essentials": "查看更多必备单品",

  "Payment Methods": "付款方式",
  "Credit / Debit Card": "信用卡 / 借记卡",
  "Recommended": "推荐",
  "Coming Soon": "即将推出",
  "FPX Online Banking": "FPX 网上银行",
  "Contact Info": "联系方式",
  "Login to auto-fill": "登录自动填写",
  "Full Name *": "姓名 *",
  "Email Address *": "电邮地址 *",
  "Phone Number * (e.g. 011-1234 5678)": "手机号码 * (e.g. 011-1234 5678)",
  "Delivery Address": "收件地址",
  "New Address": "新地址",
  "Add New Address": "添加新地址",
  "Recipient Name *": "收件人姓名 *",
  "Phone Number *": "手机号码 *",
  "Address Line 1 (Unit, Street) *": "地址第一行（门牌、街道）*",
  "Address Line 2 (Apartment, Suite)": "地址第二行（公寓、单位号）",
  "Postcode *": "邮编 *",
  "City *": "城市 *",
  "Select State *": "选择州属 *",
  "Save Address": "保存地址",
  "Cancel": "取消",
  "Order Summary": "订单明细",
  "Subtotal": "商品小计",
  "Shipping": "运费",
  "Total": "总计",
  "Secure Checkout": "立即结账",
  "Secure": "安全支付",
  "Fast Shipping": "快速发货",
  "7-Day Returns": "7天退换",
  "Bundle Discount": "套装优惠",
  "No saved addresses yet. Click + to add one.": "还没有保存的地址，点右上角添加。",
  "Free shipping unlocked! 🎉": "已解锁免运费！🎉",
  "MYR 150.00 to free shipping": "再购 MYR 150.00 即可免运费",
  "Free standard shipping on orders over MYR 150.00": "订单满 MYR 150.00 享免费标准配送",
  "Your bag is empty ✨": "购物袋空空如也 ✨",
  "Start Shopping": "去逛逛",
  "Add a gift note (Free)": "添加礼物贺卡（免费）",
  "Write your heartfelt message here...": "在这里写下你的祝福...",
  "Sold Out": "售罄",
  "Email verified. You can place your order.": "邮箱已验证，可以下单。",

  "How would you like to checkout?": "如何结账？",
  "Sign in to earn points & rewards on every order.": "登录即可在每笔订单上累积积分与专属奖励。",
  "Sign In / Create Account": "登录 / 注册账户",
  "Earn points + 5% cashback on top-up ✨": "赚取积分 + 充值返现5% ✨",
  "Continue as Guest": "以访客身份结账",
  "No account needed · No points earned": "无需账户 · 不累积积分",
  "Signed in as Member": "已登录会员",
  "Sign out": "退出登录",
  "Checking out as Guest": "以访客身份结账",
  "Sign in instead": "改为登录",
  "Points not earned ·": "不累积积分 ·",

  "Visa · Mastercard · PayNow": "Visa · Mastercard · PayNow",
  "Maybank · CIMB · Public Bank · RHB": "Maybank · CIMB · Public Bank · RHB",
  "DuitNow QR": "DuitNow QR",
  "Coming Soon": "即将推出",

  "© 2025 cippy Malaysia. All Rights Reserved.": "© 2025 cippy Malaysia. 保留所有权利。",
  "Effortless chic for the modern Malaysian lifestyle. Curated with love, delivered with care.": "为现代马来西亚生活方式打造的不费力优雅风格，用心精选，悉心呈递。"
};

  var textNodes = [];
  var attrNodes = [];

  // Reverse dict: Chinese value → English key, for restoring baselines
  var RDICT = {};
  Object.keys(DICT).forEach(function(k) { RDICT[DICT[k]] = k; });

  function collect() {
    // Preserve English baselines for nodes already seen, to survive re-collect in zh mode
    var existingMap = new Map(textNodes.map(function(item) { return [item.node, item.en]; }));
    var existingAttrMap = new Map(attrNodes.map(function(item) { return [item.el + ':' + item.attr, item.en]; }));
    textNodes = [];
    attrNodes = [];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest(".material-symbols-outlined")) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "TITLE"].indexOf(p.tagName) !== -1) return NodeFilter.FILTER_REJECT;
        if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var n;
    while ((n = walker.nextNode())) {
      var cur = n.textContent;
      // Use preserved English, or reverse-lookup if currently translated, or current text
      var en = existingMap.get(n) || RDICT[cur.trim()] || cur;
      textNodes.push({ node: n, en: en });
    }
    document.querySelectorAll("[placeholder]").forEach(function (el) {
      var cur = el.getAttribute("placeholder");
      var en = existingAttrMap.get(el + ':placeholder') || RDICT[cur] || cur;
      attrNodes.push({ el: el, attr: "placeholder", en: en });
    });
  }

  function apply(lang) {
    textNodes.forEach(function (item) {
      var key = item.en.trim();
      if (lang === "zh" && DICT[key]) {
        item.node.textContent = item.en.replace(key, DICT[key]);
      } else {
        item.node.textContent = item.en;
      }
    });
    attrNodes.forEach(function (item) {
      var key = item.en.trim();
      if (lang === "zh" && DICT[key]) {
        item.el.setAttribute(item.attr, DICT[key]);
      } else {
        item.el.setAttribute(item.attr, item.en);
      }
    });
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.textContent = lang === "zh" ? "\u4e2d" : "EN";
    });
  }

  window.toggleCippyLang = function () {
    var cur = localStorage.getItem(STORAGE_KEY) || "en";
    var next = cur === "zh" ? "en" : "zh";
    apply(next);
    if (window.onCippyLangChange) window.onCippyLangChange(next);
  };

  window.getCippyLang = function () {
    return localStorage.getItem(STORAGE_KEY) || "en";
  };

  window.recollectCippyLang = function () {
    collect();
    apply(localStorage.getItem(STORAGE_KEY) || "en");
  };

  document.addEventListener("DOMContentLoaded", function () {
    collect();
    apply(localStorage.getItem(STORAGE_KEY) || "en");
  });
})();
