import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { EmptyState, ProductImage, Skeleton } from '../components/ui/primitives.jsx';
import { api } from '../lib/api.js';
import { formatDate } from '../lib/format.js';

export function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.posts
      .list()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="th-container py-10">
      <p className="th-eyebrow">Journal</p>
      <h1 className="mt-2 font-display text-[28px] font-extrabold uppercase tracking-tight text-ink sm:text-[34px]">
        TechHaven blog
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Buying advice, product deep dives and the specifications that actually matter.
      </p>

      {loading ? (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[280px] w-full" />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="th-card group flex flex-col overflow-hidden">
              <Link to={`/blog/${post.slug}`} aria-label={post.title}>
                <ProductImage
                  src={post.image}
                  alt={post.title}
                  className="h-40 w-full bg-surface-panel"
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <span className="th-badge w-fit bg-brand/15 text-brand">{post.tag}</span>
                <h2 className="mt-3 font-display text-base font-bold leading-snug text-ink">
                  <Link to={`/blog/${post.slug}`} className="transition-colors hover:text-brand">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
                <p className="mt-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(post.createdAt)} · {post.author}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.posts
      .get(slug)
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="th-container py-10">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="mt-4 h-64 w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
      </div>
    );
  }

  if (missing || !post) {
    return (
      <div className="th-container py-16">
        <EmptyState
          title="Article not found"
          message="That post may have been moved or renamed."
          action={
            <Link to="/blog" className="th-btn th-btn-primary th-btn-md mt-1">
              All articles
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <article className="th-container py-10">
      <Link to="/blog" className="th-link-more mb-6">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All articles
      </Link>
      <span className="th-badge bg-brand/15 text-brand">{post.tag}</span>
      <h1 className="mt-3 max-w-3xl font-display text-[28px] font-extrabold uppercase leading-tight tracking-tight text-ink sm:text-[34px]">
        {post.title}
      </h1>
      <p className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
        {formatDate(post.createdAt)} · {post.author}
      </p>
      <ProductImage
        src={post.image}
        alt={post.title}
        className="mt-6 h-64 w-full rounded-xl border border-line bg-surface-panel sm:h-80"
        imgClassName="object-cover"
        eager
      />
      <div className="mt-8 max-w-2xl space-y-5">
        {post.body.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-[15px] leading-relaxed text-ink-muted">
            {paragraph}
          </p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/shop" className="th-btn th-btn-primary th-btn-md">
          Shop the catalogue
        </Link>
        <Link to="/blog" className="th-btn th-btn-outline th-btn-md">
          More articles
        </Link>
      </div>
    </article>
  );
}
