import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { ProductImage, Spinner } from '../ui/primitives.jsx';
import { api } from '../../lib/api.js';
import { currency } from '../../lib/format.js';

/** Accessible search panel: live results, keyboard navigation, no-results state. */
export function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (open) {
      setTerm('');
      setResults([]);
      setActiveIndex(-1);
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Debounced live search.
  useEffect(() => {
    if (!open) return undefined;
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      api.products
        .list({ q: query, limit: 6 })
        .then((data) => {
          if (!cancelled) setResults(data.items);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 260);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term, open]);

  const suggestions = useMemo(
    () => ['Headphones', 'Smart Watches', 'Laptops', 'Drones', 'Gaming'],
    [],
  );

  if (!open) return null;

  const goToProduct = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const submit = (event) => {
    event.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      goToProduct(results[activeIndex].slug);
      return;
    }
    if (!term.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(term.trim())}`);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    } else if (event.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      goToProduct(results[activeIndex].slug);
    }
  };

  return (
    <div className="fixed inset-0 z-[76]">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/72 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="relative mx-auto mt-0 w-full max-w-3xl border-b border-line bg-surface-panel p-4 shadow-card animate-fade-up sm:mt-24 sm:rounded-xl sm:border sm:p-5"
      >
        <form onSubmit={submit} className="flex items-center gap-3">
          <Search className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search headphones, laptops, drones…"
            aria-label="Search products"
            className="w-full bg-transparent py-2 text-base text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {loading ? <Spinner className="h-4 w-4 text-ink-faint" /> : null}
          <button type="button" onClick={onClose} className="th-icon-btn" aria-label="Close search">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>

        <div className="mt-3 border-t border-line-soft pt-3">
          {term.trim().length < 2 ? (
            <div>
              <p className="th-eyebrow">Popular searches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setTerm(suggestion)}
                    className="th-chip transition-colors hover:border-brand hover:text-brand"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {results.length > 0 ? (
            <>
              <ul className="mt-1 space-y-1">
                {results.map((product, index) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToProduct(product.slug)}
                      className={`flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors ${
                        activeIndex === index ? 'bg-surface-raised' : 'hover:bg-surface-raised'
                      }`}
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="h-11 w-11 shrink-0 rounded bg-surface-card"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{product.name}</span>
                        <span className="block text-xs text-ink-muted">{product.categoryName}</span>
                      </span>
                      <span className="text-sm font-semibold text-brand">{currency(product.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={submit}
                className="th-link-more mt-3 text-brand hover:text-brand-hover"
              >
                View all results for “{term.trim()}” »
              </button>
            </>
          ) : null}

          {term.trim().length >= 2 && !loading && results.length === 0 ? (
            <p className="py-4 text-sm text-ink-muted">
              No products match “{term.trim()}”. Try a different word — or browse{' '}
              <button type="button" onClick={() => setTerm('')} className="font-semibold text-brand">
                all categories
              </button>
              .
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
