import { useId } from 'react';
import { Link } from 'react-router-dom';

type RaicesLogoProps = {
  size?: number;
  withText?: boolean;
  textClassName?: string;
  className?: string;
  href?: string | null;
};

export function RaicesLogo({
  size = 36,
  withText = true,
  textClassName,
  className,
  href = '/',
}: RaicesLogoProps) {
  const rawId = useId();
  const gradId = `rz-grad-${rawId.replace(/[:]/g, '')}`;

  const mark = (
    <div className="shrink-0">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        className="block drop-shadow-[0_4px_12px_rgba(59,130,246,0.35)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="6" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill={`url(#${gradId})`} />
        <path d="M24 10 L24 34" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 22 C17 20 11 14 14 7 C20 8 24 15 24 22 Z" fill="white" />
        <path d="M24 18 C31 15 37 18 34 7 C28 6 24 13 24 18 Z" fill="white" />
        <path d="M24 34 C21 38 17 39 14 42" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M24 34 C27 38 31 39 34 42" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );

  const text = withText ? (
    <span
      className={
        textClassName ??
        'text-lg font-black tracking-tighter italic text-slate-800 dark:text-white'
      }
    >
      Raíces
    </span>
  ) : null;

  const inner = (
    <>
      {mark}
      {text}
    </>
  );

  const wrapperClass = `inline-flex items-center gap-3 ${className ?? ''}`;

  if (href) {
    return (
      <Link to={href} className={wrapperClass} aria-label="Raíces ERP">
        {inner}
      </Link>
    );
  }

  return (
    <span className={wrapperClass} aria-label="Raíces ERP">
      {inner}
    </span>
  );
}
