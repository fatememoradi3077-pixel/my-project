/** Map database rows to the JSON shape the storefront consumes. */

const num = (value) => (value === null || value === undefined ? null : Number(value));

export function toCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image,
    description: row.description,
    sortOrder: row.sort_order,
    productCount: row.product_count === undefined ? undefined : Number(row.product_count),
  };
}

export function toProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    brand: row.brand,
    price: num(row.price),
    originalPrice: num(row.original_price),
    image: row.image,
    gallery: row.gallery || [],
    rating: num(row.rating),
    reviewCount: Number(row.review_count || 0),
    stock: Number(row.stock || 0),
    inStock: Number(row.stock || 0) > 0,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    isOnSale: row.is_on_sale,
    specifications: row.specifications || {},
    createdAt: row.created_at,
  };
}

export function toReview(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    customerName: row.customer_name,
    avatar: row.avatar,
    rating: Number(row.rating),
    comment: row.comment,
    verified: row.verified,
    createdAt: row.created_at,
  };
}

export function toTestimonial(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerName: row.customer_name,
    avatar: row.avatar,
    rating: Number(row.rating),
    comment: row.comment,
    verified: row.verified,
  };
}

export function toOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    reference: row.reference,
    customerId: row.customer_id,
    customerEmail: row.customer_email,
    items: row.items || [],
    subtotal: num(row.subtotal),
    shipping: num(row.shipping),
    total: num(row.total),
    status: row.status,
    shippingAddress: row.shipping_address,
    deliveryMethod: row.delivery_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
  };
}

export function toPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    image: row.image,
    author: row.author,
    tag: row.tag,
    createdAt: row.created_at,
  };
}

export function toUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}
