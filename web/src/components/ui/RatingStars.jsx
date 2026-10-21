import { Star } from 'lucide-react';

/** Five stars with fractional fill for the given rating. */
export function RatingStars({ rating = 0, size = 14, className = '' }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const width = `${(value / 5) * 100}%`;
  const stars = [0, 1, 2, 3, 4];

  return (
    <span
      className={`relative inline-flex align-middle ${className}`}
      style={{ height: size }}
      role="img"
      aria-label={`Rated ${value} out of 5`}
    >
      <span className="flex gap-0.5">
        {stars.map((index) => (
          <Star key={index} style={{ width: size, height: size }} className="shrink-0 fill-current text-line" aria-hidden="true" />
        ))}
      </span>
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width }}>
        <span className="flex gap-0.5" style={{ width: 'max-content' }}>
          {stars.map((index) => (
            <Star
              key={index}
              style={{ width: size, height: size }}
              className="shrink-0 fill-current text-[#FFB020]"
              aria-hidden="true"
            />
          ))}
        </span>
      </span>
    </span>
  );
}
