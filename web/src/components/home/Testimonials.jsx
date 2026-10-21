import { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';
import { Avatar, SectionHeading, Skeleton } from '../ui/primitives.jsx';
import { RatingStars } from '../ui/RatingStars.jsx';
import { api } from '../../lib/api.js';

export function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.testimonials()
      .then((data) => {
        if (!cancelled) setItems(data);
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
      <SectionHeading title="What our customers say" to="/shop?sort=rating" linkLabel="View all reviews" />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[196px] w-full" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="th-card flex h-full flex-col p-5">
              <Quote className="h-6 w-6 text-brand" aria-hidden="true" />
              <RatingStars rating={item.rating} size={15} className="mt-4" />
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">“{item.comment}”</p>
              <div className="mt-5 flex items-center gap-3 border-t border-line-soft pt-4">
                <Avatar name={item.customerName} />
                <div>
                  <p className="text-sm font-semibold text-ink">{item.customerName}</p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-success">
                    {item.verified ? 'Verified Buyer' : 'Customer'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
