import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * The preview proxy reaches the dev server through a per-sandbox hostname, so the
 * allowlist is extended only while running inside the sandbox preview
 * (BASE44_PREVIEW_MODE=1). Outside the sandbox the Vite defaults apply unchanged.
 */
const allowedHosts = [];
if (process.env.BASE44_PREVIEW_MODE === '1') {
  if (process.env.BASE44_SANDBOX_HOST_DOMAIN) {
    allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`);
  }
  if (process.env.BASE44_PUBLIC_HOST_SUFFIX) {
    allowedHosts.push(`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`);
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    ...(allowedHosts.length ? { allowedHosts } : {}),
    // Single-origin wiring: the browser only ever talks to the dev server, which
    // forwards /api to the API container so session cookies stay same-origin.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://api:4000',
        changeOrigin: true,
      },
    },
  },
});
