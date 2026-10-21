import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';
import { ProductImage } from '../ui/primitives.jsx';
import { api } from '../../lib/api.js';
import { PROMO_ENDS_AT } from '../../lib/content.js';
import { countdownParts, pad } from '../../lib/format.js';

const UNITS = [
  { key: 'days', label: 'DAYS' },
  { key: 'hours', label: 'HRS' },
  { key: 'minutes', label: 'MINS' },
  { key: 'seconds', label: 'SECS' },
];

export function PromoBanner() {
  const [remaining, setRemaining] = useState(() => countdownParts(PROMO_ENDS_AT));
  const [collage, setCollage] = useState([]);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(countdownParts(PROMO_ENDS_AT)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.products
      .list({ onSale: 1, limit: 4, sort: 'popular' })
      .then((data) => {
        if (!cancelled) setCollage(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const expired = remaining === null;

  return (
    <section className="th-container py-6">
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface-panel">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_45%,rgba(255,106,0,0.14)_62%,rgba(255,90,34,0.05)_78%,transparent_92%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-8 h-24 w-24 rotate-45 bg-brand/10" />

        <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
              <Tag className="h-3 w-3" aria-hidden="true" />
              Limited time offer
            </p>
            <h2 className="mt-4 font-display text-[30px] font-extrabold uppercase leading-[1.05] tracking-tight text-ink sm:text-[38px]">
              Save up to <span className="text-brand">30%</span>
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-muted">Big savings on top tech picks.</p>

            {expired ? (
              <p className="mt-6 rounded-md border border-line bg-surface-card px-4 py-3 text-sm text-ink-muted">
                This offer has ended. New deals land every month —{' '}
                <Link to="/deals" className="font-semibold text-brand hover:text-brand-hover">
                  browse current deals
                </Link>
                .
              </p>
            ) : (
              <ul className="mt-6 flex flex-wrap gap-2.5" aria-label="Offer ends in">
                {UNITS.map((unit) => (
                  <li
                    key={unit.key}
                    className="min-w-[68px] rounded-md border border-line bg-surface-card px-3 py-2.5 text-center"
                  >
                    <span className="block font-display text-xl font-extrabold text-ink tabular-nums">
                      {pad(remaining[unit.key])}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                      {unit.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link to="/deals" className="th-btn th-btn-primary th-btn-lg mt-6">
              SHOP DEALS
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_60%_45%,rgba(255,106,0,0.18),transparent_70%)]"
            />
            <ul className="relative grid grid-cols-2 gap-3">
              {(collage.length ? collage : [1, 2, 3, 4]).slice(0, 4).map((item, index) =>
                item === 1 || typeof item === 'number' ? (
                  <li
                    key={index}
                    className="h-[104px] rounded-lg border border-line bg-surface-card/60"
                    aria-hidden="true"
                  />
                ) : (
                  <li
                    key={item.id}
                    className="flex h-[104px] items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-card"
                  >
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full"
                      imgClassName="p-2.5"
                    />
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
