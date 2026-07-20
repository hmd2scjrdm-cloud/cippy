import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", size = "md" }: LogoProps) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const heightClass = isSmall 
    ? 'h-8 sm:h-9' 
    : isLarge 
      ? 'h-24 sm:h-28 md:h-32' 
      : 'h-14 sm:h-16';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <img
        src="https://ilzeziznxzaxxudzhdmu.supabase.co/storage/v1/object/public/logo/cippylogo.svg.PNG"
        alt="Cippy Malaysia"
        className={`${heightClass} w-auto object-contain transition-all duration-300`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
