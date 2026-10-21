/** Accounts, sessions, wishlists and orders. */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, withTransaction } from '../db.js';
import { clearSessionCookie, requireAuth, setSessionCookie, signToken } from '../auth.js';
import { isEmail, h, asInt, priceOrder } from '../helpers.js';
import { toOrder, toUser } from '../serialize.js';

const router = Router();

const EMAIL_MAX = 160;
const ORDER_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

function makeReference() {
  return `TH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

router.post(
  '/auth/register',
  h(async (req, res) => {
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const errors = {};
    if (name.length < 2) errors.name = 'Please enter your name.';
    if (!isEmail(email) || email.length > EMAIL_MAX) errors.email = 'Enter a valid email address.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const existing = await query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(409).json({ errors: { email: 'An account with this email already exists.' } });
    }

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'customer') RETURNING *`,
      [name, email, bcrypt.hashSync(password, 10)],
    );
    const user = toUser(rows[0]);
    setSessionCookie(res, signToken(user));
    res.status(201).json(user);
  }),
);

router.post(
  '/auth/login',
  h(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const errors = {};
    if (!isEmail(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Enter your password.';
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const safeUser = toUser(user);
    setSessionCookie(res, signToken(safeUser));
    res.json(safeUser);
  }),
);

router.post('/auth/logout', (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/auth/me', (req, res) => {
  res.json({ user: req.user ?? null });
});

router.get(
  '/wishlist',
  requireAuth,
  h(async (req, res) => {
    const { rows } = await query('SELECT product_ids FROM wishlist WHERE customer_id = $1', [req.user.id]);
    res.json({ productIds: rows[0]?.product_ids ?? [] });
  }),
);

router.put(
  '/wishlist',
  requireAuth,
  h(async (req, res) => {
    const input = Array.isArray(req.body?.productIds) ? req.body.productIds : null;
    if (!input) return res.status(400).json({ error: 'productIds must be an array' });
    const ids = [...new Set(input.map((value) => asInt(value)).filter(Boolean))].slice(0, 200);

    await query(
      `INSERT INTO wishlist (customer_id, product_ids, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (customer_id) DO UPDATE SET product_ids = EXCLUDED.product_ids, updated_at = now()`,
      [req.user.id, JSON.stringify(ids)],
    );
    res.json({ productIds: ids });
  }),
);

router.post(
  '/orders',
  h(async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const contact = req.body?.contact ?? {};
    const address = req.body?.shippingAddress ?? {};
    const deliveryMethod = String(req.body?.deliveryMethod ?? 'standard');

    const errors = {};
    if (items.length === 0) errors.items = 'Your cart is empty.';
    if (String(contact.name ?? '').trim().length < 2) errors.name = 'Enter the name for this order.';
    if (!isEmail(contact.email)) errors.email = 'Enter a valid email address.';
    if (String(contact.phone ?? '').trim().length < 6) errors.phone = 'Enter a contact phone number.';
    if (deliveryMethod !== 'pickup') {
      if (String(address.line1 ?? '').trim().length < 4) errors.line1 = 'Enter your street address.';
      if (String(address.city ?? '').trim().length < 2) errors.city = 'Enter your city.';
      if (String(address.postalCode ?? '').trim().length < 3) errors.postalCode = 'Enter your postcode.';
      if (String(address.country ?? '').trim().length < 2) errors.country = 'Choose a country.';
    }
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const priced = await priceOrder(items, deliveryMethod);
    if (priced.error) return res.status(400).json({ error: priced.error });

    const order = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO orders (
           customer_id, customer_email, reference, items, subtotal, shipping, total,
           status, shipping_address, delivery_method, payment_status
         ) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, 'processing', $8::jsonb, $9, 'demo_not_processed')
         RETURNING *`,
        [
          req.user?.id ?? null,
          String(contact.email).trim().toLowerCase(),
          makeReference(),
          JSON.stringify(priced.lines),
          priced.subtotal,
          priced.shipping,
          priced.total,
          JSON.stringify({
            name: contact.name,
            phone: contact.phone,
            line1: address.line1 ?? '',
            line2: address.line2 ?? '',
            city: address.city ?? '',
            region: address.region ?? '',
            postalCode: address.postalCode ?? '',
            country: address.country ?? '',
          }),
          deliveryMethod,
        ],
      );

      for (const line of priced.lines) {
        await client.query('UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2', [
          line.quantity,
          line.productId,
        ]);
      }
      return rows[0];
    });

    res.status(201).json(toOrder(order));
  }),
);

router.get(
  '/orders',
  requireAuth,
  h(async (req, res) => {
    const { rows } = await query(
      'SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [req.user.id],
    );
    res.json(rows.map(toOrder));
  }),
);

router.get(
  '/orders/:reference',
  requireAuth,
  h(async (req, res) => {
    const { rows } = await query('SELECT * FROM orders WHERE reference = $1 AND customer_id = $2', [
      req.params.reference,
      req.user.id,
    ]);
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(toOrder(rows[0]));
  }),
);

router.patch(
  '/orders/:reference/cancel',
  requireAuth,
  h(async (req, res) => {
    const { rows } = await query(
      'SELECT * FROM orders WHERE reference = $1 AND customer_id = $2',
      [req.params.reference, req.user.id],
    );
    const order = rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'processing') {
      return res.status(409).json({ error: `An order that is already ${order.status} cannot be cancelled.` });
    }
    const updated = await query(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [order.id],
    );
    res.json(toOrder(updated.rows[0]));
  }),
);

export { ORDER_STATUSES };
export default router;
