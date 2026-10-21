import { Hero } from '../components/home/Hero.jsx';
import { CategoryStrip } from '../components/home/CategoryStrip.jsx';
import { FeaturedProducts } from '../components/home/FeaturedProducts.jsx';
import { PromoBanner } from '../components/home/PromoBanner.jsx';
import { Testimonials } from '../components/home/Testimonials.jsx';

export function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedProducts />
      <PromoBanner />
      <Testimonials />
    </>
  );
}
