/** Small helpers shared by the route modules. */
import { query } from './db.js';

/** Wrap an async handler so rejected promises reach the error middleware. */
export const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const isEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const asInt = (value, fallback = null) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const money = (value) => Math.round(Number(value) * 100) / 100;

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const FREE_SHIPPING_THRESHOLD = 99;
export const DELIVERY_FEES = { standard: 9.99, express: 14.99, pickup: 0 };

/** Recalculate an order server-side so client-supplied prices are never trusted. */
export async function priceOrder(items, deliveryMethod = 'standard') {
  const lines = [];
  for (const item of items) {
    const productId = asInt(item.productId);
    const quantity = asInt(item.quantity, 1);
    if (!productId || !quantity || quantity < 1 || quantity > 99) {
      return { error: 'Each cart line needs a valid product and a quantity between 1 and 99.' };
    }
    const { rows } = await query('SELECT * FROM products WHERE id = $1', [productId]);
    const product = rows[0];
    if (!product) return { error: `Product ${productId} is no longer available.` };
    if (product.stock <= 0) return { error: `${product.name} is out of stock.` };
    if (quantity > product.stock) {
      return { error: `Only ${product.stock} units of ${product.name} are available.` };
    }
    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: money(product.price),
      quantity,
      lineTotal: money(Number(product.price) * quantity),
    });
  }

  const subtotal = money(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const fee = DELIVERY_FEES[deliveryMethod] ?? DELIVERY_FEES.standard;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || deliveryMethod === 'pickup' ? 0 : fee;
  return { lines, subtotal, shipping, total: money(subtotal + shipping) };
}
