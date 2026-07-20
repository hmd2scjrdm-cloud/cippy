import React, { useState } from 'react';
import { SizeRecommendation } from '../types';
import { Sparkles, HelpCircle, Ruler, Scale } from 'lucide-react';

interface SizingHelperProps {
  activeTheme?: any;
  activeArchetype?: any;
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

export default function SizingHelper({ activeTheme: activeThemeProp, activeArchetype: activeArchetypeProp }: SizingHelperProps) {
  const activeTheme = activeThemeProp || pinkFallback;
  const activeArchetype = activeArchetypeProp || defaultArchetype;

  const [height, setHeight] = useState<number>(160);
  const [weight, setWeight] = useState<number>(50);
  const [shoulder, setShoulder] = useState<number>(37);
  const [chest, setChest] = useState<number>(84);

  const isMinimal = activeArchetype.id === 'minimalist';
  const isVintage = activeArchetype.id === 'vintage';

  // Simple, elegant, high-end size recommendation logic for Korean loose-fitting clothes
  const getRecommendation = (h: number, w: number, s: number, c: number): SizeRecommendation => {
    let rec: 'S' | 'M' = 'S';
    let fitDescription = "";
    let cnFitDescription = "";

    if (h >= 164 || w >= 56 || s >= 39 || c >= 88) {
      rec = 'M';
    } else {
      rec = 'S';
    }

    if (rec === 'S') {
      fitDescription = `We recommend size S for your measurements. On your frame, our loose-fitting garments will drape beautifully with a perfect oversized feel—relaxed shoulders, a comfortable chest room, and a lovely flowing hemline that won't overwhelm your height.`;
      cnFitDescription = `针对您的身形，我们强烈推荐【S码（小码）】。在您的身材比例上，我们的宽松版型能够呈现出完美的韩系慵懒度——恰到好处的落肩幅度、舒适优雅的胸围放量，以及灵动飘逸的裙摆，绝不会压低身高，尽显娇美温婉。`;
    } else {
      fitDescription = `We recommend size M for your measurements. This will ensure the drop-shoulder seams sit perfectly and the sleeve/hem lengths are calibrated to give you that authentic premium loose silhouette without feeling tight or too short.`;
      cnFitDescription = `针对您的身形，我们推荐选择【M码（中码）】。这能保证宽松衣物的落肩车线垂落在最理想的臂侧，袖长与裙摆长度也经过精确调校，为您完美还原高档韩系大廓形的松弛气场，自在轻盈。`;
    }

    return {
      height: h,
      weight: w,
      shoulderWidth: s,
      chestCircumference: c,
      recommendedSize: rec,
      fitDescription,
      cnFitDescription
    };
  };

  const result = getRecommendation(height, weight, shoulder, chest);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4" id="sizing-fairy">
      <div className="text-center mb-8">
        {!isMinimal && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${activeTheme.softBg} ${activeTheme.primaryText} ${
            isVintage ? 'rounded-md' : 'rounded-full'
          } text-xs tracking-widest font-sans font-medium uppercase mb-2`}>
            <Sparkles className={`w-3.5 h-3.5 ${activeTheme.starFill}`} /> 
            {isVintage ? 'Atelier Sizing Scroll // 骨相度量' : 'Sizing Fairy · 尺码精灵'}
          </span>
        )}
        <h2 className={`text-3xl ${activeArchetype.fontTitle} font-bold text-zinc-800 tracking-tight`}>
          {isMinimal ? 'PROPORTION CALCULATOR' : 'Find Your Perfect Loose Fit'}
        </h2>
        <p className={`text-sm ${activeArchetype.fontBody} text-zinc-400 mt-1 max-w-lg mx-auto`}>
          We focus exclusively on S & M sizes to ensure the ultimate elegant drape. Tell the fairy your metrics!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Left: Input sliders (7 cols) */}
        <div className={`${
          isMinimal 
            ? 'bg-white border border-zinc-200 p-6 md:p-8 rounded-none' 
            : isVintage 
            ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 p-6 md:p-8 rounded-md' 
            : 'bg-white/95 storybook-border-sm p-6 md:p-8 rounded-2xl storybook-shadow'
        } md:col-span-7 space-y-6`}>
          <h3 className={`font-bold text-lg text-zinc-800 border-b ${
            isMinimal ? 'border-zinc-200' : isVintage ? 'border-amber-900/10' : 'border-pink-100/50'
          } pb-2 flex items-center gap-2 ${activeArchetype.fontTitle}`}>
            <Ruler className={`w-4 h-4 ${activeTheme.accentText}`} /> Your Proportions · 身形比例
          </h3>

          {/* Height slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-zinc-600 flex items-center gap-1">身高 Height</span>
              <span className={`font-semibold ${activeTheme.primaryText}`}>{height} cm</span>
            </div>
            <input
              type="range"
              min="145"
              max="178"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                isMinimal ? 'bg-zinc-200 accent-zinc-800' : `${activeTheme.softBg} accent-[var(--theme-primary-soft)]`
              }`}
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>145 cm</span>
              <span>160 cm</span>
              <span>178 cm</span>
            </div>
          </div>

          {/* Weight slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-zinc-600 flex items-center gap-1">体重 Weight</span>
              <span className={`font-semibold ${activeTheme.primaryText}`}>{weight} kg</span>
            </div>
            <input
              type="range"
              min="38"
              max="75"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
                isMinimal ? 'bg-zinc-200 accent-zinc-800' : `${activeTheme.softBg} accent-[var(--theme-primary-soft)]`
              }`}
            />
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>38 kg</span>
              <span>55 kg</span>
              <span>75 kg</span>
            </div>
          </div>

          {/* Secondary fields side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-sans text-zinc-500">
                肩宽 Shoulder (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="32"
                  max="45"
                  value={shoulder}
                  onChange={(e) => setShoulder(Math.max(32, Math.min(45, Number(e.target.value))))}
                  className={`w-full text-sm font-sans px-3 py-2 text-zinc-700 focus:outline-none focus:border-zinc-500 border ${
                    isMinimal ? 'border-zinc-200 rounded-none bg-zinc-50/20' : `bg-[var(--theme-scrollbar-bg)]/20 ${activeTheme.primaryBorderSoft} rounded-xl`
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-400">CM</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-sans text-zinc-500">
                胸围 Chest (cm)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="75"
                  max="105"
                  value={chest}
                  onChange={(e) => setChest(Math.max(75, Math.min(105, Number(e.target.value))))}
                  className={`w-full text-sm font-sans px-3 py-2 text-zinc-700 focus:outline-none focus:border-zinc-500 border ${
                    isMinimal ? 'border-zinc-200 rounded-none bg-zinc-50/20' : `bg-[var(--theme-scrollbar-bg)]/20 ${activeTheme.primaryBorderSoft} rounded-xl`
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono text-zinc-400">CM</span>
              </div>
            </div>
          </div>

          {/* Explanation on S-M specification */}
          <div className={`p-3 border flex items-start gap-2.5 ${
            isMinimal 
              ? 'bg-zinc-50 border-zinc-200 rounded-none' 
              : isVintage 
              ? 'bg-[#FAF6F0] border-amber-900/10 rounded-sm' 
              : 'bg-pink-50/30 border-pink-100/50 rounded-xl'
          }`}>
            <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${activeTheme.accentText}`} />
            <p className={`text-[11px] text-zinc-500 leading-relaxed ${activeArchetype.fontBody}`}>
              <strong>S & M Specifics:</strong> Because our Korean ready-to-wear is designed naturally loose and oversized, standard parameters don't apply. We ensure perfect drop-shoulder lines so you always look slim and graceful.
              <br />
              <span className={`italic ${activeTheme.accentText}`}>提示：韩系宽松版型容错率极高，主要通过落肩和胸放呈现慵懒感，无需担心围度束缚。</span>
            </p>
          </div>
        </div>

        {/* Right: Recommendation Display (5 cols) */}
        <div className={`md:col-span-5 p-6 md:p-8 flex flex-col justify-between text-center relative overflow-hidden ${
          isMinimal
            ? 'bg-zinc-100 border border-zinc-200 rounded-none'
            : isVintage
            ? 'bg-[#FAF6F0] border-2 border-double border-amber-900/15 rounded-md'
            : `bg-gradient-to-b from-[var(--theme-scrollbar-bg)] to-[var(--theme-primary-soft)]/20 storybook-border-sm rounded-2xl storybook-shadow`
        }`}>
          {/* Subtle design element */}
          {!isMinimal && (
            <div className={`absolute top-0 right-0 w-24 h-24 ${activeTheme.accentText} opacity-10 rounded-full blur-xl`} />
          )}
          
          <div className="space-y-4 relative z-10">
            <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">
              RECOM_SIZE_ENG
            </span>
            
            <div className="space-y-1">
              <span className="text-zinc-500 text-xs font-sans block">Your Recommended Size</span>
              <span className={`text-zinc-500 text-xs ${activeArchetype.fontTitle} italic block`}>仙子推荐尺码</span>
              
              {/* Huge animated size badge */}
              <div className={`w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center border-2 shadow-sm animate-gentle-bounce my-3 ${
                isMinimal ? 'border-zinc-300 rounded-none' : isVintage ? 'border-amber-900/20' : 'border-pink-200'
              }`}>
                <span className={`text-5xl font-bold ${activeTheme.primaryText} ${activeArchetype.fontTitle}`}>
                  {result.recommendedSize}
                </span>
              </div>
            </div>

            {/* Custom Sizing text */}
            <div className="space-y-3 pt-2">
              <p className={`text-xs text-zinc-600 leading-relaxed text-justify ${activeArchetype.fontBody}`}>
                {result.fitDescription}
              </p>
              <p className={`text-xs text-zinc-500 bg-white/80 p-3 border text-justify leading-relaxed ${
                isMinimal ? 'border-zinc-200 rounded-none' : isVintage ? 'border-amber-900/10 rounded-sm' : 'border-pink-100 rounded-lg'
              }`}>
                {result.cnFitDescription}
              </p>
            </div>
          </div>

          <div className={`mt-6 pt-4 border-t relative z-10 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-sans ${
            isMinimal ? 'border-zinc-200' : 'border-[var(--theme-primary-soft)]/20'
          }`}>
            <Scale className={`w-3.5 h-3.5 ${activeTheme.accentText}`} /> Suitable for weights 40kg - 72kg beautifully.
          </div>
        </div>

      </div>
    </div>
  );
}
