import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { query } from './db.js';
import { attachUser } from './auth.js';
import catalogRoutes from './routes/catalog.js';
import accountRoutes from './routes/account.js';
import engagementRoutes from './routes/engagement.js';
import adminRoutes from './routes/admin.js';

const app = express();

/**
 * Origin allowlist. Same-origin requests through the Vite proxy send no Origin
 * header and are always allowed; anything else must be explicitly listed.
 */
const allowedOrigins = String(process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
if (process.env.BASE44_PUBLIC_HOST_SUFFIX) {
  allowedOrigins.push(`https://3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`);
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, service: 'techhaven-api' });
  } catch (error) {
    res.status(503).json({ ok: false, error: error.message });
  }
});

app.use('/api', catalogRoutes);
app.use('/api', accountRoutes);
app.use('/api', engagementRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' });
  }
  console.error('[api]', error);
  res.status(500).json({ error: 'Something went wrong on our side.' });
});

const port = Number.parseInt(process.env.PORT ?? '4000', 10);
app.listen(port, '0.0.0.0', () => {
  console.log(`[api] TechHaven API listening on http://0.0.0.0:${port}`);
});
