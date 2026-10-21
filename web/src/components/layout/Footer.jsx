import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Lock, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Logo.jsx';
import { Spinner } from '../ui/primitives.jsx';
import { api } from '../../lib/api.js';
import { BRAND, FOOTER_COLUMNS, PAYMENT_METHODS, SOCIAL_LINKS } from '../../lib/content.js';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const subscribe = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setStatus({ state: 'error', message: 'Enter a valid email address.' });
      return;
    }
    setStatus({ state: 'loading', message: '' });
    try {
      const result = await api.newsletter(email.trim());
      setStatus({ state: 'success', message: result.message });
      setEmail('');
    } catch (error) {
      setStatus({ state: 'error', message: error.message ?? 'Could not subscribe right now.' });
    }
  };

  return (
    <footer className="mt-16 border-t border-line bg-surface-panel">
      <div className="th-container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Your ultimate destination for premium electronics and gadgets. Quality, trusted service, always.
            </p>
            <ul className="mt-5 space-y-2 text-[13px] text-ink-muted">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-brand">
                  {BRAND.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                <a href={`mailto:${BRAND.supportEmail}`} className="hover:text-brand">
                  {BRAND.supportEmail}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                {BRAND.address}
              </li>
            </ul>
            <ul className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="th-chip transition-colors hover:border-brand hover:text-brand"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-ink">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-[13px] text-ink-muted transition-colors hover:text-brand">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 rounded-lg border border-line bg-surface-card p-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h3 className="font-display text-base font-extrabold uppercase tracking-tight text-ink">Stay connected</h3>
            <p className="mt-1.5 text-sm text-ink-muted">
              Subscribe to get the latest updates, restocks and members-only offers.
            </p>
          </div>
          <form onSubmit={subscribe} noValidate>
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status.state !== 'loading') setStatus({ state: 'idle', message: '' });
                }}
                placeholder="you@example.com"
                aria-invalid={status.state === 'error' ? 'true' : undefined}
                className={`th-input ${status.state === 'error' ? 'border-sale' : ''}`}
              />
              <button
                type="submit"
                disabled={status.state === 'loading'}
                className="th-btn th-btn-primary th-btn-md shrink-0"
                aria-label="Subscribe to the newsletter"
              >
                {status.state === 'loading' ? (
                  <Spinner className="h-4 w-4" />
                ) : status.state === 'success' ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {status.message ? (
              <p
                role={status.state === 'error' ? 'alert' : 'status'}
                className={`mt-2 text-xs ${status.state === 'error' ? 'text-sale' : 'text-success'}`}
              >
                {status.message}
              </p>
            ) : (
              <p className="mt-2 text-xs text-ink-faint">We only email when there is something worth saying.</p>
            )}
          </form>
        </div>
      </div>

      <div className="border-t border-line-soft">
        <div className="th-container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <Lock className="h-3.5 w-3.5 text-success" aria-hidden="true" /> Demo checkout
            </span>
            <ul className="flex flex-wrap items-center gap-1.5">
              {PAYMENT_METHODS.map((method) => (
                <li
                  key={method}
                  className="rounded border border-line bg-surface-base px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted"
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="th-container pb-5">
          <p className="text-center text-[11px] leading-relaxed text-ink-faint sm:text-left">
            No payment provider is connected to this deployment — orders placed here are recorded in demo mode and no
            payment is taken.
          </p>
        </div>
      </div>
    </footer>
  );
}
