import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyState, ProductImage, Skeleton } from '../components/ui/primitives.jsx';
import { SelectField, TextAreaField, TextField } from '../components/ui/FormField.jsx';
import { api } from '../lib/api.js';
import { currency, formatDate } from '../lib/format.js';
import { ORDER_STATUS_TONES } from '../lib/content.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const TABS = [
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'newsletter', label: 'Newsletter' },
];

const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];
const EMPTY_PRODUCT = {
  name: '',
  brand: 'TechHaven',
  categorySlug: '',
  price: '',
  originalPrice: '',
  stock: '10',
  image: '',
  description: '',
  isFeatured: false,
  isNew: false,
  isOnSale: false,
};

function ProductRow({ product, categories, onSaved, onDeleted }) {
  const toast = useToast();
  const [draft, setDraft] = useState({
    price: String(product.price),
    stock: String(product.stock),
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isOnSale: product.isOnSale,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft({
      price: String(product.price),
      stock: String(product.stock),
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isOnSale: product.isOnSale,
    });
  }, [product]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.admin.updateProduct(product.id, {
        price: draft.price,
        stock: draft.stock,
        isFeatured: draft.isFeatured,
        isNew: draft.isNew,
        isOnSale: draft.isOnSale,
      });
      onSaved(updated);
      toast.push({ tone: 'success', title: 'Saved', message: `${updated.name} updated.` });
    } catch (error) {
      toast.push({ tone: 'error', title: 'Could not save', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      await api.admin.deleteProduct(product.id);
      onDeleted(product.id);
      toast.push({ tone: 'info', title: 'Product deleted', message: product.name });
    } catch (error) {
      toast.push({ tone: 'error', title: 'Could not delete', message: error.message });
    }
  };

  return (
    <tr className="border-b border-line-soft align-middle">
      <td className="py-3 pr-3">
        <div className="flex items-center gap-3">
          <ProductImage src={product.image} alt={product.name} className="h-10 w-10 shrink-0 rounded bg-surface-panel" />
          <div className="min-w-0">
            <Link
              to={`/product/${product.slug}`}
              className="line-clamp-1 text-[13px] font-medium text-ink transition-colors hover:text-brand"
            >
              {product.name}
            </Link>
            <p className="text-[11px] text-ink-faint">
              {product.brand} · {product.categoryName}
            </p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min="0"
          step="0.01"
          value={draft.price}
          onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
          aria-label={`Price for ${product.name}`}
          className="th-input w-24 px-2 py-1.5 text-[13px]"
        />
      </td>
      <td className="px-2 py-3">
        <input
          type="number"
          min="0"
          value={draft.stock}
          onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))}
          aria-label={`Stock for ${product.name}`}
          className={`th-input w-20 px-2 py-1.5 text-[13px] ${Number(draft.stock) === 0 ? 'border-sale' : ''}`}
        />
      </td>
      <td className="px-2 py-3">
        <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted">
          {[
            ['isFeatured', 'Featured'],
            ['isNew', 'New'],
            ['isOnSale', 'Sale'],
          ].map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={draft[key]}
                onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))}
                className="h-3.5 w-3.5 rounded border-line accent-brand"
              />
              {label}
            </label>
          ))}
        </div>
      </td>
      <td className="px-2 py-3 text-right">
        <div className="flex justify-end gap-1.5">
          <Button size="sm" variant="outline" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <button
            type="button"
            onClick={remove}
            className="th-icon-btn hover:text-sale"
            aria-label={`Delete ${product.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);
  const [creating, setCreating] = useState(false);

  const loadProducts = useCallback(
    async (term) => {
      setLoadingData(true);
      try {
        const data = await api.admin.products(term || undefined);
        setProducts(data);
      } catch (error) {
        toast.push({ tone: 'error', title: 'Could not load products', message: error.message });
      } finally {
        setLoadingData(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (!isAdmin) return;
    loadProducts('');
    api.admin.categories().then(setCategories).catch(() => {});
  }, [isAdmin, loadProducts]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'orders') {
      setLoadingData(true);
      api.admin
        .orders()
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
    if (tab === 'newsletter') {
      setLoadingData(true);
      api.admin
        .newsletter()
        .then(setSubscribers)
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [isAdmin, tab]);

  useEffect(() => {
    if (!isAdmin || tab !== 'products') return undefined;
    const timer = window.setTimeout(() => loadProducts(search), 300);
    return () => window.clearTimeout(timer);
  }, [search, isAdmin, tab, loadProducts]);

  if (loading) {
    return (
      <div className="th-container py-12">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="th-container py-16">
        <EmptyState
          icon={ShieldAlert}
          title="Administrator access required"
          message={
            user
              ? 'Your account does not have permission to manage the store. Ask an administrator if you need access.'
              : 'Sign in with an administrator account to manage products, inventory and orders.'
          }
          action={
            <Link to={user ? '/' : '/login'} className="th-btn th-btn-primary th-btn-md mt-1">
              {user ? 'Back to store' : 'Sign in'}
            </Link>
          }
        />
      </div>
    );
  }

  const createProduct = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      const created = await api.admin.createProduct({
        ...newProduct,
        price: newProduct.price,
        originalPrice: newProduct.originalPrice || undefined,
        stock: newProduct.stock,
      });
      setProducts((current) => [created, ...current]);
      setNewProduct(EMPTY_PRODUCT);
      setShowCreate(false);
      toast.push({ tone: 'success', title: 'Product created', message: created.name });
    } catch (error) {
      toast.push({ tone: 'error', title: 'Could not create product', message: error.message });
    } finally {
      setCreating(false);
    }
  };

  const updateOrderStatus = async (order, status) => {
    try {
      const updated = await api.admin.updateOrder(order.id, status);
      setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)));
      toast.push({ tone: 'success', title: 'Order updated', message: `${updated.reference} → ${status}` });
    } catch (error) {
      toast.push({ tone: 'error', title: 'Could not update order', message: error.message });
    }
  };

  return (
    <div className="th-container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="th-eyebrow">Admin</p>
          <h1 className="mt-2 font-display text-[26px] font-extrabold uppercase tracking-tight text-ink sm:text-[30px]">
            Store management
          </h1>
        </div>
        <Badge tone="new">Signed in as {user.name}</Badge>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            aria-current={tab === item.key ? 'page' : undefined}
            className={`rounded-md px-3.5 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors ${
              tab === item.key ? 'bg-surface-raised text-brand' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'products' ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products by name, brand or category"
                aria-label="Search products"
                className="th-input max-w-sm"
              />
              <Button variant="outline" onClick={() => setShowCreate((current) => !current)}>
                <Plus className="h-4 w-4" aria-hidden="true" /> {showCreate ? 'Close' : 'New product'}
              </Button>
            </div>

            {showCreate ? (
              <form onSubmit={createProduct} className="th-card mt-4 grid gap-4 p-5 sm:grid-cols-2">
                <TextField
                  label="Name"
                  required
                  value={newProduct.name}
                  onChange={(event) => setNewProduct((current) => ({ ...current, name: event.target.value }))}
                />
                <TextField
                  label="Brand"
                  value={newProduct.brand}
                  onChange={(event) => setNewProduct((current) => ({ ...current, brand: event.target.value }))}
                />
                <SelectField
                  label="Category"
                  required
                  value={newProduct.categorySlug}
                  onChange={(event) => setNewProduct((current) => ({ ...current, categorySlug: event.target.value }))}
                  options={[
                    { value: '', label: 'Choose a category' },
                    ...categories.map((category) => ({ value: category.slug, label: category.name })),
                  ]}
                />
                <TextField
                  label="Image URL"
                  value={newProduct.image}
                  onChange={(event) => setNewProduct((current) => ({ ...current, image: event.target.value }))}
                  hint="Leave blank to use the category image."
                />
                <TextField
                  label="Price"
                  type="number"
                  step="0.01"
                  required
                  value={newProduct.price}
                  onChange={(event) => setNewProduct((current) => ({ ...current, price: event.target.value }))}
                />
                <TextField
                  label="Compare-at price (optional)"
                  type="number"
                  step="0.01"
                  value={newProduct.originalPrice}
                  onChange={(event) => setNewProduct((current) => ({ ...current, originalPrice: event.target.value }))}
                />
                <TextField
                  label="Stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(event) => setNewProduct((current) => ({ ...current, stock: event.target.value }))}
                />
                <div className="sm:col-span-2">
                  <TextAreaField
                    label="Description"
                    rows={3}
                    value={newProduct.description}
                    onChange={(event) => setNewProduct((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap gap-4 sm:col-span-2">
                  {[
                    ['isFeatured', 'Featured'],
                    ['isNew', 'New'],
                    ['isOnSale', 'On sale'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-muted">
                      <input
                        type="checkbox"
                        checked={newProduct[key]}
                        onChange={(event) =>
                          setNewProduct((current) => ({ ...current, [key]: event.target.checked }))
                        }
                        className="h-4 w-4 rounded border-line accent-brand"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating…' : 'CREATE PRODUCT'}
                  </Button>
                </div>
              </form>
            ) : null}

            {loadingData ? (
              <Skeleton className="mt-4 h-64 w-full" />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                message="Try a different search term, or create a new product."
                className="mt-4"
              />
            ) : (
              <div className="th-card mt-4 overflow-x-auto p-2">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                      <th className="px-1 py-2 font-semibold">Product</th>
                      <th className="px-2 py-2 font-semibold">Price</th>
                      <th className="px-2 py-2 font-semibold">Stock</th>
                      <th className="px-2 py-2 font-semibold">Flags</th>
                      <th className="px-2 py-2 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        categories={categories}
                        onSaved={(updated) =>
                          setProducts((current) => current.map((item) => (item.id === updated.id ? updated : item)))
                        }
                        onDeleted={(id) => setProducts((current) => current.filter((item) => item.id !== id))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}

        {tab === 'orders' ? (
          loadingData ? (
            <Skeleton className="h-64 w-full" />
          ) : orders.length === 0 ? (
            <EmptyState title="No orders yet" message="Orders placed at checkout appear here with their status." />
          ) : (
            <div className="th-card overflow-x-auto p-2">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line text-[11px] uppercase tracking-[0.1em] text-ink-faint">
                    <th className="px-2 py-2 font-semibold">Reference</th>
                    <th className="px-2 py-2 font-semibold">Customer</th>
                    <th className="px-2 py-2 font-semibold">Placed</th>
                    <th className="px-2 py-2 font-semibold">Total</th>
                    <th className="px-2 py-2 font-semibold">Items</th>
                    <th className="px-2 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-line-soft">
                      <td className="px-2 py-3">
                        <Link
                          to={`/order/${order.reference}`}
                          className="text-[13px] font-medium text-ink transition-colors hover:text-brand"
                        >
                          {order.reference}
                        </Link>
                        <span className="ml-2">
                          <span className={`th-badge ${ORDER_STATUS_TONES[order.status] ?? ''}`}>{order.status}</span>
                        </span>
                      </td>
                      <td className="px-2 py-3 text-[13px] text-ink-muted">{order.customerEmail}</td>
                      <td className="px-2 py-3 text-[13px] text-ink-muted">{formatDate(order.createdAt)}</td>
                      <td className="px-2 py-3 text-[13px] font-semibold text-ink">{currency(order.total)}</td>
                      <td className="px-2 py-3 text-[13px] text-ink-muted">{order.items.length}</td>
                      <td className="px-2 py-3">
                        <label className="sr-only" htmlFor={`status-${order.id}`}>
                          Status for {order.reference}
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(event) => updateOrderStatus(order, event.target.value)}
                          className="th-input w-auto px-2 py-1.5 text-[13px]"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {tab === 'newsletter' ? (
          loadingData ? (
            <Skeleton className="h-48 w-full" />
          ) : subscribers.length === 0 ? (
            <EmptyState title="No subscribers yet" message="Newsletter sign-ups from the footer appear here." />
          ) : (
            <ul className="th-card divide-y divide-line-soft p-2">
              {subscribers.map((subscriber) => (
                <li key={subscriber.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                  <span className="text-[13px] text-ink">{subscriber.email}</span>
                  <span className="text-[11px] text-ink-faint">{formatDate(subscriber.createdAt)}</span>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>

      <p className="mt-8 flex items-center gap-2 text-xs text-ink-faint">
        <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
        Customers cannot change their own order status or payment status — only administrators can move an order forward.
      </p>
    </div>
  );
}
