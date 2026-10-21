import { Link } from 'react-router-dom';
import { BRAND } from '../../lib/content.js';

/** TECHHAVEN mark: orange TH tile, wordmark and tagline. */
export function Logo({ compact = false, className = '' }) {
  return (
    <Link to="/" className={`group flex items-center gap-2.5 ${className}`} aria-label={`${BRAND.name} home`}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-brand text-[13px] font-extrabold tracking-tight text-[#120A03] transition-transform duration-300 group-hover:scale-105">
        TH
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span className="font-display text-[15px] font-extrabold tracking-[0.02em] text-ink">
          {BRAND.name.toUpperCase()}
        </span>
        {compact ? null : (
          <span className="mt-0.5 hidden text-[8.5px] font-semibold uppercase tracking-[0.16em] text-ink-faint sm:block">
            {BRAND.tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
