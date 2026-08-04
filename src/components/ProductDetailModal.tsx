import React, { useState } from 'react';
import { Product } from '../types';
import { X, ShoppingBag, Heart, Check, Sparkles, Scale, BookOpen, AlertCircle } from 'lucide-react';
import { getPriceTier } from '../lib/priceTier';

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddProductToCart: (product: Product, size: 'S' | 'M') => void;
  lang: 'en' | 'zh';
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

// product.sizes may be plain strings (['S','M']) or, for color-variant products set up in the
// admin product manager, per-color/size stock entries like {size, color, stock}.
function isColorSizeEntry(sizes: unknown): sizes is { size: string; color: string; stock?: number }[] {
  return Array.isArray(sizes) && sizes.length > 0 && typeof sizes[0] === 'object' && sizes[0] !== null && 'color' in (sizes[0] as object);
}

// Unique color names configured for this product in the admin panel (empty if none = no color choice needed)
function getColorOptions(sizes: unknown): string[] {
  if (!isColorSizeEntry(sizes)) return [];
  return Array.from(new Set(sizes.map(s => s.color).filter(Boolean)));
}

// Sizes available for the given color (or all sizes if no color selected yet / not a color product)
function getSizesForColor(sizes: unknown, color: string | null): ('S' | 'M')[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return ['S', 'M'];
  if (!isColorSizeEntry(sizes)) {
    const labels = Array.from(new Set(sizes.filter((s: any) => typeof s === 'string'))) as ('S' | 'M')[];
    return labels.length > 0 ? labels : ['S', 'M'];
  }
  const filtered = color ? sizes.filter(s => s.color === color) : sizes;
  const labels = Array.from(new Set(filtered.map(s => s.size).filter(Boolean))) as ('S' | 'M')[];
  return labels.length > 0 ? labels : ['S', 'M'];
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddProductToCart,
  lang,
  isWishlisted,
  onToggleWishlist
}: ProductDetailModalProps) {
  const colorOptions = getColorOptions(product.sizes);
  const isColorProduct = colorOptions.length > 0;
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const availableSizes = getSizesForColor(product.sizes, selectedColor);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | null>(availableSizes.length === 1 ? availableSizes[0] : null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectionRequiredHint, setSelectionRequiredHint] = useState<string | null>(null);

  // Auto-pick the size when a color leaves only one option; clear it if it's no longer valid
  React.useEffect(() => {
    if (availableSizes.length === 1) {
      setSelectedSize(availableSizes[0]);
    } else if (selectedSize && !availableSizes.includes(selectedSize)) {
      setSelectedSize(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  // Sizing Fairy Calculator State
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [calcResult, setCalcResult] = useState<{
    size: 'S' | 'M';
    fitEn: string;
    fitZh: string;
  } | null>(null);

  if (!isOpen) return null;

  // Compile all images (primary image + extra images)
  const allImages = [
    product.imageUrl,
    ...(product.images || []),
    ...(product.detailImages || [])
  ].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSelectionRequiredHint(tx('Please select a size', '请先选择尺码'));
      setTimeout(() => setSelectionRequiredHint(null), 1500);
      return;
    }
    if (isColorProduct && !selectedColor) {
      setSelectionRequiredHint(tx('Please select a color', '请先选择颜色'));
      setTimeout(() => setSelectionRequiredHint(null), 1500);
      return;
    }
    let finalProduct = product;
    if (isColorProduct && selectedColor) {
      const slug = selectedColor.toLowerCase().replace(/\s+/g, '-');
      finalProduct = {
        ...product,
        id: `${product.id}-${slug}`,
        baseProductId: product.baseProductId || product.id,
        name: `${product.name} - ${selectedColor}`,
        cnName: `${product.cnName} - ${selectedColor}`,
        imageUrl: product.color_images?.[selectedColor] || product.imageUrl,
      };
    }
    onAddProductToCart(finalProduct, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return;

    // Premium Korean drape-fit calculation logic
    // Small (S) is recommended for smaller frames, Medium (M) is recommended for standard frames
    let recommendedSize: 'S' | 'M' = 'S';
    let fitEn = "";
    let fitZh = "";

    if (h > 163 || w > 52) {
      recommendedSize = 'M';
      fitEn = "The Medium size will give you that beautiful, airy Korean loose fit. Sizing Fairy notes excellent drop-shoulder draping with absolute comfort.";
      fitZh = "仙子推荐 M 码。高挑或丰满身形穿上能呈现极其松弛、干净的落肩线条，兼顾舒适垂顺感与温柔气质。";
    } else {
      recommendedSize = 'S';
      fitEn = "The Small size is calibrated for a perfect petite Korean silhouette. Sizing Fairy notes elegant body proportions without overwhelming your delicate frame.";
      fitZh = "仙子推荐 S 码。专为精致小个子研发的版型，比例更显纤长，让‘宽松大廓形’完美贴合身形而不累赘。";
    }

    setCalcResult({
      size: recommendedSize,
      fitEn,
      fitZh
    });
  };

  const tx = (en: string, zh: string) => (lang === 'zh' ? zh : en);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-zinc-950/40 backdrop-blur-md">
      {/* Background click overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-[#FFFDFC] rounded-[24px] shadow-2xl border border-pink-100 overflow-hidden flex flex-col md:flex-row z-10 animate-fade-in max-h-[92vh] md:max-h-[85vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/85 hover:bg-white border border-pink-100 text-zinc-500 hover:text-zinc-800 transition-colors shadow-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Images Gallery */}
        <div className="w-full md:w-1/2 bg-[#FFF9FA]/40 p-4 sm:p-6 flex flex-col justify-between border-r border-pink-50 max-h-[45vh] md:max-h-full overflow-y-auto">
          <div className="space-y-4">
            {/* Primary Image Viewer */}
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-pink-50/20 to-pink-100/30 border border-pink-100/40 relative flex items-center justify-center">
              {allImages.length > 0 ? (
                <img
                  src={allImages[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover animate-fade-in"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-4xl text-pink-300">🎀</div>
              )}
              
              {product.series && (
                <span className="absolute top-4 left-4 bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-mono tracking-widest text-[#B96A73] uppercase font-bold border border-pink-100">
                  {product.series}
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-18 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-[#B96A73] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* OOTD Note */}
          <div className="hidden md:flex items-start gap-2.5 bg-[#FFF0F2]/40 rounded-xl p-3 border border-pink-100/30 text-[10px] text-zinc-500 leading-relaxed mt-4">
            <Sparkles className="w-4 h-4 text-[#B96A73] shrink-0" />
            <div>
              <strong>{tx("Cippy Studio Styling Note:", "Cippy 首尔美学穿搭建议：")}</strong>
              {" "}{tx(
                "This loose silhouette is cut to layer elegantly. Pair S with high-waisted folds to maximize your vertical proportions.",
                "此款松弛感成衣专为黄金比例叠穿而生。S 码建议搭配高腰长裤或蛋糕短裙，极佳拉长下半身比例，干净清爽。"
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Details & Interaction */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[47vh] md:max-h-full space-y-6">
          <div className="space-y-5">
            {/* Title Block */}
            <div className="space-y-1.5 border-b border-pink-100/50 pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B96A73]">
                  {getPriceTier(product.price).emoji} {getPriceTier(product.price).en}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  RM {product.price}.00
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-zinc-800 leading-snug tracking-tight">
                {product.name}
              </h1>
              <span className="font-serif text-xs font-semibold text-[#B96A73] block">
                {product.cnName}
              </span>
            </div>

            {/* Design Chronicles (Fairytale Story) */}
            <div className="bg-[#FFF9FB] p-4 rounded-xl border border-pink-100/40 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#B96A73] font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{tx("Style Chronicles", "故事编织")}</span>
              </div>
              <p className="text-xs text-zinc-600 font-serif italic leading-relaxed text-justify">
                "{tx(product.story, product.cnStory)}"
              </p>
            </div>

            {/* Specification Checklist */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-zinc-600 font-sans border-b border-pink-100/30 pb-4">
              <div>
                <span className="text-zinc-400 font-mono">{tx("FABRIC / 面料:", "面料:")}</span>
                <strong className="text-zinc-700 ml-1">{product.fabric || tx("Linen Cotton", "高级棉麻混纺")}</strong>
              </div>
              <div>
                <span className="text-zinc-400 font-mono">{tx("FIT / 版型:", "版型:")}</span>
                <strong className="text-zinc-700 ml-1">{tx("Korean Loose Fit", "韩系落肩宽松")}</strong>
              </div>
              <div>
                <span className="text-zinc-400 font-mono">{tx("CARE / 洗涤:", "洗涤:")}</span>
                <strong className="text-zinc-700 ml-1">{tx("Hand Wash Cold", "冷水轻柔手洗")}</strong>
              </div>
              <div>
                <span className="text-zinc-400 font-mono">{tx("STOCK / 状态:", "状态:")}</span>
                <strong className={`ml-1 ${(product.stock || 0) > 0 ? 'text-emerald-600' : 'text-zinc-400'}`}>
                  {(product.stock || 0) > 0 ? tx("In Stock (S, M)", "少量现货") : tx("Pre-order", "预定款")}
                </strong>
              </div>
            </div>

            {/* Interactive Sizing Fairy Calculator */}
            <div className="bg-[#FFFDFC] rounded-xl p-4 border border-pink-100/50 space-y-3 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                <Scale className="w-4 h-4 text-[#B96A73]" />
                <span>{tx("Sizing Fairy Calculator", "尺码精灵助选")}</span>
              </div>
              
              <form onSubmit={handleCalculateSize} className="flex gap-2.5">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder={tx("Height / 身高 (cm)", "身高 (cm)")}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full text-xs font-sans border border-pink-100 rounded-lg px-2.5 py-1.5 bg-[#FFFDFE] focus:outline-none focus:border-pink-300"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder={tx("Weight / 体重 (kg)", "体重 (kg)")}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-xs font-sans border border-pink-100 rounded-lg px-2.5 py-1.5 bg-[#FFFDFE] focus:outline-none focus:border-pink-300"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#B96A73] hover:bg-[#a55962] text-white font-sans font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {tx("Calc", "计算")}
                </button>
              </form>

              {calcResult && (
                <div className="bg-pink-50/30 p-3 rounded-lg border border-pink-100/30 text-[11px] leading-relaxed text-zinc-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                      {tx("Recommended Size:", "仙子推荐尺码:")}{" "}
                      <strong className="text-sm font-serif text-[#B96A73]">{calcResult.size}</strong>
                    </span>
                  </div>
                  <p>{tx(calcResult.fitEn, calcResult.fitZh)}</p>
                </div>
              )}
            </div>

            {/* Colors selector (if applicable) */}
            {isColorProduct && (
              <div className="flex items-center justify-between text-xs font-sans pt-2 border-t border-pink-100/30 gap-2">
                <span className="text-zinc-500 font-medium shrink-0">{tx("Choose Color / 颜色:", "选择颜色:")}</span>
                <div className="flex gap-2 flex-wrap justify-end">
                  {colorOptions.map((col) => {
                    const swatchImg = product.color_images?.[col];
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        title={col}
                        className={`relative rounded-full border-2 transition-all cursor-pointer overflow-hidden flex items-center justify-center ${
                          selectedColor === col ? 'border-[#B96A73]' : 'border-zinc-200'
                        } ${swatchImg ? 'w-7 h-7' : 'px-2.5 h-7 text-[10px] font-semibold whitespace-nowrap ' + (selectedColor === col ? 'text-[#B96A73] bg-[#FFF0F2]' : 'text-zinc-600')}`}
                      >
                        {swatchImg ? (
                          <>
                            <img src={swatchImg} alt={col} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {selectedColor === col && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Check className="w-3.5 h-3.5 text-white" />
                              </span>
                            )}
                          </>
                        ) : col}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes selector */}
            <div className="flex items-center justify-between text-xs font-sans pt-2">
              <span className="text-zinc-500 font-medium">{tx("Choose your drape size / 尺码:", "选择尺码:")}</span>
              <div className="flex gap-2">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-10 h-8 rounded-lg font-serif font-bold border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'border-[#B96A73] bg-[#FFF0F2] text-[#B96A73] shadow-inner'
                        : 'border-zinc-200 text-zinc-400 hover:border-pink-200 hover:text-zinc-700'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons (Add to cart & Save to wishlist) */}
          <div className="pt-4 border-t border-pink-100/40 flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 text-xs font-bold font-sans transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-xs cursor-pointer ${
                addedToCart
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-100'
                  : selectionRequiredHint
                  ? 'bg-red-400 text-white'
                  : 'bg-[#B96A73] hover:bg-[#a55962] text-white hover:shadow-md'
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="w-4 h-4" /> {tx("Added to bag!", "包裹已打结装箱！")}
                </>
              ) : selectionRequiredHint ? (
                <>{selectionRequiredHint}</>
              ) : selectedSize ? (
                <>
                  <ShoppingBag className="w-4 h-4" /> {tx(`Add Ready-to-Wear (${selectedSize})`, `加入购物车 (${selectedSize})`)}
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> {tx("Select Options to Continue", "请选择尺码/颜色")}
                </>
              )}
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`px-3 py-3 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isWishlisted
                  ? 'border-pink-300 bg-pink-50 text-pink-500'
                  : 'border-zinc-200 hover:border-pink-200 text-zinc-400 hover:text-pink-500'
              }`}
              title={tx("Add to Saves", "加入我的收藏")}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-pink-500' : ''}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
