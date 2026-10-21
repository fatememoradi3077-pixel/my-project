import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, Package, Truck } from 'lucide-react';
import { Badge, EmptyState, ProductImage, Skeleton } from '../components/ui/primitives.jsx';
import { api } from '../lib/api.js';
import { currency, formatDate } from '../lib/format.js';
import { ORDER_STATUS_TONES } from '../lib/content.js';
import { useAuth } from '../context/AuthContext.jsx';

export function OrderConfirmation() {
  const { reference } = useParams();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(location.state?.order ?? null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (order || authLoading) return undefined;
    if (!user) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    api.orders
      .get(reference)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reference, user, authLoading, order]);

  if (loading) {
    return (
      <div className="th-container py-12">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-52 w-full" />
      </div>
    );
  }

  if (failed || !order) {
    return (
      <div className="th-container py-16">
        <EmptyState
          icon={Package}
          title="We could not find that order"
          message={
            user
              ? 'Check your order history for the reference, or contact support and we will track it down.'
              : 'Sign in to view orders placed with your account, or contact support with your reference.'
          }
          action={
            <div className="mt-1 flex flex-wrap justify-center gap-2">
              <Link to={user ? '/account?tab=orders' : '/login'} className="th-btn th-btn-primary th-btn-md">
                {user ? 'Order history' : 'Sign in'}
              </Link>
              <Link to="/shop" className="th-btn th-btn-outline th-btn-md">
                Keep shopping
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="th-container py-10">
      <div className="rounded-xl border border-success/35 bg-success/5 p-6">
        <p className="flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-tight text-success">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Order placed
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Thank you, {order.shippingAddress?.name ?? 'friend'}. Your reference is{' '}
          <strong className="text-ink">{order.reference}</strong> — a confirmation was sent to {order.customerEmail}.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-md border border-line bg-surface-base/60 p-3 text-[13px] text-ink-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
          This deployment runs a demo checkout: the order is recorded so you can review the full flow, and no payment
          was taken.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="th-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Items</h2>
            <span className={`th-badge ${ORDER_STATUS_TONES[order.status] ?? 'bg-surface-raised text-ink-muted'}`}>
              {order.status}
            </span>
          </div>
          <ul className="mt-4 divide-y divide-line-soft">
            {order.items.map((line) => (
              <li key={line.productId} className="flex items-center gap-3 py-3">
                <ProductImage
                  src={line.image}
                  alt={line.name}
                  className="h-14 w-14 shrink-0 rounded bg-surface-panel"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${line.slug}`}
                    className="line-clamp-1 text-sm font-medium text-ink transition-colors hover:text-brand"
                  >
                    {line.name}
                  </Link>
                  <p className="text-xs text-ink-muted">
                    Qty {line.quantity} · {currency(line.price)} each
                  </p>
                </div>
                <span className="text-sm font-semibold text-ink">{currency(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line-soft pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="text-ink">{currency(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Shipping</dt>
              <dd className={order.shipping === 0 ? 'text-success' : 'text-ink'}>
                {order.shipping === 0 ? 'Free' : currency(order.shipping)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-3">
              <dt className="font-display text-base font-bold text-ink">Total</dt>
              <dd className="font-display text-lg font-extrabold text-brand">{currency(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="th-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Delivery</h2>
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
              <Truck className="h-4 w-4 text-brand" aria-hidden="true" />
              {order.deliveryMethod === 'pickup'
                ? 'Collection in store, Bristol'
                : order.deliveryMethod === 'express'
                  ? 'Express — next business day'
                  : 'Standard — 3–5 business days'}
            </p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-ink-muted">
              {order.shippingAddress?.line1}
              {order.shippingAddress?.line2 ? (
                <>
                  <br />
                  {order.shippingAddress.line2}
                </>
              ) : null}
              <br />
              {order.shippingAddress?.city}
              {order.shippingAddress?.region ? `, ${order.shippingAddress.region}` : ''}{' '}
              {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
            </address>
          </div>

          <div className="th-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-ink">Order details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-faint">Reference</dt>
                <dd className="font-medium text-ink">{order.reference}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-faint">Placed</dt>
                <dd className="text-ink">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-faint">Payment</dt>
                <dd>
                  <Badge tone="muted">Demo — not charged</Badge>
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {user ? (
                <Link to="/account?tab=orders" className="th-btn th-btn-outline th-btn-sm">
                  View order history
                </Link>
              ) : (
                <Link to="/signup" className="th-btn th-btn-outline th-btn-sm">
                  Create an account
                </Link>
              )}
              <Link to="/shop" className="th-btn th-btn-subtle th-btn-sm">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
