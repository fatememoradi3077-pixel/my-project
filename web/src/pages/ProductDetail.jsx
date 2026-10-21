import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { Badge, Button, EmptyState, ProductImage, Skeleton } from '../components/ui/primitives.jsx';
import { RatingStars } from '../components/ui/RatingStars.jsx';
import { TextAreaField } from '../components/ui/FormField.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { QuickViewModal } from '../components/product/QuickViewModal.jsx';
import { api } from '../lib/api.js';
import { currency, discountPercent, formatDate } from '../lib/format.js';
import { BRAND } from '../lib/content.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function ProductDetail() {
  const { slug } = useParams();
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: '5', comment: '' });
  const [reviewErrors, setReviewErrors] = useState({});
  const [submittingReview, setSubmittingReview] = useState(false);
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    setActiveImage(0);
    setQuantity(1);
    setProduct(null);
    api.products
      .get(slug)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="th-container py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-[360px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (missing || !product) {
    return (
      <div className="th-container py-16">
        <EmptyState
          title="Product not found"
          message="This product may have sold out or been renamed."
          action={
            <Link to="/shop" className="th-btn th-btn-primary th-btn-md mt-1">
              Browse all products
            </Link>
          }
        />
      </div>
    );
  }

  const gallery = [product.image, ...(product.gallery ?? []).filter((url) => url !== product.image)].slice(0, 4);
  const discount = discountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;
  const saved = wishlist.has(product.id);

  const addToCart = () => {
    if (outOfStock) return;
    cart.add(product, quantity);
    toast.push({
      tone: 'success',
      title: 'Added to cart',
      message: `${quantity} × ${product.name}`,
      action: (
        <button type="button" onClick={cart.open} className="text-[13px] font-semibold text-brand hover:text-brand-hover">
          View cart →
        </button>
      ),
    });
  };

  const submitReview = async (event) => {
    event.preventDefault();
    const errors = {};
    if (review.comment.trim().length < 8) errors.comment = 'Please write at least a short sentence.';
    if (Object.keys(errors).length) {
      setReviewErrors(errors);
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await api.products.review(product.slug, {
        rating: Number(review.rating),
        comment: review.comment.trim(),
      });
      setProduct((current) => ({
        ...current,
        reviews: [created, ...current.reviews],
        reviewCount: current.reviewCount + 1,
      }));
      setReview({ rating: '5', comment: '' });
      setReviewErrors({});
      toast.push({ tone: 'success', title: 'Thank you', message: 'Your review is now live on this product.' });
    } catch (error) {
      if (error.fieldErrors) setReviewErrors(error.fieldErrors);
      toast.push({ tone: 'error', title: 'Could not post review', message: error.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  const specificationEntries = Object.entries(product.specifications ?? {});

  return (
    <div className="th-container py-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
        <Link to="/" className="transition-colors hover:text-brand">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link to={`/shop?category=${product.categorySlug}`} className="transition-colors hover:text-brand">
          {product.categoryName}
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="text-ink-muted">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <ProductImage
            src={gallery[activeImage]}
            alt={product.name}
            eager
            className="h-[300px] w-full rounded-xl border border-line bg-surface-card sm:h-[400px]"
            imgClassName="p-6"
          />
          {gallery.length > 1 ? (
            <ul className="mt-3 flex gap-3">
              {gallery.map((url, index) => (
                <li key={`${url}-${index}`}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`Show image ${index + 1} of ${product.name}`}
                    aria-current={index === activeImage}
                    className={`overflow-hidden rounded-md border bg-surface-card transition-colors ${
                      index === activeImage ? 'border-brand' : 'border-line hover:border-ink-faint'
                    }`}
                  >
                    <ProductImage src={url} alt="" className="h-16 w-16" imgClassName="p-1.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {product.brand}
            </span>
            {product.isNew ? <Badge tone="new">NEW</Badge> : null}
            {product.isOnSale ? <Badge tone="sale">SALE</Badge> : null}
          </div>

          <h1 className="mt-2 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars rating={product.rating} size={16} />
            <span className="text-sm text-ink-muted">
              {product.rating} · {product.reviewCount} reviews
            </span>
            <a href="#reviews" className="text-sm font-semibold text-brand hover:text-brand-hover">
              Read reviews
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-extrabold text-brand">{currency(product.price)}</span>
            {product.originalPrice ? (
              <>
                <span className="text-base text-ink-faint line-through">{currency(product.originalPrice)}</span>
                <Badge tone="sale">Save {discount}%</Badge>
              </>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">{product.description}</p>

          <p className="mt-4">
            {outOfStock ? (
              <Badge tone="out">Out of stock — check back soon</Badge>
            ) : (
              <Badge tone="stock">
                In stock — {product.stock} unit{product.stock === 1 ? '' : 's'} available
              </Badge>
            )}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-line bg-surface-card">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="th-icon-btn h-11 w-11 rounded-none"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(product.stock || 99, value + 1))}
                className="th-icon-btn h-11 w-11 rounded-none"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <Button size="lg" onClick={addToCart} disabled={outOfStock} className="flex-1 min-w-[180px]">
              ADD TO CART
            </Button>

            <button
              type="button"
              onClick={() => {
                wishlist.toggle(product.id);
                toast.push({
                  tone: 'info',
                  title: saved ? 'Removed from wishlist' : 'Saved to wishlist',
                  message: product.name,
                });
              }}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`th-icon-btn h-11 w-11 border border-line ${saved ? 'text-brand' : 'text-ink-muted'}`}
            >
              <Heart className={`h-4 w-4 ${saved ? 'animate-pop fill-current' : ''}`} aria-hidden="true" />
            </button>
          </div>

          <ul className="mt-6 grid gap-3 rounded-lg border border-line bg-surface-panel p-4 text-[13px] text-ink-muted sm:grid-cols-2">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" aria-hidden="true" />
              Free shipping over ${BRAND.freeShippingThreshold}
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-brand" aria-hidden="true" />
              30-day returns
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              2-year warranty
            </li>
            <li className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              Dispatched within 24 hours
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        <section className="th-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">Description</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{product.description}</p>
        </section>

        <section className="th-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">
            Technical specifications
          </h2>
          {specificationEntries.length ? (
            <dl className="mt-3 divide-y divide-line-soft text-sm">
              {specificationEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 py-2">
                  <dt className="text-ink-faint">{key}</dt>
                  <dd className="text-right font-medium text-ink">{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink-muted">Specifications for this product are being finalised.</p>
          )}
        </section>

        <section className="th-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">Shipping &amp; returns</h2>
          <ul className="mt-3 space-y-3 text-sm text-ink-muted">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Orders over ${BRAND.freeShippingThreshold} ship free; below that standard delivery is $9.99.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Express delivery arrives the next business day for $14.99.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Return unused items in original packaging within 30 days for a full refund.
            </li>
          </ul>
          <Link to="/info/returns" className="th-link-more mt-4">
            Full returns policy »
          </Link>
        </section>
      </div>

      <section id="reviews" className="mt-12 scroll-mt-24">
        <h2 className="th-section-title th-heading-dash mb-5">Customer reviews</h2>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-3">
            {product.reviews.length === 0 ? (
              <EmptyState
                icon={BadgeCheck}
                title="No reviews yet"
                message="Be the first to review this product and help other shoppers decide."
              />
            ) : (
              product.reviews.map((item) => (
                <article key={item.id} className="th-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.customerName}</p>
                      <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <RatingStars rating={item.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.comment}</p>
                  {item.verified ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.1em] text-success">
                      <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified Buyer
                    </p>
                  ) : null}
                </article>
              ))
            )}
          </div>

          <div className="th-card h-fit p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">Write a review</h3>
            {user ? (
              <form onSubmit={submitReview} noValidate className="mt-4 space-y-4">
                <div>
                  <label htmlFor="review-rating" className="th-label">
                    Rating
                  </label>
                  <select
                    id="review-rating"
                    value={review.rating}
                    onChange={(event) => setReview((current) => ({ ...current, rating: event.target.value }))}
                    className="th-input"
                  >
                    {[5, 4, 3, 2, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} star{value === 1 ? '' : 's'}
                      </option>
                    ))}
                  </select>
                </div>
                <TextAreaField
                  label="Your review"
                  required
                  rows={5}
                  value={review.comment}
                  onChange={(event) => {
                    setReview((current) => ({ ...current, comment: event.target.value }));
                    setReviewErrors({});
                  }}
                  error={reviewErrors.comment}
                  placeholder="What did you like or dislike?"
                />
                <Button type="submit" className="w-full" disabled={submittingReview}>
                  {submittingReview ? 'Posting…' : 'POST REVIEW'}
                </Button>
              </form>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-ink-muted">
                  Sign in to your TechHaven account to leave a review. Your name appears next to it, never your email.
                </p>
                <Link to="/login" className="th-btn th-btn-outline th-btn-md mt-4 w-full">
                  Sign in to review
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {product.related?.length ? (
        <section className="mt-14">
          <h2 className="th-section-title th-heading-dash mb-5">You may also like</h2>
          <ProductGrid products={product.related} layout="listing" skeletonCount={0} onQuickView={setQuickView} />
        </section>
      ) : null}

      <div className="mt-10">
        <Link to="/shop" className="th-link-more">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to all products
        </Link>
      </div>

      {quickView ? <QuickViewModal product={quickView} onClose={() => setQuickView(null)} /> : null}
    </div>
  );
}
