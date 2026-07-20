import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingBag, BookOpen, Star, Sparkles, Check, ChevronDown, ChevronUp, GitCompare, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddProductToCart: (product: Product, size: 'S' | 'M') => void;
  onViewProduct?: (product: Product) => void;
  activeTheme?: any;
  activeArchetype?: any;
  lang?: 'en' | 'zh';
  onToggleCompare?: (product: Product) => void;
  isComparing?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
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

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddProductToCart, 
  onViewProduct,
  activeTheme: activeThemeProp,
  activeArchetype: activeArchetypeProp,
  lang = 'en',
  onToggleCompare,
  isComparing = false,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const activeTheme = activeThemeProp || pinkFallback;
  const activeArchetype = activeArchetypeProp || defaultArchetype;

  const handleCardClick = () => {
    if (onViewProduct) {
      onViewProduct(product);
    }
  };
  
  const [selectedSize, setSelectedSize] = useState<'S' | 'M'>('S');
  const [showStory, setShowStory] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Pulse when item is added to wishlist
  React.useEffect(() => {
    if (isWishlisted) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isWishlisted]);

  const handleAdd = () => {
    onAddProductToCart(product, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  const isMinimal = activeArchetype.id === 'minimalist';
  const isVintage = activeArchetype.id === 'vintage';

  // Determine dynamic badge based on stock and series
  let badgeText = '';
  let badgeCnText = '';
  let badgeStyle = '';

  const isSoldOut = product.stock === 0 || product.inStock === false;
  const isLowStock = !isSoldOut && product.stock !== undefined && product.stock > 0 && product.stock <= 2;
  const isNewArrival = !isSoldOut && !isLowStock && (product.series === "Cippy Sweet" || product.series === "Cippy Summer");

  if (isSoldOut) {
    badgeText = 'Sold Out';
    badgeCnText = '已售罄';
    if (isMinimal) {
      badgeStyle = 'bg-zinc-100 text-zinc-400 border-zinc-200 uppercase font-mono tracking-wider text-[9px] px-2 py-0.5 rounded-none';
    } else if (isVintage) {
      badgeStyle = 'bg-stone-100/95 text-stone-500/80 border-stone-200 font-serif italic text-[10px] px-2 py-0.5 rounded-sm';
    } else {
      badgeStyle = 'bg-zinc-100/95 text-zinc-400 border-zinc-200/50 font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-full';
    }
  } else if (isLowStock) {
    badgeText = product.stock === 1 ? 'Only 1 Left' : 'Low Stock';
    badgeCnText = product.stock === 1 ? '仅剩 1 件' : '仅余极少';
    if (isMinimal) {
      badgeStyle = 'bg-orange-50 text-orange-700 border-orange-200 uppercase font-mono tracking-wider text-[9px] px-2 py-0.5 rounded-none';
    } else if (isVintage) {
      badgeStyle = 'bg-amber-50/95 text-amber-900/90 border-amber-900/15 font-serif italic text-[10px] px-2 py-0.5 rounded-sm';
    } else {
      badgeStyle = 'bg-rose-50/95 text-rose-600 border-rose-100 font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-full';
    }
  } else if (isNewArrival) {
    badgeText = 'New Arrival';
    badgeCnText = '新品上架';
    if (isMinimal) {
      badgeStyle = 'bg-zinc-900 text-white border-zinc-900 uppercase font-mono tracking-wider text-[9px] px-2 py-0.5 rounded-none';
    } else if (isVintage) {
      badgeStyle = 'bg-[#FAF6EC] text-amber-800 border-amber-900/10 font-serif italic text-[10px] px-2 py-0.5 rounded-sm';
    } else {
      badgeStyle = 'bg-sky-50/95 text-sky-600 border-sky-100 font-sans font-semibold text-[10px] px-2.5 py-0.5 rounded-full';
    }
  }

  const badgeMarkup = badgeText ? (
    <div className={`absolute top-13 right-3 z-10 flex items-center justify-center border shadow-2xs transition-all duration-300 group-hover:scale-105 ${badgeStyle}`}>
      <span className="leading-none">{lang === 'zh' ? badgeCnText : badgeText}</span>
    </div>
  ) : null;

  return (
    <div
      className={`flex flex-col justify-between overflow-hidden relative group h-full ${activeArchetype.cardStyle}`}
      id={`product-card-${product.id}`}
    >
      {/* Decorative Brand Star in corners - Only for storybook & vintage */}
      {!isMinimal && (
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <Sparkles className={`w-4 h-4 ${isVintage ? 'text-amber-800/40' : 'text-yellow-400'} animate-star-float`} />
        </div>
      )}

      {/* Main image container / Vector representation */}
      <div 
        onClick={handleCardClick}
        className={`h-72 bg-gradient-to-b ${product.bgGradient} flex items-center justify-center relative p-4 border-b overflow-hidden cursor-pointer ${
          isMinimal ? 'border-zinc-200' : isVintage ? 'border-amber-900/10' : 'border-[var(--theme-primary-soft)]/50'
        }`}
      >
        {badgeMarkup}

        {/* Floating Heart Icon Overlay with pulse animation on save */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          animate={isPulsing ? { scale: [1, 1.45, 0.85, 1.15, 1] } : { scale: 1 }}
          transition={isPulsing ? { duration: 0.5, ease: "easeInOut" } : { duration: 0.2 }}
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleWishlist) {
              onToggleWishlist(product);
            }
          }}
          className={`absolute top-3 right-3 z-30 p-2 rounded-full backdrop-blur-md shadow-sm border transition-all duration-300 flex items-center justify-center cursor-pointer ${
            isWishlisted
              ? 'bg-[#FFF0F2] border-pink-200 text-[#B96A73]'
              : 'bg-white/90 hover:bg-white border-zinc-200/60 text-zinc-400 hover:text-[#B96A73]'
          }`}
          title={isWishlisted ? (lang === 'zh' ? '从收藏夹移除' : 'Remove from Saves') : (lang === 'zh' ? '加入收藏夹' : 'Save to Wishlist')}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#B96A73]' : ''}`} />
        </motion.button>

        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            className={`absolute top-3 left-3 z-25 px-2.5 py-1 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm flex items-center justify-center gap-1 border font-sans text-[10px] font-bold ${
              isComparing 
                ? 'bg-[#B96A73] text-white border-[#B96A73]' 
                : 'bg-white/90 hover:bg-white text-zinc-600 hover:text-[#B96A73] border-zinc-200/60 hover:scale-105'
            }`}
            title={lang === 'zh' ? '加入对比' : 'Add to Compare'}
          >
            <GitCompare className={`w-3 h-3 ${isComparing ? 'animate-pulse' : ''}`} />
            <span>
              {isComparing 
                ? (lang === 'zh' ? '已加入对比' : 'Comparing') 
                : (lang === 'zh' ? '加入对比' : 'Compare')}
            </span>
          </button>
        )}
        {product.imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-750 transform ${
                isMinimal ? 'group-hover:scale-102' : 'group-hover:scale-108 group-hover:rotate-1'
              }`}
            />
            {/* Elegant overlay gradient to make cards feel soft and blended */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
          </div>
        ) : (
          /* Large vector silhouette fallback */
          <div className={`transition-all duration-500 transform ${
            isMinimal ? 'group-hover:scale-102' : 'group-hover:scale-105 group-hover:rotate-1'
          } relative z-10 w-full h-full flex items-center justify-center`}>
            {product.svgPath && (
              <svg
                viewBox="0 0 100 100"
                fill="none"
                className="w-40 h-40 filter drop-shadow-md"
                style={{ color: product.color }}
              >
                <path d={product.svgPath} fill="currentColor" />
                {/* Fine stitch detail overlay */}
                <path
                  d={product.svgPath}
                  stroke="#FFF"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                  strokeOpacity="0.85"
                />
              </svg>
            )}
          </div>
        )}

        {/* Brand category badge */}
        <span className={`absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[9px] uppercase border font-medium transition-opacity duration-200 group-hover:opacity-0 ${
          isMinimal 
            ? 'border-zinc-300 font-mono text-zinc-600 rounded-none' 
            : isVintage 
            ? 'border-amber-900/20 font-serif text-amber-900/80 italic rounded-md' 
            : 'border-[var(--theme-primary-soft)]/60 font-mono text-zinc-500 rounded-full'
        }`}>
          {product.category}
        </span>

        {/* 'Quick Add' Button Overlay (Slides up on hover) */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-15 flex flex-col gap-2.5 border-t border-[#FBEBF0]/85 shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] tracking-wider font-bold text-zinc-400 uppercase ${activeArchetype.fontBody}`}>
              Quick Add / 快速加入
            </span>
            <div className="flex gap-1.5">
              {(['S', 'M'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`w-7 h-6 font-semibold border text-[10px] transition-all duration-200 cursor-pointer rounded-md ${
                    selectedSize === sz
                      ? `border-[var(--theme-primary-soft)] ${activeTheme.softBg} ${activeTheme.primaryText}`
                      : `border-zinc-200 text-zinc-400 hover:border-[var(--theme-primary-soft)] hover:${activeTheme.primaryText}`
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAdd();
            }}
            className={`w-full py-2 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isMinimal ? 'rounded-none font-mono tracking-widest uppercase' : isVintage ? 'rounded-sm font-serif italic' : 'rounded-xl font-sans'
            } ${
              addedAnimation
                ? 'bg-emerald-500 text-white shadow-emerald-100'
                : isMinimal
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : `${activeTheme.primaryBg} ${activeTheme.primaryHover} text-white hover:shadow-md ${activeTheme.btnShadow}`
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added! 包裹装好啦
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" /> Add Size {selectedSize} · RM {product.price}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        
        {/* Title, Chinese subtitle and Price */}
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 
              onClick={handleCardClick}
              className={`cursor-pointer ${activeArchetype.fontTitle} font-bold text-zinc-800 text-sm md:text-base leading-snug tracking-tight group-hover:${activeTheme.primaryText} transition-colors duration-200`}
            >
              {product.name}
            </h3>
            <span className={`font-mono text-base font-bold ${activeTheme.primaryText} shrink-0`}>
              RM {product.price}
            </span>
          </div>
          <h4 className={`${activeArchetype.fontTitle} text-xs ${activeTheme.accentText} font-medium leading-none`}>
            {product.cnName}
          </h4>
        </div>

        {/* Short description */}
        <p className={`text-xs text-zinc-500 leading-relaxed text-justify line-clamp-2 ${activeArchetype.fontBody}`}>
          {product.description}
        </p>

        {/* Interactive size and action buttons */}
        <div className={`space-y-2 pt-1 border-t ${isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/30'}`}>
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-zinc-400">Available S&M sizes:</span>
            <div className="flex gap-1.5">
              {(['S', 'M'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-8 h-6.5 font-semibold border transition-all duration-200 cursor-pointer ${
                    isMinimal ? 'rounded-none font-mono text-[11px]' : isVintage ? 'rounded-xs font-serif text-[10px]' : 'rounded-md font-serif text-[10px]'
                  } ${
                    selectedSize === sz
                      ? isMinimal
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : `border-[var(--theme-primary-soft)] ${activeTheme.softBg} ${activeTheme.primaryText}`
                      : `border-zinc-200 text-zinc-400 hover:border-[var(--theme-primary-soft)] hover:${activeTheme.primaryText}`
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Storybook / Design Legend expansion */}
        <div className={`border-t ${isMinimal ? 'border-zinc-100' : 'border-[var(--theme-primary-soft)]/20'} pt-2`}>
          <button
            onClick={() => setShowStory(!showStory)}
            className={`flex items-center justify-between w-full text-left text-[11px] ${activeTheme.accentText} hover:${activeTheme.primaryText} font-medium transition-colors cursor-pointer ${activeArchetype.fontBody}`}
          >
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> 
              {isMinimal ? 'Design Spec Log // 设色初见' : isVintage ? 'Atelier Storybook Anthology // 精灵溯源' : 'Read Storybook Legend · 童话起源'}
            </span>
            {showStory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showStory && (
            <div className={`mt-2 p-3 space-y-2 animate-gentle-bounce ${
              isMinimal 
                ? 'bg-zinc-50 border border-zinc-200 rounded-none' 
                : isVintage 
                ? 'bg-[#FDFBF7] border border-amber-900/10 rounded-sm' 
                : 'rounded-xl border border-[var(--theme-primary-soft)]/50'
            }`} style={!isMinimal && !isVintage ? { backgroundColor: 'var(--theme-scrollbar-bg)' } : undefined}>
              <p className={`text-[11px] italic text-zinc-600 leading-relaxed text-justify ${activeArchetype.fontTitle}`}>
                "{product.story}"
              </p>
              <p className={`text-[10px] text-zinc-500 leading-relaxed text-justify border-t pt-1.5 ${
                isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/30'
              }`}>
                {product.cnStory}
              </p>
              
              {/* Bullets details */}
              <div className={`border-t pt-2 space-y-1 ${isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/30'}`}>
                <span className="text-[9px] font-mono tracking-widest text-zinc-400 block uppercase">
                  Details / 成衣特征
                </span>
                <ul className="list-disc list-inside text-[9px] text-zinc-500 space-y-0.5">
                  {product.cnDetails.slice(0, 3).map((det, idx) => (
                    <li key={idx} className="truncate">{det}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick purchase button */}
        <div className="pt-1.5">
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isMinimal ? 'rounded-none font-mono tracking-widest uppercase' : isVintage ? 'rounded-sm font-serif italic' : 'rounded-xl font-sans'
            } ${
              addedAnimation
                ? 'bg-emerald-500 text-white shadow-emerald-100'
                : isMinimal
                ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                : `${activeTheme.primaryBg} ${activeTheme.primaryHover} text-white hover:shadow-md ${activeTheme.btnShadow}`
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" /> Added to Bag! 包裹装好啦
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add Ready-to-Wear
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductCard;
