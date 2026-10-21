import { useEffect, useState } from 'react';
import { SectionHeading } from '../ui/primitives.jsx';
import { ProductGrid } from '../product/ProductGrid.jsx';
import { QuickViewModal } from '../product/QuickViewModal.jsx';
import { api } from '../../lib/api.js';

export function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.products
      .list({ featured: 1, limit: 6 })
      .then((data) => {
        if (!cancelled) setProducts(data.items);
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
    <section className="th-container py-6 pb-12">
      <SectionHeading title="Featured products" to="/shop" linkLabel="View all products" />
      <ProductGrid
        products={products}
        loading={loading}
        skeletonCount={6}
        layout="featured"
        onQuickView={setQuickView}
        emptyMessage="Our featured selection is being updated — browse the full catalogue in the meantime."
      />
      {quickView ? <QuickViewModal product={quickView} onClose={() => setQuickView(null)} /> : null}
    </section>
  );
}
