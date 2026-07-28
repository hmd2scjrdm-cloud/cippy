import { Product, StoryChapter } from './types';

export const storybookChapters: StoryChapter[] = [
  {
    id: 1,
    title: "Chapter I: Silent Structures & Airy Grace",
    cnTitle: "第一章：无声结构与纯净美学",
    subtitle: "Absolute freedom of movement & muted elegance",
    cnSubtitle: "自由舒展的剪裁与不费力优雅",
    content: "At Cippy, we believe that garments should never confine you. Our loose-fitting philosophy is a love letter to the relaxed Korean aesthetic—tailored with premium drapes that flow with your body, creating a fairytale silhouette that is both high-end and deeply comforting.",
    cnContent: "在 Cippy，我们深信衣物不该是拘束。我们的‘韩系宽松美学’是一首献给随性生活的抒情诗——选用高端垂坠面料，随着身体的律动起伏，营造出既高级又温暖舒适的童话廓形。",
    illustrationType: "dress",
    image: "/assets/journal/chapter-1.png"
  },
  {
    id: 2,
    title: "Chapter II: Ready-to-Wear Magic",
    cnTitle: "第二章：即穿即美的日常魔法",
    subtitle: "Effortless styling for the modern dreamer",
    cnSubtitle: "无需费心搭配，穿上即是梦境主角",
    content: "True luxury is effortless. Every Cippy piece is meticulously curated to be the main character of your daily look. No complicated styling required—simply wear, adjust the delicate premium details, and step out into your day with confidence and whimsical beauty.",
    cnContent: "真正的奢华是毫不费力的。Cippy 的每一件 Ready-to-Wear（成衣）都经过精心雕琢，旨在成为你日常穿搭的绝对主角。无需繁复的搭配技巧——轻轻穿上，系好带子，便能自信走入童话般的日常。",
    illustrationType: "bow",
    image: "/assets/journal/chapter-2.jpeg"
  },
  {
    id: 3,
    title: "Chapter III: The S & M Fit Philosophy",
    cnTitle: "第三章：专属于 S 与 M 的合身哲学",
    subtitle: "REFINED PROPORTIONS FOR A BEAUTIFUL EVERYDAY FIT",
    cnSubtitle: "为日常穿着反复调整的细腻比例",
    content: "We focus on S and M sizing so every silhouette can be adjusted with greater attention to proportion. From the neckline and waist placement to the overall length and drape, each detail is considered to create a flattering fit that feels comfortable, feminine and easy to wear.",
    cnContent: "我们专注于 S 与 M 两个尺码，让每一件衣服的比例都能获得更细致的调整。从领口、腰线到衣长与垂坠度，我们反复琢磨每一个细节，让衣服自然贴合身形，穿起来舒适、显比例，同时保留 Cippy 独有的温柔感。",
    illustrationType: "stars",
    image: "/assets/journal/chapter-3.jpg"
  },
  {
    id: 4,
    title: "Chapter IV: Made for Malaysian Days",
    cnTitle: "第四章：为马来西亚日常而选",
    subtitle: "Breathable weaves tailored for year-round comfort",
    cnSubtitle: "专为热带气温与冷气房甄选的柔顺触感",
    content: "Curated for life in Malaysia—from sunny afternoons and café dates to cool classrooms and air-conditioned spaces. Cippy pieces are selected to feel light, comfortable and easy to layer, so you can look lovely without dressing too formally.",
    cnContent: "为马来西亚的日常生活而精选——从炎热午后、咖啡店约会，到冷气充足的教室与商场。Cippy 重视轻盈、舒适与容易叠穿，让你既可以穿去打卡，也能自然融入上课、逛街和普通生活，不必穿得过分隆重。",
    illustrationType: "cloud"
  }
];

export const products: Product[] = [
  {
    "id": "e59bbfe1-abfa-439f-b433-88eb20d9d011",
    "name": "Flattering Silhouette | Waist-Fit Crewneck Ribbed Tee",
    "cnName": "版型超正圆领T｜修身收腰螺纹短袖",
    "category": "tops",
    "price": 15,
    "sizes": [
      "M"
    ],
    "description": "A super flattering waist-fit crewneck ribbed tee. Crafted from lightweight, breathable ribbed fabric. Freesize, suitable for 45-50kg. Available in White, Pink, Black.",
    "cnDescription": "版型超级正的圆领T！螺纹面料，清爽透气。特别添加修身收腰设计。Freesize 均码（适合体重 45-50kg 可穿）。拥有白色、粉色、黑色三种经典颜色选择，每个颜色各 2 件。",
    "story": "A timeless, waist-contouring basic featuring a clean ribbed knit. Soft to the touch and incredibly breathable, it effortlessly updates your daily fairytale look.",
    "cnStory": "修身利落的剪裁搭配温柔亲肤的螺纹面料，单穿即可营造法式轻慵懒氛围。精致的收腰设计，给简单的日常多了一分浪漫细节。",
    "details": [
      "Fabric: Premium elastic ribbed cotton blend / 螺纹棉混纺",
      "Series: Cippy Basic",
      "Fit: Flattering waist-contouring slim silhouette",
      "Care: Gentle hand wash or machine wash under 30°C"
    ],
    "cnDetails": [
      "面料材质：高端轻薄螺纹棉混纺",
      "系列归属：Cippy Basic",
      "版型剪裁：修身收腰版型，视觉上非常显腰细",
      "洗涤建议：建议放入洗衣袋轻柔机洗或手洗，避免暴力拉扯"
    ],
    "color": "#FAF4F6",
    "bgGradient": "from-[#FCF5F7] to-[#F5E6EB]",
    "svgPath": "M 15,35 L 85,35 L 80,80 L 20,80 Z",
    "imageUrl": "/images/product_ribbed_tee_011.jpg",
    "detailImages": [],
    "images": [],
    "inStock": true,
    "stock": 6,
    "series": "Cippy Basic",
    "fabric": "螺纹面料",
    "clothingType": "短袖上衣、T恤",
    "lining": "无内衬",
    "stretch": "高弹力",
    "transparency": "微透 (Slight)",
    "care": "冷水轻柔手洗 / 悬挂晾干"
  },
  {
    "id": "8063d07c-3062-4f2a-bc71-fc7d73b62803",
    "name": "Campus Diary | Navy Dachshund Embroidered Tube Top + Grey Ruffle Skirt Set",
    "cnName": "校园日记｜深蓝腊肠狗刺绣抹胸 + 灰色层叠蛋糕裙",
    "category": "sets",
    "price": 80,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "Reminiscent of sweet collegiate afternoons under breezy trees, this set pairs a delicate dachshund embroidered tube top with a beautifully layered ruffle skirt. Pure youthful magic.",
    "cnStory": "灵感源自绿树微风下的甜美校园午后，精致的腊肠狗刺绣抹胸，搭配层层叠叠的灰色蛋糕短裙，尽显干净纯粹的少女灵动感。",
    "details": [
      "Fabric: 混纺",
      "Series: Cippy Sweet",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：混纺",
      "系列归属：Cippy Sweet",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#1E3A8A",
    "bgGradient": "from-[#F0F4FC] to-[#DCE4F5]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/005.png",
    "detailImages": [],
    "images": [],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Sweet",
    "fabric": "混纺",
    "clothingType": "抹胸上衣、蛋糕短裙、套装",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "573351cc-0215-4fb2-b1f5-c6c6908b481f",
    "name": "A",
    "cnName": "日常｜简约纯色高腰A字包臀短裙",
    "category": "bottoms",
    "price": 40,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "A pristine high-waisted silhouette cut to elongate the legs. Its A-line drape floats gracefully, making it an essential chapter for your daily strolls.",
    "cnStory": "专为修饰小个子比例甄选的高腰 A 字裙摆。利落服帖的线条，走动时却带出轻盈波光，是日常衣橱里最百搭温婉的诗意篇章。",
    "details": [
      "Fabric: 聚酯纤维",
      "Series: Cippy Essential",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：聚酯纤维",
      "系列归属：Cippy Essential",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#C4928A",
    "bgGradient": "from-[#FFF5F7] to-[#FFE3EB]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/011.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/010.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/009.png"
    ],
    "images": [],
    "inStock": true,
    "stock": 0,
    "series": "Cippy Essential",
    "fabric": "聚酯纤维",
    "clothingType": "裙子",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "bef1b190-bd86-4e1f-b3c4-c2ce24c79bca",
    "name": "Everyday Essential | Drawstring Casual Shorts",
    "cnName": "日常必备｜抽绳休闲短裤",
    "category": "bottoms",
    "price": 36,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "Crafted for high-end lounging and weekend adventures. The gentle drawstring waist ensures effortless wearability, offering a cozy touch of Korean styling.",
    "cnStory": "专为慵懒周末与精致居家打造的抽绳热裤。高品质棉麻混纺，亲肤而有型，在漫步吉隆坡暖风里带来不费力的极致舒适。",
    "details": [
      "Fabric: 棉、聚酯纤维",
      "Series: Cippy Essential",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：棉、聚酯纤维",
      "系列归属：Cippy Essential",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#C4928A",
    "bgGradient": "from-[#FFF5F7] to-[#FFE3EB]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/006.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/013.png"
    ],
    "images": [],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Essential",
    "fabric": "棉、聚酯纤维",
    "clothingType": "热裤、休闲裤、短裤",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "33fa56e3-cafb-4502-82b6-0a5035b0cf3c",
    "name": "Paris Girl | Cream Polka Dot Cami Dress Set",
    "cnName": "巴黎少女｜奶白波点吊带连衣裙套装",
    "category": "sets",
    "price": 120,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "A romantic crossover between French elegance and Seoul street style. Features classic cream polka dots and a matching light cover-up, draping like a dream.",
    "cnStory": "法式复古浪漫与首尔街头风的梦幻交织。轻盈的奶白波点吊带裙，搭配同色系防晒微开衫，微风吹拂时宛如漫步巴黎左岸。",
    "details": [
      "Fabric: 聚酯纤维",
      "Series: Cippy Sweet",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：聚酯纤维",
      "系列归属：Cippy Sweet",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#F3F4F6",
    "bgGradient": "from-[#FAF9F6] to-[#F3F2EC]",
    "svgPath": "M 20,40 C 25,25 75,25 80,40 L 75,55 L 90,85 L 10,85 L 25,55 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/003.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/003details/1.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/003details/2.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/003details/4.png"
    ],
    "images": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0005.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0013.jpeg"
    ],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Sweet",
    "fabric": "聚酯纤维",
    "clothingType": "连衣裙、开衫、套装",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "e26470ef-5ffc-48de-aad4-1521e6b5a32d",
    "name": "",
    "cnName": "日常显腿长｜休闲垂感显瘦阔腿长裤",
    "category": "bottoms",
    "price": 40,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "A classic high-drape silhouette that elongates the figure beautifully. Fabricated with a soft-touch fluid drape that flows elegantly with every step you take.",
    "cnStory": "拥有神仙垂感的高腰阔腿长裤。天丝麻质地走动时带有如水波般的流动感，瞬间拉长双腿比例，让大马的每一次通勤都充满松弛自信。",
    "details": [
      "Fabric: 粘胶纤维、聚酯纤维、氨纶",
      "Series: Cippy Essential",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：粘胶纤维、聚酯纤维、氨纶",
      "系列归属：Cippy Essential",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#C4928A",
    "bgGradient": "from-[#FFF5F7] to-[#FFE3EB]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/007.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/014.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/015.png"
    ],
    "images": [],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Essential",
    "fabric": "粘胶纤维、聚酯纤维、氨纶",
    "clothingType": "长裤、休闲裤",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "e3791f4a-949d-41eb-8e45-d091708ba5b2",
    "name": "Seoul Girl | Grey-Brown Knit Tee + Dark Brown Lace Cami · Adjustable Straps",
    "cnName": "首尔少女｜灰棕色针织短袖 + 深棕蕾丝吊带内搭～吊带可调节",
    "category": "dresses",
    "price": 120,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "A cozy, highly styled layering masterpiece featuring a soft grey-brown knit and a romantic dark brown lace camisole. calibrates modern proportions beautifully.",
    "cnStory": "自带慵懒韩风的叠穿神作。灰棕色微透针织衫，内搭深色蕾丝可调节吊带，冷暖色调优雅互补，在微凉冷气房里舒展无限高级感。",
    "details": [
      "Fabric: Premium blend",
      "Series: Cippy Sweet",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：高档混纺面料，柔软透气",
      "系列归属：Cippy Sweet",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#6B7280",
    "bgGradient": "from-[#F3F4F6] to-[#E5E7EB]",
    "svgPath": "M 15,35 L 85,35 L 80,80 L 20,80 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/002.png",
    "detailImages": [],
    "images": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0014.jpg",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0015.jpeg"
    ],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Sweet",
    "fabric": null,
    "clothingType": null,
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "4cf8db77-23f6-4da8-bb58-50a1026a4b2e",
    "name": "Bali Afternoon | Matcha Jacquard Mini Dress · Adjustable Fit",
    "cnName": "巴厘岛午后｜抹茶绿提花吊带连衣裙～修身可调节",
    "category": "dresses",
    "price": 58,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "Woven in a rich matcha green jacquard pattern. Perfect for sun-soaked afternoons and relaxing café dates, featuring delicate adjustable straps.",
    "cnStory": "一抹沁人心脾的抹茶提花。精致立体的微雕纹理，在阳光下熠熠生辉。修身裁剪与可调节吊带，让每一刻悠闲下午茶都散发夏日温柔。",
    "details": [
      "Fabric: Premium blend",
      "Series: Cippy Summer",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：高档混纺面料，柔软透气",
      "系列归属：Cippy Summer",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#5D6B54",
    "bgGradient": "from-[#F4F6F2] to-[#E4E8DF]",
    "svgPath": "M 20,40 C 25,25 75,25 80,40 L 75,55 L 90,85 L 10,85 L 25,55 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/001.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/001details/1.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/001details/2.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/001details/4.png"
    ],
    "images": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0019.jpeg",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0021.jpeg",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0022.jpeg",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0014.jpeg"
    ],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Summer",
    "fabric": null,
    "clothingType": null,
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "90d8f406-18e1-499d-8e16-3797b3e49bb7",
    "name": "Seoul Street | Tie-Front Puff Sleeve Top",
    "cnName": "首尔街拍｜泡泡袖上衣 ",
    "category": "sets",
    "price": 45,
    "sizes": [
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "An adorable Seoul-inspired top featuring gorgeous puff sleeves and a playful tie-front closure. Highly breathable for warm, bright days.",
    "cnStory": "首尔严选力作，立体蓬松的泡泡袖搭配前幅温柔的小系带。修身显瘦，选用透气微凉感面料，在吉隆坡的骄阳下依然清爽优雅。",
    "details": [
      "Fabric: 聚酯纤维",
      "Series: Cippy Daily",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：聚酯纤维",
      "系列归属：Cippy Daily",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#C4928A",
    "bgGradient": "from-[#FFF5F7] to-[#FFE3EB]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/004.png",
    "detailImages": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/004details/1.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/004details/2.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/004details/3.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/004details/4.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/details_pic/004details/5.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/008.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/012.png"
    ],
    "images": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0001.jpg",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0004.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0003.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0002.png",
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0012.jpeg"
    ],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Daily",
    "fabric": "聚酯纤维",
    "clothingType": "上衣、裙子、套装",
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "f0b63670-1b4e-4eed-9f4c-1b5396cc67c9",
    "name": "First Love | Floral Lace Mini Dress",
    "cnName": "初恋｜碎花蕾丝连衣裙",
    "category": "dresses",
    "price": 80,
    "sizes": [
      "S"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "Delicately embroidered with floral lace details. Evokes the sweetness and purity of a fairytale romance, tailored for an effortless fit.",
    "cnStory": "宛如初恋般纯净剔透的碎花蕾丝连衣裙。全身布满手工感的花朵刺绣，质地柔软亲肤，系上纤细的背部缎带，一键开启唯美梦境。",
    "details": [
      "Fabric: Premium blend",
      "Series: Cippy Sweet",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：高档混纺面料，柔软透气",
      "系列归属：Cippy Sweet",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#C4928A",
    "bgGradient": "from-[#FFF5F7] to-[#FFE3EB]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/016.png",
    "detailImages": [],
    "images": [
      "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/model-ootd/0023.jpeg"
    ],
    "inStock": true,
    "stock": 0,
    "series": "Cippy Sweet",
    "fabric": null,
    "clothingType": null,
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  },
  {
    "id": "5205d0ee-6fc6-48f3-9a37-c151381ff33b",
    "name": "Navy Muse｜Lace Halter Dress",
    "cnName": "海军蓝缪斯｜蕾丝挂脖裙",
    "category": "dresses",
    "price": 68,
    "sizes": [
      "XS",
      "S",
      "M"
    ],
    "description": "An effortlessly chic, premium ready-to-wear piece crafted from highly breathable fabric. Perfect for modern, everyday storytelling.",
    "cnDescription": "一款专为大马气候精选的高端透气成衣。裁剪松弛而优雅，细节精致，完美融入日常韩系氛围穿搭。",
    "story": "An elegant lace halter silhouette in a deep, mysterious navy hue. Cut to float beautifully between day-lit galleries and evening garden parties.",
    "cnStory": "一袭神秘高贵的海军蓝蕾丝挂脖裙。精致钩花蕾丝如海浪般层层倾泻，挂脖剪裁衬托出完美颈部曲线，是美术馆漫步与暮色晚宴的绝佳选择。",
    "details": [
      "Fabric: Premium blend",
      "Series: Cippy Sweet",
      "Fit: Highly customized S/M proportions for an elongated look",
      "Care: Gentle hand wash or dry clean recommended"
    ],
    "cnDetails": [
      "面料材质：高档混纺面料，柔软透气",
      "系列归属：Cippy Sweet",
      "版型剪裁：专为小个子比例微调落肩与垂地感，显瘦显高",
      "洗涤建议：建议冷水轻柔手洗或干洗，平铺晾干"
    ],
    "color": "#1E3A8A",
    "bgGradient": "from-[#F0F4FC] to-[#DCE4F5]",
    "svgPath": "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    "imageUrl": "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/017.png",
    "detailImages": [],
    "images": [],
    "inStock": true,
    "stock": 1,
    "series": "Cippy Sweet",
    "fabric": null,
    "clothingType": null,
    "lining": null,
    "stretch": null,
    "transparency": null,
    "care": null
  }
];

export interface MixMatchItem {
  id: string;
  name: string;
  cnName: string;
  type: 'top' | 'bottom';
  color: string;
  svgPath: string;
  productId: string; // references actual Product
  imageUrl?: string;
}

// Pick the real top products from our Supabase list for interactive Mix-Match
export const mixMatchTops: MixMatchItem[] = [
  {
    id: "top-puff-sleeve",
    name: "Seoul Street | Tie-Front Puff Sleeve Top",
    cnName: "首尔街拍｜泡泡袖上衣",
    type: "top",
    color: "#F4F6F2",
    svgPath: "M 20,35 L 80,35 L 85,65 L 70,65 L 68,80 L 32,80 L 30,65 L 15,65 Z",
    productId: "90d8f406-18e1-499d-8e16-3797b3e49bb7",
    imageUrl: "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/004.png"
  },
  {
    id: "top-grey-knit",
    name: "Seoul Girl | Grey-Brown Knit Tee",
    cnName: "首尔少女｜灰棕色针织短袖",
    type: "top",
    color: "#6B7280",
    svgPath: "M 15,35 L 85,35 L 80,80 L 20,80 Z",
    productId: "e3791f4a-949d-41eb-8e45-d091708ba5b2",
    imageUrl: "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/002.png"
  }
];

// Pick the real bottom products from our Supabase list for interactive Mix-Match
export const mixMatchBottoms: MixMatchItem[] = [
  {
    id: "bottom-skirt-a",
    name: "A-Line Mini Skirt",
    cnName: "高腰A字包臀短裙",
    type: "bottom",
    color: "#C4928A",
    svgPath: "M 32,30 L 68,30 L 80,85 L 20,85 Z",
    productId: "573351cc-0215-4fb2-b1f5-c6c6908b481f",
    imageUrl: "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/011.png"
  },
  {
    id: "bottom-drawstring-shorts",
    name: "Everyday Drawstring Shorts",
    cnName: "日常必备｜抽绳休闲短裤",
    type: "bottom",
    color: "#78350F",
    svgPath: "M 30,30 L 70,30 L 75,85 L 53,85 L 50,55 L 47,85 L 25,85 Z",
    productId: "bef1b190-bd86-4e1f-b3c4-c2ce24c79bca",
    imageUrl: "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/006.png"
  },
  {
    id: "bottom-wide-pants",
    name: "Draped Wide-Leg Pants",
    cnName: "日常显腿长｜阔腿长裤",
    type: "bottom",
    color: "#1E3A8A",
    svgPath: "M 30,30 L 70,30 L 75,85 L 53,85 L 50,55 L 47,85 L 25,85 Z",
    productId: "e26470ef-5ffc-48de-aad4-1521e6b5a32d",
    imageUrl: "https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/product-image/007.png"
  }
];

export interface StylingCombination {
  topId: string;
  bottomId: string;
  title: string;
  cnTitle: string;
  verdict: string;
  cnVerdict: string;
}

export const stylingCombinations: StylingCombination[] = [
  {
    topId: "top-puff-sleeve",
    bottomId: "bottom-skirt-a",
    title: "Seoul Street Minimal Sweet",
    cnTitle: "首尔街拍甜酷风",
    verdict: "A perfect sweet-yet-clean look. The volume of the puff sleeve top balances the sleek, crisp tailoring of the A-line mini skirt. Stunning and lightweight.",
    cnVerdict: "甜而不腻的黄金穿搭。蓬松立体的泡泡袖上衣完美中和了高腰 A 字包臀裙的挺括线条，呈现出极致显瘦又大方的韩系街头甜酷感。"
  },
  {
    topId: "top-grey-knit",
    bottomId: "bottom-wide-pants",
    title: "Effortless Cozy Lounge Vibe",
    cnTitle: "午后咖啡松弛美学",
    verdict: "The ultimate cozy Korean silhouette. Features layering with a drop-shoulder knit tee and a highly fluid draped wide-leg trousers. Incredibly soft.",
    cnVerdict: "极致温柔的韩系慵懒代表。软糯贴合的针织短袖与高垂坠阔腿长裤形成完美的上紧下宽流线，在冷气咖啡厅里散发漫不经心的高级感。"
  },
  {
    topId: "top-puff-sleeve",
    bottomId: "bottom-drawstring-shorts",
    title: "Sunshine Weekend Stroll",
    cnTitle: "骄阳周末慵懒漫步",
    verdict: "Airy and joyful. Pair the playful puff sleeve top with casual drawstring shorts for a day of gallery hopping or flower markets.",
    cnVerdict: "洒满阳光的夏日活力穿搭。将前幅系带的蓬松泡泡袖上衣，搭配透气抽绳休闲短裤，不论是去市集买花还是去美术馆，都极其轻盈舒适。"
  }
];
