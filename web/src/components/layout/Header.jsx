import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User } from 'lucide-react';
import { Logo } from './Logo.jsx';
import { Drawer } from '../ui/Modal.jsx';
import { api } from '../../lib/api.js';
import { MAIN_NAV } from '../../lib/content.js';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWishlist } from '../../context/WishlistContext.jsx';

const SHOP_MENU = [
  { label: 'All Products', to: '/shop', detail: 'The full TechHaven range' },
  { label: 'New Arrivals', to: '/new-arrivals', detail: 'Fresh in this month' },
  { label: 'Best Sellers', to: '/shop?sort=popular', detail: 'Most ordered by customers' },
  { label: 'Deals & Offers', to: '/deals', detail: 'Save up to 30% right now' },
];

export function Header({ onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openGroup, setOpenGroup] = useState(null);
  const location = useLocation();
  const cart = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let cancelled = false;
    api.categories()
      .then((data) => {
        if (!cancelled) setCategories(data.slice(0, 8));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const linkClass = ({ isActive }) =>
    `relative inline-flex items-center gap-1 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
      isActive ? 'text-brand' : 'text-ink-muted hover:text-ink'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? 'border-line bg-surface-base/95 backdrop-blur-md' : 'border-transparent bg-surface-base'
      }`}
    >
      <div className="th-container flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="th-icon-btn lg:hidden"
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Logo />
        </div>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {MAIN_NAV.map((item) => {
            if (!item.menu) {
              return (
                <NavLink key={item.label} to={item.to} end={item.to === '/'} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive ? (
                        <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-brand" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            }

            const items = item.menu === 'shop' ? SHOP_MENU : categories;
            return (
              <div key={item.label} className="group relative">
                <NavLink to={item.to} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" aria-hidden="true" />
                      {isActive ? (
                        <span className="absolute -bottom-px left-0 h-[2px] w-full rounded-full bg-brand" />
                      ) : null}
                    </>
                  )}
                </NavLink>
                <div className="invisible absolute left-0 top-full w-64 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="overflow-hidden rounded-lg border border-line bg-surface-panel p-1.5 shadow-card">
                    {items.map((entry) => (
                      <Link
                        key={entry.label ?? entry.slug}
                        to={entry.to ?? `/shop?category=${entry.slug}`}
                        className="flex items-center justify-between gap-3 rounded-md px-3 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:bg-surface-raised hover:text-brand"
                      >
                        <span>{entry.label ?? entry.name}</span>
                        {entry.detail ? (
                          <span className="hidden text-[10px] uppercase tracking-wider text-ink-faint xl:inline">
                            {entry.detail}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                    {item.menu === 'categories' && categories.length === 0 ? (
                      <p className="px-3 py-2 text-[13px] text-ink-faint">Loading categories…</p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-0.5">
          <button type="button" onClick={onOpenSearch} className="th-icon-btn" aria-label="Search products">
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <Link
            to={user ? '/account' : '/login'}
            className="th-icon-btn"
            aria-label={user ? `Account for ${user.name}` : 'Sign in'}
          >
            <User className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
          <Link
            to="/account?tab=wishlist"
            className="th-icon-btn relative hidden sm:inline-flex"
            aria-label={`Wishlist, ${wishlist.count} saved`}
          >
            <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            {wishlist.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-surface-raised px-1 text-[10px] font-bold text-brand">
                {wishlist.count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={cart.open}
            className="th-icon-btn relative"
            aria-label={`Open cart, ${cart.count} items`}
          >
            <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
            {cart.count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-[#120A03]">
                {cart.count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu" side="left">
        <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
          {MAIN_NAV.map((item) => {
            if (!item.menu) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
                      isActive ? 'bg-surface-raised text-brand' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              );
            }

            const items = item.menu === 'shop' ? SHOP_MENU : categories;
            const isOpen = openGroup === item.label;
            return (
              <div key={item.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : item.label)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.08em] text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {isOpen ? (
                  <div className="ml-2 mt-1 space-y-0.5 border-l border-line pl-3">
                    {items.map((entry) => (
                      <Link
                        key={entry.label ?? entry.slug}
                        to={entry.to ?? `/shop?category=${entry.slug}`}
                        className="block rounded px-2 py-2 text-[13px] text-ink-muted transition-colors hover:text-brand"
                      >
                        {entry.label ?? entry.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-6 space-y-2 border-t border-line-soft pt-4">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              onOpenSearch();
            }}
            className="th-btn th-btn-outline th-btn-md w-full"
          >
            <Search className="h-4 w-4" aria-hidden="true" /> Search products
          </button>
          <Link
            to={user ? '/account' : '/login'}
            className="th-btn th-btn-subtle th-btn-md w-full"
            onClick={() => setMobileOpen(false)}
          >
            <User className="h-4 w-4" aria-hidden="true" /> {user ? 'My account' : 'Sign in'}
          </Link>
        </div>
      </Drawer>
    </header>
  );
}
