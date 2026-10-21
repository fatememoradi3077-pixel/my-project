import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { EmptyState } from '../components/ui/primitives.jsx';
import { INFO_PAGES } from '../lib/content.js';

export function Info() {
  const { slug } = useParams();
  const page = INFO_PAGES[slug];

  if (!page) {
    return (
      <div className="th-container py-16">
        <EmptyState
          title="That page does not exist"
          message="The link may be out of date. Try the help centre or the storefront."
          action={
            <Link to="/" className="th-btn th-btn-primary th-btn-md mt-1">
              Back to home
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="th-container py-10">
      <Link to="/" className="th-link-more mb-6">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back home
      </Link>
      <p className="th-eyebrow">TechHaven</p>
      <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
        {page.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">{page.intro}</p>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {page.sections.map((section) => (
          <article key={section.heading} className="th-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.1em] text-brand">
              {section.heading}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{section.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/contact" className="th-btn th-btn-primary th-btn-md">
          Contact support
        </Link>
        <Link to="/shop" className="th-btn th-btn-outline th-btn-md">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
