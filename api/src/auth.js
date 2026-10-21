import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { toUser } from './serialize.js';

export const COOKIE_NAME = 'th_session';
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET is not configured');
  return value;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), { expiresIn: TOKEN_TTL_SECONDS });
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: TOKEN_TTL_SECONDS * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

async function userFromRequest(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    return toUser(rows[0]);
  } catch {
    return null;
  }
}

/** Attaches req.user when a valid session exists, otherwise continues as a guest. */
export async function attachUser(req, _res, next) {
  try {
    req.user = await userFromRequest(req);
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Administrator access required' });
  next();
}
