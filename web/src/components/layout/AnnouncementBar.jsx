import { Headphones, Truck } from 'lucide-react';
import { BRAND } from '../../lib/content.js';

export function AnnouncementBar() {
  return (
    <div className="border-b border-line-soft bg-[#0B0C0E]">
      <div className="th-container flex h-9 items-center justify-between gap-4 text-[11px] text-ink-muted sm:text-xs">
        <p className="flex items-center gap-2 truncate">
          <Truck className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
          <span className="truncate">
            Free Shipping on orders over <strong className="font-semibold text-ink">${BRAND.freeShippingThreshold}</strong>
          </span>
        </p>
        <a
          href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap transition-colors hover:text-brand"
        >
          <Headphones className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          <span className="hidden sm:inline">Need help?</span>
          <span className="font-semibold">{BRAND.phone}</span>
        </a>
      </div>
    </div>
  );
}
