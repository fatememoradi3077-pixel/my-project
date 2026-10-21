# AGENTS.md — TechHaven

Premium electronics storefront: React + Vite frontend, Express API, PostgreSQL. Both app
services run from the cloned source under `docker-compose.base44.yml`.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
curl -s localhost:3000/ >/dev/null && echo "web up"        # Vite dev server on host port 3000
curl -s localhost:8000/api/health                          # API also exposed on 8000 for debugging
docker compose -f docker-compose.base44.yml logs -f api
```

Everything is recreated from source on boot, so edits appear without rebuilding images:

- `web/` → Vite HMR in place.
- `api/` → `node --watch` restarts the server; no manual restart needed for most edits.

## Things that are not obvious

- **Single origin by design.** The browser only ever talks to the Vite dev server on port 3000,
  which proxies `/api` to the `api` service (`API_PROXY_TARGET`, default `http://api:4000`).
  Session cookies are httpOnly and same-origin, so no CORS/`credentials` handling is needed for
  the app itself. The API still has a CORS allowlist (`CORS_ORIGINS`, plus the preview origin) for
  direct calls.
- **Migrations and seed run as a one-shot `migrate` service** before the API starts. It is
  idempotent: the schema is `CREATE TABLE IF NOT EXISTS`, and seeding is skipped when the
  catalogue already has products. To reseed from scratch, drop the `db_data` volume
  (destroys orders and accounts too).
- **Seeded accounts** (see `api/db/seed-data.js`): `admin@techhaven.dev` / `Admin1234!` (role
  `admin`, can reach `/admin`) and `demo@techhaven.dev` / `Demo1234!` (customer). These are
  development fixtures — change or remove them before any real deployment.
- **No payment provider is connected.** Checkout is explicitly a demo: orders are stored with
  `payment_status = 'demo_not_processed'` and no card fields exist anywhere in the app. Do not
  describe it as taking payments.
- **Product imagery** is loaded from `images.unsplash.com` direct links (verified to return 200)
  listed in `api/db/seed-data.js`; `ProductImage` falls back to an in-app placeholder if a
  remote image fails, so a dead URL degrades instead of breaking the layout.
- **The hero background is a video, not a photo.** `web/public/videos/hero-background.mp4` is committed
  in the repo and served by Vite at `/videos/hero-background.mp4` (`HERO_VIDEO_SRC` in
  `web/src/lib/content.js`). It autoplays, loops and is muted (muted is what makes autoplay allowed in
  every browser), so it plays continuously while the slide copy rotates on top of it; swap the file to
  change the loop.
- **Promo countdown** is driven by `PROMO_ENDS_AT` in `web/src/lib/content.js`. It is a real
  countdown and renders an expired state after that timestamp — update the constant for a new
  campaign instead of hardcoding days/hours.
- **Cart and guest wishlist live in `localStorage`**; a signed-in wishlist is mirrored to the
  `wishlist` table and merged on sign-in.
- **`JWT_SECRET` is required at boot.** `.env.base44-defaults` ships a development placeholder so
  the stack always starts; the platform's real value arrives via `/run/base44/env` →
  `/run/base44/app.env` (`env_file`, listed last so it always wins).

## Verifying changes

- API: `curl -s localhost:8000/api/health`, `/api/products`, `/api/categories`.
- Frontend: it must be the Vite dev server that answers on port 3000 (live compile output in
  `docker compose logs web`), never a prebuilt bundle.
- Auth, checkout and admin flows need the seeded accounts above.
