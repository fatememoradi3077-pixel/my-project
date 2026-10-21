import { PackageSearch } from 'lucide-react';
import { ProductCard } from './ProductCard.jsx';
import { EmptyState, ProductCardSkeleton } from '../ui/primitives.jsx';

const GRIDS = {
  featured: 'grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6',
  listing: 'grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4',
  wide: 'grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3',
};

export function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 6,
  layout = 'listing',
  onQuickView,
  emptyTitle = 'No products found',
  emptyMessage = 'Try removing a filter or searching for something else.',
  emptyAction = null,
  className = '',
}) {
  if (loading) {
    return (
      <div className={`grid ${GRIDS[layout]} ${className}`}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }

  return (
    <div className={`grid ${GRIDS[layout]} ${className}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
