import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Headphones, ChevronLeft, ChevronRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { HERO_BENEFITS, HERO_SLIDES } from '../../lib/content.js';

const BENEFIT_ICONS = { shield: ShieldCheck, truck: Truck, refresh: RotateCcw, headset: Headphones };
const AUTOPLAY_MS = 6500;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const go = useCallback((next) => {
    setIndex((current) => (next + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion.current) return undefined;
    const timer = window.setInterval(() => go(index + 1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [index, paused, go]);

  const slide = HERO_SLIDES[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured promotions"
      className="relative overflow-hidden border-b border-line bg-surface-base"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-brand/10 blur-[130px]" />
        <div className="absolute right-0 top-0 h-full w-3/4 bg-[linear-gradient(118deg,transparent_38%,rgba(255,106,0,0.07)_62%,transparent_88%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      </div>

      <div className="th-container relative">
        <div className="grid items-center gap-7 py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-9">
          <div key={slide.id} className="animate-fade-up">
            <p className="th-eyebrow text-brand">{slide.eyebrow}</p>
            <h1 className="mt-3 font-display text-[34px] font-extrabold uppercase leading-[1.02] tracking-[-0.02em] text-ink sm:text-[42px] lg:text-[46px]">
              {slide.heading[0]}
              <br />
              {slide.heading[1]}
            </h1>
            <p className="mt-2 font-display text-base font-bold text-brand sm:text-lg">{slide.accent}</p>
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-ink-muted">{slide.copy}</p>

            <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {HERO_BENEFITS.map((benefit) => {
                const Icon = BENEFIT_ICONS[benefit.icon] ?? ShieldCheck;
                return (
                  <li key={benefit.label} className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-ink-muted">
                      {benefit.label}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to={slide.ctaTo} className="th-btn th-btn-primary th-btn-lg">
                {slide.ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/deals" className="th-btn th-btn-outline th-btn-lg">
                View deals
              </Link>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[28px] bg-[radial-gradient(circle_at_65%_35%,rgba(255,106,0,0.22),transparent_65%)]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-6 bottom-6 h-28 w-28 rotate-45 rounded-lg border border-brand/20 bg-brand/5"
            />
            <div className="relative h-[210px] overflow-hidden rounded-xl border border-line bg-surface-panel sm:h-[250px] lg:h-[268px]">
              {HERO_SLIDES.map((item, slideIndex) => (
                <img
                  key={item.id}
                  src={item.image}
                  alt={slideIndex === index ? item.alt : ''}
                  aria-hidden={slideIndex === index ? undefined : 'true'}
                  loading={slideIndex === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    slideIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,17,20,0.12)_0%,rgba(16,17,20,0.55)_100%)]"
              />

              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  className="th-icon-btn border border-line bg-surface-base/80 backdrop-blur"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  className="th-icon-btn border border-line bg-surface-base/80 backdrop-blur"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="absolute bottom-4 left-4 max-w-[60%] text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/90">
                {slide.eyebrow}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 pb-6" role="tablist" aria-label="Choose a slide">
          {HERO_SLIDES.map((item, slideIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`Slide ${slideIndex + 1}: ${item.heading.join(' ')}`}
              onClick={() => go(slideIndex)}
              className={`h-2 rounded-full transition-all duration-300 ${
                slideIndex === index ? 'w-6 bg-brand' : 'w-2 bg-line hover:bg-ink-faint'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
