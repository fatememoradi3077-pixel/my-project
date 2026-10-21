import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { Heart, LogOut, Package, Save, User } from 'lucide-react';
import { Badge, Button, EmptyState, ProductImage, Skeleton } from '../components/ui/primitives.jsx';
import { ProductGrid } from '../components/product/ProductGrid.jsx';
import { api } from '../lib/api.js';
import { currency, formatDate } from '../lib/format.js';
import { ORDER_STATUS_TONES } from '../lib/content.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
];

function SavedDetails() {
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('techhaven.checkout.v1');
      setSaved(raw ? JSON.parse(raw) : null);
    } catch {
      setSaved(null);
    }
  }, []);

  if (!saved) {
    return (
      <p className="text-sm text-ink-muted">
        No saved delivery details yet. Details you enter at checkout are remembered on this device for next time.
      </p>
    );
  }

  return (
    <div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-faint">Name</dt>
          <dd className="text-right text-ink">{saved.name || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-faint">Phone</dt>
          <dd className="text-right text-ink">{saved.phone || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-faint">Address</dt>
          <dd className="text-right text-ink">
            {saved.line1 ? (
              <>
                {saved.line1}
                <br />
                {saved.city} {saved.postalCode}
                <br />
                {saved.country}
              </>
            ) : (
              '—'
            )}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={() => {
          window.localStorage.removeItem('techhaven.checkout.v1');
          setSaved(null);
        }}
        className="mt-4 text-[13px] font-semibold text-ink-faint transition-colors hover:text-sale"
      >
        Clear saved details
      </button>
    </div>
  );
}

export function Account() {
  const { user, loading, logout } = useAuth();
  const wishlist = useWishlist();
  const toast = useToast();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((item) => item.key === params.get('tab')) ? params.get('tab') : 'profile';

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  useEffect(() => {
    if (!user || tab !== 'orders') return undefined;
    let cancelled = false;
    setOrdersLoading(true);
    api.orders
      .list()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, tab]);

  useEffect(() => {
    if (!user || tab !== 'wishlist') return undefined;
    if (wishlist.ids.length === 0) {
      setWishlistProducts([]);
      setWishlistLoading(false);
      return undefined;
    }
    let cancelled = false;
    setWishlistLoading(true);
    api.products
      .list({ ids: wishlist.ids.join(','), limit: 48 })
      .then((data) => {
        if (!cancelled) setWishlistProducts(data.items);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setWishlistLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, tab, wishlist.ids]);

  if (loading) {
    return (
      <div className="th-container py-12">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  const cancelOrder = async (reference) => {
    try {
      const updated = await api.orders.cancel(reference);
      setOrders((current) => current.map((order) => (order.reference === reference ? updated : order)));
      toast.push({ tone: 'success', title: 'Order cancelled', message: `${reference} is cancelled.` });
    } catch (error) {
      toast.push({ tone: 'error', title: 'Could not cancel', message: error.message });
    }
  };

  return (
    <div className="th-container py-10">
      <p className="th-eyebrow">My account</p>
      <h1 className="mt-2 font-display text-[26px] font-extrabold uppercase tracking-tight text-ink sm:text-[30px]">
        {user.name}
      </h1>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setParams(item.key === 'profile' ? {} : { tab: item.key }, { replace: true })}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                active ? 'bg-surface-raised text-brand' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
              {item.key === 'wishlist' && wishlist.count > 0 ? (
                <span className="text-[11px] text-ink-faint">({wishlist.count})</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {tab === 'profile' ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="th-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">Account details</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Name</dt>
                  <dd className="text-ink">{user.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Email</dt>
                  <dd className="text-ink">{user.email}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Member since</dt>
                  <dd className="text-ink">{formatDate(user.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-faint">Role</dt>
                  <dd>
                    <Badge tone={user.role === 'admin' ? 'new' : 'muted'}>{user.role}</Badge>
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-ink-faint">
                Your password is stored only as a salted hash, and your orders are visible to nobody but you.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {user.role === 'admin' ? (
                  <Link to="/admin" className="th-btn th-btn-outline th-btn-sm">
                    <Save className="h-3.5 w-3.5" aria-hidden="true" /> Open admin
                  </Link>
                ) : null}
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={async () => {
                    await logout();
                    toast.push({ tone: 'info', title: 'Signed out', message: 'See you again soon.' });
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
                </Button>
              </div>
            </section>

            <section className="th-card p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">
                Saved delivery details
              </h2>
              <div className="mt-4">
                <SavedDetails />
              </div>
            </section>
          </div>
        ) : null}

        {tab === 'orders' ? (
          ordersLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              message="When you place an order it appears here with its reference, items and status."
              action={
                <Link to="/shop" className="th-btn th-btn-primary th-btn-md mt-1">
                  Start shopping
                </Link>
              }
            />
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id} className="th-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        to={`/order/${order.reference}`}
                        className="font-display text-sm font-bold text-ink transition-colors hover:text-brand"
                      >
                        {order.reference}
                      </Link>
                      <p className="text-xs text-ink-muted">
                        {formatDate(order.createdAt)} · {order.items.length} item
                        {order.items.length === 1 ? '' : 's'} · {currency(order.total)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`th-badge ${ORDER_STATUS_TONES[order.status] ?? 'bg-surface-raised text-ink-muted'}`}
                      >
                        {order.status}
                      </span>
                      <Link to={`/order/${order.reference}`} className="th-btn th-btn-outline th-btn-sm">
                        Details
                      </Link>
                      {order.status === 'processing' ? (
                        <button
                          type="button"
                          onClick={() => cancelOrder(order.reference)}
                          className="th-btn th-btn-ghost th-btn-sm hover:text-sale"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-wrap gap-3 border-t border-line-soft pt-3">
                    {order.items.map((line) => (
                      <li key={line.productId} className="flex items-center gap-2">
                        <ProductImage
                          src={line.image}
                          alt={line.name}
                          className="h-10 w-10 rounded bg-surface-panel"
                        />
                        <span className="text-xs text-ink-muted">
                          {line.name}
                          <span className="block text-ink-faint">Qty {line.quantity}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === 'wishlist' ? (
          <ProductGrid
            products={wishlistProducts}
            loading={wishlistLoading}
            skeletonCount={4}
            layout="listing"
            emptyTitle="Your wishlist is empty"
            emptyMessage="Tap the heart on any product to save it here. Signed-in wishlists follow you between devices."
            emptyAction={
              <Link to="/shop" className="th-btn th-btn-primary th-btn-md mt-1">
                Find something to save
              </Link>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
