/** Public catalogue: categories, products, reviews, testimonials and blog posts. */
import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { h, asInt } from '../helpers.js';
import { toCategory, toPost, toProduct, toReview, toTestimonial } from '../serialize.js';

const router = Router();

const SORTS = {
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id ASC',
  newest: 'created_at DESC, id DESC',
  rating: 'rating DESC, review_count DESC',
  popular: 'review_count DESC, rating DESC',
  featured: 'is_featured DESC, id ASC',
};

router.get(
  '/categories',
  h(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.*, (SELECT COUNT(*)::int FROM products p WHERE p.category_slug = c.slug) AS product_count
       FROM categories c ORDER BY c.sort_order ASC, c.name ASC`,
    );
    res.json(rows.map(toCategory));
  }),
);

router.get(
  '/products',
  h(async (req, res) => {
    const params = [];
    const p = (value) => {
      params.push(value);
      return `$${params.length}`;
    };
    const where = [];

    if (req.query.category) where.push(`category_slug = ${p(String(req.query.category))}`);
    if (req.query.brand) {
      const brands = String(req.query.brand)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (brands.length) where.push(`brand = ANY(${p(brands)})`);
    }
    if (req.query.featured === '1' || req.query.featured === 'true') where.push('is_featured = true');
    if (req.query.onSale === '1' || req.query.onSale === 'true') where.push('is_on_sale = true');
    if (req.query.isNew === '1' || req.query.isNew === 'true') where.push('is_new = true');
    if (req.query.inStock === '1' || req.query.inStock === 'true') where.push('stock > 0');

    const minPrice = Number.parseFloat(String(req.query.minPrice ?? ''));
    if (Number.isFinite(minPrice)) where.push(`price >= ${p(minPrice)}`);
    const maxPrice = Number.parseFloat(String(req.query.maxPrice ?? ''));
    if (Number.isFinite(maxPrice)) where.push(`price <= ${p(maxPrice)}`);
    const rating = Number.parseFloat(String(req.query.rating ?? ''));
    if (Number.isFinite(rating) && rating > 0) where.push(`rating >= ${p(rating)}`);

    if (req.query.q) {
      const term = `%${String(req.query.q).trim()}%`;
      where.push(
        `(name ILIKE ${p(term)} OR brand ILIKE ${p(term)} OR category_name ILIKE ${p(term)} OR keywords ILIKE ${p(term)})`,
      );
    }
    if (req.query.ids) {
      const ids = String(req.query.ids)
        .split(',')
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value));
      if (ids.length === 0) return res.json({ items: [], total: 0, page: 1, pages: 0 });
      where.push(`id = ANY(${p(ids)}::int[])`);
    }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limit = Math.min(Math.max(asInt(req.query.limit, 12) ?? 12, 1), 48);
    const page = Math.max(asInt(req.query.page, 1) ?? 1, 1);
    const sort = SORTS[String(req.query.sort ?? 'featured')] ?? SORTS.featured;

    const { rows } = await query(
      `SELECT * FROM products ${clause} ORDER BY ${sort} LIMIT $${params.length + 1} OFFSET $${
        params.length + 2
      }`,
      [...params, limit, (page - 1) * limit],
    );
    const countResult = await query(`SELECT COUNT(*)::int AS total FROM products ${clause}`, params);
    const total = countResult.rows[0].total;

    res.json({
      items: rows.map(toProduct),
      total,
      page,
      pages: Math.max(Math.ceil(total / limit), total > 0 ? 1 : 0),
      limit,
    });
  }),
);

router.get(
  '/products/facets',
  h(async (_req, res) => {
    const brands = await query('SELECT DISTINCT brand FROM products ORDER BY brand ASC');
    const range = await query(
      'SELECT COALESCE(MIN(price), 0)::float AS min, COALESCE(MAX(price), 0)::float AS max FROM products',
    );
    const categories = await query(
      `SELECT c.name, c.slug, (SELECT COUNT(*)::int FROM products p WHERE p.category_slug = c.slug) AS product_count
       FROM categories c ORDER BY c.sort_order ASC`,
    );
    res.json({
      brands: brands.rows.map((row) => row.brand),
      priceRange: { min: Math.floor(range.rows[0].min), max: Math.ceil(range.rows[0].max) },
      categoryList: categories.rows.map((row) => ({
        name: row.name,
        slug: row.slug,
        productCount: row.product_count,
      })),
    });
  }),
);

router.get(
  '/products/:slug',
  h(async (req, res) => {
    const { rows } = await query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    const product = rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const reviews = await query(
      'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC LIMIT 12',
      [product.id],
    );
    const related = await query(
      'SELECT * FROM products WHERE category_slug = $1 AND id <> $2 ORDER BY is_featured DESC, rating DESC LIMIT 4',
      [product.category_slug, product.id],
    );

    res.json({
      ...toProduct(product),
      reviews: reviews.rows.map(toReview),
      related: related.rows.map(toProduct),
    });
  }),
);

router.post(
  '/products/:slug/reviews',
  requireAuth,
  h(async (req, res) => {
    const rating = asInt(req.body?.rating);
    const comment = String(req.body?.comment ?? '').trim();
    const errors = {};
    if (!rating || rating < 1 || rating > 5) errors.rating = 'Choose a rating between 1 and 5.';
    if (comment.length < 8) errors.comment = 'Please write at least a short sentence.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const { rows } = await query('SELECT * FROM products WHERE slug = $1', [req.params.slug]);
    const product = rows[0];
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const inserted = await query(
      `INSERT INTO reviews (product_id, customer_name, rating, comment, verified)
       VALUES ($1, $2, $3, $4, true) RETURNING *`,
      [product.id, req.user.name, rating, comment],
    );

    await query(
      `UPDATE products SET
         rating = ROUND((SELECT AVG(rating)::numeric FROM reviews WHERE product_id = $1), 1),
         review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = $1)
       WHERE id = $1`,
      [product.id],
    );

    res.status(201).json(toReview(inserted.rows[0]));
  }),
);

router.get(
  '/testimonials',
  h(async (_req, res) => {
    const { rows } = await query('SELECT * FROM testimonials ORDER BY sort_order ASC, id ASC');
    res.json(rows.map(toTestimonial));
  }),
);

router.get(
  '/posts',
  h(async (_req, res) => {
    const { rows } = await query('SELECT * FROM posts ORDER BY created_at DESC, id DESC');
    res.json(rows.map(toPost));
  }),
);

router.get(
  '/posts/:slug',
  h(async (req, res) => {
    const { rows } = await query('SELECT * FROM posts WHERE slug = $1', [req.params.slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
    res.json(toPost(rows[0]));
  }),
);

export default router;
