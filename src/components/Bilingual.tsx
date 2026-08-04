interface BilingualProps {
  en: string;
  zh: string;
  className?: string;
  enClassName?: string;
  zhClassName?: string;
  inline?: boolean;
}

// English-first brand chrome: nav items, section headers, category labels, and
// product names always show English prominently with Chinese as a small
// secondary line, regardless of the site-wide language toggle (which still
// governs body copy elsewhere).
export function Bilingual({ en, zh, className = '', enClassName = '', zhClassName = '', inline = false }: BilingualProps) {
  if (inline) {
    return (
      <span className={className}>
        <span className={enClassName}>{en}</span>
        {zh && zh !== en && <span className={`opacity-55 ${zhClassName}`}> · {zh}</span>}
      </span>
    );
  }
  return (
    <span className={`inline-flex flex-col leading-tight ${className}`}>
      <span className={enClassName}>{en}</span>
      {zh && zh !== en && <span className={`opacity-50 ${zhClassName}`}>{zh}</span>}
    </span>
  );
}
