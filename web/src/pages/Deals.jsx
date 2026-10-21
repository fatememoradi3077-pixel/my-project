import { ProductBrowser } from '../components/shop/ProductBrowser.jsx';

export function Deals() {
  return (
    <div className="border-b border-line bg-surface-base">
      <div className="th-container pt-8">
        <p className="th-eyebrow text-brand">Limited time</p>
        <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
          Deals &amp; offers
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Save up to 30% across audio, laptops, wearables and more while stock lasts.
        </p>
      </div>
      <ProductBrowser locked={{ onSale: 1 }} defaultSort="popular" />
    </div>
  );
}
