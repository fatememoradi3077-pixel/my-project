import { ProductBrowser } from '../components/shop/ProductBrowser.jsx';

export function NewArrivals() {
  return (
    <div className="border-b border-line bg-surface-base">
      <div className="th-container pt-8">
        <p className="th-eyebrow text-brand">Just landed</p>
        <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
          New arrivals
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          The newest additions to the TechHaven catalogue, tested by our team before listing.
        </p>
      </div>
      <ProductBrowser locked={{ isNew: 1 }} defaultSort="newest" />
    </div>
  );
}
