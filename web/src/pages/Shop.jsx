import { useSearchParams } from 'react-router-dom';
import { ProductBrowser } from '../components/shop/ProductBrowser.jsx';

export function Shop() {
  const [params] = useSearchParams();
  const category = params.get('category');
  const search = params.get('q');

  const title = search
    ? `Search results`
    : category
      ? category.replace(/-/g, ' ')
      : 'All products';

  return (
    <div className="border-b border-line bg-surface-base">
      <div className="th-container pt-8">
        <p className="th-eyebrow">Shop</p>
        <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          {search
            ? `Every product matching “${search}”, refined by category, brand, price and rating.`
            : 'Filter by category, brand, price, rating and availability. Every product ships with a two-year warranty.'}
        </p>
      </div>
      <ProductBrowser />
    </div>
  );
}
