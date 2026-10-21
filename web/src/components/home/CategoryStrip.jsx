import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading, Skeleton } from '../ui/primitives.jsx';
import { api } from '../../lib/api.js';

export function CategoryStrip() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.categories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="th-container py-12">
      <SectionHeading title="Shop by category" to="/shop" linkLabel="View all categories" />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-[124px] w-full" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                to={`/shop?category=${category.slug}`}
                className="group flex h-full flex-col items-center gap-2 rounded-lg border border-line bg-surface-card px-3 py-4 text-center transition-all duration-200 hover:border-brand/50 hover:bg-surface-raised"
              >
                <span className="grid h-16 w-full place-items-center overflow-hidden rounded-md bg-surface-panel">
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-ink-muted transition-colors group-hover:text-brand">
                  {category.name}
                </span>
                <span className="text-[10px] text-ink-faint">{category.productCount} items</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
