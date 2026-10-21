/** Storefront copy and configuration that is not product data. */

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const BRAND = {
  name: 'TechHaven',
  tagline: 'SMARTER TECH. BETTER LIFE.',
  phone: '1-800-555-0199',
  freeShippingThreshold: 99,
  supportEmail: 'support@techhaven.example',
  address: 'Unit 4, Harbour Works, Bristol BS1 6TY',
};

/** Campaign end for the limited-time banner. Rendered as a live countdown. */
export const PROMO_ENDS_AT = '2026-12-31T23:59:59Z';

export const HERO_SLIDES = [
  {
    id: 'next-gen',
    eyebrow: 'NEW SEASON DROP',
    heading: ['UPGRADE TO', 'NEXT GEN'],
    accent: 'Flagship audio. Pro-grade power.',
    copy: 'Discover cutting-edge gadgets designed to power your world.',
    ctaLabel: 'SHOP NOW',
    ctaTo: '/shop',
    image: img('1550009158-9ebf69173e03', 1400),
    alt: 'Premium electronics arranged on a dark studio surface',
  },
  {
    id: 'audio-event',
    eyebrow: 'AUDIO EVENT',
    heading: ['HEAR EVERY', 'DETAIL'],
    accent: 'Up to 30% off premium audio.',
    copy: 'Studio-grade headphones and earbuds built for long sessions.',
    ctaLabel: 'SHOP AUDIO',
    ctaTo: '/shop?category=headphones',
    image: img('1468495244123-6c6c332eeece', 1400),
    alt: 'Over-ear headphones photographed on a dark background',
  },
  {
    id: 'mobile-week',
    eyebrow: 'MOBILE WEEK',
    heading: ['POWER IN', 'YOUR POCKET'],
    accent: 'Flagship phones, unlocked.',
    copy: '5G phones with pro-grade cameras and all-day battery life.',
    ctaLabel: 'SHOP PHONES',
    ctaTo: '/shop?category=smartphones',
    image: img('1518770660439-4636190af475', 1400),
    alt: 'Modern smartphone beside technical components',
  },
];

export const HERO_BENEFITS = [
  { label: 'PREMIUM QUALITY', icon: 'shield' },
  { label: 'FAST & FREE SHIPPING', icon: 'truck' },
  { label: 'EASY RETURNS', icon: 'refresh' },
  { label: '24/7 SUPPORT', icon: 'headset' },
];

export const MAIN_NAV = [
  { label: 'HOME', to: '/' },
  { label: 'SHOP', to: '/shop', menu: 'shop' },
  { label: 'CATEGORIES', to: '/shop', menu: 'categories' },
  { label: 'DEALS', to: '/deals' },
  { label: 'NEW ARRIVALS', to: '/new-arrivals' },
  { label: 'BLOG', to: '/blog' },
  { label: 'CONTACT', to: '/contact' },
];

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most popular' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

export const RATING_OPTIONS = [
  { value: '', label: 'Any rating' },
  { value: '4.5', label: '4.5 stars & up' },
  { value: '4', label: '4 stars & up' },
  { value: '3', label: '3 stars & up' },
];

export const DELIVERY_METHODS = [
  { value: 'standard', label: 'Standard delivery', detail: '3–5 business days', fee: 9.99 },
  { value: 'express', label: 'Express delivery', detail: 'Next business day', fee: 14.99 },
  { value: 'pickup', label: 'Collect in store', detail: 'Ready in 2 hours, Bristol', fee: 0 },
];

export const ORDER_STATUS_TONES = {
  processing: 'bg-brand/15 text-brand',
  shipped: 'bg-white/10 text-ink',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-sale/15 text-sale',
};

export const COUNTRIES = [
  'United Kingdom',
  'Ireland',
  'United States',
  'Canada',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Australia',
  'New Zealand',
  'United Arab Emirates',
  'Iran',
];

export const PAYMENT_METHODS = ['VISA', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'];

export const FOOTER_COLUMNS = [
  {
    title: 'SHOP',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Best Sellers', to: '/shop?sort=popular' },
      { label: 'Deals & Offers', to: '/deals' },
      { label: 'Gift Cards', to: '/info/gift-cards' },
    ],
  },
  {
    title: 'CUSTOMER SERVICE',
    links: [
      { label: 'Help Center', to: '/info/help-center' },
      { label: 'Shipping & Delivery', to: '/info/shipping' },
      { label: 'Returns & Refunds', to: '/info/returns' },
      { label: 'Track Your Order', to: '/account?tab=orders' },
      { label: 'Warranty Information', to: '/info/warranty' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About Us', to: '/info/about' },
      { label: 'Careers', to: '/info/careers' },
      { label: 'Blog', to: '/blog' },
      { label: 'Privacy Policy', to: '/info/privacy' },
      { label: 'Terms & Conditions', to: '/info/terms' },
    ],
  },
];

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Twitter', href: 'https://twitter.com/' },
  { label: 'YouTube', href: 'https://www.youtube.com/' },
];

/** Supporting pages linked from the footer, so no footer link is a dead end. */
export const INFO_PAGES = {
  'help-center': {
    title: 'Help Center',
    intro: 'Answers to the questions our support team hears most often.',
    sections: [
      {
        heading: 'Contacting support',
        body: `Our team is available 24/7 by phone on ${BRAND.phone} and by email at ${BRAND.supportEmail}. We reply to emails within one business day.`,
      },
      {
        heading: 'Orders and changes',
        body: 'You can review every order you have placed under Account → Order history. An order can be cancelled from there while it is still processing.',
      },
      {
        heading: 'Technical help',
        body: 'If a product is not behaving as expected, check the warranty page first — most faults are covered for two years from delivery.',
      },
    ],
  },
  shipping: {
    title: 'Shipping & Delivery',
    intro: 'How and when your order arrives.',
    sections: [
      {
        heading: 'Free shipping over $99',
        body: `Orders above $${BRAND.freeShippingThreshold} ship free within the UK. Below that, standard delivery is $9.99 and express delivery is $14.99.`,
      },
      {
        heading: 'Dispatch times',
        body: 'Orders placed before 4pm on a business day are dispatched the same day. Express orders placed after that go out the next business day.',
      },
      {
        heading: 'Tracking',
        body: 'A tracking reference is emailed as soon as your parcel is handed to the carrier. You can also track it from your account.',
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    intro: 'Changed your mind? You have 30 days.',
    sections: [
      {
        heading: '30-day returns',
        body: 'Return any unused item in its original packaging within 30 days of delivery for a full refund.',
      },
      {
        heading: 'Faulty goods',
        body: 'If something arrives faulty, contact support and we arrange collection at no cost, then repair, replace or refund.',
      },
      {
        heading: 'Refund timing',
        body: 'Refunds are issued to the original payment method within five business days of the return being received.',
      },
    ],
  },
  warranty: {
    title: 'Warranty Information',
    intro: 'Two years on every TechHaven product.',
    sections: [
      {
        heading: 'What is covered',
        body: 'Manufacturing defects in materials and workmanship for 24 months from the delivery date.',
      },
      {
        heading: 'What is not covered',
        body: 'Accidental damage, water ingress beyond the stated rating, and normal battery degradation.',
      },
      {
        heading: 'Making a claim',
        body: `Email your order reference and a description of the fault to ${BRAND.supportEmail}.`,
      },
    ],
  },
  about: {
    title: 'About TechHaven',
    intro: 'Smarter tech. Better life.',
    sections: [
      {
        heading: 'Who we are',
        body: 'TechHaven is an independent electronics retailer based in Bristol, curating a small number of products we can genuinely stand behind.',
      },
      {
        heading: 'How we choose products',
        body: 'Every product is tested by our team before it is listed. If we would not use it daily, we do not sell it.',
      },
      {
        heading: 'Our promise',
        body: 'Genuine stock, honest specifications, and support that answers the phone.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    intro: 'Build the storefront you would want to shop in.',
    sections: [
      {
        heading: 'Working here',
        body: 'We are a small, product-led team. Everyone talks to customers, and everyone ships.',
      },
      {
        heading: 'Open roles',
        body: `We are not advertising specific roles right now, but we always read speculative applications — write to ${BRAND.supportEmail}.`,
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'What we collect, and why.',
    sections: [
      {
        heading: 'What we store',
        body: 'Your name, email address, order history and delivery address. Passwords are stored only as a salted hash and are never readable by our team.',
      },
      {
        heading: 'What we never store',
        body: 'This storefront runs in demo checkout mode and does not process live payments, so no card details are collected or retained.',
      },
      {
        heading: 'Your rights',
        body: `Ask us for a copy of your data, or for deletion of your account, at ${BRAND.supportEmail}.`,
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'The terms that apply when you order from us.',
    sections: [
      {
        heading: 'Orders',
        body: 'An order is accepted once we confirm dispatch. Prices are shown in US dollars and include applicable taxes.',
      },
      {
        heading: 'Demo checkout',
        body: 'Checkout on this deployment is a demonstration: orders are recorded so you can review them in your account, and no payment is taken.',
      },
      {
        heading: 'Liability',
        body: 'Nothing in these terms limits your statutory rights as a consumer.',
      },
    ],
  },
  'gift-cards': {
    title: 'Gift Cards',
    intro: 'Digital gift cards, delivered by email.',
    sections: [
      {
        heading: 'Availability',
        body: 'Digital gift cards are not on sale yet. Join the newsletter and we will announce them the day they launch.',
      },
      {
        heading: 'When they launch',
        body: 'Cards will be available in $25, $50, $100 and $250 denominations, valid for 24 months and usable against any product.',
      },
    ],
  },
};
