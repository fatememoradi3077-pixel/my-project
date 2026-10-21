/** Administrator-only catalogue, inventory and order management. */
import { Router } from 'express';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { h, asInt, slugify, money } from '../helpers.js';
import { toCategory, toOrder, toProduct } from '../serialize.js';
import { ORDER_STATUSES } from './account.js';

const router = Router();
router.use(requireAdmin);

const toBool = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

router.get(
  '/products',
  h(async (req, res) => {
    const search = String(req.query.q ?? '').trim();
    const params = [];
    let clause = '';
    if (search) {
      params.push(`%${search}%`);
      clause = 'WHERE name ILIKE $1 OR brand ILIKE $1 OR category_name ILIKE $1';
    }
    const { rows } = await query(
      `SELECT * FROM products ${clause} ORDER BY created_at DESC, id DESC LIMIT 200`,
      params,
    );
    res.json(rows.map(toProduct));
  }),
);

router.post(
  '/products',
  h(async (req, res) => {
    const body = req.body ?? {};
    const name = String(body.name ?? '').trim();
    const price = Number.parseFloat(String(body.price ?? ''));
    const categorySlug = String(body.categorySlug ?? '').trim();

    const errors = {};
    if (name.length < 3) errors.name = 'Enter a product name.';
    if (!Number.isFinite(price) || price <= 0) errors.price = 'Enter a price greater than zero.';
    if (!categorySlug) errors.categorySlug = 'Choose a category.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const category = await query('SELECT * FROM categories WHERE slug = $1', [categorySlug]);
    if (!category.rows[0]) return res.status(400).json({ errors: { categorySlug: 'Unknown category.' } });

    const slug = slugify(body.slug || name);
    const originalPrice = Number.parseFloat(String(body.originalPrice ?? ''));

    const { rows } = await query(
      `INSERT INTO products (
         name, slug, description, category_id, category_slug, category_name, brand,
         price, original_price, image, gallery, rating, review_count, stock,
         is_featured, is_new, is_on_sale, specifications, keywords
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,0,0,$12,$13,$14,$15,$16::jsonb,$17)
       RETURNING *`,
      [
        name,
        slug,
        String(body.description ?? '').trim() || `${name} from TechHaven.`,
        category.rows[0].id,
        categorySlug,
        category.rows[0].name,
        String(body.brand ?? 'TechHaven').trim(),
        money(price),
        Number.isFinite(originalPrice) ? money(originalPrice) : null,
        body.image ? String(body.image) : category.rows[0].image,
        JSON.stringify(Array.isArray(body.gallery) ? body.gallery : []),
        asInt(body.stock, 0) ?? 0,
        Boolean(body.isFeatured),
        Boolean(body.isNew),
        Boolean(body.isOnSale),
        JSON.stringify(body.specifications ?? {}),
        [name, body.brand, categorySlug].join(' '),
      ],
    );
    res.status(201).json(toProduct(rows[0]));
  }),
);

router.patch(
  '/products/:id',
  h(async (req, res) => {
    const id = asInt(req.params.id);
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [id]);
    const current = rows[0];
    if (!current) return res.status(404).json({ error: 'Product not found' });

    const body = req.body ?? {};
    const sets = [];
    const params = [];
    const set = (column, value) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (body.name !== undefined) set('name', String(body.name).trim());
    if (body.description !== undefined) set('description', String(body.description));
    if (body.brand !== undefined) set('brand', String(body.brand).trim());
    if (body.price !== undefined) {
      const price = Number.parseFloat(String(body.price));
      if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ errors: { price: 'Invalid price.' } });
      set('price', money(price));
    }
    if (body.originalPrice !== undefined) {
      const original = Number.parseFloat(String(body.originalPrice));
      set('original_price', Number.isFinite(original) && original > 0 ? money(original) : null);
    }
    if (body.stock !== undefined) {
      const stock = asInt(body.stock);
      if (stock === null || stock < 0) return res.status(400).json({ errors: { stock: 'Stock cannot be negative.' } });
      set('stock', stock);
    }
    set('is_featured', toBool(body.isFeatured, current.is_featured));
    set('is_new', toBool(body.isNew, current.is_new));
    set('is_on_sale', toBool(body.isOnSale, current.is_on_sale));

    if (body.categorySlug !== undefined) {
      const category = await query('SELECT * FROM categories WHERE slug = $1', [String(body.categorySlug)]);
      if (!category.rows[0]) return res.status(400).json({ errors: { categorySlug: 'Unknown category.' } });
      set('category_slug', category.rows[0].slug);
      set('category_name', category.rows[0].name);
      set('category_id', category.rows[0].id);
    }

    const updated = await query(
      `UPDATE products SET ${sets.join(', ')} WHERE id = $${params.length + 1} RETURNING *`,
      [...params, id],
    );
    res.json(toProduct(updated.rows[0]));
  }),
);

router.delete(
  '/products/:id',
  h(async (req, res) => {
    const id = asInt(req.params.id);
    const deleted = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (!deleted.rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true, id });
  }),
);

router.get(
  '/categories',
  h(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.*, (SELECT COUNT(*)::int FROM products p WHERE p.category_slug = c.slug) AS product_count
       FROM categories c ORDER BY c.sort_order ASC`,
    );
    res.json(rows.map(toCategory));
  }),
);

router.patch(
  '/categories/:id',
  h(async (req, res) => {
    const id = asInt(req.params.id);
    const body = req.body ?? {};
    const sets = [];
    const params = [];
    const set = (column, value) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };
    if (body.name !== undefined) set('name', String(body.name).trim());
    if (body.description !== undefined) set('description', String(body.description));
    if (body.sortOrder !== undefined) set('sort_order', asInt(body.sortOrder, 0) ?? 0);
    if (sets.length === 0) return res.status(400).json({ error: 'Nothing to update' });

    const updated = await query(
      `UPDATE categories SET ${sets.join(', ')} WHERE id = $${params.length + 1} RETURNING *`,
      [...params, id],
    );
    if (!updated.rows[0]) return res.status(404).json({ error: 'Category not found' });
    if (req.body?.name) {
      await query('UPDATE products SET category_name = $1 WHERE category_id = $2', [
        String(body.name).trim(),
        id,
      ]);
    }
    res.json(toCategory(updated.rows[0]));
  }),
);

router.get(
  '/orders',
  h(async (_req, res) => {
    const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200');
    res.json(rows.map(toOrder));
  }),
);

router.patch(
  '/orders/:id',
  h(async (req, res) => {
    const id = asInt(req.params.id);
    const status = String(req.body?.status ?? '');
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}` });
    }
    const updated = await query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (!updated.rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(toOrder(updated.rows[0]));
  }),
);

router.get(
  '/newsletter',
  h(async (_req, res) => {
    const { rows } = await query(
      'SELECT id, email, created_at FROM newsletter_subscriptions ORDER BY created_at DESC LIMIT 200',
    );
    res.json(rows.map((row) => ({ id: row.id, email: row.email, createdAt: row.created_at })));
  }),
);

export default router;
