/**
 * Applies the schema and seeds the catalogue when the database is empty.
 * Safe to run repeatedly.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';
import { categories, products, posts, users, testimonials, reviewPool } from './seed-data.js';

const here = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const user of users) {
      await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, bcrypt.hashSync(user.password, 10), user.role],
      );
    }

    const categoryIds = new Map();
    for (const category of categories) {
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, image, description, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           image = EXCLUDED.image,
           description = EXCLUDED.description,
           sort_order = EXCLUDED.sort_order
         RETURNING id`,
        [category.name, category.slug, category.image, category.description, category.sortOrder],
      );
      categoryIds.set(category.slug, rows[0].id);
    }

    const productIds = [];
    for (const [index, product] of products.entries()) {
      const category = categories.find((item) => item.slug === product.category);
      const { rows } = await client.query(
        `INSERT INTO products (
           name, slug, description, category_id, category_slug, category_name, brand,
           price, original_price, image, gallery, rating, review_count, stock,
           is_featured, is_new, is_on_sale, specifications, keywords, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
           $15, $16, $17, $18::jsonb, $19, now() - make_interval(hours => $20)
         )
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          product.name,
          product.slug,
          product.description,
          categoryIds.get(product.category) ?? null,
          product.category,
          category?.name ?? product.category,
          product.brand,
          product.price,
          product.originalPrice,
          product.image,
          JSON.stringify(product.gallery ?? []),
          product.rating,
          product.reviewCount,
          product.stock,
          product.isFeatured,
          product.isNew,
          product.isOnSale,
          JSON.stringify(product.specifications ?? {}),
          [product.name, product.brand, product.category, category?.name, product.description].join(' '),
          index * 7,
        ],
      );
      if (rows[0]) productIds.push(rows[0].id);
    }

    // Three reviews per product, deterministic so reseeding stays stable.
    for (const [index, productId] of productIds.entries()) {
      const { rows } = await client.query('SELECT COUNT(*)::int AS n FROM reviews WHERE product_id = $1', [
        productId,
      ]);
      if (rows[0].n > 0) continue;
      for (let offset = 0; offset < 3; offset += 1) {
        const review = reviewPool[(index + offset) % reviewPool.length];
        await client.query(
          `INSERT INTO reviews (product_id, customer_name, rating, comment, verified, created_at)
           VALUES ($1, $2, $3, $4, true, now() - make_interval(days => $5))`,
          [productId, review.name, review.rating, review.comment, index + offset],
        );
      }
    }

    for (const item of testimonials) {
      const { rows } = await client.query('SELECT 1 FROM testimonials WHERE customer_name = $1', [
        item.customerName,
      ]);
      if (rows.length === 0) {
        await client.query(
          `INSERT INTO testimonials (customer_name, rating, comment, verified, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [item.customerName, item.rating, item.comment, item.verified, item.sortOrder],
        );
      }
    }

    for (const post of posts) {
      await client.query(
        `INSERT INTO posts (title, slug, excerpt, body, image, tag)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO NOTHING`,
        [post.title, post.slug, post.excerpt, post.body, post.image, post.tag],
      );
    }

    await client.query('COMMIT');
    console.log(`[migrate] seeded ${productIds.length} products and ${categories.length} categories`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  await pool.query(fs.readFileSync(path.join(here, 'schema.sql'), 'utf8'));
  console.log('[migrate] schema ready');

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n === 0) {
    await seed();
  } else {
    console.log(`[migrate] catalogue already contains ${rows[0].n} products — seed skipped`);
  }
  await pool.end();
}

main().catch(async (error) => {
  console.error('[migrate] failed:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
