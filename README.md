# TECHHAVEN — Smarter Tech. Better Life.

A premium, dark-themed electronics storefront: cinematic hero carousel, category grid, featured
products, limited-time offer with a live countdown, customer reviews, a full shop with filters,
product detail pages, cart drawer, live search, accounts, orders and an admin area.

Built as a real fullstack application — not a static mockup. Products, categories, reviews,
orders, wishlists, newsletter sign-ups and contact messages all live in PostgreSQL.

## Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, lucide-react           |
| API      | Node.js, Express, JWT session cookies (httpOnly), bcryptjs, `pg`    |
| Database | PostgreSQL 16                                                      |

## Running locally

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- Storefront: <http://localhost:3000>
- API: <http://localhost:8000/api/health>

The database schema and sample catalogue are applied automatically by the one-shot `migrate`
service before the API starts. Seeded demo accounts:

| Account                          | Role     | Can access          |
| -------------------------------- | -------- | ------------------- |
| `admin@techhaven.dev` / `Admin1234!` | admin    | Storefront + `/admin` |
| `demo@techhaven.dev` / `Demo1234!`   | customer | Storefront + `/account` |

## Checkout and payments

**No payment provider is connected to this deployment.** Checkout runs in a clearly labelled demo
mode: the order is recorded so the whole flow can be reviewed from the account area, no card
details are collected or stored, and no payment is ever taken. Wire up a provider before treating
any of this as a real store.

## Project layout

```
api/
  db/            schema.sql, idempotent migrate + seed, seed data (products, posts, accounts)
  src/routes/    catalog, account (auth/wishlist/orders), engagement, admin
  src/           express app, db pool, auth helpers, row serialisers
web/
  src/components/layout     announcement bar, sticky header with dropdowns, footer
  src/components/home       hero carousel, categories, featured, promo countdown, testimonials
  src/components/product    product card, grid, quick view
  src/components/cart       slide-out cart with free-shipping progress
  src/components/search     live search overlay with keyboard navigation
  src/components/shop       filterable listing shared by shop, deals and new arrivals
  src/pages                 routes (home, shop, product, blog, info, checkout, account, admin)
  src/context               auth, cart, wishlist and toast state
```

## Routes

`/` · `/shop` · `/deals` · `/new-arrivals` · `/product/:slug` · `/blog` · `/blog/:slug` ·
`/contact` · `/info/:slug` · `/checkout` · `/order/:reference` · `/account` · `/login` ·
`/signup` · `/admin`

## Notes

- Prices are shown in USD; free standard shipping applies above $99.
- Session cookies are same-origin (the dev server proxies `/api`), so auth works without CORS
  gymnastics in development.
- Operational details, sandbox specifics and verification commands live in [AGENTS.md](./AGENTS.md).
