import React, { useState } from 'react';
import { mixMatchTops, mixMatchBottoms, stylingCombinations, products, MixMatchItem } from '../data';
import { Product } from '../types';
import { Sparkles, ShoppingBag, ArrowRight, Star } from 'lucide-react';

interface MixMatchRoomProps {
  onAddProductToCart: (product: Product, size: 'S' | 'M') => void;
  activeTheme?: any;
  activeArchetype?: any;
  lang?: 'en' | 'zh';
}

const pinkFallback = {
  id: 'pink' as const,
  primaryBg: 'bg-pink-400',
  primaryText: 'text-pink-500',
  primaryHover: 'hover:bg-pink-500',
  primaryBorder: 'border-pink-200',
  primaryBorderSoft: 'border-pink-100/40',
  softBg: 'bg-pink-50/50',
  softBgHover: 'hover:bg-pink-100/50',
  pillBg: 'bg-pink-50/40',
  badgeBg: 'bg-pink-100/60 text-pink-600',
  accentText: 'text-pink-400',
  accentTextHover: 'hover:text-pink-500',
  accentFill: 'fill-pink-100',
  starFill: 'fill-pink-100 text-pink-300',
  topBar: 'from-pink-200 via-pink-300 to-pink-200',
  heroGradient: 'from-[#FFF5F7] via-[#FFFDFE] to-transparent',
  ribbonColor: '#F472B6',
  btnShadow: 'shadow-pink-200',
  selectionBg: 'selection:bg-pink-100 selection:text-pink-600',
};

const defaultArchetype = {
  id: 'storybook' as const,
  name: 'Fairytale Storybook',
  cnName: '童话绘本',
  cardStyle: 'bg-white/90 storybook-border-sm storybook-shadow storybook-shadow-hover rounded-2xl relative transition-all duration-300',
  fontTitle: 'font-serif',
  fontBody: 'font-sans'
};

export default function MixMatchRoom({ onAddProductToCart, activeTheme: activeThemeProp, activeArchetype: activeArchetypeProp, lang = 'en' }: MixMatchRoomProps) {
  const activeTheme = activeThemeProp || pinkFallback;
  const activeArchetype = activeArchetypeProp || defaultArchetype;
  
  const [selectedTopId, setSelectedTopId] = useState<string>(mixMatchTops[0].id);
  const [selectedBottomId, setSelectedBottomId] = useState<string>(mixMatchBottoms[0].id);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M'>('S');
  const [showHeartburst, setShowHeartburst] = useState(false);

  const selectedTop = mixMatchTops.find(t => t.id === selectedTopId) || mixMatchTops[0];
  const selectedBottom = mixMatchBottoms.find(b => b.id === selectedBottomId) || mixMatchBottoms[0];

  // Retrieve actual products linked
  const topProduct = products.find(p => p.id === selectedTop.productId);
  const bottomProduct = products.find(p => p.id === selectedBottom.productId);

  const totalCost = (topProduct?.price || 0) + (bottomProduct?.price || 0);

  // Get combination review
  const combinationReview = stylingCombinations.find(
    c => c.topId === selectedTopId && c.bottomId === selectedBottomId
  ) || {
    title: "Lovely Mix",
    cnTitle: "甜美搭配",
    verdict: "A wonderful pairing that looks effortlessly daily & lovely.",
    cnVerdict: "极具随性之美的一套日常宽松成衣穿搭。"
  };

  const handleAddSetToBag = () => {
    if (topProduct) onAddProductToCart(topProduct, selectedSize);
    if (bottomProduct) onAddProductToCart(bottomProduct, selectedSize);

    // Show beautiful heart burst effect
    setShowHeartburst(true);
    setTimeout(() => {
      setShowHeartburst(false);
    }, 1200);
  };

  const isMinimal = activeArchetype.id === 'minimalist';
  const isVintage = activeArchetype.id === 'vintage';

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4 animate-fade-in" id="dressing-room">
      <div className="text-center mb-10">
        {!isMinimal && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${activeTheme.softBg} ${activeTheme.primaryText} ${
            isVintage ? 'rounded-md' : 'rounded-full'
          } text-xs tracking-widest font-sans font-medium uppercase mb-2`}>
            <Star className={`w-3.5 h-3.5 ${activeTheme.starFill}`} /> 
            {isVintage ? 'Atelier Fitting Parlour // 镜阁' : 'Storybook Dressing Room · 试衣间'}
          </span>
        )}
        <h2 className={`text-3xl md:text-4xl ${activeArchetype.fontTitle} font-bold text-zinc-800 tracking-tight`}>
          {isMinimal
            ? (lang === 'zh' ? '搭配衣橱' : 'COORDINATES CLOSET')
            : (lang === 'zh' ? '成衣自由搭配' : 'Mix & Match Ready-to-Wear')}
        </h2>
        <p className={`text-sm ${activeArchetype.fontBody} text-zinc-400 mt-1 max-w-xl mx-auto`}>
          {isMinimal
            ? (lang === 'zh'
              ? '在我们的虚拟人台衣架上，自由挑选并搭配上装与下装。'
              : 'Select and combine ready-to-wear tops and bottoms on our architectural virtual mannequin hanger.')
            : (lang === 'zh'
              ? '我们的宽松成衣搭配完美适配 S 与 M 码。轻触为我们的梦幻精品衣架换上新装吧！'
              : 'Our loose-fitting ready-to-wear coordinates fit S & M flawlessly. Drag or tap to dress our magical boutique hanger!')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Wardrobe selection (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Select Tops */}
          <div className={`${
            isMinimal 
              ? 'bg-white border border-zinc-200 p-5 rounded-none' 
              : isVintage 
              ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 p-5 rounded-md' 
              : 'bg-white/95 storybook-border-sm p-5 storybook-shadow rounded-2xl'
          } space-y-3`}>
            <span className={`text-xs ${activeArchetype.fontTitle} italic ${activeTheme.accentText} font-medium block`}>
              Step 1: Choose a Top · 选择上装
            </span>
            <div className="flex flex-col gap-2.5">
              {mixMatchTops.map((top) => (
                <button
                  key={top.id}
                  onClick={() => setSelectedTopId(top.id)}
                  className={`flex items-center gap-3 p-3 text-left transition-all duration-300 cursor-pointer ${
                    isMinimal ? 'rounded-none' : isVintage ? 'rounded-sm' : 'rounded-xl'
                  } border ${
                    selectedTopId === top.id
                      ? isMinimal
                        ? 'border-zinc-900 bg-zinc-50'
                        : `${activeTheme.primaryBorder} ${activeTheme.softBg} shadow-sm`
                      : 'border-zinc-100 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {/* Miniature photo */}
                  <div className={`w-10 h-10 ${
                    isMinimal ? 'rounded-none border-zinc-200 bg-zinc-50' : 'rounded-lg border-[var(--theme-primary-soft)] bg-[var(--theme-scrollbar-bg)]'
                  } overflow-hidden border shrink-0`}>
                    {top.imageUrl ? (
                      <img src={top.imageUrl} alt={top.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <svg viewBox="0 0 100 100" fill="none" className={`w-full h-full p-2 ${activeTheme.primaryText}`}>
                        <path d={top.svgPath} fill="currentColor" opacity="0.8" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold text-zinc-800 leading-tight ${activeArchetype.fontTitle}`}>
                      {top.name}
                    </h4>
                    <p className={`text-[10px] text-zinc-400 mt-0.5 ${activeArchetype.fontBody}`}>
                      {top.cnName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Select Bottoms */}
          <div className={`${
            isMinimal 
              ? 'bg-white border border-zinc-200 p-5 rounded-none' 
              : isVintage 
              ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 p-5 rounded-md' 
              : 'bg-white/95 storybook-border-sm p-5 storybook-shadow rounded-2xl'
          } space-y-3`}>
            <span className={`text-xs ${activeArchetype.fontTitle} italic ${activeTheme.accentText} font-medium block`}>
              Step 2: Choose a Bottom · 选择下装
            </span>
            <div className="flex flex-col gap-2.5">
              {mixMatchBottoms.map((bottom) => (
                <button
                  key={bottom.id}
                  onClick={() => setSelectedBottomId(bottom.id)}
                  className={`flex items-center gap-3 p-3 text-left transition-all duration-300 cursor-pointer ${
                    isMinimal ? 'rounded-none' : isVintage ? 'rounded-sm' : 'rounded-xl'
                  } border ${
                    selectedBottomId === bottom.id
                      ? isMinimal
                        ? 'border-zinc-900 bg-zinc-50'
                        : `${activeTheme.primaryBorder} ${activeTheme.softBg} shadow-sm`
                      : 'border-zinc-100 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 ${
                    isMinimal ? 'rounded-none border-zinc-200 bg-zinc-50' : 'rounded-lg border-[var(--theme-primary-soft)] bg-[var(--theme-scrollbar-bg)]'
                  } overflow-hidden border shrink-0`}>
                    {bottom.imageUrl ? (
                      <img src={bottom.imageUrl} alt={bottom.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <svg viewBox="0 0 100 100" fill="none" className={`w-full h-full p-2 ${activeTheme.primaryText}`}>
                        <path d={bottom.svgPath} fill="currentColor" opacity="0.8" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold text-zinc-800 leading-tight ${activeArchetype.fontTitle}`}>
                      {bottom.name}
                    </h4>
                    <p className={`text-[10px] text-zinc-400 mt-0.5 ${activeArchetype.fontBody}`}>
                      {bottom.cnName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Choice */}
          <div className={`${
            isMinimal 
              ? 'bg-white border border-zinc-200 p-4 rounded-none' 
              : isVintage 
              ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 p-4 rounded-md' 
              : 'bg-white/95 storybook-border-sm p-4 storybook-shadow rounded-2xl'
          } flex items-center justify-between gap-4`}>
            <span className={`text-xs text-zinc-600 ${activeArchetype.fontBody}`}>
              {lang === 'zh' ? '选择尺码（两件通用）：' : 'Select Size for both:'}
            </span>
            <div className="flex gap-2">
              {(['S', 'M'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-10 h-8 font-semibold border transition-all duration-200 cursor-pointer ${
                    isMinimal ? 'rounded-none font-mono text-xs' : isVintage ? 'rounded-sm font-serif text-xs' : 'rounded-lg font-serif text-xs'
                  } ${
                    selectedSize === sz
                      ? isMinimal
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'border-[var(--theme-primary-soft)] bg-[color:var(--theme-scrollbar-thumb-hover)] text-white'
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-600'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Middle: Canvas Closet (4 cols) */}
        <div className={`lg:col-span-4 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px] ${
          isMinimal
            ? 'bg-zinc-50 border border-zinc-200 rounded-none'
            : isVintage
            ? 'bg-[#FAF6F0] border-2 border-double border-amber-900/15 rounded-md'
            : `bg-gradient-to-b from-[var(--theme-scrollbar-bg)] to-[var(--theme-primary-soft)]/20 storybook-border-sm storybook-shadow rounded-3xl`
        }`}>
          {/* Whimsical star sparkles - Only for storybook */}
          {!isMinimal && !isVintage && (
            <>
              <div className="absolute top-4 left-6 w-3 h-3 bg-yellow-400 rounded-full animate-star-float" style={{ animationDelay: '0.2s' }} />
              <div className={`absolute top-10 right-8 w-4 h-4 rounded-full animate-star-float`} style={{ animationDelay: '0.8s', backgroundColor: 'var(--theme-primary-soft)' }} />
              <div className="absolute bottom-12 left-8 w-3 h-3 bg-yellow-300 rounded-full animate-star-float" style={{ animationDelay: '2.1s' }} />
            </>
          )}

          {isMinimal && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:10px_10px]" />
          )}

          {/* Boutique Hanger Closet Display */}
          <div className="relative flex flex-col items-center justify-center w-full h-full max-w-[220px]">
            {/* The gold wire hanger */}
            <svg viewBox="0 0 100 30" fill="none" className="w-32 text-amber-500/80 drop-shadow-sm -mb-2 relative z-30">
              {/* Hook */}
              <path d="M 50,15 C 50,2 45,2 45,6 C 45,10 50,10 50,15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Triangle frame */}
              <path d="M 15,22 L 50,15 L 85,22 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>

            {/* Top garment photo */}
            <div className="relative z-20 w-40 h-52 rounded-2xl overflow-hidden ring-4 ring-white transition-all duration-500 transform hover:scale-105" style={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.1))' }}>
              {selectedTop.imageUrl ? (
                <img src={selectedTop.imageUrl} alt={selectedTop.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" style={{ color: selectedTop.color }}>
                  <path d={selectedTop.svgPath} fill="currentColor" />
                </svg>
              )}
            </div>

            {/* Bottom garment photo */}
            <div className="relative z-10 w-40 h-52 rounded-2xl overflow-hidden ring-4 ring-white -mt-6 transition-all duration-500 transform hover:scale-105" style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.12))' }}>
              {selectedBottom.imageUrl ? (
                <img src={selectedBottom.imageUrl} alt={selectedBottom.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" style={{ color: selectedBottom.color }}>
                  <path d={selectedBottom.svgPath} fill="currentColor" />
                </svg>
              )}
            </div>
          </div>

          {/* Dynamic Heart Burst Overlay */}
          {showHeartburst && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-40 transition-all duration-300">
              <span className="text-4xl animate-bounce">🎀✨</span>
              <span className={`text-sm ${activeArchetype.fontTitle} ${activeTheme.primaryText} font-bold mt-2`}>{lang === 'zh' ? '已加入购物袋！' : 'Ready-To-Wear Added!'}</span>
            </div>
          )}

          {/* Tiny label */}
          <span className="absolute bottom-3 text-[10px] font-mono tracking-widest text-zinc-400">
            {isMinimal
              ? (lang === 'zh' ? 'CAD_模块 // 高定_V1' : 'CAD_MODULE // ATELIER_V1')
              : (lang === 'zh' ? 'CIPPY_精品衣橱' : 'CIPPY_BOUTIQUE_CLOSER')}
          </span>
        </div>

        {/* Right: Editorial Review & Set Checkout (4 cols) */}
        <div className={`${
          isMinimal 
            ? 'bg-white border border-zinc-200 p-6 rounded-none' 
            : isVintage 
            ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 p-6 rounded-md' 
            : 'bg-white/95 storybook-border-sm p-6 storybook-shadow rounded-2xl'
        } flex flex-col justify-between`}>
          <div className="space-y-4">
            <div>
              <span className={`text-xs ${activeArchetype.fontBody} ${activeTheme.accentText} font-semibold tracking-wider uppercase block`}>
                Editorial Review · 搭配美学
              </span>
              <h3 className={`text-xl ${activeArchetype.fontTitle} text-zinc-800 tracking-tight mt-1 font-bold`}>
                {combinationReview.title}
              </h3>
              <h4 className={`text-sm ${activeArchetype.fontTitle} ${activeTheme.primaryText} font-medium`}>
                {combinationReview.cnTitle}
              </h4>
            </div>

            <div className={`space-y-3 pt-2 text-xs md:text-sm text-zinc-600 leading-relaxed ${activeArchetype.fontBody}`}>
              <p className="text-justify font-sans">{combinationReview.verdict}</p>
              <p className={`p-3 border text-zinc-500 leading-relaxed text-justify ${
                isMinimal 
                  ? 'bg-zinc-50 border-zinc-200 rounded-none' 
                  : isVintage 
                  ? 'bg-[#FAF6F0] border-amber-900/10 rounded-sm' 
                  : 'border-[var(--theme-primary-soft)]/50 rounded-lg'
              }`} style={!isMinimal && !isVintage ? { backgroundColor: 'var(--theme-scrollbar-bg)' } : undefined}>
                {combinationReview.cnVerdict}
              </p>
            </div>

            {/* Included products breakdown */}
            <div className={`border-t ${isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/40'} pt-3 space-y-2`}>
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase block">
                Set Components / 成衣明细
              </span>
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-600 truncate max-w-[180px]">
                  👚 {topProduct?.name}
                </span>
                <span className="font-mono text-zinc-500 font-medium">RM {topProduct?.price}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-zinc-600 truncate max-w-[180px]">
                  👖 {bottomProduct?.name}
                </span>
                <span className="font-mono text-zinc-500 font-medium">RM {bottomProduct?.price}</span>
              </div>
            </div>
          </div>

          <div className={`mt-8 pt-4 border-t ${isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/40'} space-y-4`}>
            {/* Price section */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                  Set Special Price
                </span>
                <span className={`text-xs text-zinc-500 ${activeArchetype.fontTitle} italic`}>成衣整套价</span>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-mono font-bold ${activeTheme.primaryText}`}>
                  RM {totalCost}
                </span>
                <span className="text-[10px] font-sans text-zinc-400 block">
                  {lang === 'zh' ? `尺码 ${selectedSize} · 大马境内免运费` : `Size ${selectedSize} · Free Delivery within Malaysia`}
                </span>
              </div>
            </div>

            {/* Purchase whole ready-to-wear set */}
            <button
              onClick={handleAddSetToBag}
              className={`w-full py-3 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                isMinimal 
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-white rounded-none font-mono tracking-widest uppercase text-xs' 
                  : isVintage 
                  ? 'bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-sm font-serif italic text-xs border border-amber-900' 
                  : `${activeTheme.primaryBg} ${activeTheme.primaryHover} text-white font-sans font-semibold text-xs rounded-xl shadow-sm ${activeTheme.btnShadow}`
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> {lang === 'zh' ? '加入整套成衣' : 'Add Ready-to-Wear Set'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
