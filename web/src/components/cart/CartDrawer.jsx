import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { Drawer } from '../ui/Modal.jsx';
import { EmptyState, ProductImage } from '../ui/primitives.jsx';
import { currency } from '../../lib/format.js';
import { BRAND } from '../../lib/content.js';
import { useCart } from '../../context/CartContext.jsx';

export function CartDrawer() {
  const cart = useCart();
  const progress = Math.min((cart.subtotal / BRAND.freeShippingThreshold) * 100, 100);

  return (
    <Drawer
      open={cart.isOpen}
      onClose={cart.close}
      title={`Your cart (${cart.count})`}
      footer={
        cart.items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">Subtotal</span>
              <span className="font-display text-lg font-extrabold text-ink">{currency(cart.subtotal)}</span>
            </div>
            <Link to="/checkout" onClick={cart.close} className="th-btn th-btn-primary th-btn-md w-full">
              CHECKOUT
            </Link>
            <button
              type="button"
              onClick={cart.clear}
              className="w-full text-center text-xs font-medium text-ink-faint transition-colors hover:text-sale"
            >
              Clear cart
            </button>
          </div>
        ) : null
      }
    >
      {cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse the store and add something you like — free shipping starts at $99."
          action={
            <Link to="/shop" onClick={cart.close} className="th-btn th-btn-primary th-btn-md mt-1">
              START SHOPPING
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-md border border-line bg-surface-card p-3">
            <div className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Truck className="h-4 w-4 text-brand" aria-hidden="true" />
              {cart.qualifiesForFreeShipping ? (
                <span className="text-success">You qualify for free shipping.</span>
              ) : (
                <span>
                  Add <strong className="text-ink">{currency(cart.remainingForFreeShipping)}</strong> for free shipping.
                </span>
              )}
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <ul className="space-y-3">
            {cart.items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3 rounded-md border border-line bg-surface-card p-3">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 shrink-0 rounded bg-surface-panel"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={cart.close}
                    className="line-clamp-2 text-[13px] font-semibold text-ink transition-colors hover:text-brand"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-ink-muted">{currency(product.price)} each</p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center rounded border border-line bg-surface-panel">
                      <button
                        type="button"
                        className="th-icon-btn h-7 w-7 rounded-none"
                        onClick={() => cart.setQuantity(product.id, quantity - 1)}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        <Minus className="h-3 w-3" aria-hidden="true" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">{quantity}</span>
                      <button
                        type="button"
                        className="th-icon-btn h-7 w-7 rounded-none"
                        onClick={() => cart.setQuantity(product.id, quantity + 1)}
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        <Plus className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-ink">
                        {currency(product.price * quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => cart.remove(product.id)}
                        className="th-icon-btn h-7 w-7 hover:text-sale"
                        aria-label={`Remove ${product.name} from cart`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Drawer>
  );
}
