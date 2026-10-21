import { Link } from 'react-router-dom';
import { ImageOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

/** Button / link primitive. Renders a router Link, an anchor or a button. */
export function Button({ to, href, variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const classes = ['th-btn', `th-btn-${variant}`, `th-btn-${size}`, className].filter(Boolean).join(' ');
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}

export function Badge({ tone = 'new', children, className = '' }) {
  const tones = {
    new: 'bg-brand text-[#120A03]',
    sale: 'bg-sale text-white',
    muted: 'bg-surface-raised text-ink-muted',
    success: 'bg-success/15 text-success',
    stock: 'bg-success/15 text-success',
    out: 'bg-sale/15 text-sale',
  };
  return <span className={`th-badge ${tones[tone] ?? tones.new} ${className}`}>{children}</span>;
}

/** Product imagery with an intentional fallback when a remote image fails. */
export function ProductImage({ src, alt, className = '', imgClassName = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {failed || !src ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-raised px-3 text-center">
          <ImageOff className="h-6 w-6 text-ink-faint" aria-hidden="true" />
          <span className="line-clamp-2 text-[11px] font-medium text-ink-faint">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full object-contain ${imgClassName}`}
        />
      )}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`th-skeleton ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="th-card overflow-hidden p-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="mt-4 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-2/5" />
      <Skeleton className="mt-4 h-9 w-full" />
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function SectionHeading({ title, to, linkLabel, eyebrow, className = '' }) {
  return (
    <div className={`mb-6 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {eyebrow ? <p className="th-eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="th-section-title th-heading-dash">{title}</h2>
      </div>
      {to ? (
        <Link to={to} className="th-link-more">
          {linkLabel ?? 'View all'}
          <span aria-hidden="true">»</span>
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-surface-panel/60 px-6 py-14 text-center ${className}`}
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-ink-faint">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      ) : null}
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {message ? <p className="max-w-sm text-sm text-ink-muted">{message}</p> : null}
      {action}
    </div>
  );
}

export function Avatar({ name, className = '' }) {
  const label =
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'TH';
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-xs font-bold tracking-wide text-brand ${className}`}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
