/** Thin fetch wrapper around the TechHaven API (same-origin via the dev proxy). */
import { qs } from './format.js';

const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  /** Field-level validation errors, when the API returned them. */
  get fieldErrors() {
    return this.data?.errors ?? null;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const raw = await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(data?.error || `Request failed (${response.status})`, response.status, data);
  }
  return data;
}

const get = (path, params) => request(`${path}${params ? qs(params) : ''}`);
const post = (path, body) => request(path, { method: 'POST', body });
const patch = (path, body) => request(path, { method: 'PATCH', body });
const put = (path, body) => request(path, { method: 'PUT', body });
const del = (path) => request(path, { method: 'DELETE' });

export const api = {
  health: () => get('/health'),
  categories: () => get('/categories'),
  testimonials: () => get('/testimonials'),
  posts: {
    list: () => get('/posts'),
    get: (slug) => get(`/posts/${slug}`),
  },
  products: {
    list: (params) => get('/products', params),
    facets: () => get('/products/facets'),
    get: (slug) => get(`/products/${slug}`),
    review: (slug, body) => post(`/products/${slug}/reviews`, body),
  },
  auth: {
    me: () => get('/auth/me'),
    login: (body) => post('/auth/login', body),
    register: (body) => post('/auth/register', body),
    logout: () => post('/auth/logout'),
  },
  wishlist: {
    get: () => get('/wishlist'),
    put: (productIds) => put('/wishlist', { productIds }),
  },
  orders: {
    create: (body) => post('/orders', body),
    list: () => get('/orders'),
    get: (reference) => get(`/orders/${reference}`),
    cancel: (reference) => patch(`/orders/${reference}/cancel`),
  },
  newsletter: (email) => post('/newsletter', { email }),
  contact: (body) => post('/contact', body),
  admin: {
    products: (q) => get('/admin/products', q ? { q } : undefined),
    createProduct: (body) => post('/admin/products', body),
    updateProduct: (id, body) => patch(`/admin/products/${id}`, body),
    deleteProduct: (id) => del(`/admin/products/${id}`),
    categories: () => get('/admin/categories'),
    updateCategory: (id, body) => patch(`/admin/categories/${id}`, body),
    orders: () => get('/admin/orders'),
    updateOrder: (id, status) => patch(`/admin/orders/${id}`, { status }),
    newsletter: () => get('/admin/newsletter'),
  },
};
