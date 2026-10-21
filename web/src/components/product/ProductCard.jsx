import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingCart } from 'lucide-react';
import { Badge, Button, ProductImage } from '../ui/primitives.jsx';
import { RatingStars } from '../ui/RatingStars.jsx';
import { currency, discountPercent } from '../../lib/format.js';
import { useCart } from '../../context/CartContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export function ProductCard({ product, onQuickView, priority = false }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const toast = useToast();

  const discount = discountPercent(product.price, product.originalPrice);
  const saved = wishlist.has(product.id);
  const outOfStock = !product.inStock;

  const handleAdd = () => {
    if (outOfStock) return;
    cart.add(product, 1);
    toast.push({
      tone: 'success',
      title: 'Added to cart',
      message: `${product.name} is in your cart.`,
      action: (
        <button type="button" onClick={cart.open} className="text-[13px] font-semibold text-brand hover:text-brand-hover">
          View cart →
        </button>
      ),
    });
  };

  const handleWishlist = () => {
    wishlist.toggle(product.id);
    toast.push({
      tone: 'info',
      title: saved ? 'Removed from wishlist' : 'Saved to wishlist',
      message: product.name,
    });
  };

  return (
    <article className="th-card group flex h-full flex-col overflow-hidden transition-colors hover:border-brand/45">
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" aria-label={product.name}>
          <ProductImage
            src={product.image}
            alt={product.name}
            eager={priority}
            className="h-40 w-full bg-surface-panel sm:h-44"
            imgClassName="p-3 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
          />
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.isNew ? <Badge tone="new">NEW</Badge> : null}
          {product.isOnSale ? <Badge tone="sale">SALE</Badge> : null}
          {discount > 0 ? <Badge tone="muted">−{discount}%</Badge> : null}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
            aria-pressed={saved}
            className={`th-icon-btn border border-line bg-surface-panel/85 backdrop-blur ${
              saved ? 'text-brand' : ''
            }`}
          >
            <Heart className={`h-4 w-4 ${saved ? 'animate-pop fill-current' : ''}`} aria-hidden="true" />
          </button>
          {onQuickView ? (
            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label={`Quick view ${product.name}`}
              className="th-icon-btn border border-line bg-surface-panel/85 opacity-100 backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {outOfStock ? (
          <div className="absolute inset-x-3 bottom-3 rounded bg-surface-base/85 py-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-sale backdrop-blur">
            Out of stock
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-3.5 pt-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {product.categoryName}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink">
          <Link to={`/product/${product.slug}`} className="transition-colors hover:text-brand">
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <RatingStars rating={product.rating} />
          <span className="text-[11px] text-ink-muted">({product.reviewCount})</span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-base font-extrabold text-brand">{currency(product.price)}</span>
          {product.originalPrice ? (
            <span className="text-xs text-ink-faint line-through">{currency(product.originalPrice)}</span>
          ) : null}
        </div>

        <div className="mt-3 flex items-stretch gap-2 pt-1">
          <Button
            onClick={handleAdd}
            disabled={outOfStock}
            size="sm"
            className="flex-1"
            aria-label={`Add ${product.name} to cart`}
          >
            {outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
          </Button>
          <button
            type="button"
            onClick={cart.open}
            aria-label="View cart"
            className="th-icon-btn h-auto w-10 border border-line bg-surface-raised text-ink hover:text-brand"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
