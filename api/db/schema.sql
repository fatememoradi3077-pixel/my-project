-- TechHaven storefront schema (idempotent)

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  image       TEXT,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL,
  category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  category_slug  TEXT NOT NULL,
  category_name  TEXT NOT NULL,
  brand          TEXT NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  image          TEXT NOT NULL,
  gallery        JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating         NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count   INTEGER NOT NULL DEFAULT 0,
  stock          INTEGER NOT NULL DEFAULT 0,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_new         BOOLEAN NOT NULL DEFAULT false,
  is_on_sale     BOOLEAN NOT NULL DEFAULT false,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  keywords       TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_slug_idx ON products (category_slug);
CREATE INDEX IF NOT EXISTS products_featured_idx ON products (is_featured);

CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  avatar        TEXT,
  rating        INTEGER NOT NULL,
  comment       TEXT NOT NULL,
  verified      BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews (product_id);

CREATE TABLE IF NOT EXISTS testimonials (
  id            SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  avatar        TEXT,
  rating        INTEGER NOT NULL DEFAULT 5,
  comment       TEXT NOT NULL,
  verified      BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  customer_id      INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_email   TEXT NOT NULL,
  reference        TEXT NOT NULL UNIQUE,
  items            JSONB NOT NULL,
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping         NUMERIC(10,2) NOT NULL,
  total            NUMERIC(10,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'processing',
  shipping_address JSONB NOT NULL,
  delivery_method  TEXT NOT NULL DEFAULT 'standard',
  payment_status   TEXT NOT NULL DEFAULT 'demo_not_processed',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders (customer_id);

CREATE TABLE IF NOT EXISTS wishlist (
  id         SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id         SERIAL PRIMARY KEY,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
  id         SERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  excerpt    TEXT NOT NULL,
  body       TEXT NOT NULL,
  image      TEXT,
  author     TEXT NOT NULL DEFAULT 'TechHaven Team',
  tag        TEXT NOT NULL DEFAULT 'Guides',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
