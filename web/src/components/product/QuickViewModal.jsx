import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Badge, Button, ProductImage, Spinner } from '../ui/primitives.jsx';
import { RatingStars } from '../ui/RatingStars.jsx';
import { api } from '../../lib/api.js';
import { currency, discountPercent } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function QuickViewModal({ product, onClose }) {
  const cart = useCart();
  const toast = useToast();
  const [detail, setDetail] = useState(product);
  const [loading, setLoading] = useState(Boolean(product?.slug));
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product?.slug) return undefined;
    let cancelled = false;
    setLoading(true);
    setQuantity(1);
    api.products
      .get(product.slug)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setDetail(product);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.slug]);

  if (!product) return null;

  const discount = discountPercent(detail.price, detail.originalPrice);
  const outOfStock = detail.stock !== undefined ? detail.stock <= 0 : !detail.inStock;

  const addToCart = () => {
    cart.add(detail, quantity);
    toast.push({
      tone: 'success',
      title: 'Added to cart',
      message: `${quantity} × ${detail.name}`,
      action: (
        <button type="button" onClick={cart.open} className="text-[13px] font-semibold text-brand hover:text-brand-hover">
          View cart →
        </button>
      ),
    });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Quick view">
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductImage
          src={detail.image}
          alt={detail.name}
          className="h-56 w-full rounded-lg border border-line bg-surface-card sm:h-72"
          imgClassName="p-4"
        />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {detail.categoryName}
            </p>
            {detail.isNew ? <Badge tone="new">NEW</Badge> : null}
            {detail.isOnSale ? <Badge tone="sale">SALE</Badge> : null}
          </div>

          <h3 className="mt-2 font-display text-xl font-extrabold leading-tight text-ink">{detail.name}</h3>

          <div className="mt-2 flex items-center gap-2">
            <RatingStars rating={detail.rating} size={15} />
            <span className="text-xs text-ink-muted">
              {detail.rating} · {detail.reviewCount} reviews
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold text-brand">{currency(detail.price)}</span>
            {detail.originalPrice ? (
              <span className="text-sm text-ink-faint line-through">{currency(detail.originalPrice)}</span>
            ) : null}
            {discount > 0 ? <Badge tone="sale">Save {discount}%</Badge> : null}
          </div>

          {loading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
              <Spinner className="h-4 w-4" /> Loading details…
            </div>
          ) : (
            <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-ink-muted">{detail.description}</p>
          )}

          <p className="mt-4 text-sm">
            {outOfStock ? (
              <Badge tone="out">Out of stock</Badge>
            ) : (
              <Badge tone="stock">In stock — {detail.stock} available</Badge>
            )}
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center rounded-md border border-line bg-surface-card">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="th-icon-btn rounded-none"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="w-9 text-center text-sm font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(detail.stock || 99, value + 1))}
                className="th-icon-btn rounded-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <Button onClick={addToCart} disabled={outOfStock} className="flex-1">
              ADD TO CART
            </Button>
          </div>

          <Link
            to={`/product/${detail.slug}`}
            onClick={onClose}
            className="th-link-more mt-4 justify-start text-brand hover:text-brand-hover"
          >
            Full product details <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
