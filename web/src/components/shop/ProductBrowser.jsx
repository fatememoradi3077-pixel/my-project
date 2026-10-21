import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button, Spinner } from '../ui/primitives.jsx';
import { Drawer } from '../ui/Modal.jsx';
import { ProductGrid } from '../product/ProductGrid.jsx';
import { QuickViewModal } from '../product/QuickViewModal.jsx';
import { api } from '../../lib/api.js';
import { RATING_OPTIONS, SORT_OPTIONS } from '../../lib/content.js';
import { currency } from '../../lib/format.js';

const PAGE_SIZE = 12;

/**
 * Filterable product listing shared by the shop, deals and new-arrivals pages.
 * All filter state lives in the URL so results can be linked and shared.
 */
export function ProductBrowser({ locked = {}, defaultSort = 'featured' }) {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [facets, setFacets] = useState({ brands: [], priceRange: { min: 0, max: 0 } });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [priceDraft, setPriceDraft] = useState({ min: '', max: '' });

  const read = useCallback((key, fallback = '') => params.get(key) ?? fallback, [params]);
  const category = read('category');
  const brandParam = read('brand');
  const selectedBrands = useMemo(() => (brandParam ? brandParam.split(',').filter(Boolean) : []), [brandParam]);
  const minPrice = read('minPrice');
  const maxPrice = read('maxPrice');
  const rating = read('rating');
  const inStock = read('inStock') === '1';
  const sort = read('sort') || defaultSort;
  const search = read('q');

  // Serialising keeps the effect dependencies stable across renders even though
  // callers pass `locked` as an inline object literal.
  const lockedKey = JSON.stringify(locked ?? {});
  const lockedParams = useMemo(() => JSON.parse(lockedKey), [lockedKey]);

  const queryKey = JSON.stringify({
    category,
    brands: selectedBrands,
    minPrice,
    maxPrice,
    rating,
    inStock,
    sort,
    search,
    locked: lockedKey,
  });

  useEffect(() => {
    setPriceDraft({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    api.products
      .facets()
      .then((data) => {
        if (!cancelled) setFacets(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const buildParams = useCallback(
    (nextPage) => ({
      category: category || undefined,
      brand: selectedBrands.length ? selectedBrands : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      rating: rating || undefined,
      inStock: inStock ? 1 : undefined,
      sort,
      q: search || undefined,
      limit: PAGE_SIZE,
      page: nextPage,
      ...lockedParams,
    }),
    [category, selectedBrands, minPrice, maxPrice, rating, inStock, sort, search, lockedParams],
  );

  // Reset and reload whenever a filter changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);
    api.products
      .list(buildParams(1))
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, buildParams]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    api.products
      .list(buildParams(nextPage))
      .then((data) => {
        setItems((current) => [...current, ...data.items]);
        setPage(nextPage);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === '' || value === null || value === undefined) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  };

  const toggleBrand = (brand) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((item) => item !== brand)
      : [...selectedBrands, brand];
    update('brand', next.join(','));
  };

  const clearAll = () => {
    const next = new URLSearchParams();
    if (search) next.set('q', search);
    setParams(next, { replace: true });
  };

  const activeFilters =
    (category ? 1 : 0) +
    selectedBrands.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (rating ? 1 : 0) +
    (inStock ? 1 : 0);

  const filterPanel = (
    <div className="space-y-6">
      <fieldset>
        <legend className="th-label">Category</legend>
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => update('category', '')}
            className={`block w-full rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
              category ? 'text-ink-muted hover:text-ink' : 'bg-surface-raised font-semibold text-brand'
            }`}
          >
            All categories
          </button>
          {facets.categoryList?.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              onClick={() => update('category', entry.slug)}
              className={`block w-full rounded px-2 py-1.5 text-left text-[13px] transition-colors ${
                category === entry.slug
                  ? 'bg-surface-raised font-semibold text-brand'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {entry.name}
              <span className="ml-2 text-[11px] text-ink-faint">{entry.productCount}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="th-label">Brand</legend>
        <div className="space-y-1.5">
          {facets.brands.map((brand) => (
            <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-muted">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="h-4 w-4 rounded border-line bg-surface-panel accent-brand"
              />
              {brand}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="th-label">Price</legend>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={priceDraft.min}
            onChange={(event) => setPriceDraft((draft) => ({ ...draft, min: event.target.value }))}
            placeholder={String(facets.priceRange.min || 0)}
            aria-label="Minimum price"
            className="th-input py-2 text-[13px]"
          />
          <span className="text-ink-faint">–</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={priceDraft.max}
            onChange={(event) => setPriceDraft((draft) => ({ ...draft, max: event.target.value }))}
            placeholder={String(facets.priceRange.max || 0)}
            aria-label="Maximum price"
            className="th-input py-2 text-[13px]"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params);
            if (priceDraft.min) next.set('minPrice', priceDraft.min);
            else next.delete('minPrice');
            if (priceDraft.max) next.set('maxPrice', priceDraft.max);
            else next.delete('maxPrice');
            setParams(next, { replace: true });
          }}
          className="th-btn th-btn-outline th-btn-sm mt-2 w-full"
        >
          Apply price
        </button>
        <p className="mt-2 text-[11px] text-ink-faint">
          Catalogue range: {currency(facets.priceRange.min)} – {currency(facets.priceRange.max)}
        </p>
      </fieldset>

      <fieldset>
        <legend className="th-label">Rating</legend>
        <div className="space-y-1.5">
          {RATING_OPTIONS.map((option) => (
            <label key={option.value || 'any'} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-muted">
              <input
                type="radio"
                name="rating"
                checked={rating === option.value}
                onChange={() => update('rating', option.value)}
                className="h-4 w-4 accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="th-label">Availability</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-muted">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(event) => update('inStock', event.target.checked ? '1' : '')}
            className="h-4 w-4 rounded border-line bg-surface-panel accent-brand"
          />
          In stock only
        </label>
      </fieldset>

      {activeFilters > 0 ? (
        <button type="button" onClick={clearAll} className="th-btn th-btn-subtle th-btn-sm w-full">
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="th-container py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-lg border border-line bg-surface-panel p-4">
            <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.14em] text-ink">
              Filters {activeFilters > 0 ? <span className="text-brand">({activeFilters})</span> : null}
            </h2>
            {filterPanel}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted" aria-live="polite">
              {loading ? (
                'Loading products…'
              ) : (
                <>
                  Showing <strong className="text-ink">{items.length}</strong> of{' '}
                  <strong className="text-ink">{total}</strong> products
                  {search ? (
                    <>
                      {' '}
                      for “<span className="text-ink">{search}</span>”
                    </>
                  ) : null}
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="th-btn th-btn-outline th-btn-sm lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
              </button>
              <label className="sr-only" htmlFor="sort">
                Sort products
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => update('sort', event.target.value)}
                className="th-input w-auto py-2 text-[13px]"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {search || activeFilters > 0 ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {search ? (
                <button type="button" onClick={() => update('q', '')} className="th-chip hover:border-brand hover:text-brand">
                  {search} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              {category ? (
                <button
                  type="button"
                  onClick={() => update('category', '')}
                  className="th-chip hover:border-brand hover:text-brand"
                >
                  {category.replace(/-/g, ' ')} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => toggleBrand(brand)}
                  className="th-chip hover:border-brand hover:text-brand"
                >
                  {brand} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          <ProductGrid
            products={items}
            loading={loading}
            skeletonCount={PAGE_SIZE}
            layout="listing"
            onQuickView={setQuickView}
            emptyTitle="No products match those filters"
            emptyMessage="Try widening the price range, clearing a brand, or searching for a different term."
            emptyAction={
              activeFilters > 0 || search ? (
                <Button variant="outline" size="sm" onClick={clearAll} className="mt-1">
                  Clear all filters
                </Button>
              ) : null
            }
          />

          {!loading && items.length < total ? (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Spinner className="h-4 w-4" /> : null}
                {loadingMore ? 'Loading…' : `Load more (${total - items.length} remaining)`}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        side="left"
        footer={
          <Button variant="primary" className="w-full" onClick={() => setFiltersOpen(false)}>
            Show {total} results
          </Button>
        }
      >
        {filterPanel}
      </Drawer>

      {quickView ? <QuickViewModal product={quickView} onClose={() => setQuickView(null)} /> : null}
    </div>
  );
}
