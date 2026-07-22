import React, { useState } from 'react';
import { storybookChapters } from '../data';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';

interface StoryChaptersProps {
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

export default function StoryChapters({ activeTheme: activeThemeProp, activeArchetype: activeArchetypeProp, lang = 'en' }: StoryChaptersProps) {
  const activeTheme = activeThemeProp || pinkFallback;
  const activeArchetype = activeArchetypeProp || defaultArchetype;

  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const totalChapters = storybookChapters.length;
  const currentChapter = storybookChapters[currentPageIdx];

  const isMinimal = activeArchetype.id === 'minimalist';
  const isVintage = activeArchetype.id === 'vintage';

  const handlePrev = () => {
    if (currentPageIdx > 0) {
      setCurrentPageIdx(currentPageIdx - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIdx < totalChapters - 1) {
      setCurrentPageIdx(currentPageIdx + 1);
    }
  };

  // Render high-end custom storybook vectors based on type
  const renderIllustration = (type: string) => {
    const mainColor = activeTheme.ribbonColor || '#F472B6';
    const softFill = activeTheme.id === 'pink' ? '#FFF1F2' : activeTheme.id === 'apricot' ? '#FFFBEB' : '#F5F3FF';
    const lineFill = activeTheme.id === 'pink' ? '#FBCFE8' : activeTheme.id === 'apricot' ? '#FDE68A' : '#DDD6FE';

    switch (type) {
      case 'dress':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background sparkle glow */}
            <div className={`absolute inset-0 ${activeTheme.softBg} rounded-full blur-2xl opacity-40`} />
            
            {/* Elegant dress illustration */}
            <svg className="w-48 h-48 drop-shadow-md animate-gentle-bounce" style={{ color: mainColor }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Collar */}
              <path d="M 42,20 C 46,24 54,24 58,20 C 58,20 54,25 50,25 C 46,25 42,20 42,20 Z" fill={lineFill} stroke="currentColor" strokeWidth="1.5" />
              {/* Puff sleeves */}
              <circle cx="34" cy="27" r="8" fill={softFill} stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="66" cy="27" r="8" fill={softFill} stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Bodice */}
              <path d="M 38,25 L 62,25 L 59,45 L 41,45 Z" fill={softFill} stroke="currentColor" strokeWidth="2" />
              {/* Sweetheart waist ribbon */}
              <path d="M 39,45 L 61,45 L 61,48 L 39,48 Z" fill="currentColor" />
              <path d="M 50,47 C 45,50 48,58 45,63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 50,47 C 55,50 52,58 55,63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              {/* Big fluffy skirt */}
              <path d="M 40,48 C 30,65 20,85 18,90 C 40,94 60,94 82,90 C 80,85 70,65 60,48 Z" fill={softFill} stroke="currentColor" strokeWidth="2" />
              {/* Skirt lace details */}
              <path d="M 23,83 C 35,85 45,86 50,86 C 55,86 65,85 77,83" stroke={lineFill} strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 20,88 C 35,90 45,91 50,91 C 55,91 65,90 80,88" stroke={lineFill} strokeWidth="1.5" strokeLinecap="round" />
              {/* Sparkles around */}
              <path d="M 20,20 L 22,22 M 22,20 L 20,22" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 80,45 L 82,47 M 82,45 L 80,47" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        );
      case 'bow':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute inset-0 ${activeTheme.softBg} rounded-full blur-2xl opacity-40`} />
            {/* Big storybook bow */}
            <svg className="w-48 h-48 drop-shadow-md" style={{ color: mainColor }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 50,50 C 35,25 15,30 20,48 C 22,60 45,55 50,50 Z" fill={softFill} stroke="currentColor" strokeWidth="2.5" />
              <path d="M 50,50 C 65,25 85,30 80,48 C 78,60 55,55 50,50 Z" fill={softFill} stroke="currentColor" strokeWidth="2.5" />
              <path d="M 47,52 C 40,65 30,78 15,84" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M 53,52 C 60,65 70,78 85,84" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </div>
        );
      case 'stars':
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-radial from-orange-100/40 to-transparent rounded-full blur-2xl" />
            <svg className="w-48 h-48" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Star shapes */}
              <g className="animate-star-float" style={{ animationDelay: '0s' }}>
                <path d="M 40,25 L 43,33 L 51,33 L 45,38 L 47,46 L 40,41 L 33,46 L 35,38 L 29,33 L 37,33 Z" fill="#FBBF24" opacity="0.9" />
              </g>
              <g className="animate-star-float" style={{ animationDelay: '1.5s' }}>
                <path d="M 85,55 L 87,60 L 93,60 L 88,64 L 90,70 L 85,66 L 80,70 L 82,64 L 77,60 L 83,60 Z" fill={mainColor} opacity="0.8" />
              </g>
              <g className="animate-star-float" style={{ animationDelay: '3s' }}>
                <path d="M 30,80 L 32,83 L 37,83 L 33,86 L 34,91 L 30,88 L 26,91 L 27,86 L 23,83 L 28,83 Z" fill={lineFill} opacity="0.95" />
              </g>
              {/* Central S & M emblem */}
              <circle cx="60" cy="60" r="18" fill={softFill} stroke="currentColor" strokeWidth="1.5" style={{ color: mainColor }} />
              <text x="60" y="65" textAnchor="middle" fill={mainColor} className="font-serif font-bold text-xs">S & M</text>
            </svg>
          </div>
        );
      case 'cloud':
      default:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className={`absolute inset-0 ${activeTheme.softBg} rounded-full blur-xl opacity-40`} />
            {/* Cute cloud with rain threads */}
            <svg className="w-48 h-48 drop-shadow-sm animate-gentle-bounce" style={{ color: mainColor }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 30,65 C 20,65 15,55 22,46 C 20,35 30,22 45,26 C 52,18 68,20 72,30 C 82,30 85,42 80,50 C 85,58 75,65 65,65 Z" fill={softFill} stroke="currentColor" strokeWidth="2" />
              {/* Hanging hearts or rain droplets */}
              <line x1="35" y1="72" x2="35" y2="82" stroke={lineFill} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
              <line x1="50" y1="75" x2="50" y2="88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
              <line x1="65" y1="72" x2="65" y2="82" stroke={lineFill} strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
              <circle cx="50" cy="88" r="3" fill="currentColor" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="cippy-diary">
      {/* Title block */}
      <div className="text-center mb-8">
        {!isMinimal && (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${activeTheme.softBg} ${activeTheme.primaryText} ${
            isVintage ? 'rounded-md' : 'rounded-full'
          } text-xs tracking-widest font-sans font-medium uppercase mb-2`}>
            <BookOpen className="w-3.5 h-3.5" /> 
            {isVintage ? 'Atelier Design Chronicle // 手作日志' : 'Cippy Design Diary · 设计手札'}
          </span>
        )}
        <h2 className={`text-3xl md:text-4xl ${activeArchetype.fontTitle} font-bold text-zinc-800 tracking-tight`}>
          {isMinimal
            ? (lang === 'zh' ? '风格纪事' : 'STYLE CHRONOLOGY')
            : (lang === 'zh' ? 'Cippy 的篇章' : 'Chapters of Cippy')}
        </h2>
        <p className={`text-sm ${activeArchetype.fontBody} text-zinc-400 mt-1`}>
          {lang === 'zh'
            ? '翻开每一页，探索我们的绘本美学与剪裁秘密'
            : 'Turn the pages to explore our storybook aesthetic and tailoring secrets'}
        </p>
      </div>

      {/* The Storybook container */}
      <div className={`relative min-h-[480px] flex flex-col md:flex-row gap-8 items-stretch overflow-hidden p-6 md:p-8 ${
        isMinimal 
          ? 'bg-white border border-zinc-200 rounded-none' 
          : isVintage 
          ? 'bg-[#FDFBF7] border-2 border-double border-amber-900/15 rounded-md' 
          : 'bg-[#FFF9F9] storybook-border storybook-shadow rounded-3xl'
      }`}>
        
        {/* Soft background design page divider lines */}
        <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-[1.5px] ${
          isMinimal ? 'bg-zinc-100' : isVintage ? 'bg-amber-900/10' : 'bg-pink-100/70'
        }`} />
        <div className={`hidden md:block absolute left-[calc(1/2+6px)] top-4 bottom-4 w-[1px] ${
          isMinimal ? 'bg-zinc-50' : isVintage ? 'bg-amber-900/5' : 'bg-pink-100/30'
        }`} />
        <div className={`hidden md:block absolute left-[calc(1/2-6px)] top-4 bottom-4 w-[1px] ${
          isMinimal ? 'bg-zinc-50' : isVintage ? 'bg-amber-900/5' : 'bg-pink-100/30'
        }`} />

        {/* Left Page: The illustration & visual atmosphere */}
        <div className={`flex-1 flex flex-col justify-center items-center p-4 relative ${
          isMinimal 
            ? 'bg-zinc-50 rounded-none border border-zinc-100' 
            : isVintage 
            ? 'bg-[#FAF6F0] rounded-sm border border-amber-900/5' 
            : 'bg-[#FFFDFC] rounded-2xl border border-pink-50/50'
        }`}>
          {renderIllustration(currentChapter.illustrationType)}

          {/* Page Number indicator left */}
          <span className="absolute bottom-2 left-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            CI_DIARY_PAGE_{(currentPageIdx * 2) + 1}
          </span>
          <span className={`absolute bottom-2 right-4 text-[10px] ${activeArchetype.fontBody} ${activeTheme.accentText}`}>
            Daily & Lovely
          </span>
        </div>

        {/* Right Page: The storytelling text (Bilingual) */}
        <div className={`flex-1 flex flex-col justify-between p-4 relative ${
          isMinimal 
            ? 'bg-zinc-50 rounded-none border border-zinc-100' 
            : isVintage 
            ? 'bg-[#FAF6F0] rounded-sm border border-amber-900/5' 
            : 'bg-[#FFFDFC] rounded-2xl border border-pink-50/50'
        }`}>
          
          <div className="space-y-4">
            {/* Title / Chapter Label */}
            <div className="space-y-1">
              <span className={`text-xs ${activeArchetype.fontTitle} italic ${activeTheme.accentText} font-medium block`}>
                {lang === 'zh' ? `第 ${currentChapter.id} 章 · 共 ${totalChapters} 章` : `Chapter ${currentChapter.id} of ${totalChapters}`}
              </span>
              <h3 className={`text-xl md:text-2xl ${activeArchetype.fontTitle} font-bold text-zinc-800 tracking-tight leading-snug`}>
                {currentChapter.title}
              </h3>
              <h4 className={`text-sm md:text-base ${activeArchetype.fontTitle} ${activeTheme.primaryText} font-medium tracking-tight`}>
                {currentChapter.cnTitle}
              </h4>
            </div>

            {/* Subtitles */}
            <div className={`border-b ${isMinimal ? 'border-zinc-200' : 'border-pink-100/50'} pb-2`}>
              <p className={`text-[11px] text-zinc-400 uppercase tracking-widest leading-relaxed ${activeArchetype.fontBody}`}>
                {currentChapter.subtitle}
              </p>
              <p className={`text-xs text-zinc-400 ${activeArchetype.fontBody}`}>
                {currentChapter.cnSubtitle}
              </p>
            </div>

            {/* Content text block */}
            <div className={`space-y-4 text-xs md:text-sm leading-relaxed text-zinc-600 ${activeArchetype.fontBody}`}>
              <p className={`first-letter:text-2xl first-letter:${activeArchetype.fontTitle} first-letter:font-bold first-letter:${activeTheme.primaryText} first-letter:mr-1 first-letter:float-left`}>
                {currentChapter.content}
              </p>
              <p className={`p-3 italic text-zinc-500 text-xs md:text-[13px] border-l-2 ${
                isMinimal 
                  ? 'bg-zinc-100 border-zinc-400' 
                  : isVintage 
                  ? 'bg-[#EFEAE2] border-amber-900' 
                  : 'bg-pink-50/40 border-pink-300 rounded-lg'
              }`}>
                {currentChapter.cnContent}
              </p>
            </div>
          </div>

          {/* Book navigation controls */}
          <div className={`flex items-center justify-between mt-6 pt-4 border-t ${
            isMinimal ? 'border-zinc-200' : 'border-pink-100/50'
          }`}>
            {/* Prev button */}
            <button
              onClick={handlePrev}
              disabled={currentPageIdx === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-300 cursor-pointer ${
                isMinimal ? 'rounded-none font-mono uppercase tracking-wider' : 'rounded-full'
              } ${
                currentPageIdx === 0
                  ? 'text-zinc-300 cursor-not-allowed'
                  : isMinimal
                  ? 'text-zinc-900 hover:bg-zinc-100'
                  : `${activeTheme.primaryText} ${activeTheme.softBgHover} font-medium`
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> {lang === 'zh' ? '上一页' : 'Prev Page'}
            </button>

            {/* Micro star icon decoration - Only for non-minimal */}
            {!isMinimal && (
              <Sparkles className={`w-3.5 h-3.5 ${isVintage ? 'text-amber-800/40' : 'text-yellow-400'} animate-star-float`} />
            )}

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentPageIdx === totalChapters - 1}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-all duration-300 cursor-pointer ${
                isMinimal ? 'rounded-none font-mono uppercase tracking-wider' : 'rounded-full'
              } ${
                currentPageIdx === totalChapters - 1
                  ? 'text-zinc-300 cursor-not-allowed'
                  : isMinimal
                  ? 'text-zinc-900 hover:bg-zinc-100'
                  : `${activeTheme.primaryText} ${activeTheme.softBgHover} font-medium`
              }`}
            >
              {lang === 'zh' ? '下一页' : 'Next Page'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Number indicator right */}
          <span className="absolute bottom-2 right-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            CI_DIARY_PAGE_{(currentPageIdx * 2) + 2}
          </span>
        </div>
      </div>
    </div>
  );
}
